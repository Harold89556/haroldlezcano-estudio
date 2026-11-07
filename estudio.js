 'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const defaults = window.ESTUDIO_DEFAULTS;
 const data = window.EstudioDatos;
 let apiPromise;
 const firebase = () => apiPromise || (apiPromise = import('./firebase-client.js').catch(error => { apiPromise = null; throw error; }));
 let references = [];
 let uploading = false;
 let lockedControls = [];
 function lockQuote(value) {
  if(value) { lockedControls=[...document.querySelectorAll('#tab-cotizacion input,#tab-cotizacion select,#tab-cotizacion textarea,#tab-cotizacion button,#sticky-footer input,#sticky-footer select,#sticky-footer button')].map(control=>[control,control.disabled]);for(const [control] of lockedControls)control.disabled=true; }
  else {for(const [control,disabled] of lockedControls)control.disabled=disabled;lockedControls=[];}
 }
 const status = text => { $('referencias-estado').textContent = text; };
 const photoChoice = $('fotos_referencia');
 const picker = $('referencias_archivos');
 window.sitioActual = data.clone(defaults.sitio);
 let seed = [...document.querySelectorAll('#mainGallery .gallery-item')].map((button, order) => ({
  id: button.dataset.galleryId, category:[...button.classList].find(c => c !== 'gallery-item'),
  url:button.querySelector('img').src, alt:button.querySelector('img').alt,
  caption:'', order, cover:false, hidden:false, storagePath:''
 }));
 let categories = data.clone(defaults.categorias);
 let gallery = seed;
 function renderPreviews() {
  $('referencias-previews').replaceChildren();
  references.forEach((item, n) => {
   const card = document.createElement('div');card.className = 'upload-preview';
   const img = document.createElement('img');img.src=item.preview;img.alt='Vista previa de la referencia ' + (n+1);
   const label = document.createElement('span');label.textContent=item.file.name;
   const remove = document.createElement('button');remove.type='button';remove.textContent='Quitar';remove.disabled=uploading;
   remove.setAttribute('aria-label', 'Quitar ' + item.file.name);
   remove.onclick = () => { URL.revokeObjectURL(item.preview); references=references.filter(r=>r!==item); renderPreviews(); $('whatsapp-continuar').hidden=true; status('Imagen quitada.'); };
   card.append(img,label,remove);$('referencias-previews').append(card);
  });
 }
 picker.addEventListener('change', () => {
  const errors = [];
  // Las vistas previas nunca dependen de Firebase ni de su CDN.
  for (const file of picker.files) {
   if (references.length >= 5) { errors.push('Podés cargar hasta 5 imágenes.');break; }
   if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif|bmp|tiff)$/i.test(file.type)) { errors.push(file.name + ': formato no compatible. Usá JPG, PNG, WEBP, GIF, AVIF, HEIC o TIFF.');continue; }
   if (!file.size || file.size > 8*1024*1024) { errors.push(file.name + ': el límite es 8 MB por imagen.');continue; }
   if (references.some(r=>r.file.name===file.name && r.file.size===file.size && r.file.lastModified===file.lastModified)) continue;
   references.push({file, preview:URL.createObjectURL(file), url:null, path:null});
  }
  picker.value='';
  if (references.length) photoChoice.value='Sí, quiero cargar fotos de guía';
  $('whatsapp-continuar').hidden=true;
  renderPreviews();status(errors.join(' ') || 'Fotos listas para subir al continuar por WhatsApp.');
 });
 photoChoice.addEventListener('change', () => {
  $('whatsapp-continuar').hidden=true;
  if (references.length && photoChoice.value==='No, necesito asesoramiento') {
   photoChoice.value='Sí, quiero cargar fotos de guía';
   status('Si preferís pedir asesoramiento sin fotos, quitá primero las imágenes seleccionadas.');
  }
 });
 window.enviarObra = async function() {
  if (uploading || !validarObra()) return;
  if (photoChoice.value==='Sí, quiero cargar fotos de guía' && !references.length) {
   errorCampo('fotos_referencia','Cargá al menos una imagen o elegí que necesitás asesoramiento.');picker.focus();return;
  }
  const text = prepararMensajeObra();if (!text) return;
  let target;
  let message = text;
  // Abrir una ventana en el gesto del usuario evita el bloqueo tras el await.
  if (references.length) {
   target = window.open('about:blank','_blank');
   if (target) { target.opener=null;target.document.title='Preparando fotos de referencia';target.document.body.textContent='Subiendo fotos de referencia. El mensaje de WhatsApp se abrirá al terminar.'; }
   uploading=true;lockQuote(true);renderPreviews();
   try {
    status('Conectando el servicio de carga… Tus fotos siguen seleccionadas.');
    const api = await firebase();
    await api.getServices();
    const batch = Date.now() + '_' + api.newId();
    for (const [n,item] of references.entries()) {
     if (!item.url) {
      // Un intento fallido usa otra ruta: no se permite sobrescribir referencias públicas.
      item.path='referencias/'+batch+'/'+api.newId()+'_'+api.safeName(item.file.name);
      item.url=await api.uploadImage(item.file,item.path,p=>status('Subiendo foto '+(n+1)+' de '+references.length+': '+p+'%'));
     }
    }
    message += '\n📸 *Enlaces de las fotos de referencia:*\n' + references.map((item,n)=>(n+1)+'. '+item.url).join('\n') + '\n';
   } catch (error) {
    if (target) target.close();
    const api = await firebase().catch(()=>null);
    status('No pudimos completar la carga. El servicio se está conectando o no está disponible. Tus fotos siguen seleccionadas; no se abrió WhatsApp sin ellas. ' + (api?.explainError(error) || 'Revisá tu conexión y volvé a intentar.'));
    return;
   } finally { uploading=false;lockQuote(false);renderPreviews(); }
  }
  const url='https://wa.me/'+window.sitioActual.whatsapp+'?text='+encodeURIComponent(message);
  $('whatsapp-continuar').href=url;$('whatsapp-continuar').hidden=false;
  status(references.length ? 'Fotos cargadas. Revisá el mensaje en WhatsApp antes de enviarlo. Si no se abrió, usá el enlace de abajo.' : 'Revisá el mensaje en WhatsApp antes de enviarlo.');
  if (target) target.location.replace(url);else window.open(url,'_blank','noopener,noreferrer');
 };
 for(const event of ['input','change']) $('tab-cotizacion').addEventListener(event,()=>{$('whatsapp-continuar').hidden=true;});
 function applySite(config) {
  window.sitioActual=data.validateSite(config);
  for (const el of document.querySelectorAll('[data-setting]')) {
   const value=window.sitioActual.textos[el.dataset.setting];if (typeof value==='string') el.textContent=value;
  }
  const tab=document.getElementById('tab-curso').classList.contains('active');
  $('bioText').textContent=window.sitioActual.textos[tab?'introduccionCurso':'biografia'];
  for (const a of document.querySelectorAll('a[href^="https://wa.me/595972173847"]')) a.href='https://wa.me/'+window.sitioActual.whatsapp;
 }
 function applyCoursePrices() {
  for (const el of document.querySelectorAll('[data-price]')) el.textContent=preciosActuales.cursos[el.dataset.price].toLocaleString('es-PY');
  document.querySelector('#c_pag option[value=""]').textContent='Pago de Matrícula ('+preciosActuales.cursos.matricula.toLocaleString('es-PY')+' Gs.)...';
 }
 $('mapa-curso').addEventListener('click',()=>window.open(window.sitioActual.mapaCurso,'_blank','noopener,noreferrer'));
 function renderGallery() {
  const visible=gallery.filter(item=>!item.hidden);
  const albumGrid=$('vista-albumes');albumGrid.replaceChildren();
  const allCategories=[...categories];
  for (const item of visible) if (!allCategories.some(c=>c.id===item.category)) allCategories.push({id:item.category,name:item.category});
  for (const cat of allCategories) {
   nombresAlbum[cat.id]=cat.name;
   const items=visible.filter(item=>item.category===cat.id);
   const cover=items.find(item=>item.cover)||items[0];
   const button=document.createElement('button');button.type='button';button.className='album-book';button.dataset.album=cat.id;
   button.addEventListener('click',()=>openAlbum(cat.id,cat.name));
   if (cover) { const img=document.createElement('img');img.src=cover.url;img.alt=cat.name;img.className='album-cover-img';img.loading='lazy';button.append(img); }
   const title=document.createElement('div');title.className='album-title';title.textContent=cat.name;
   const count=document.createElement('span');count.className='album-count';count.textContent=items.length+' fotos';button.append(title,count);albumGrid.append(button);
  }
  const main=$('mainGallery');main.replaceChildren();
  for (const item of visible) {
   const button=document.createElement('button');button.type='button';button.className='gallery-item '+item.category;button.dataset.galleryId=item.id;
   const img=document.createElement('img');img.src=item.url;img.alt=item.caption || item.alt || 'Obra de Harold Lezcano';img.loading='lazy';button.append(img);
   if (item.caption) { const caption=document.createElement('span');caption.className='gallery-caption';caption.textContent=item.caption;button.append(caption); }
   button.addEventListener('click',()=>openModal(img.src));main.append(button);
  }
  const route=location.hash.split('/');
  if (route[0]==='#galeria' && route[1] && nombresAlbum[route[1]]) restaurarRuta();
 }
 async function loadRemote() {
  // El catálogo local no depende de Firebase: también funciona sin conexión al SDK.
  try {
   const response = await fetch('./galeria-ig.json');
   if (!response.ok) throw Error('Catálogo no disponible');
   const items = await response.json();
   if (!Array.isArray(items)) throw Error('Catálogo inválido');
   seed = data.mergeGallery(seed, items);
  } catch { /* Si falla la descarga, conservar las 152 fotos originales. */ }
  gallery = seed;
  renderGallery();
  try {
   const api=await firebase();
   await Promise.allSettled([
    api.readConfig('precios').then(config=>{if(config) aplicarPrecios(data.validatePrices(config));applyCoursePrices();}),
    api.readConfig('sitio').then(config=>{if(config) applySite(config);}),
    api.readConfig('categorias').then(config=>{if(config) categories=data.validateCategories(config.items);}),
    api.readGallery().then(items=>{gallery=data.mergeGallery(seed,items);})
   ]);
   renderGallery();
  } catch { /* El HTML original y los precios de respaldo permanecen disponibles. */ }
 }
 applyCoursePrices();
 loadRemote();
})();
