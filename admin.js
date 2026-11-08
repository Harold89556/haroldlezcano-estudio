import * as api from './firebase-client.js';
import { abrirEditor } from './admin-editor.js';
const $ = id => document.getElementById(id);
const D = window.EstudioDatos;
const defaults = window.ESTUDIO_DEFAULTS;
let categories = D.clone(defaults.categorias);
let prices = D.clone(defaults.precios);
let site = D.clone(defaults.sitio);
let seed = [];
let gallery = [];
let services;
let readGeneration = 0;
let uploading = false;
let signingIn = false;
let savedPending=[];try { savedPending=JSON.parse(localStorage.getItem('hl-pending-gallery') || '[]'); }catch{}
const pending = new Set(Array.isArray(savedPending)?savedPending.filter(p=>typeof p==='string'&&(p.startsWith('galeria/')||p.startsWith('sitio/'))):[]);
const say = text => { $('admin-status').textContent = text; };
function busy(form, value) { for(const control of form.querySelectorAll('input,select,textarea,button')) control.disabled=value; }
async function action(form, callback, output = say) {
 busy(form,true);
 try { await callback(); }
 catch(error) { output(api.explainError(error)); }
 finally { busy(form,false); }
}
function makeLabel(text, control) { const label=document.createElement('label');label.htmlFor=control.id;label.textContent=text;return label; }
function setPending(path, add) {
 if(add) pending.add(path);else pending.delete(path);
 try {localStorage.setItem('hl-pending-gallery',JSON.stringify([...pending]));}catch{}renderPending();
}
function renderPending() {
 $('pending-files-panel').hidden=!pending.size;$('pending-files').replaceChildren();
 for(const path of pending) {
  const row=document.createElement('p');const name=document.createElement('span');name.textContent=path;
  const button=document.createElement('button');button.type='button';button.className='admin-secondary';button.textContent='Borrar archivo pendiente';
  button.onclick=()=>action(row,async()=>{if(!confirm('¿Borrar este archivo pendiente de Storage?')) return;await api.deleteStorageFile(path);setPending(path,false);say('Archivo pendiente borrado.');});
  row.append(name,button);$('pending-files').append(row);
 }
}
function galleryRecord(item) {
 return { url:item.url, category:item.category, caption:item.caption || '', alt:item.alt || '', order:Number(item.order), cover:Boolean(item.cover), hidden:Boolean(item.hidden), storagePath:item.storagePath || '', ...(window.EstudioRecorte.valido(item.edit)?{edit:{x:item.edit.x,y:item.edit.y,w:item.edit.w,h:item.edit.h,r:item.edit.r}}:{}) };
}
async function persistItem(item) {
 const edits = [];
 if(item.cover && !item.hidden) {
  for(const old of gallery) if(old.id!==item.id && old.category===item.category && old.cover) edits.push({id:old.id,...galleryRecord({...old,cover:false})});
 }
 edits.push({id:item.id,...galleryRecord(item)});
 await api.saveGalleryBatch(edits);
 for(const edit of edits) {
  const n=gallery.findIndex(i=>i.id===edit.id);
  if(n>=0)gallery[n]=edit;else gallery.push(edit);
 }
}
function fillCategorySelect(select, includeAll = false) {
 const previous=select.value;select.replaceChildren();
 if(includeAll) select.add(new Option('Todos los álbumes',''));
 for(const c of categories) select.add(new Option(c.name,c.id));
 if([...select.options].some(o=>o.value===previous)) select.value=previous;
}
function renderCategories() {
 fillCategorySelect($('upload-category'));fillCategorySelect($('gallery-filter'),true);
 $('category-list').replaceChildren();
 for(const c of categories) {
  const form=document.createElement('form');form.className='admin-category-row';
  const input=document.createElement('input');input.id='category-'+c.id;input.value=c.name;input.maxLength=80;input.required=true;
  const small=document.createElement('small');small.textContent='Identificador: '+c.id;
  const save=document.createElement('button');save.className='admin-secondary';save.type='submit';save.textContent='Guardar nombre';
  form.append(makeLabel('Nombre del álbum',input),input,small,save);
  form.onsubmit=e=>{e.preventDefault();action(form,async()=>{
   const next=D.validateCategories(categories.map(item=>item.id===c.id?{...item,name:input.value}:item));
   await api.saveConfig('categorias',{items:next});categories=next;renderCategories();renderGallery();say('Nombre del álbum guardado.');
  });};$('category-list').append(form);
 }
}
function renderGallery() {
 const filter=$('gallery-filter').value;
 const items=gallery.filter(item=>!filter || item.category===filter).sort((a,b)=>a.order-b.order);
 $('gallery-count').textContent=items.length+' fotos'+(filter?' en este álbum':' en total');
 $('gallery-admin-items').replaceChildren();
 for(const item of items) {
  const card=document.createElement('form');card.className='admin-image-card';
  const img=document.createElement('img');img.src=item.url;img.alt=item.caption || item.alt || 'Obra de Harold Lezcano';img.loading='lazy';
  const cat=document.createElement('select');cat.id='cat-'+item.id;fillCategorySelect(cat);cat.value=item.category;
  const caption=document.createElement('input');caption.id='caption-'+item.id;caption.maxLength=240;caption.value=item.caption || '';
  const order=document.createElement('input');order.id='order-'+item.id;order.type='number';order.step='1';order.min='0';order.max='1000000';order.value=String(item.order);
  const cover=document.createElement('input');cover.id='cover-'+item.id;cover.type='checkbox';cover.checked=item.cover;
  const hidden=document.createElement('input');hidden.id='hidden-'+item.id;hidden.type='checkbox';hidden.checked=item.hidden;
  const save=document.createElement('button');save.type='submit';save.className='admin-secondary';save.textContent='Guardar cambios';
  const note=document.createElement('p');note.className='admin-card-status';note.setAttribute('role','status');
  const original=item.id.startsWith('seed-')||item.id.startsWith('ig-');
  if(item.hidden) card.classList.add('admin-card-hidden');
  window.EstudioRecorte.aplicar(img,item.edit);
  const thumb=document.createElement('div');thumb.className='admin-thumb';thumb.append(img);
  if(item.hidden){const badge=document.createElement('span');badge.className='admin-badge';badge.textContent='Eliminada de la galería';thumb.append(badge);}
  const actions=document.createElement('div');actions.className='admin-photo-actions';
  const editBtn=document.createElement('button');editBtn.type='button';editBtn.className='admin-edit';editBtn.innerHTML='<i class="fas fa-crop-simple" aria-hidden="true"></i> ';editBtn.append('Editar foto');
  editBtn.onclick=()=>abrirEditor({url:item.url,edit:item.edit,title:item.caption||'',onSave:async(result,progress)=>{
   if(result.file){
    const file=result.file;const previous=item.storagePath||'';
    let path='galeria/'+item.id+'/'+api.safeName(file.name);if(path===previous)path='galeria/'+item.id+'/'+Date.now().toString(36)+'-'+api.safeName(file.name);
    setPending(path,true);
    const url=await api.uploadImage(file,path,p=>progress('Subiendo: '+p+'%'));
    await persistItem({...item,url,storagePath:path,edit:null});setPending(path,false);
    if(previous && previous!==path && previous.startsWith('galeria/')) { try { await api.deleteStorageFile(previous); } catch { setPending(previous,true); } }
    say('Foto editada y guardada.');
   } else {
    await persistItem({...item,edit:result.edit});say('Recorte guardado. La foto original no se modifica; el sitio la muestra recortada.');
   }
  }}).then(saved=>{if(saved)renderGallery();});
  const remove=document.createElement('button');remove.type='button';remove.className='admin-danger';
  remove.innerHTML='<i class="fas '+(original&&item.hidden?'fa-eye':'fa-trash')+'" aria-hidden="true"></i> ';remove.append(original&&item.hidden?'Volver a mostrar':'Eliminar');
  remove.onclick=()=>action(card,async()=>{
   if(original){
    if(!item.hidden && !confirm('¿Eliminar esta foto de la galería? Dejará de verse en el sitio.')) return;
    await persistItem({...item,hidden:!item.hidden});renderGallery();say(item.hidden?'Foto visible otra vez en el sitio.':'Foto eliminada de la galería. Podés volver a mostrarla desde acá.');
    return;
   }
   if(!confirm('¿Eliminar definitivamente esta foto de la galería y su archivo?')) return;
   try { await api.deleteGalleryItem(item); }
   catch(error) {
    if(error.galleryRemoved) { if(item.storagePath) setPending(item.storagePath,true);gallery=gallery.filter(i=>i.id!==item.id);renderGallery(); }
    throw error;
   }
   gallery=gallery.filter(i=>i.id!==item.id);renderGallery();say('Foto eliminada.');
  },text=>{note.textContent=text;});
  actions.append(editBtn,remove);
  card.append(thumb,actions,makeLabel('Álbum',cat),cat,makeLabel('Texto opcional',caption),caption,makeLabel('Orden (menor primero)',order),order,makeLabel('Portada del álbum',cover),cover,makeLabel('Oculta en el sitio',hidden),hidden,save,note);
  card.onsubmit=e=>{e.preventDefault();action(card,async()=>{
   const n=Number(order.value);if(!Number.isInteger(n)||n<0||n>1000000) throw Error('Usá un orden entero entre 0 y 1.000.000.');
   await persistItem({...item,category:cat.value,caption:caption.value.trim(),order:n,cover:cover.checked,hidden:hidden.checked});
   renderGallery();say('Foto actualizada.');
  },text=>{note.textContent=text;});};
  $('gallery-admin-items').append(card);
 }
}
const numericLabels = {
 matriz:'Óleo, carbonilla, personas extra y marcos',escultura:'Escultura modelada a mano',ajustes:'Otros importes y factores de cotización',cursos:'Cursos',
 espatulado:'Espatulado',realista:'Realista',hiper:'Hiperrealista',boceto:'Bocetado',extraPersona:'Persona extra',marcos:'Marcos',base:'Base carbonilla',
 Estandar:'Estándar',Cajon:'Cajón',Clasico:'Clásico',SemiRelieve:'Semi relieve',GruesoRelieves:'Grueso con relieves',
 min:'Altura mínima (cm)',max:'Altura máxima (cm)',step:'Paso de altura (cm)',def:'Altura inicial (cm)',minimo:'Precio mínimo',fijo:'Importe fijo',porCm:'Precio por cm',redondeo:'Redondear al múltiplo de',
 restauracionDigital:'Restauración digital simple',restauracionDigitalCompleja:'Restauración digital compleja',
 personalizadoMinRetrato:'Personalizado: mínimo retrato',personalizadoMinOtros:'Personalizado: mínimo otros temas',personalizadoCm2Retrato:'Personalizado: guaraníes por cm² (retrato)',personalizadoCm2Otros:'Personalizado: guaraníes por cm² (otros)',
 personalizadoEspatulado:'Personalizado: factor espatulado',personalizadoHiper:'Personalizado: factor hiperrealista',personalizadoBoceto:'Personalizado: factor bocetado',personalizadoExtraPersona:'Personalizado: persona extra',personalizadoMarcos:'Personalizado: marcos',
 carbonillaRespaldo:'Carbonilla: base de respaldo',carbonillaColor:'Factor carbonilla a color',acrilico:'Factor acrílico',circular:'Factor circular',ovalado:'Factor ovalado',mascota:'Factor mascota respecto a persona extra',fondo:'Factor de fondo complejo sobre base',cuotasMinimo:'Monto mínimo para tarjeta',tarjeta:'Factor recargo tarjeta',iva:'Factor IVA',senaDivisor:'Divisor para seña',cuotasCantidad:'Cantidad de cuotas',cambioUSD:'Respaldo: guaraníes por USD',cambioEUR:'Respaldo: EUR por USD',cambioBRL:'Respaldo: BRL por USD',matricula:'Matrícula',mensualidad:'Mensualidad',claseSuelta:'Clase suelta'
};
function renderPrices() {
 const root=$('price-fields');root.replaceChildren();
 function walk(object,parent,path=[]) {
  for(const [key,value] of Object.entries(object)) {
   const next=[...path,key];
   if(typeof value==='object') {
    const details=document.createElement('details');details.className='admin-price-group';details.open=path.length===0;
    const summary=document.createElement('summary');summary.textContent=numericLabels[key] || (/^\d+x\d+$/.test(key) ? key.replace('x',' × ')+' cm' : key);
    details.append(summary);if(key.startsWith('personalizado'))details.hidden=true;walk(value,details,next);parent.append(details);
   } else {
    const row=document.createElement('div');row.className='admin-number-row';
    const input=document.createElement('input');input.id='price-'+next.join('-').replaceAll(' ','-');input.type='number';input.min='0';input.max='1000000000000';input.step='any';input.required=true;input.value=String(value);input.dataset.path=JSON.stringify(next);
    row.append(makeLabel(numericLabels[key] || key,input),input);if(key.startsWith('personalizado'))row.hidden=true;parent.append(row);
   }
  }
 }
 walk(prices,root);
}
function renderSite() {
 $('foto-inicio-preview').src=site.fotoArtista||'artista.jpg';
 $('site-whatsapp').value=site.whatsapp;$('site-map').value=site.mapaCurso;
 $('site-text-fields').replaceChildren();
 for(const [key,value] of Object.entries(site.textos)) {
  const input=document.createElement('textarea');input.id='text-'+key;input.dataset.textKey=key;input.value=value;input.rows=3;input.maxLength=6000;
  $('site-text-fields').append(makeLabel(defaults.etiquetasTextos[key]||key,input),input);
 }
}
async function loadWorkspace() {
 const generation=++readGeneration;
 $('admin-workspace').hidden=true;say('Cargando la galería y la configuración…');
 try {
  const response=await fetch('./galeria-seed.json');if(!response.ok) throw Error('No se pudo leer la galería original.');
  seed=await response.json();
  try {
   const extraRes=await fetch('./galeria-ig.json');
   if(extraRes.ok){
    const extra=await extraRes.json();
    if(Array.isArray(extra)) seed=D.mergeGallery(seed,extra);
   }
  } catch { /* Si no carga el catálogo de Instagram, se editan solo las 152 originales. */ }
  // Si falla una lectura, no habilitar un formulario con valores por defecto que
  // pudiera sobrescribir una configuración existente por accidente.
  const [p,s,c,remote]=await Promise.all([api.readConfig('precios'),api.readConfig('sitio'),api.readConfig('categorias'),api.readGallery()]);
  if(generation!==readGeneration || !api.isAdmin(services.auth.currentUser)) return;
  prices=p?D.validatePrices(p):D.clone(defaults.precios);site=s?D.validateSite(s):D.clone(defaults.sitio);
  categories=c?D.validateCategories(c.items):D.clone(defaults.categorias);gallery=D.mergeGallery(seed,remote);
  renderCategories();renderGallery();renderPrices();renderSite();renderPending();$('admin-workspace').hidden=false;
  say('Sesión de administración activa. Los cambios se publican al guardar.');
 } catch(error) {say('No se habilitó la edición: '+api.explainError(error)+' Recargá la página cuando estén disponibles Firestore y sus reglas.');}
}
$('login-form').onsubmit=e=>{e.preventDefault();action(e.currentTarget,async()=>{
 if($('admin-email').value.trim().toLowerCase()!==api.ADMIN_EMAIL) throw Error('Este acceso es solo para el correo de administración del estudio.');
 services=await api.getServices();
 await services.authSDK.setPersistence(services.auth,services.authSDK.browserSessionPersistence);
 signingIn=true;
 try {
  await services.authSDK.signInWithEmailAndPassword(services.auth,$('admin-email').value.trim(),$('admin-password').value);
  if(api.isAdmin(services.auth.currentUser)) await api.signInStorage($('admin-email').value.trim(),$('admin-password').value);
 } catch(error) {
  await Promise.allSettled([api.signOutStorage(),services.authSDK.signOut(services.auth)]);
  throw error;
 } finally {signingIn=false;$('admin-password').value='';}
 if(api.isAdmin(services.auth.currentUser)) await loadWorkspace();
});};
$('logout').onclick=async()=>{const results=await Promise.allSettled([api.signOutStorage(),services.authSDK.signOut(services.auth)]);const failed=results.find(r=>r.status==='rejected');if(failed)say(api.explainError(failed.reason));};
$('reset-password').onclick=async()=>{
 if(!confirm('¿Enviar un enlace de recuperación de contraseña a henro89@gmail.com?')) return;
 try { services=await api.getServices();await services.authSDK.sendPasswordResetEmail(services.auth,api.ADMIN_EMAIL);say('Si la cuenta está habilitada, recibirás el enlace de recuperación.'); } catch(error){say(api.explainError(error));}
};
$('verify-email').onclick=async()=>{
 if(!confirm('¿Enviar un enlace de verificación a henro89@gmail.com?')) return;
 try { await services.authSDK.sendEmailVerification(services.auth.currentUser);say('Revisá tu correo para verificar la dirección.'); }catch(error){say(api.explainError(error));}
};
$('refresh-user').onclick=async()=>{
 try {await services.authSDK.reload(services.auth.currentUser);await services.auth.currentUser.getIdToken(true);
 if(api.isAdmin(services.auth.currentUser)) { $('verification-panel').hidden=true;await loadWorkspace(); }else say('El correo todavía no figura como verificado.');
 }catch(error){say(api.explainError(error));}
};
$('gallery-filter').onchange=renderGallery;
// Pantallas tipo app: una sección por vez, menú inferior y scroll recordado por pantalla.
const SCREENS={'galeria-admin':'galeria-admin',galeria:'galeria-admin','categorias-admin':'categorias-admin',albumes:'categorias-admin','precios-admin':'precios-admin',precios:'precios-admin','sitio-admin':'sitio-admin',textos:'sitio-admin',sitio:'sitio-admin'};
const scrolls={};let currentScreen='';
function showScreen(id){
 const next=SCREENS[id]||'galeria-admin';
 if(currentScreen) scrolls[currentScreen]=window.scrollY;
 for(const sec of document.querySelectorAll('.admin-screen')) sec.hidden=sec.id!==next;
 for(const a of document.querySelectorAll('.admin-bottom-nav .tab-btn')){const on=a.dataset.screen===next;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
 const changed=currentScreen!==next;currentScreen=next;document.body.dataset.pantalla=next;
 if(changed) requestAnimationFrame(()=>window.scrollTo(0,scrolls[next]||0));
}
window.addEventListener('hashchange',()=>showScreen(location.hash.slice(1)));
showScreen(location.hash.slice(1));
$('gallery-upload-form').onsubmit=e=>{e.preventDefault();if(uploading) return;const form=e.currentTarget;
 action(form,async()=>{
  const files=[...$('gallery-files').files];if(!files.length||files.length>10) throw Error('Elegí entre 1 y 10 imágenes por carga.');files.forEach(api.checkImage);
  const category=$('upload-category').value,caption=$('upload-caption').value.trim();
  const startOrder=Math.max(-1,...gallery.map(i=>i.order))+1;let completed=0;uploading=true;
  try {
   for(const [index,file] of files.entries()) {
    const id=api.newId(),path='galeria/'+id+'/'+api.safeName(file.name);
    setPending(path,true);
    const url=await api.uploadImage(file,path,p=>{$('gallery-upload-status').textContent='Foto '+(index+1)+' de '+files.length+': '+p+'%';});
    await persistItem({id,url,category,caption,alt:'',order:startOrder+index,cover:false,hidden:false,storagePath:path});
    setPending(path,false);completed++;
   }
   $('gallery-files').value='';$('upload-caption').value='';say('Fotos agregadas a la galería.');
  } finally {
   uploading=false;renderGallery();$('gallery-upload-status').textContent=completed+' de '+files.length+' fotos guardadas. Si hubo un error, seleccioná solo las restantes para evitar duplicados.';
  }
 });};
$('category-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;action(form,async()=>{
 const name=$('category-name').value.trim();if(!name) throw Error('Escribí un nombre.');
 let id=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32);
 if(!/^[a-z]/.test(id)) id=('album-'+id).slice(0,40);
 if(categories.some(c=>c.id===id)) id=id.slice(0,30)+'-'+api.newId().slice(0,6);
 const next=D.validateCategories([...categories,{id,name}]);await api.saveConfig('categorias',{items:next});categories=next;$('category-name').value='';renderCategories();renderGallery();say('Álbum creado. Ya aparece en la galería pública.');
});};
$('prices-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;action(form,async()=>{
 const next=D.clone(prices);
 for(const input of form.querySelectorAll('[data-path]')) {
  const path=JSON.parse(input.dataset.path);let object=next;for(const key of path.slice(0,-1)) object=object[key];object[path.at(-1)]=Number(input.value);
 }
 const validated=D.validatePrices(next);await api.saveConfig('precios',validated);prices=validated;$('prices-status').textContent='Precios guardados. El cotizador los lee al abrir o recargar la página.';
},text=>{$('prices-status').textContent=text;});};
$('reset-prices').onclick=()=>{if(confirm('¿Cargar los precios originales en el formulario sin publicar todavía?')){prices=D.clone(defaults.precios);renderPrices();$('prices-status').textContent='Valores originales cargados. Falta guardar para publicar.';}};
$('foto-inicio-editar').onclick=()=>{const out=t=>{$('foto-inicio-status').textContent=t;};
 abrirEditor({url:new URL(site.fotoArtista||'artista.jpg',location.href).href,title:'Foto de Inicio.',soloArchivo:true,onSave:async({file},progress)=>{
  const previous=site.fotoArtistaPath||'';const ext=(file.name.split('.').pop()||'png').toLowerCase();
  const path='sitio/artista-'+Date.now().toString(36)+'.'+ext;
  setPending(path,true);
  const url=await api.uploadImage(file,path,p=>progress('Subiendo: '+p+'%'));
  const next=D.validateSite({...site,fotoArtista:url,fotoArtistaPath:path});await api.saveConfig('sitio',next);site=next;setPending(path,false);
  if(previous&&previous!==path&&previous.startsWith('sitio/')){try{await api.deleteStorageFile(previous);}catch{setPending(previous,true);}}
  $('foto-inicio-preview').src=url;out('Foto de Inicio guardada. Ya se ve en el sitio.');
 }}).catch(e=>out(api.explainError(e)));
};
$('site-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;action(form,async()=>{
 const next={fotoArtista:site.fotoArtista,fotoArtistaPath:site.fotoArtistaPath,whatsapp:$('site-whatsapp').value.trim(),mapaCurso:$('site-map').value.trim(),textos:{}};
 for(const input of form.querySelectorAll('[data-text-key]')) next.textos[input.dataset.textKey]=input.value;
 const validated=D.validateSite(next);await api.saveConfig('sitio',validated);site=validated;$('site-status').textContent='Textos y contacto guardados.';
},text=>{$('site-status').textContent=text;});};
try {
 services=await api.getServices();
 services.authSDK.onAuthStateChanged(services.auth,async user=>{
  readGeneration++;$('admin-workspace').hidden=true;
  $('login-panel').hidden=Boolean(user);$('logout').hidden=!user;$('verification-panel').hidden=true;
  if(!user){say('Ingresá con la cuenta del estudio.');return;}
  if(user.email?.toLowerCase()!==api.ADMIN_EMAIL){await services.authSDK.signOut(services.auth);say('Esta cuenta no tiene acceso al administrador.');return;}
  if(!user.emailVerified){$('verification-panel').hidden=false;say('Verificá tu correo para habilitar la administración.');return;}
  if(!signingIn) await loadWorkspace();
 });
} catch(error) {say('Firebase todavía no está disponible: '+api.explainError(error));}
