import { firebaseConfig } from './firebase-config.js';
import { supabaseConfig } from './supabase-config.js';

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
 if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return Promise.reject(Error('El servicio de carga se está conectando. Tus archivos siguen seleccionados; todavía no se enviaron.'));
 if (!servicesPromise) {
  servicesPromise = timeout(Promise.all([
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js')
  ]).then(([appSDK, authSDK, dbSDK]) => {
   const app = appSDK.getApps().length ? appSDK.getApp() : appSDK.initializeApp(firebaseConfig);
   return { auth: authSDK.getAuth(app), db: dbSDK.getFirestore(app), authSDK, dbSDK };
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
// Solo se carga Supabase al iniciar sesión o gestionar archivos del administrador.
let storagePromise;
async function getStorageClient() {
 if (!storagePromise) storagePromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  .then(({createClient}) => createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
   auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:false}
  })).catch(error => {storagePromise=null;throw error;});
 return storagePromise;
}
export async function signInStorage(email, password) {
 const {auth}=await getServices();
 if (!isAdmin(auth.currentUser) || email.trim().toLowerCase()!==ADMIN_EMAIL) throw Error('Necesitás la cuenta administradora con correo verificado.');
 const client=await getStorageClient();
 const credentials={email:email.trim().toLowerCase(),password};
 let result=await client.auth.signInWithPassword(credentials);
 if (result.error && (/^(invalid_credentials|user_not_found)$/.test(result.error.code || '') || result.error.status===400 && /invalid login credentials/i.test(result.error.message))) {
  // El trigger del proyecto permite únicamente la cuenta del estudio y la confirma.
  result=await client.auth.signUp(credentials);
  if (!result.error && !result.data.session) result=await client.auth.signInWithPassword(credentials);
 }
 if (result.error) throw result.error;
 if (!result.data.session) throw Error('No se pudo abrir la sesión de fotos. Volvé a iniciar sesión.');
}
export async function signOutStorage() {
 const client=await getStorageClient();
 const {error}=await client.auth.signOut();
 if(error) throw error;
}
function checkStoragePath(path) {
 if(typeof path!=='string' || !(path.startsWith('galeria/') || /^sitio\/[A-Za-z0-9._-]+$/.test(path)) || path.split('/').some(part=>!part || part==='.' || part==='..')) throw Error('Ruta no permitida.');
}
async function adminStorage() {
 const {auth}=await getServices();
 if(!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 const client=await getStorageClient();
 const {data,error}=await client.auth.getSession();
 if(error) throw error;
 if(!data.session) throw Error('La sesión de fotos venció. Cerrá sesión y volvé a entrar con tu cuenta del estudio.');
 return client.storage.from('fotos');
}
export async function deleteGalleryItem(item) {
 const { auth, db, dbSDK } = await getServices();
 if (!isAdmin(auth.currentUser)) throw Error('Necesitás iniciar sesión como administrador.');
 if (/^(seed-|ig-)/.test(item.id)) throw Error('Las fotos originales solo se pueden ocultar o recategorizar.');
 // Borrar metadata primero evita imágenes rotas; el panel permite limpiar pendientes.
 await dbSDK.deleteDoc(dbSDK.doc(db, 'galeria', item.id));
 if (item.storagePath?.startsWith('galeria/')) {
  try { await deleteStorageFile(item.storagePath); }
  catch { const failure=Error('La foto salió de la galería, pero no se pudo borrar el archivo de Supabase. Usá la limpieza de archivos pendientes.'); failure.galleryRemoved=true; throw failure; }
 }
}

export async function uploadReference(file, path, progress) {
 checkImage(file);
 if(!/^image\/(jpeg|png|webp)$/i.test(file.type)) throw Error('La foto de referencia debe ser JPG, PNG o WEBP.');
 if(typeof path!=='string' || !/^pedidos\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[1-5]\.(webp|jpg|jpeg|png)$/.test(path)) throw Error('Ruta de referencia no permitida.');
 const client=await getStorageClient();
 const bucket=client.storage.from('referencias');
 progress?.(10);
 const {error}=await bucket.upload(path,file,{upsert:false,contentType:file.type.toLowerCase(),cacheControl:'3600'});
 if(error) throw error;
 progress?.(90);
 const {data}=bucket.getPublicUrl(path);
 if(!httpsURL(data.publicUrl)) throw Error('No se obtuvo un enlace HTTPS válido.');
 progress?.(100);
 return data.publicUrl;
}
export async function uploadImage(file, path, progress) {
 checkImage(file);
 if(!/^image\/(jpeg|png|webp|gif|avif)$/i.test(file.type)) throw Error('Para la galería usá JPG, PNG, WEBP, GIF o AVIF. Convertí primero las fotos HEIC, HEIF, BMP o TIFF.');
 checkStoragePath(path);
 const bucket=await adminStorage();
 progress?.(10);
 const {error}=await bucket.upload(path,file,{upsert:false,contentType:file.type.toLowerCase(),cacheControl:'3600'});
 if(error) throw error;
 progress?.(90);
 const {data}=bucket.getPublicUrl(path);
 if(!httpsURL(data.publicUrl)) throw Error('No se obtuvo un enlace HTTPS válido.');
 progress?.(100);
 return data.publicUrl;
}
export function explainError(error) {
 const code = error?.code || '';
 if (/permission-denied|unauthorized|not_authenticated|42501/i.test(code) || [401,403].includes(Number(error?.status || error?.statusCode)) || /row.level security|not authenticated|jwt expired|invalid jwt/i.test(error?.message || '')) return 'No tenés permiso para gestionar las fotos. Cerrá sesión y volvé a entrar con la cuenta del estudio; si continúa, revisá los permisos de Supabase.';
 if (/invalid_credentials|user_already_exists/.test(code)) return 'No se pudo iniciar la sesión de fotos. Revisá la contraseña del administrador; si la cambiaste, también debe actualizarse en Supabase.';
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
 checkStoragePath(path);
 const bucket=await adminStorage();
 const {error}=await bucket.remove([path]);
 if(error) throw error;
}
