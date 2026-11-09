const { chromium }=require('@playwright/test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const vmContext={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'estudio-datos.js'),'utf8'),vmContext);const sitioBase=JSON.parse(JSON.stringify(vmContext.window.ESTUDIO_DEFAULTS.sitio));
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
export async function signInStorage(email,password){if(state.failStorageLogin)throw Error('Sesión de fotos fallida');state.storageLogin={email,passwordPresent:!!password};}
export async function signOutStorage(){state.storageSignedOut=true;}
export async function readConfig(name){if(state.offline)throw Error('Offline');return state.config[name]||null;}
export async function readGallery(){if(state.offline)throw Error('Offline');return state.gallery;}
export async function saveConfig(name,value){state.config[name]=value;state.saved.push({name,value});}
export async function saveGalleryBatch(items){for(const item of items){state.gallery=state.gallery.filter(i=>i.id!==item.id);state.gallery.push(item);}state.saved.push({items});}
export async function uploadImage(file,path,progress){state.uploadAttempts++;if(state.failUpload||state.failAt===state.uploadAttempts)throw Error('Carga de prueba fallida');progress(100);const url='https://example.com/'+encodeURIComponent(path);state.uploads.push({name:file.name,type:file.type,size:file.size,path,url,bucket:'fotos'});return url;}export async function uploadReference(file,path,progress){state.uploadAttempts++;if(state.failReference||state.failAt===state.uploadAttempts)throw Error(state.failReferenceMessage||'Carga de referencia fallida');progress(100);const url='https://example.com/referencias/'+path;state.uploads.push({name:file.name,type:file.type,size:file.size,path,url,bucket:'referencias'});return url;}
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
  if(route.request().resourceType()==='image')return route.fulfill({contentType:'image/png',body:png,headers:url.hostname==='example.com'?{'Access-Control-Allow-Origin':'*'}:{}});
  return route.abort();
 });
 await context.addInitScript(value=>{
  window.__mock={config:{},gallery:[],saved:[],uploads:[],uploadAttempts:0,deleted:[],...value};
  window.__opened=[];
  window.open=(url)=>{if(url!=='about:blank')window.__opened.push(url);let current=url;const loc={replace(link){current=link;if(link&&link!=='about:blank')window.__opened.push(link);}};Object.defineProperty(loc,'href',{get(){return current;},set(v){current=v;if(v&&v!=='about:blank')window.__opened.push(v);},configurable:true});return {opener:null,closed:false,document:{title:'',body:{textContent:''}},location:loc,close(){window.__mock.closed=true;this.closed=true;}};};
 },settings);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());
 return {context,page,errors};
}
async function quote(page){
 await page.goto(base+'/index.html#cotizacion');
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
 await test('WhatsApp con fotos sube referencias y pone los enlaces en el mensaje',async()=>{
  const {page,context}=await session();await quote(page);await page.setInputFiles('#referencias_archivos',[photo('guía.png'),photo('otra.png')]);await page.click('#enviar-obra');
  await page.waitForFunction(()=>window.__mock.uploads.filter(u=>u.bucket==='referencias').length===2);
  await page.waitForFunction(()=>window.__opened.some(u=>String(u).includes('wa.me')));
  const state=await page.evaluate(()=>window.__mock);
  assert.equal(state.uploads.filter(u=>u.bucket==='fotos').length,0);
  assert.equal(state.uploads.length,2);
  assert.match(state.uploads[0].path,/^pedidos\/[0-9a-f-]{36}\/1\.(webp|jpg)$/);
  assert.match(state.uploads[1].path,/^pedidos\/[0-9a-f-]{36}\/2\.(webp|jpg)$/);
  const link=await page.evaluate(()=>window.__opened.find(u=>String(u).includes('wa.me')));
  const text=new URL(link).searchParams.get('text');
  assert.match(text,/Foto(s)? de referencia/);assert.match(text,/700.000/);
  assert.match(text,/https:\/\/example\.com\/referencias\/pedidos\//);
  assert.equal((text.match(/https:\/\/example\.com\/referencias\/pedidos\//g)||[]).length,2);
  assert.ok(!/Te envío/.test(text));
  assert.equal(await page.locator('#whatsapp-continuar').isVisible(),true);
  assert.equal(await page.locator('#referencias-compartir').isHidden(),true);
  assert.match(await page.textContent('#referencias-estado'),/enlace/);
  await context.close();
 });
 await test('Si falla la subida, WhatsApp abre con aviso y se puede compartir como respaldo',async()=>{
  const {page,context}=await session({failReference:true,failReferenceMessage:'Sin red de prueba'});
  await page.addInitScript(()=>{
   window.__shared=[];
   navigator.canShare=data=>!!(data&&data.files&&data.files.length);
   navigator.share=async data=>{window.__shared.push({files:[...data.files].map(f=>f.name),text:data.text});};
  });
  await quote(page);await page.setInputFiles('#referencias_archivos',[photo('guía.png'),photo('otra.png')]);await page.click('#enviar-obra');
  await page.waitForFunction(()=>window.__opened.some(u=>String(u).includes('wa.me')));
  assert.equal(await page.evaluate(()=>window.__mock.uploads.length),0);
  const link=await page.evaluate(()=>window.__opened.find(u=>String(u).includes('wa.me')));
  const text=new URL(link).searchParams.get('text');
  assert.match(text,/Te envío/);assert.match(text,/700.000/);assert.ok(!/example\.com\/referencias/.test(text));
  assert.equal(await page.locator('#referencias-compartir').isVisible(),true);
  assert.match(await page.textContent('#referencias-estado'),/No se pudo subir/);
  await page.click('#referencias-compartir');await page.waitForFunction(()=>window.__shared.length===1);
  assert.deepEqual(await page.evaluate(()=>window.__shared[0].files),['referencia-1.png','referencia-2.png']);await context.close();
 });
 await test('Inicio, menú inferior y hashes',async()=>{
  const {page,context}=await session();await page.setViewportSize({width:390,height:844});await page.goto(base+'/index.html');
  assert.equal(await page.locator('#tab-inicio').isVisible(),true);assert.equal(await page.locator('#tab-cotizacion').isVisible(),false);
  const nav=await page.locator('.bottom-nav').boundingBox();assert.ok(Math.abs(nav.y+nav.height-844)<2);
  for(const b of await page.locator('.bottom-nav .tab-btn').all()){const box=await b.boundingBox();assert.ok(box.height>=44&&box.width>=44);}
  await page.click('.tab-btn[data-tab="cotizacion"]');assert.equal(new URL(page.url()).hash,'#cotizacion');
  await page.selectOption('#estilo','Realista');await page.selectOption('#tecnica','Oleo');await page.selectOption('#tema','Retrato');await page.selectOption('#tamano_predefinido','30x40');
  await page.waitForTimeout(800);const foot=await page.locator('#sticky-footer').boundingBox();assert.ok(foot.y+foot.height<=nav.y+1,JSON.stringify([foot,nav]));
  await page.click('.tab-btn[data-tab="inicio"]');assert.equal(await page.locator('#sticky-footer').isVisible(),false);assert.equal(await page.locator('.bottom-nav .tab-btn').count(),3);assert.equal(await page.locator('#tab-inicio img.artista-foto').isVisible(),true);assert.ok((await page.locator('#tab-inicio img.artista-foto').boundingBox()).width>=300);assert.equal(await page.locator('#tab-inicio #vista-albumes').isVisible(),true);
  await page.goto(base+'/index.html#galeria/retrato/2');await page.waitForSelector('#imageModal:not([hidden])');assert.equal(await page.locator('.tab-btn.active').getAttribute('data-tab'),'inicio');await page.keyboard.press('Escape');
  await page.goto(base+'/index.html#inicio');assert.equal(await page.locator('.tab-btn.active').getAttribute('data-tab'),'inicio');
  await page.goto(base+'/index.html#cursos');assert.equal(await page.locator('.tab-btn.active').getAttribute('data-tab'),'curso');
  await page.screenshot({path:'/workspace/harold-app-cursos.png'});await context.close();
 });
 await test('Mezcla pública preserva semilla, agrega categoría y trata textos como texto',async()=>{
  const {page,context}=await session({config:{categorias:{items:[{id:'nuevo',name:'Categoría de prueba'}]}},gallery:[{id:'nueva',url:'https://example.com/foto.png',category:'nuevo',order:180,caption:'<img src=x onerror=alert(1)>',cover:true,hidden:false},{id:'seed-001',url:'https://example.com/original.png',category:'retrato',caption:'',order:0,cover:false,hidden:true}]});
  await page.goto(base+'/index.html');await page.waitForSelector('[data-album="nuevo"]',{state:'attached'});assert.equal(await page.locator('#mainGallery .gallery-item').count(),152);assert.equal(await page.locator('[data-gallery-id="seed-002"]').count(),1);assert.equal(await page.locator('.gallery-caption img').count(),0);await page.click('[data-album="nuevo"]');assert.equal(await page.textContent('#titulo-album-abierto'),'Categoría de prueba');await context.close();
 });
 await test('Administrador requiere cuenta verificada',async()=>{
  for(const user of [{email:'other@example.com',emailVerified:true},{email:'henro89@gmail.com',emailVerified:false}]){
   const {page,context}=await session({user});await page.goto(base+'/admin.html');await page.waitForTimeout(100);assert.equal(await page.locator('#admin-workspace').isHidden(),true);await context.close();
  }
 });
 await test('Administrador: login, precios, galería, categorías y contacto',async()=>{
  const {page,context,errors}=await session();await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  assert.deepEqual(await page.evaluate(()=>window.__mock.storageLogin),{email:'henro89@gmail.com',passwordPresent:true});
  assert.equal(await page.inputValue('#admin-password'),'');
  assert.equal(await page.locator('.admin-image-card').count(),152);
  await page.click('.admin-bottom-nav [data-screen=precios-admin]');await page.locator('details').evaluateAll(items=>items.forEach(i=>i.open=true));await page.fill('#price-matriz-30x40-realista','900000');await page.locator('#prices-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.config.precios?.matriz['30x40'].realista===900000);
  await page.click('.admin-bottom-nav [data-screen=categorias-admin]');await page.fill('#category-name','Taller de prueba');await page.locator('#category-form button').click();await page.waitForFunction(()=>window.__mock.config.categorias?.items.some(i=>i.name==='Taller de prueba'));
  await page.click('.admin-bottom-nav [data-screen=galeria-admin]');await page.selectOption('#upload-category','taller-de-prueba');await page.setInputFiles('#gallery-files',photo('nueva.png'));await page.locator('#gallery-upload-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.storagePath?.startsWith('galeria/')));
  assert.equal(await page.locator('.admin-image-card').count(),153);
  const first=page.locator('.admin-image-card').first();await first.locator('input[id^=caption]').fill('Texto ingresado en prueba');await first.locator('input[id^=hidden]').check();await first.locator('button[type=submit]').click();await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.id==='seed-001'&&i.hidden&&i.caption==='Texto ingresado en prueba'));
  const second=page.locator('form.admin-image-card:has(#caption-seed-002)');
  await second.getByRole('button',{name:'Editar foto'}).click();await page.waitForSelector('#photo-editor .editor-canvas');await page.waitForFunction(()=>!document.querySelector('#photo-editor .editor-save').disabled);
  const handle=await page.locator('.editor-se').boundingBox();const wrap=await page.locator('.editor-wrap').boundingBox();
  await page.mouse.move(handle.x+14,handle.y+14);await page.mouse.down();await page.mouse.move(handle.x+14-wrap.width/2,handle.y+14-wrap.height/2,{steps:4});await page.mouse.up();
  await page.locator('.editor-btn',{hasText:'Girar a la derecha'}).click();await page.locator('.editor-save').click();
  // La foto local del catálogo es exportable por canvas: se sube el recorte como archivo nuevo.
  await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.id==='seed-002'&&/^galeria\/seed-002\/.+-editada\.(webp|jpg)$/.test(i.storagePath)&&!i.edit));
  assert.equal(await page.locator('#photo-editor').count(),0);
  const third=page.locator('form.admin-image-card:has(#caption-seed-003)');await third.getByRole('button',{name:'Eliminar'}).click();await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.id==='seed-003'&&i.hidden));
  assert.equal(await third.locator('.admin-badge').textContent(),'Eliminada de la galería');assert.equal(await third.getByRole('button',{name:'Volver a mostrar'}).count(),1);
  assert.equal(await page.evaluate(()=>window.__mock.deleted.length),0);
  const nueva=page.locator('.admin-image-card').last();const oldPath=await page.evaluate(()=>window.__mock.gallery.find(i=>!/^(seed|ig)-/.test(i.id)).storagePath);
  await nueva.getByRole('button',{name:'Editar foto'}).click();await page.waitForSelector('#editor-file',{state:'attached'});await page.setInputFiles('#editor-file',photo('cambio.png'));
  await page.waitForFunction(()=>!document.querySelector('#photo-editor .editor-save').disabled);await page.locator('.editor-save').click();
  await page.waitForFunction(p=>window.__mock.deleted.includes(p),oldPath);
  const changed=await page.evaluate(()=>window.__mock.gallery.find(i=>!/^(seed|ig)-/.test(i.id)));assert.match(changed.storagePath,/^galeria\/[^/]+\/cambio-editada\.(webp|jpg)$/);assert.equal(changed.edit,undefined);
  const nueva2=page.locator('.admin-image-card').last();await nueva2.getByRole('button',{name:'Editar foto'}).click();await page.waitForFunction(()=>document.querySelector('#photo-editor .editor-save')&&!document.querySelector('#photo-editor .editor-save').disabled);
  await page.locator('.editor-btn',{hasText:'Girar a la izquierda'}).click();await page.locator('.editor-save').click();await page.waitForFunction(p=>window.__mock.deleted.includes(p),changed.storagePath);
  assert.equal(await page.evaluate(()=>window.__mock.uploads.length),4);
  await page.click('.admin-bottom-nav [data-screen=sitio-admin]');await page.fill('#site-whatsapp','595971000000');await page.fill('#text-subtitulo','Texto local de prueba');await page.locator('#site-form button[type=submit]').click();await page.waitForFunction(()=>window.__mock.config.sitio?.whatsapp==='595971000000');
  await page.click('.admin-bottom-nav [data-screen=galeria-admin]');const last=page.locator('.admin-image-card').last();await last.getByRole('button',{name:'Eliminar'}).click();await page.waitForFunction(()=>window.__mock.deleted.length===3);assert.equal(await page.locator('.admin-image-card').count(),152);
  await page.screenshot({path:'/workspace/harold-admin-desktop.png',fullPage:false});assert.deepEqual(errors,[]);await page.click('#logout');await page.waitForFunction(()=>window.__mock.storageSignedOut&&!document.getElementById('login-panel').hidden);await context.close();
 });
 await test('Administrador móvil: menú inferior con cuatro secciones, hash y botones visibles',async()=>{
  const {page,context,errors}=await session();await page.setViewportSize({width:390,height:844});await page.goto(base+'/admin.html#precios-admin');
  assert.equal(await page.locator('.admin-bottom-nav').isVisible(),false);
  await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  const tabs=page.locator('.admin-bottom-nav .tab-btn');assert.equal(await tabs.count(),4);assert.deepEqual(await tabs.allTextContents(),['Galería','Álbumes','Precios','Textos']);
  const nav=await page.locator('.admin-bottom-nav').boundingBox();assert.ok(Math.abs(nav.y+nav.height-844)<2);
  for(const t of await tabs.all()){const b=await t.boundingBox();assert.ok(b.height>=44&&b.width>=44);}
  assert.equal(await page.locator('.admin-bottom-nav .active').getAttribute('data-screen'),'precios-admin');assert.equal(await page.locator('#galeria-admin').isVisible(),false);
  await tabs.nth(0).click();await page.waitForFunction(()=>document.getElementById('precios-admin').hidden);assert.equal(new URL(page.url()).hash,'#galeria-admin');assert.equal(await page.locator('#precios-admin').isVisible(),false);
  const card=page.locator('form.admin-image-card:has(#caption-seed-001)');assert.equal(await card.getByRole('button',{name:'Editar foto'}).isVisible(),true);assert.equal(await card.getByRole('button',{name:'Eliminar'}).isVisible(),true);
  await page.evaluate(()=>window.scrollTo(0,2500));const y=await page.evaluate(()=>scrollY);await tabs.nth(1).click();await page.waitForFunction(()=>document.getElementById('galeria-admin').hidden);await tabs.nth(0).click();await page.waitForFunction(()=>!document.getElementById('galeria-admin').hidden);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>scrollY),y);
  await page.goto(base+'/admin.html#sitio-admin');await page.waitForSelector('#admin-workspace:not([hidden])');
  await page.locator('#site-form button[type=submit]').scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const btn=await page.locator('#site-form button[type=submit]').boundingBox();const nav2=await page.locator('.admin-bottom-nav').boundingBox();assert.ok(btn.y+btn.height<=nav2.y,JSON.stringify([btn,nav2]));
  await page.goto(base+'/admin.html#galeria-admin');await page.waitForSelector('#admin-workspace:not([hidden])');await page.locator('form.admin-image-card:has(#caption-seed-001)').getByRole('button',{name:'Editar foto'}).click();
  await page.waitForSelector('#photo-editor .editor-canvas');assert.equal(await page.locator('.admin-bottom-nav').isVisible(),false);await page.screenshot({path:'/workspace/harold-admin-editor.png'});
  await page.locator('.editor-cancel').click();assert.equal(await page.locator('#photo-editor').count(),0);
  assert.deepEqual(errors,[]);await page.screenshot({path:'/workspace/harold-admin-mobile-nav.png'});await context.close();
 });
 await test('Foto externa sin CORS: el recorte se guarda como ajuste y se ve en el admin',async()=>{
  const {page,context,errors}=await session({gallery:[{id:'seed-001',url:'https://i.postimg.cc/x/original.png',category:'retrato',caption:'',alt:'',order:0,cover:false,hidden:false,storagePath:''}]});
  // Playwright sirve las imágenes interceptadas con CORS; se simula el canvas "tainted" de un host externo real.
  await page.addInitScript(()=>{const err=()=>new DOMException('Tainted canvas','SecurityError');const gid=CanvasRenderingContext2D.prototype.getImageData;CanvasRenderingContext2D.prototype.getImageData=function(...a){if(window.__taint)throw err();return gid.apply(this,a);};const tb=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...a){if(window.__taint)throw err();return tb.apply(this,a);};window.__taint=true;});
  await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  const card=page.locator('form.admin-image-card:has(#caption-seed-001)');await card.getByRole('button',{name:'Editar foto'}).click();
  await page.waitForFunction(()=>document.querySelector('.editor-status')?.textContent.includes('ajuste de vista'));
  const handle=await page.locator('.editor-se').boundingBox();const wrap=await page.locator('.editor-wrap').boundingBox();
  await page.mouse.move(handle.x+14,handle.y+14);await page.mouse.down();await page.mouse.move(handle.x+14-wrap.width/2,handle.y+14-wrap.height/2,{steps:4});await page.mouse.up();
  await page.locator('.editor-btn',{hasText:'Girar a la derecha'}).click();await page.locator('.editor-save').click();
  await page.waitForFunction(()=>window.__mock.gallery.some(i=>i.id==='seed-001'&&i.edit&&i.edit.r===90&&i.edit.w<60&&i.url.includes('postimg')));
  assert.equal(await page.evaluate(()=>window.__mock.uploads.length),0);
  assert.ok(await page.locator('form.admin-image-card:has(#caption-seed-001) img').getAttribute('data-edit'));assert.deepEqual(errors,[]);await context.close();
 });
 await test('Recorte guardado como ajuste se aplica en la galería pública y el visor',async()=>{
  const {page,context}=await session({gallery:[{id:'seed-001',url:'https://i.postimg.cc/x/original.png',category:'retrato',caption:'',alt:'',order:0,cover:false,hidden:false,storagePath:'',edit:{x:10,y:10,w:50,h:60,r:90}}]});
  await page.goto(base+'/index.html');await page.waitForFunction(()=>document.querySelector('[data-gallery-id="seed-001"] img')?.dataset.edit);
  assert.equal(await page.locator('[data-gallery-id="seed-001"] img').evaluate(i=>i.style.rotate),'90deg');await context.close();
 });
 await test('Foto de Inicio: editor, Quitar fondo (simulado), guardado en sitio/ y config',async()=>{
  const {page,context,errors}=await session({config:{sitio:{...sitioBase,fotoArtista:'https://example.com/sitio/artista-viejo.png',fotoArtistaPath:'sitio/artista-viejo.png'}}});
  await page.addInitScript(()=>{window.__quitarFondoMock=async src=>{window.__fondoQuitado=(window.__fondoQuitado||0)+1;const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);x.clearRect(0,0,Math.ceil(c.width/2),c.height);return c;};});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/admin.html#sitio-admin');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  assert.equal(await page.locator('#foto-inicio-admin h2').textContent(),'Foto de Inicio');assert.equal(await page.getAttribute('#foto-inicio-preview','src'),'https://example.com/sitio/artista-viejo.png');
  await page.click('#foto-inicio-editar');await page.waitForFunction(()=>document.querySelector('#photo-editor .editor-save')&&!document.querySelector('#photo-editor .editor-save').disabled);
  await page.locator('.editor-btn',{hasText:'Quitar fondo'}).click();await page.waitForFunction(()=>document.querySelector('.editor-status').textContent.includes('Fondo quitado'));
  assert.equal(await page.evaluate(()=>window.__fondoQuitado),1);
  await page.locator('.editor-btn',{hasText:'Girar a la derecha'}).click();await page.locator('.editor-save').click();
  await page.waitForFunction(()=>window.__mock.config.sitio.fotoArtistaPath!=='sitio/artista-viejo.png'&&window.__mock.deleted.length>0);
  const st=await page.evaluate(()=>JSON.parse(JSON.stringify({uploads:window.__mock.uploads,config:window.__mock.config,deleted:window.__mock.deleted})));const up=st.uploads[st.uploads.length-1];
  assert.match(up.path,/^sitio\/artista-[a-z0-9]+\.(png|webp)$/);assert.match(up.type,/^image\/(png|webp)$/);assert.equal(st.config.sitio.fotoArtista,up.url);
  assert.ok(st.deleted.includes('sitio/artista-viejo.png'));assert.equal(st.config.sitio.whatsapp,sitioBase.whatsapp);
  assert.equal(await page.getAttribute('#foto-inicio-preview','src'),up.url);
  await page.locator('#site-form button[type=submit]').click();await page.waitForFunction(u=>window.__mock.saved.filter(s=>s.name==='sitio').length===2&&window.__mock.config.sitio.fotoArtista===u,up.url);
  assert.deepEqual(errors,[]);await context.close();
 });
 await test('Sitio público usa la foto de Inicio guardada y, sin ella, artista.jpg',async()=>{
  let {page,context}=await session({config:{sitio:{...sitioBase,fotoArtista:'https://example.com/sitio/artista-nueva.png',fotoArtistaPath:'sitio/artista-nueva.png'}}});
  await page.goto(base+'/index.html');await page.waitForFunction(()=>document.querySelector('img.artista-foto').src.includes('artista-nueva.png'));
  assert.equal(await page.getAttribute('img.artista-foto','alt'),'Harold Lezcano, artista plástico');assert.equal(await page.locator('img.artista-foto.artista-foto-propia').count(),1);await context.close();
  ({page,context}=await session());await page.goto(base+'/index.html');await page.waitForTimeout(300);assert.match(await page.getAttribute('img.artista-foto','src'),/^artista\.jpg$/);await context.close();
 });
 await test('Fondo de la página: cambiar imagen, opacidad y restaurar original',async()=>{
  const {page,context,errors}=await session({config:{sitio:{...sitioBase,fondoImagen:'https://example.com/sitio/fondo-viejo.webp',fondoImagenPath:'sitio/fondo-viejo.webp',fondoOpacidad:0.3}}});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/admin.html#sitio-admin');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');
  assert.equal(await page.locator('#fondo-admin h2').textContent(),'Fondo de la página');
  assert.equal(await page.inputValue('#fondo-opacidad'),'30');assert.equal(await page.textContent('#fondo-opacidad-valor'),'30 %');
  assert.equal(await page.locator('#fondo-quitar').isVisible(),true);
  await page.fill('#fondo-opacidad','70');await page.dispatchEvent('#fondo-opacidad','change');
  await page.waitForFunction(()=>window.__mock.config.sitio?.fondoOpacidad===0.7);
  assert.equal(await page.evaluate(()=>window.__mock.config.sitio.fondoImagen),'https://example.com/sitio/fondo-viejo.webp');
  await page.click('#fondo-cambiar');await page.waitForFunction(()=>document.querySelector('#photo-editor .editor-save')&&!document.querySelector('#photo-editor .editor-save').disabled);
  await page.setInputFiles('#editor-file',photo('fondo.png'));await page.waitForFunction(()=>!document.querySelector('#photo-editor .editor-save').disabled);
  await page.locator('.editor-save').click();
  await page.waitForFunction(()=>window.__mock.config.sitio?.fondoImagenPath?.startsWith('sitio/fondo-')&&window.__mock.deleted.includes('sitio/fondo-viejo.webp'));
  const st=await page.evaluate(()=>JSON.parse(JSON.stringify({uploads:window.__mock.uploads,config:window.__mock.config})));
  const up=st.uploads.find(u=>u.path.startsWith('sitio/fondo-'));assert.ok(up);assert.equal(st.config.sitio.fondoImagen,up.url);assert.equal(st.config.sitio.fondoOpacidad,0.7);
  await page.fill('#site-whatsapp','595971111111');await page.locator('#site-form button[type=submit]').click();
  await page.waitForFunction(()=>window.__mock.config.sitio?.whatsapp==='595971111111'&&window.__mock.config.sitio.fondoImagenPath?.startsWith('sitio/fondo-')&&window.__mock.config.sitio.fondoOpacidad===0.7);
  await page.click('#fondo-quitar');await page.waitForFunction(()=>!window.__mock.config.sitio.fondoImagen&&!window.__mock.config.sitio.fondoImagenPath&&window.__mock.config.sitio.fondoOpacidad===0.7);
  assert.deepEqual(errors,[]);await context.close();
 });
 await test('Sitio público aplica imagen y opacidad de fondo; sin config usa el original',async()=>{
  let {page,context}=await session({config:{sitio:{...sitioBase,fondoImagen:'https://example.com/sitio/fondo-nueva.webp',fondoImagenPath:'sitio/fondo-nueva.webp',fondoOpacidad:0.55}}});
  await page.goto(base+'/index.html');await page.waitForFunction(()=>getComputedStyle(document.querySelector('.page-background')).getPropertyValue('--fondo-opacidad').trim()==='0.55');
  const url=await page.evaluate(()=>getComputedStyle(document.querySelector('.page-background')).getPropertyValue('--fondo-url'));
  assert.match(url,/fondo-nueva\.webp/);await context.close();
  ({page,context}=await session());await page.goto(base+'/index.html');await page.waitForTimeout(200);
  const def=await page.evaluate(()=>({op:getComputedStyle(document.querySelector('.page-background')).getPropertyValue('--fondo-opacidad').trim(),url:getComputedStyle(document.querySelector('.page-background')).getPropertyValue('--fondo-url')}));
  assert.ok(Number(def.op)>0);assert.match(def.url,/Picsart-26-04-28|i\.postimg\.cc/);await context.close();
 });
 await test('Fallo del login de fotos cierra Firebase y conserva el panel bloqueado',async()=>{
  const {page,context}=await session({failStorageLogin:true});await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');
  await page.waitForFunction(()=>document.getElementById('admin-status').textContent.includes('Sesión de fotos fallida'));
  assert.equal(await page.locator('#admin-workspace').isHidden(),true);assert.equal(await page.inputValue('#admin-password'),'');assert.equal(await page.evaluate(()=>window.__mock.storageSignedOut),true);await context.close();
 });
 await test('Vista móvil y rutas de galería sin desbordamiento',async()=>{
  const {page,context}=await session();await page.setViewportSize({width:390,height:844});await quote(page);await page.setInputFiles('#referencias_archivos',photo());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/workspace/harold-cotizador-mobile.png',fullPage:true});
  await page.goto(base+'/admin.html');await page.fill('#admin-password','clave-simulada-local');await page.click('#login-button');await page.waitForSelector('#admin-workspace:not([hidden])');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/workspace/harold-admin-mobile.png',fullPage:false});await context.close();
 });
 console.log(JSON.stringify(results,null,2));fs.writeFileSync(path.join(root,'resultados-navegador.json'),JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
