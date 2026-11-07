import { firebaseConfig } from './firebase-config.js';

// SDK modular, cargado a demanda para que el cotizador y las vistas previas
// sigan funcionando cuando Firebase o su CDN no están disponibles.
let servicesPromise;
export const ADMIN_EMAIL = 'henro89@gmail.com';
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_REFERENCES = 5;
export const IMAGE_TYPE = /^image\/(jpeg|png|webp|gif|avif|heic|heif|bmp|tiff)$/i;
export function checkImage(file) {
 if (!IMAGE_TYPE.test(file.type)) throw Error('Usá una imagen JPG, PNG, WEBP, GIF, AVIF, HEIC o TIFF.');
 if (!file.size || file.size > MAX_IMAGE_BYTES) throw Error('Cada imagen debe pesar como máximo 8 MB y no estar vacía.');
}
export function timeout(promise, ms = 12000) {
 let timer;
 return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('El servicio no respondió. Revisá tu conexión y volvé a intentar.')), ms); })]).finally(() => clearTimeout(timer));
}
export function getServices() {
 if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) return Promise.reject(Error('El servicio de carga se está conectando. Tus archivos siguen seleccionados; todavía no se enviaron.'));
 if (!servicesPromise) {
  servicesPromise = timeout(Promise.all([
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js'),
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js')
  ]).then(([appSDK, authSDK, dbSDK, storageSDK]) => {
   const app = appSDK.getApps().length ? appSDK.getApp() : appSDK.initializeApp(firebaseConfig);
   const storage = storageSDK.getStorage(app);
   storage.maxUploadRetryTime = 30000;
   storage.maxOperationRetryTime = 15000;
   return { auth: authSDK.getAuth(app), db: dbSDK.getFirestore(app), storage, authSDK, dbSDK, storageSDK };
  })).catch(error => { servicesPromise = null; throw error; });
 }
 return servicesPromise;
}
export const isAdmin = user => Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL && user.emailVerified);
export function newId() { return crypto.randomUUID(); }
export function safeName(name) {
 return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(-100) || 'imagen';
}
export function httpsURL(value) {
 try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
export async function readConfig(name) {
 const { db, dbSDK } = await getServices();
 const snapshot = await timeout(dbSDK.getDoc(dbSDK.doc(db, 'config', name)));
 return snapshot.exists() ? snapshot.data() : null;
}
export async function readGallery() {
 const { db, dbSDK } = await getServices();
 const snapshot = await timeout(dbSDK.getDocs(dbSDK.collection(db, 'galeria')));
 return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}
export async function saveConfig(name, data) {
 const { auth, db, dbSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('El acceso requiere la cuenta administradora con correo verificado.');
 await dbSDK.setDoc(dbSDK.doc(db, 'config', name), data);
}
export async function saveGallery(id, data) {
 const { auth, db, dbSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 await dbSDK.setDoc(dbSDK.doc(db, 'galeria', id), data);
}
export async function deleteGalleryItem(item) {
 const { auth, db, dbSDK, storage, storageSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 // El documento se borra primero; un fallo posterior deja un archivo huérfano,
 // no una imagen rota en la galería. El panel permite volver a limpiar Storage.
 await dbSDK.deleteDoc(dbSDK.doc(db, 'galeria', item.id));
 if (item.storagePath?.startsWith('galeria/')) {
  try { await storageSDK.deleteObject(storageSDK.ref(storage, item.storagePath)); }
  catch (error) { if (error.code !== 'storage/object-not-found') { const failure=Error('La foto salió de la galería, pero no se pudo borrar el archivo de Storage. Usá la limpieza de archivos pendientes.'); failure.galleryRemoved=true; throw failure; } }
 }
}
export async function uploadImage(file, path, progress) {
 checkImage(file);
 const { storage, storageSDK } = await getServices();
 const object = storageSDK.ref(storage, path);
 const task = storageSDK.uploadBytesResumable(object, file, { contentType: file.type, cacheControl: 'public,max-age=3600' });
 const timer = setTimeout(() => task.cancel(), 120000);
 try {
  await new Promise((resolve, reject) => task.on('state_changed', snap => progress?.(Math.round(100 * snap.bytesTransferred / snap.totalBytes)), reject, resolve));
  const url = await timeout(storageSDK.getDownloadURL(object));
  if (!httpsURL(url)) throw Error('No se obtuvo un enlace HTTPS válido.');
  return url;
 } finally { clearTimeout(timer); }
}
export function explainError(error) {
 const code = error?.code || '';
 if (/permission-denied|unauthorized/.test(code)) return 'El servicio de carga o las reglas todavía no están habilitados para esta operación. Tus archivos no se enviaron por WhatsApp.';
 if (/auth\//.test(code)) return 'No se pudo iniciar sesión. Revisá correo, contraseña y la habilitación de Email/Password en Firebase.';
 return error?.message || 'No se pudo completar la operación. Volvé a intentar.';
}

export async function saveGalleryBatch(items) {
 const { auth, db, dbSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 const batch = dbSDK.writeBatch(db);
 for (const {id, ...item} of items) batch.set(dbSDK.doc(db,'galeria',id),item);
 await batch.commit();
}
export async function deleteStorageFile(path) {
 if (!path.startsWith('galeria/')) throw Error('Ruta no permitida.');
 const { auth, storage, storageSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 try { await storageSDK.deleteObject(storageSDK.ref(storage,path)); }
 catch(error) { if(error.code !== 'storage/object-not-found') throw error; }
}
