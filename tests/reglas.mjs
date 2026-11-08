import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getBytes, listAll, deleteObject } from 'firebase/storage';
import vm from 'node:vm';
const context={window:{}};vm.runInNewContext(await readFile('estudio-datos.js','utf8'),context);
const defaults=context.window.ESTUDIO_DEFAULTS;
const env=await initializeTestEnvironment({projectId:'demo-harold-estudio',firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9199,rules:await readFile('storage.rules','utf8')}});
const anonymous=env.unauthenticatedContext();
const admin=env.authenticatedContext('admin',{email:'henro89@gmail.com',email_verified:true});
const unverified=env.authenticatedContext('not-verified',{email:'henro89@gmail.com',email_verified:false});
const stranger=env.authenticatedContext('other',{email:'other@example.com',email_verified:true});
const picture={url:'https://example.com/foto.jpg',category:'retrato',caption:'',alt:'',order:0,cover:false,hidden:false,storagePath:'galeria/test/foto.jpg'};
let checks=0;const succeeds=async promise=>{await assertSucceeds(promise);checks++;};const fails=async promise=>{await assertFails(promise);checks++;};
try {
 for(const ctx of [anonymous,unverified,stranger]) {
  await fails(setDoc(doc(ctx.firestore(),'galeria/test'),picture));
  await fails(setDoc(doc(ctx.firestore(),'config/precios'),defaults.precios));
 }
 await succeeds(setDoc(doc(admin.firestore(),'galeria/test'),picture));
 await succeeds(getDoc(doc(anonymous.firestore(),'galeria/test')));
 await fails(setDoc(doc(admin.firestore(),'galeria/test'),{...picture,order:'bad'}));
 await succeeds(setDoc(doc(admin.firestore(),'galeria/test'),{...picture,edit:{x:10,y:5.5,w:80,h:90,r:90}}));
 await fails(setDoc(doc(admin.firestore(),'galeria/test'),{...picture,edit:{x:10,y:5,w:95,h:90,r:45}}));
 await succeeds(setDoc(doc(admin.firestore(),'galeria/test'),picture));
 await succeeds(setDoc(doc(admin.firestore(),'config/precios'),defaults.precios));
 await succeeds(setDoc(doc(admin.firestore(),'config/sitio'),defaults.sitio));
 await succeeds(setDoc(doc(admin.firestore(),'config/categorias'),{items:defaults.categorias}));
 await succeeds(getDoc(doc(anonymous.firestore(),'config/precios')));
 await fails(setDoc(doc(admin.firestore(),'private/test'),{value:true}));
 await fails(getDoc(doc(anonymous.firestore(),'private/test')));
 const bytes=new Uint8Array([137,80,78,71]);
 const reference=ref(anonymous.storage(),'referencias/test/new.png');
 await succeeds(uploadBytes(reference,bytes,{contentType:'image/png'}));
 await succeeds(getBytes(reference));
 await fails(uploadBytes(reference,bytes,{contentType:'image/png'}));
 await fails(deleteObject(reference));
 await fails(listAll(ref(anonymous.storage(),'referencias')));
 await fails(uploadBytes(ref(anonymous.storage(),'referencias/test/archivo.pdf'),bytes,{contentType:'application/pdf'}));
 await fails(uploadBytes(ref(anonymous.storage(),'referencias/test/vector.svg'),bytes,{contentType:'image/svg+xml'}));
 await fails(uploadBytes(ref(anonymous.storage(),'referencias/test/grande.png'),new Uint8Array(8*1024*1024+1),{contentType:'image/png'}));
 for(const ctx of [anonymous,unverified,stranger]) await fails(uploadBytes(ref(ctx.storage(),'galeria/test/foto.png'),bytes,{contentType:'image/png'}));
 await succeeds(uploadBytes(ref(admin.storage(),'galeria/test/foto.png'),bytes,{contentType:'image/png'}));
 await succeeds(getBytes(ref(anonymous.storage(),'galeria/test/foto.png')));
 await succeeds(deleteObject(ref(admin.storage(),'referencias/test/new.png')));
 await succeeds(deleteDoc(doc(admin.firestore(),'galeria/test')));
 console.log(checks+' controles de reglas: OK');
} finally {await env.cleanup();}
