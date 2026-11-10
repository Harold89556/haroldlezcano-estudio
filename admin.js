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
let adminLang='es';
const ADMIN_LANGS=[['es','Español'],['en','English'],['pt','Português'],['fr','Français'],['it','Italiano'],['de','Deutsch']];
function pintarLangTabs(host,hint){
 if(!host) return;
 host.replaceChildren();
 for(const [code,name] of ADMIN_LANGS){
  const b=document.createElement('button');b.type='button';b.className='idioma-tab'+(adminLang===code?' active':'');b.textContent=name;
  b.onclick=()=>{if(typeof flushTextosForm==='function') flushTextosForm();if(typeof flushCaptionsForm==='function') flushCaptionsForm();adminLang=code;renderSite();renderGallery();};
  host.append(b);
 }
 if(hint) hint.textContent=adminLang==='es'?'Estás editando el texto en español (el principal).':'Estás editando la traducción. Si un campo queda vacío, en el sitio se muestra el español.';
}
function valorTexto(key){
 const es=(site.textos&&site.textos[key])||'';
 if(adminLang==='es') return es;
 const has=site.textosI18n&&site.textosI18n[adminLang]&&Object.prototype.hasOwnProperty.call(site.textosI18n[adminLang],key);
 if(has) return site.textosI18n[adminLang][key];
 const def=window.ESTUDIO_DEFAULTS&&ESTUDIO_DEFAULTS.sitio&&ESTUDIO_DEFAULTS.sitio.textosI18n&&ESTUDIO_DEFAULTS.sitio.textosI18n[adminLang]&&ESTUDIO_DEFAULTS.sitio.textosI18n[adminLang][key];
 return typeof def==='string'?def:'';
}
function flushTextosForm(){
 if(!site) return;
 if(!site.textos) site.textos={};
 if(!site.textosI18n) site.textosI18n={};
 for(const input of document.querySelectorAll('#site-form [data-text-key]')){
  const key=input.dataset.textKey, lang=input.dataset.textLang||'es';
  if(lang==='es') site.textos[key]=input.value;
  else { if(!site.textosI18n[lang]) site.textosI18n[lang]={}; site.textosI18n[lang][key]=input.value; }
 }
}
function flushCaptionsForm(){
 if(!Array.isArray(gallery)) return;
 for(const input of document.querySelectorAll('#gallery-admin-items input[id^="caption-"]')){
  const id=input.id.slice('caption-'.length);
  const item=gallery.find(i=>i.id===id);
  if(!item) continue;
  const val=input.value.trim();
  if(adminLang==='es') item.caption=val;
  else { item.captions=item.captions||{}; if(val) item.captions[adminLang]=val; else delete item.captions[adminLang]; }
 }
}
function captionValor(item){
 if(adminLang==='es') return item.caption||'';
 const c=item.captions&&item.captions[adminLang];
 return typeof c==='string'?c:'';
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
 const rec={ url:item.url, category:item.category, caption:item.caption || '', alt:item.alt || '', order:Number(item.order), cover:Boolean(item.cover), hidden:Boolean(item.hidden), storagePath:item.storagePath || '', ...(window.EstudioRecorte.valido(item.edit)?{edit:{x:item.edit.x,y:item.edit.y,w:item.edit.w,h:item.edit.h,r:item.edit.r}}:{}) };
 if(item.captions&&typeof item.captions==='object'&&!Array.isArray(item.captions)) rec.captions=item.captions;
 return rec;
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
 pintarLangTabs($('gallery-lang-tabs'),$('gallery-lang-hint'));
 const filter=$('gallery-filter').value;
 const items=gallery.filter(item=>!filter || item.category===filter).sort((a,b)=>a.order-b.order);
 $('gallery-count').textContent=items.length+' fotos'+(filter?' en este álbum':' en total');
 $('gallery-admin-items').replaceChildren();
 for(const item of items) {
  const card=document.createElement('form');card.className='admin-image-card';
  const img=document.createElement('img');img.src=item.url;img.alt=item.caption || item.alt || 'Obra de Harold Lezcano';img.loading='lazy';
  const cat=document.createElement('select');cat.id='cat-'+item.id;fillCategorySelect(cat);cat.value=item.category;
  const caption=document.createElement('input');caption.id='caption-'+item.id;caption.maxLength=240;caption.value=captionValor(item);if(adminLang!=='es') caption.placeholder=item.caption||'';
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
  card.append(thumb,actions,makeLabel('Álbum',cat),cat,makeLabel(adminLang==='es'?'Texto opcional':'Texto opcional ('+adminLang+')',caption),caption,makeLabel('Orden (menor primero)',order),order,makeLabel('Portada del álbum',cover),cover,makeLabel('Oculta en el sitio',hidden),hidden,save,note);
  card.onsubmit=e=>{e.preventDefault();action(card,async()=>{
   const n=Number(order.value);if(!Number.isInteger(n)||n<0||n>1000000) throw Error('Usá un orden entero entre 0 y 1.000.000.');
   const nextItem={...item,category:cat.value,order:n,cover:cover.checked,hidden:hidden.checked};
   const val=caption.value.trim();
   if(adminLang==='es') nextItem.caption=val;
   else { const caps={...(item.captions||{})}; if(val) caps[adminLang]=val; else delete caps[adminLang]; nextItem.captions=caps; }
   await persistItem(nextItem);
   renderGallery();say('Foto actualizada.');
  },text=>{note.textContent=text;});};
  $('gallery-admin-items').append(card);
 }
}
const numericLabels = {
 matriz:'Óleo, carbonilla, personas extra y marcos',escultura:'Escultura modelada a mano',ajustes:'Otros importes y factores de cotización',cursos:'Cursos',
 espatulado:'Espatulado',realista:'Realista',hiper:'Hiperrealista',boceto:'Monocromático',extraPersona:'Persona extra',marcos:'Marcos',base:'Base carbonilla',
 Estandar:'Estándar',Cajon:'Cajón',Clasico:'Clásico',SemiRelieve:'Semi relieve',GruesoRelieves:'Grueso con relieves',
 min:'Altura mínima (cm)',max:'Altura máxima (cm)',step:'Paso de altura (cm)',def:'Altura inicial (cm)',minimo:'Precio mínimo',fijo:'Importe fijo',porCm:'Precio por cm',redondeo:'Redondear al múltiplo de',
 restauracionDigital:'Restauración digital simple',restauracionDigitalCompleja:'Restauración digital compleja',
 personalizadoMinRetrato:'Personalizado: mínimo retrato',personalizadoMinOtros:'Personalizado: mínimo otros temas',personalizadoCm2Retrato:'Personalizado: guaraníes por cm² (retrato)',personalizadoCm2Otros:'Personalizado: guaraníes por cm² (otros)',
 personalizadoEspatulado:'Personalizado: factor espatulado',personalizadoHiper:'Personalizado: factor hiperrealista',personalizadoBoceto:'Personalizado: factor monocromático',personalizadoExtraPersona:'Personalizado: persona extra',personalizadoMarcos:'Personalizado: marcos',
 carbonillaRespaldo:'Carbonilla: base de respaldo',carbonillaColor:'Factor carbonilla a color',acrilico:'Factor acrílico',circular:'Factor circular',ovalado:'Factor ovalado',mascota:'Factor mascota respecto a persona extra',fondo:'Factor de fondo complejo sobre base',cuotasMinimo:'Monto mínimo para tarjeta',tarjeta:'Factor recargo tarjeta',iva:'Factor IVA (no se usa: los precios ya incluyen IVA)',senaDivisor:'Divisor para seña',cuotasCantidad:'Cantidad de cuotas',cambioUSD:'Respaldo: guaraníes por USD',cambioEUR:'Respaldo: EUR por USD',cambioBRL:'Respaldo: BRL por USD',matricula:'Matrícula',mensualidad:'Mensualidad',claseSuelta:'Clase suelta',
 materialesEscultura:'Material de escultura (factor sobre el precio por altura)',Fibra:'Fibra de vidrio con estructura de hierro',Cemento:'Cemento hueco con estructura de hierro',Arcilla:'Arcilla con cemento con estructura de hierro',Chapa:'Chapa de hierro (piezas soldadas)',Chatarra:'Objetos de chatarra (piezas soldadas)',
 pesosEscultura:'Estimación de peso de escultura',refCm:'Altura de referencia (cm)',areaRefCm2:'Área de referencia (cm²)',espesorFibra:'Espesor de fibra (cm)',espesorCemento:'Espesor de cemento (cm)',espesorArcilla:'Espesor de arcilla con cemento (cm)',densidadFibra:'Densidad de fibra (g/cm³)',densidadCemento:'Densidad de cemento (g/cm³)',densidadArcilla:'Densidad de arcilla con cemento (g/cm³)',espesorChapa:'Espesor efectivo de chapa (cm)',espesorChatarra:'Espesor efectivo de chatarra (cm)',densidadAcero:'Densidad del acero (g/cm³)',hierroFigura:'Hierro en figura completa (kg a 170 cm)',hierroMedio:'Hierro en medio cuerpo (kg a 170 cm)',hierroBusto:'Hierro en busto (kg a 170 cm)',hierroRelieve:'Hierro en relieve (kg a 170 cm)',factorMedio:'Factor de superficie: medio cuerpo',factorBusto:'Factor de superficie: busto',factorRelieve:'Factor de superficie: relieve',
 tasasRespaldo:'Tasas de respaldo (unidades de cada moneda por 1 ₲)'
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
    row.append(makeLabel(numericLabels[key] || key,input),input);if(key.startsWith('personalizado')||key==='iva')row.hidden=true;parent.append(row);
   }
  }
 }
 walk(prices,root);
}

function fondoUrl(){ return site.fondoImagen || window.ESTUDIO_FONDO_DEFAULT; }
function fondoOp(){ return Number.isFinite(site.fondoOpacidad) ? site.fondoOpacidad : window.ESTUDIO_FONDO_OPACIDAD_DEFAULT; }
function ventanasOp(){ return Number.isFinite(site.ventanasOpacidad) ? site.ventanasOpacidad : window.ESTUDIO_VENTANAS_OPACIDAD_DEFAULT; }
function fondoBlur(){ return Number.isFinite(site.fondoDesenfoque) ? site.fondoDesenfoque : window.ESTUDIO_FONDO_DESENFOQUE_DEFAULT; }
function aplicarFondoAdmin(url, op, blur, vent){
 const bg=document.querySelector('.page-background');
 if(bg){
  const safe=String(url||fondoUrl()).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  bg.style.setProperty('--fondo-url','url("'+safe+'")');
  bg.style.setProperty('--fondo-opacidad',String(op));
  bg.style.setProperty('--fondo-desenfoque',blur+'px');
 }
 document.documentElement.style.setProperty('--ventanas-opacidad',String(vent));
 document.body.style.setProperty('--ventanas-opacidad',String(vent));
}
function previewFondo(){
 const op=Number($('fondo-opacidad').value)/100;
 const blur=Number($('fondo-desenfoque').value);
 const vent=Number($('ventanas-opacidad').value)/100;
 const img=$('fondo-preview-img');
 const o=Number.isFinite(op)?op:fondoOp();
 const v=Number.isFinite(vent)?vent:ventanasOp();
 const b=Number.isFinite(blur)?blur:fondoBlur();
 img.style.opacity=String(o);
 img.style.filter=b>0?('blur('+b+'px)'):'none';
 const pane=$('fondo-preview-ventana');
 if(pane) pane.style.background='rgba(18,18,18,'+v+')';
 aplicarFondoAdmin(fondoUrl(), o, b, v);
}
function renderFondo(){
 const url=fondoUrl(), op=fondoOp(), vent=ventanasOp(), blur=fondoBlur();
  $('fondo-preview-img').style.backgroundImage='url("'+url.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")';
 $('fondo-opacidad').value=String(Math.round(op*100));
 $('fondo-opacidad-valor').textContent=Math.round(op*100)+' %';
 $('fondo-desenfoque').value=String(Math.round(blur));
 $('fondo-desenfoque-valor').textContent=Math.round(blur)+' px';
 $('ventanas-opacidad').value=String(Math.round(vent*100));
 $('ventanas-opacidad-valor').textContent=Math.round(vent*100)+' %';
 $('fondo-quitar').hidden=!(site.fondoImagen||site.fondoImagenPath);
 previewFondo();
}

let guias = { items: {} };
const GUIA_LABELS = {
 'estilo:Realista':'Estilo · Realista','estilo:Hiperrealista':'Estilo · Hiperrealista','estilo:Espatulado':'Estilo · Espatulado','estilo:Bocetado':'Estilo · Monocromático','estilo:Abstracto':'Estilo · Abstracto','estilo:Mural':'Estilo · Mural','estilo:Escultura':'Estilo · Escultura','estilo:Restauracion':'Estilo · Restauración',
 'tecnica:Oleo':'Técnica · Óleo','tecnica:Acrilico':'Técnica · Acrílico','tecnica:Carbonilla':'Técnica · Carbonilla',
 'tema:Retrato':'Tema · Retrato','tema:Paisaje':'Tema · Paisaje','tema:Bodegon':'Tema · Bodegón','tema:Abstracto':'Tema · Abstracto',
 'fondo:simple':'Fondo · Simple','fondo:detallado':'Fondo · Detallado',
 'forma_lienzo:Estandar':'Forma · Rectangular','forma_lienzo:Circular':'Forma · Circular','forma_lienzo:Ovalado':'Forma · Ovalado','forma_lienzo:Hexagonal':'Forma · Hexagonal',
 'enmarcado:SinMarco':'Marco · Sin marco','enmarcado:Estandar':'Marco · Estándar','enmarcado:Cajon':'Marco · Cajón','enmarcado:Clasico':'Marco · Clásico','enmarcado:SemiRelieve':'Marco · Semirrelieve','enmarcado:GruesoRelieves':'Marco · Grueso',
 'tipo_escultura:Busto':'Escultura · Busto','tipo_escultura:Medio cuerpo':'Escultura · Medio cuerpo','tipo_escultura:Figura completa':'Escultura · Figura completa','tipo_escultura:Relieve':'Escultura · Relieve','tipo_escultura:Animal':'Escultura · Animal','tipo_escultura:Abstracto':'Escultura · Abstracto','tipo_escultura:Objeto':'Escultura · Objeto','tipo_escultura:Otro':'Escultura · Otro','material_escultura:Fibra':'Material · Fibra de vidrio','material_escultura:Cemento':'Material · Cemento hueco','material_escultura:Arcilla':'Material · Arcilla con cemento','material_escultura:Chapa':'Material · Chapa de hierro','material_escultura:Chatarra':'Material · Objetos de chatarra',
 'sujetos:1':'Sujetos · 1 persona','sujetos:2':'Sujetos · 2 personas','sujetos:mascota':'Sujetos · Con mascota',
 'estilo:Realista:Carbonilla':'Estilo · Realista (dibujo)','estilo:Hiperrealista:Carbonilla':'Estilo · Hiperrealista (grafito)','estilo:Bocetado:Carbonilla':'Estilo · Boceto (dibujo)','estilo:Abstracto:Carbonilla':'Estilo · Abstracto (dibujo)',
 'estilo:Realista:Acrilico':'Estilo · Realista (acrílico)','estilo:Hiperrealista:Acrilico':'Estilo · Hiperrealista (acrílico)','estilo:Espatulado:Acrilico':'Estilo · Espatulado (acrílico)','estilo:Bocetado:Oleo':'Estilo · Monocromático (óleo)','estilo:Bocetado:Acrilico':'Estilo · Monocromático (acrílico)','estilo:Abstracto:Acrilico':'Estilo · Abstracto (acrílico)',
 'tema:Retrato:Carbonilla':'Tema · Retrato (dibujo)','tema:Paisaje:Carbonilla':'Tema · Paisaje (dibujo)','tema:Bodegon:Carbonilla':'Tema · Bodegón (dibujo)',
 'fondo:simple:Carbonilla':'Fondo · Simple (dibujo)','fondo:detallado:Carbonilla':'Fondo · Detallado (dibujo)',
 'enmarcado:SinMarco:Carbonilla':'Marco · Sin marco (dibujo)','enmarcado:Estandar:Carbonilla':'Marco · Estándar (vidrio y paspartú)','enmarcado:Clasico:Carbonilla':'Marco · Clásico (vidrio y paspartú)',
 'sujetos:1:Carbonilla':'Sujetos · 1 persona (dibujo)','sujetos:2:Carbonilla':'Sujetos · 2 personas (dibujo)','sujetos:mascota:Carbonilla':'Sujetos · Con mascota (dibujo)',

};
function guiaItem(key){
 const base=(window.ESTUDIO_GUIAS_DEFAULT.items||{})[key]||{};
 const over=(guias.items||{})[key]||{};
 return { url: over.url||base.url||'', text: over.text||base.text||'', kind: over.kind||base.kind||'foto', storagePath: over.storagePath||'' };
}
function renderGuias(){
 const root=$('guias-list'); if(!root) return; root.replaceChildren();
 for(const key of Object.keys(window.ESTUDIO_GUIAS_DEFAULT.items||{})){
  const g=guiaItem(key);
  const row=document.createElement('div'); row.className='admin-guia-row';
  const img=document.createElement('img'); img.src=g.url; img.alt=''; img.loading='lazy';
  const body=document.createElement('div');
  const title=document.createElement('strong'); title.textContent=GUIA_LABELS[key]||key;
  const text=document.createElement('input'); text.id='guia-text-'+key.replace(/[^a-z0-9]+/gi,'-'); text.maxLength=160; text.value=g.text; text.placeholder='Texto breve';
  const actions=document.createElement('div'); actions.className='admin-fondo-actions';
  const edit=document.createElement('button'); edit.type='button'; edit.className='admin-edit'; edit.textContent='Cambiar imagen';
  const save=document.createElement('button'); save.type='button'; save.className='admin-secondary'; save.textContent='Guardar texto';
  edit.onclick=()=>abrirEditor({url:g.url.startsWith('data:')?g.url:new URL(g.url,location.href).href,title:GUIA_LABELS[key]||key,soloArchivo:true,onSave:async({file},progress)=>{
   const previous=g.storagePath||''; const ext=(file.name.split('.').pop()||'webp').toLowerCase();
   const path='sitio/guia-'+key.replace(/[^a-z0-9]+/gi,'-').slice(0,40)+'-'+Date.now().toString(36)+'.'+ext;
   setPending(path,true);
   const url=await api.uploadImage(file,path,p=>progress('Subiendo: '+p+'%'));
   const nextItems={...(guias.items||{}), [key]:{...(guias.items||{})[key], url, storagePath:path, text:text.value.trim(), kind:'foto'}};
   const validated=D.validateGuias({items:nextItems}); await api.saveConfig('guias',validated); guias=validated; setPending(path,false);
   if(previous&&previous!==path&&previous.startsWith('sitio/')){try{await api.deleteStorageFile(previous);}catch{setPending(previous,true);}}
   renderGuias(); $('guias-status').textContent='Imagen de guía guardada.';
  }}).catch(e=>$('guias-status').textContent=api.explainError(e));
  save.onclick=()=>action(row,async()=>{
   const base=(window.ESTUDIO_GUIAS_DEFAULT.items||{})[key]||{};
   const prev=(guias.items||{})[key]||{};
   const entry={...prev, text:text.value.trim()};
   if(prev.url) entry.url=prev.url; if(prev.storagePath) entry.storagePath=prev.storagePath; if(prev.kind) entry.kind=prev.kind;
   // No guardar de nuevo la imagen por defecto (sobre todo diagramas SVG largos).
   if(entry.text===base.text) delete entry.text;
   const nextItems={...(guias.items||{})}; if(Object.keys(entry).length) nextItems[key]=entry; else delete nextItems[key];
   const validated=D.validateGuias({items:nextItems}); await api.saveConfig('guias',validated); guias=validated; $('guias-status').textContent='Texto de guía guardado.';
  },t=>$('guias-status').textContent=t);
  actions.append(edit,save); body.append(title,text,actions); row.append(img,body); root.append(row);
 }
}

function renderSite() {
 $('foto-inicio-preview').src=site.fotoArtista||'artista.jpg';
 renderFondo();
 renderGuias();
 if($('site-whatsapp')) $('site-whatsapp').value=site.whatsapp;if($('site-map')) $('site-map').value=site.mapaCurso;
 pintarLangTabs($('site-lang-tabs'),$('site-lang-hint'));
 pintarLangTabs($('gallery-lang-tabs'),$('gallery-lang-hint'));
 const box=$('site-text-fields'); if(!box) return;
 box.replaceChildren();
 for(const key of Object.keys(site.textos||{})) {
  const input=document.createElement('textarea');input.id='text-'+key;input.dataset.textKey=key;input.dataset.textLang=adminLang;input.value=valorTexto(key);input.rows=3;input.maxLength=6000;
  if(adminLang!=='es') input.placeholder=site.textos[key]||'';
  box.append(makeLabel((defaults.etiquetasTextos[key]||key)+(adminLang==='es'?'':' ('+adminLang+')'),input),input);
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
  const [p,s,c,g,remote]=await Promise.all([api.readConfig('precios'),api.readConfig('sitio'),api.readConfig('categorias'),api.readConfig('guias'),api.readGallery()]);
  if(generation!==readGeneration || !api.isAdmin(services.auth.currentUser)) return;
  prices=p?D.validatePrices(p):D.clone(defaults.precios);site=s?D.validateSite(s):D.clone(defaults.sitio);
  categories=c?D.validateCategories(c.items):D.clone(defaults.categorias);guias=g?D.validateGuias(g):{items:{}};gallery=D.mergeGallery(seed,remote);
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
  const next=D.validateSite({...site,fotoArtista:url,fotoArtistaPath:path,fondoImagen:site.fondoImagen,fondoImagenPath:site.fondoImagenPath,fondoOpacidad:site.fondoOpacidad,ventanasOpacidad:site.ventanasOpacidad,fondoDesenfoque:site.fondoDesenfoque});await api.saveConfig('sitio',next);site=next;setPending(path,false);
  if(previous&&previous!==path&&previous.startsWith('sitio/')){try{await api.deleteStorageFile(previous);}catch{setPending(previous,true);}}
  $('foto-inicio-preview').src=url;out('Foto de Inicio guardada. Ya se ve en el sitio.');
 }}).catch(e=>out(api.explainError(e)));
};
async function saveSite(extra={}, statusEl=$('site-status'), msg='Textos y contacto guardados.'){
 flushTextosForm();
 const textos={...site.textos};
 const textosI18n=site.textosI18n?JSON.parse(JSON.stringify(site.textosI18n)):undefined;
 const next=D.validateSite({
  whatsapp:$('site-whatsapp').value.trim()||site.whatsapp,
  mapaCurso:$('site-map').value.trim()||site.mapaCurso,
  textos, textosI18n,
  fotoArtista:site.fotoArtista, fotoArtistaPath:site.fotoArtistaPath,
  fondoImagen:site.fondoImagen, fondoImagenPath:site.fondoImagenPath, fondoOpacidad:site.fondoOpacidad,
  ventanasOpacidad:site.ventanasOpacidad, fondoDesenfoque:site.fondoDesenfoque,
  ...extra
 });
 await api.saveConfig('sitio',next);site=next;statusEl.textContent=msg;renderFondo();
}
$('site-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;action(form,async()=>{
 await saveSite({}, $('site-status'), 'Textos y contacto guardados.');
},text=>{$('site-status').textContent=text;});};
$('fondo-cambiar').onclick=()=>{const out=t=>{$('fondo-status').textContent=t;};
 abrirEditor({url:fondoUrl(),title:'Fondo de la página.',soloArchivo:true,onSave:async({file},progress)=>{
  const previous=site.fondoImagenPath||'';const ext=(file.name.split('.').pop()||'webp').toLowerCase();
  const path='sitio/fondo-'+Date.now().toString(36)+'.'+ext;
  setPending(path,true);
  const url=await api.uploadImage(file,path,p=>progress('Subiendo: '+p+'%'));
  await saveSite({fondoImagen:url,fondoImagenPath:path,fondoOpacidad:fondoOp()}, $('fondo-status'), 'Imagen de fondo guardada.');
  setPending(path,false);
  if(previous&&previous!==path&&previous.startsWith('sitio/')){try{await api.deleteStorageFile(previous);}catch{setPending(previous,true);}}
 }}).catch(e=>out(api.explainError(e)));
};
$('fondo-quitar').onclick=()=>action($('fondo-admin'),async()=>{
 if(!site.fondoImagen && !site.fondoImagenPath) return;
 if(!confirm('¿Volver a la imagen de fondo original del sitio?')) return;
 const previous=site.fondoImagenPath||'';
 flushTextosForm();
 const textos={...site.textos}; const textosI18n=site.textosI18n?JSON.parse(JSON.stringify(site.textosI18n)):undefined;
 const cleared={whatsapp:site.whatsapp,mapaCurso:site.mapaCurso,textos,textosI18n,fondoOpacidad:fondoOp(),ventanasOpacidad:ventanasOp(),fondoDesenfoque:fondoBlur()};
 if(site.fotoArtista){cleared.fotoArtista=site.fotoArtista;cleared.fotoArtistaPath=site.fotoArtistaPath||'';}
 const next=D.validateSite(cleared);await api.saveConfig('sitio',next);site=next;renderFondo();$('fondo-status').textContent='Se restauró la imagen original.';
 if(previous.startsWith('sitio/')){try{await api.deleteStorageFile(previous);}catch{setPending(previous,true);}}
},t=>$('fondo-status').textContent=t);
$('fondo-opacidad').oninput=()=>{
 const pct=Number($('fondo-opacidad').value);$('fondo-opacidad-valor').textContent=pct+' %';
 previewFondo();
};
$('fondo-opacidad').onchange=()=>action($('fondo-admin'),async()=>{
 const pct=Number($('fondo-opacidad').value);
 await saveSite({fondoOpacidad:pct/100}, $('fondo-status'), 'Opacidad del fondo guardada.');
},t=>$('fondo-status').textContent=t);
$('fondo-desenfoque').oninput=()=>{
 const px=Number($('fondo-desenfoque').value);$('fondo-desenfoque-valor').textContent=px+' px';
 previewFondo();
};
$('fondo-desenfoque').onchange=()=>action($('fondo-admin'),async()=>{
 const px=Number($('fondo-desenfoque').value);
 await saveSite({fondoDesenfoque:px}, $('fondo-status'), 'Desenfoque guardado.');
},t=>$('fondo-status').textContent=t);
$('ventanas-opacidad').oninput=()=>{
 const pct=Number($('ventanas-opacidad').value);$('ventanas-opacidad-valor').textContent=pct+' %';
 previewFondo();
};
$('ventanas-opacidad').onchange=()=>action($('fondo-admin'),async()=>{
 const pct=Number($('ventanas-opacidad').value);
 await saveSite({ventanasOpacidad:pct/100}, $('fondo-status'), 'Opacidad de las ventanas guardada.');
},t=>$('fondo-status').textContent=t);
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
