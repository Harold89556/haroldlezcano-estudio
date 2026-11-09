// Ejecuta la API real del cliente en un navegador, sin servicios ni usuarios reales.
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict'), http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');let browser;
const server=http.createServer((req,res)=>{
 const route=new URL(req.url,'http://localhost').pathname;
 res.setHeader('Content-Type',route==='/'?'text/html':'text/javascript');
 if(route==='/')return res.end('<!doctype html><title>Storage aislado</title>');
 if(!['/firebase-client.js','/firebase-config.js','/supabase-config.js'].includes(route)){res.writeHead(404);return res.end();}
 res.end(fs.readFileSync(path.join(root,route)));
});
const supabaseMock=String.raw`
export function createClient(url,key,options){
 const s=window.state;s.client={url,key,options};
 return {auth:{
  signInWithPassword:async c=>{s.logins++;s.credentialsPresent=!!c.password;return s.loginResults.shift()||{data:{session:{}}};},
  signUp:async c=>{s.signups++;return s.signupResult||{data:{session:{}}};},
  signOut:async()=>{s.signouts++;return {};},
  getSession:async()=>({data:{session:s.session?{}:null}})
 },storage:{from:bucket=>{s.bucket=bucket;return {
  upload:async(path,file,options)=>{s.upload={path,type:file.type,options};return {error:s.uploadError};},
  getPublicUrl:path=>({data:{publicUrl:s.badURL?'http://unsafe.test':url+'/storage/v1/object/public/'+bucket+'/'+path}}),
  remove:async paths=>{s.events.push('remove');s.removed=paths;return {error:s.removeError};}
 };}}};
}`;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({serviceWorkers:'block'});
 let supabaseLoads=0;
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1')return route.continue();
  if(url.hostname==='cdn.jsdelivr.net'){supabaseLoads++;return route.fulfill({contentType:'text/javascript',body:supabaseMock});}
  if(url.hostname==='www.gstatic.com'){
   const body=url.pathname.endsWith('firebase-app.js')?"export const getApps=()=>[];export const initializeApp=c=>({options:c});":url.pathname.endsWith('firebase-auth.js')?"export const getAuth=()=>window.auth;":url.pathname.endsWith('firebase-firestore.js')?"export const getFirestore=()=>({});export const doc=(db,c,id)=>({id});export const deleteDoc=async()=>{window.state.events.push('deleteDoc');};":null;
   if(body)return route.fulfill({contentType:'text/javascript',body});
  }
  return route.abort();
 });
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.evaluate(()=>{
  window.auth={currentUser:{email:'henro89@gmail.com',emailVerified:true}};
  window.state={loginResults:[],logins:0,signups:0,signouts:0,session:true,events:[]};
 });
 await page.evaluate(async()=>{window.api=await import('./firebase-client.js');await api.getServices();});
 assert.equal(supabaseLoads,0,'Supabase no debe cargarse al importar o inicializar Firebase');
 let result=await page.evaluate(async()=>{
  state.loginResults=[{error:{code:'invalid_credentials'}}];
  await api.signInStorage('HENRO89@gmail.com','contraseña-solo-prueba');
  return {logins:state.logins,signups:state.signups,client:state.client};
 });
 assert.equal(result.logins,1);assert.equal(result.signups,1);
 assert.equal(result.client.url,'https://fbeihokebuekvqsfvnjv.supabase.co');
 assert.match(result.client.key,/^sb_publishable_/);
 assert.deepEqual(result.client.options.auth,{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false});
 result=await page.evaluate(async()=>{
  state.loginResults=[{error:{code:'invalid_credentials'}},{data:{session:{}}}];state.signupResult={data:{session:null}};
  await api.signInStorage('henro89@gmail.com','clave-local');return state.logins;
 });assert.equal(result,3,'Reintentar login si signup no devuelve sesión');
 result=await page.evaluate(async()=>{
  const before=state.signups;state.loginResults=[{error:{status:503,message:'Offline'}}];
  try{await api.signInStorage('henro89@gmail.com','clave-local');}catch(e){return {message:e.message,unchanged:before===state.signups};}
 });assert.deepEqual(result,{message:'Offline',unchanged:true});
 result=await page.evaluate(async()=>{
  const progress=[];const url=await api.uploadImage(new File(['png'],'foto.png',{type:'image/png'}),'galeria/id/foto.png',p=>progress.push(p));
  return {url,progress,upload:state.upload,bucket:state.bucket};
 });
 assert.equal(result.url,'https://fbeihokebuekvqsfvnjv.supabase.co/storage/v1/object/public/fotos/galeria/id/foto.png');
 assert.equal(result.bucket,'fotos');assert.deepEqual(result.progress,[10,90,100]);
 assert.deepEqual(result.upload.options,{upsert:false,contentType:'image/png',cacheControl:'3600'});
 for(const type of ['image/heic','image/heif','image/bmp','image/tiff','image/svg+xml','application/pdf']){
  const message=await page.evaluate(async type=>{try{await api.uploadImage(new File(['x'],'foto',{type}),'galeria/id/foto');}catch(e){return e.message;}},type);
  assert.match(message,/JPG/);
 }
 for(const size of [0,8388609]){
  assert.match(await page.evaluate(async size=>{try{await api.uploadImage(new File([new Uint8Array(size)],'foto.png',{type:'image/png'}),'galeria/id/foto.png');}catch(e){return e.message;}},size),/8 MB/);
 }
 for(const target of ['referencias/foto.png','galeria/../otra','galeria//foto']){
  assert.match(await page.evaluate(async target=>{try{await api.deleteStorageFile(target);}catch(e){return e.message;}},target),/Ruta no permitida/);
 }
 await page.evaluate(async()=>{state.events=[];await api.deleteGalleryItem({id:'id',storagePath:'galeria/id/foto.png'});});
 assert.deepEqual(await page.evaluate(()=>state.events),['deleteDoc','remove']);
 assert.deepEqual(await page.evaluate(()=>state.removed),['galeria/id/foto.png']);
 result=await page.evaluate(async()=>{
  state.removeError={statusCode:'403',message:'row-level security'};
  try{await api.deleteGalleryItem({id:'id',storagePath:'galeria/id/foto.png'});}catch(e){return {removed:e.galleryRemoved,message:e.message};}
 });assert.equal(result.removed,true);assert.match(result.message,/pendientes/);
 for(const id of ['seed-001','ig-001']){
  assert.match(await page.evaluate(async id=>{try{await api.deleteGalleryItem({id});}catch(e){return e.message;}},id),/solo se pueden ocultar/);
 }
 assert.match(await page.evaluate(()=>api.explainError({statusCode:'403',message:'row-level security'})),/Cerrá sesión/);
 assert.match(await page.evaluate(()=>api.explainError({message:'not authenticated'})),/Cerrá sesión/);
 result=await page.evaluate(async()=>{state.session=false;try{await api.uploadImage(new File(['x'],'foto.png',{type:'image/png'}),'galeria/id/foto.png');}catch(e){return e.message;}});
 assert.match(result,/sesión de fotos venció/);
 result=await page.evaluate(async()=>{auth.currentUser={email:'otro@example.com',emailVerified:true};try{await api.signInStorage('otro@example.com','local');}catch(e){return e.message;}});
 assert.match(result,/cuenta administradora/);
 await page.evaluate(async()=>{await api.signOutStorage();});assert.equal(await page.evaluate(()=>state.signouts),1);
 
 result=await page.evaluate(async()=>{
  state.upload=null;state.bucket=null;
  const progress=[];const url=await api.uploadReference(new File(['x'],'ref.webp',{type:'image/webp'}),'pedidos/11111111-1111-4111-8111-111111111111/1.webp',p=>progress.push(p));
  return {url,progress,upload:state.upload,bucket:state.bucket};
 });
 assert.equal(result.bucket,'referencias');
 assert.equal(result.url,'https://fbeihokebuekvqsfvnjv.supabase.co/storage/v1/object/public/referencias/pedidos/11111111-1111-4111-8111-111111111111/1.webp');
 assert.deepEqual(result.progress,[10,90,100]);
 for(const bad of ['pedidos/no-uuid/1.webp','galeria/x/1.webp','pedidos/11111111-1111-4111-8111-111111111111/9.webp']){
  assert.match(await page.evaluate(async bad=>{try{await api.uploadReference(new File(['x'],'a.webp',{type:'image/webp'}),bad);}catch(e){return e.message;}},bad),/Ruta de referencia/);
 }
 console.log('Supabase: lazy SDK, sesión/alta, permisos, formatos, subida, progreso y borrado: OK (sin servicios reales)');
 await context.close();
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
