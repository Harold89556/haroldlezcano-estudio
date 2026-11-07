const { chromium }=require('@playwright/test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jV3sAAAAASUVORK5CYII=','base64');
const server=http.createServer((req,res)=>{
 const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const target=fs.existsSync(filename)&&fs.statSync(filename).isDirectory()?path.join(filename,'index.html'):filename;
 fs.readFile(target,(error,bytes)=>{if(error){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(target)]||'text/plain');res.end(bytes);});
});
const mock=String.raw`
const state=window.__mock;
const auth={currentUser:state.user||null};
export const ADMIN_EMAIL='henro89@gmail.com';
export const isAdmin=u=>!!(u&&u.email===ADMIN_EMAIL&&u.emailVerified);
export const newId=()=>crypto.randomUUID();
export const safeName=name=>name.replace(/[^a-zA-Z0-9._-]/g,'_');
export const explainError=e=>e.message;
export function checkImage(file){if(!file.type.startsWith('image/')||file.size>8*1024*1024)throw Error('Imagen inválida');}
export function getServices(){if(state.offline)return Promise.reject(Error('Servicio sin habilitar'));return Promise.resolve({auth,authSDK:{browserSessionPersistence:'session',setPersistence:async()=>{},onAuthStateChanged:(a,fn)=>{state.listener=fn;queueMicrotask(()=>fn(auth.currentUser));},signInWithEmailAndPassword:async(a,email)=>{auth.currentUser={email,emailVerified:true};await state.listener(auth.currentUser);},signOut:async()=>{auth.currentUser=null;await state.listener(null);},sendPasswordResetEmail:async()=>{},sendEmailVerification:async()=>{},reload:async()=>{}}});}
export async function readConfig(name){if(state.offline)throw Error('Offline');return state.config[name]||null;}
export async function readGallery(){if(state.offline)throw Error('Offline');return state.gallery;}
export async function saveConfig(name,value){state.config[name]=value;state.saved.push({name,value});}
export async function saveGalleryBatch(items){for(const item of items){state.gallery=state.gallery.filter(i=>i.id!==item.id);state.gallery.push(item);}state.saved.push({items});}
export async function uploadImage(file,path,progress){state.uploadAttempts++;if(state.failUpload||state.failAt===state.uploadAttempts)throw Error('Carga de prueba fallida');progress(100);const url='https://example.com/'+encodeURIComponent(path);state.uploads.push({name:file.name,path,url});return url;}
export async function deleteGalleryItem(item){state.gallery=state.gallery.filter(i=>i.id!==item.id);state.deleted.push(item.id);}
export async function deleteStorageFile(path){state.deleted.push(path);}
`;
let browser;
const results=[];
async function session(settings={}){
 const context=await browser.newContext({viewport:{width:1280,height:960},serviceWorkers:'block'});
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1'){
   if(url.pathname==='/firebase-client.js')return route.fulfill({contentType:'text/javascript',body:mock});
   return route.continue();
  }
  if(route.request().resourceType()==='image')return route.fulfill({contentType:'image/png',body:png});
  return route.abort();
 });
 await context.addInitScript(value=>{
  window.__mock={config:{},gallery:[],saved:[],uploads:[],uploadAttempts:0,deleted:[],...value};
  window.__opened=[];
  window.open=(url)=>{if(url!=='about:blank')window.__opened.push(url);return {opener:null,document:{title:'',body:{textContent:''}},location:{replace:link=>window.__opened.push(link)},close:()=>{window.__mock.closed=true;}};};
 },settings);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());
 return {context,page,errors};
}
async function quote(page){
 await page.goto(base+'/index.html');
 await page.selectOption('#estilo','Realista');await page.selectOption('#tecnica','Oleo');await page.selectOption('#tema','Retrato');await page.selectOption('#tamano_predefinido','30x40');await page.fill('#envio_nombre','Prueba local');await page.selectOption('#fotos_referencia','No, necesito asesoramiento');
}
const photo=(name='foto.png',size)=>({name,mimeType:'image/png',buffer:size?Buffer.alloc(size):png});
async function test(name,fn){try{await fn();results.push({prueba:name,resultado:'OK'});}catch(error){results.push({prueba:name,resultado:'FALLO',detalle:error.stack});process.exitCode=1;}}
let base;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 await test('Cotizador sin Firebase: base 700.000 y 152 fotos',async()=>{
  const {page,context,errors}=await session({offline:true});await quote(page);
  assert.equal(await page.textContent('#precioFinal'),'700.000 ₲');assert.equal(await page.locator('#mainGallery .gallery-item').count(),152);assert.deepEqual(errors,[]);await context.close();
 });
 await test('Picker: vistas previas, quitar, tamaño y asesoramiento',async()=>{
  const {page,context}=await session();await quote(page);await page.setInputFiles('#referencias_archivos',[photo('uno.png'),photo('dos.png')]);
  assert.equal(await page.locator('.upload-preview').count(),2);await page.locator('.upload-preview button').first().click();assert.equal(await page.locator('.upload-preview').count(),1);
  await page.setInputFiles('#referencias_archivos',photo('grande.png',8*1024*1024+1));assert.match(await page.textContent('#referencias-estado'),/8 MB/);assert.equal(await page.locator('.upload-preview').count(),1);
  await page.selectOption('#fotos_referencia','No, necesito asesoramiento');assert.equal(await page.inputValue('#fotos_referencia'),'Sí, quiero cargar fotos de guía');await context.close();
 });
 await test('Límite de cinco fotos y no envío sin archivo',async()=>{
  const {page,context}=await session();await quote(page);await page.selectOption('#fotos_referencia','Sí, quiero cargar fotos de guía');await page.click('#enviar-obra');assert.match(await page.textContent('#error-fotos_referencia'),/al menos/);
  await page.setInputFiles('#referencias_archivos',Array.from({length:6},(_,n)=>photo(n+'.png')));assert.equal(await page.locator('.upload-preview').count(),5);assert.match(await page.textContent('#referencias-estado'),/hasta 5/);await context.close();
 });
 await test('WhatsApp contiene solo enlaces HTTPS tras subir referencias',async()=>{
  const {page,context}=await session();await quote(page);await page.setInputFiles('#referencias_archivos',[photo('guía.png'),photo('otra.png')]);await page.click('#enviar-obra');await page.waitForFunction(()=>window.__opened.length===1);
  const state=await page.evaluate(()=>window.__mock);assert.equal(state.uploads.length,2);assert.ok(state.uploads.every(u=>u.path.startsWith('referencias/')));
  const link=await page.evaluate(()=>window.__opened[0]);const text=new URL(link).searchParams.get('text');for(const upload of state.uploads)assert.ok(text.includes(upload.url));assert.match(text,/700.000/);assert.equal(await page.locator('#whatsapp-continuar').isVisible(),true);await context.close();
 });
 await test('Carga fallida conserva selección y bloquea apertura sin fotos',async()=>{
  const {page,context}=await session({failUpload:true});await quote(page);await page.setInputFiles('#referencias_archivos',photo());await page.click('#enviar-obra');await page.waitForFunction(()=>window.__mock.closed);
  assert.equal(await page.locator('.upload-preview').count(),1);assert.match(await page.textContent('#referencias-estado'),/siguen seleccionadas/);assert.deepEqual(await page.evaluate(()=>window.__opened),[]);assert.equal(await page.locator('#enviar-obra').isEnabled(),true);await context.close();
 });
 await test('Reintento no vuelve a subir archivos ya enlazados',async()=>{
  const {page,context}=await session({failAt:2});await quote(page);await page.setInputFiles('#referencias_archivos',[photo('primera.png'),photo('segunda.png')]);await page.click('#enviar-obra');await page.waitForFunction(()=>window.__mock.closed);await page.click('#enviar-obra');await page.waitForFunction(()=>window.__opened.length===1);
  const state=await page.evaluate(()=>window.__mock);assert.equal(state.uploadAttempts,3);assert.equal(state.uploads.length,2);await context.close();
 });
 await test('Mezcla pública preserva semilla, agrega categoría y trata textos como texto',async()=>{
  const {page,context}=await session({config:{categorias:{items:[{id:'nuevo',name:'Categoría de prueba'}]}},gallery:[{id:'nueva',url:'https://example.com/foto.png',category:'nuevo',order:180,caption:'<img src=x onerror=alert(1)>',cover:true,hidden:false},{id:'seed-001',url:'https://example.com/original.png',category:'retrato',caption:'',order:0,cover:false,hidden:true}]});
  await page.goto(base+'/index.html');await page.waitForSelector('[data-album="nuevo"]',{state:'attached'});assert.equal(await page.locator('#mainGallery .gallery-item').count(),152);assert.equal(await page.locator('[data-gallery-id="seed-002"]').count(),1);assert.equal(await page.locator('.gallery-caption img').count(),0);await page.click('.tab-btn:nth-child(2)');await page.click('[data-album="nuevo"]');assert.equal(await page.textContent('#titulo-album-abierto'),'Categoría de prueba');await context.close();
 });
 await test('Administrador requiere cuenta verificada',async()=>{
  for(const user of [{email:'other@example.com',emailVerified:true},{email:'henro89@gmail.com',emailVerified:false}]){
   const {page,context}=await session({user});await page.goto(base+'/admin.html');await page.waitForTimeout(100);assert.equal(await page.locator('#admin-workspace').isHidden(),true);await context.close();
  }
 });
 await test('Administrador: login, precios, galería, categorías y contacto',async()=>{
  const {page,context,errors}=await session();await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  assert.equal(await page.locator('.admin-image-card').count(),152);
  await page.locator('details').evaluateAll(items=>items.forEach(i=>i.open=true));await page.fill('#price-matriz-30x40-realista','900000');await page.locator('#prices-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.config.precios?.matriz['30x40'].realista===900000);
  await page.fill('#category-name','Taller de prueba');await page.locator('#category-form button').click();await page.waitForFunction(()=>window.__mock.config.categorias?.items.some(i=>i.name==='Taller de prueba'));
  await page.selectOption('#upload-category','taller-de-prueba');await page.setInputFiles('#gallery-files',photo('nueva.png'));await page.locator('#gallery-upload-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.storagePath?.startsWith('galeria/')));
  assert.equal(await page.locator('.admin-image-card').count(),153);
  const first=page.locator('.admin-image-card').first();await first.locator('input[id^=caption]').fill('Texto ingresado en prueba');await first.locator('input[id^=hidden]').check();await first.locator('button[type=submit]').click();await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.id==='seed-001'&&i.hidden&&i.caption==='Texto ingresado en prueba'));
  await page.fill('#site-whatsapp','595971000000');await page.fill('#text-subtitulo','Texto local de prueba');await page.locator('#site-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.config.sitio?.whatsapp==='595971000000');
  const last=page.locator('.admin-image-card').last();await last.locator('button.admin-danger').click();await page.waitForFunction(()=>window.__mock.deleted.length===1);assert.equal(await page.locator('.admin-image-card').count(),152);
  await page.screenshot({path:'/workspace/harold-admin-desktop.png',fullPage:false});assert.deepEqual(errors,[]);await context.close();
 });
 await test('Vista móvil y rutas de galería sin desbordamiento',async()=>{
  const {page,context}=await session();await page.setViewportSize({width:390,height:844});await quote(page);await page.setInputFiles('#referencias_archivos',photo());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/workspace/harold-cotizador-mobile.png',fullPage:true});
  await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/workspace/harold-admin-mobile.png',fullPage:false});await context.close();
 });
 console.log(JSON.stringify(results,null,2));fs.writeFileSync(path.join(root,'resultados-navegador.json'),JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
