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
 const shareBtn = $('referencias-compartir');
 const hideWhatsAppActions = () => { $('whatsapp-continuar').hidden = true; shareBtn.hidden = true; };
 function referenceFiles() {
  return references.map((item, n) => {
   const raw = (item.file.name.split('.').pop() || 'jpg').toLowerCase();
   const ext = /^[a-z0-9]{1,5}$/.test(raw) ? raw : 'jpg';
   return new File([item.file], 'referencia-' + (n + 1) + '.' + ext, { type: item.file.type || 'image/jpeg' });
  });
 }
 function canSharePhotos(files, text) {
  try { return !!(files.length && navigator.canShare && navigator.canShare({ files, text })); }
  catch { return false; }
 }
 function withPhotoNote(text) {
  if (!references.length) return text;
  return text + '\n📸 Te envío ' + (references.length === 1 ? 'la foto de referencia' : 'las ' + references.length + ' fotos de referencia') + ' en este chat.\n';
 }
 function whatsappUrl(message) {
  return 'https://wa.me/' + (window.sitioActual?.whatsapp || '595972173847') + '?text=' + encodeURIComponent(message);
 }
 function revealWhatsApp(url, allowShare) {
  $('whatsapp-continuar').href = url;
  $('whatsapp-continuar').hidden = false;
  shareBtn.hidden = !allowShare;
 }
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
   remove.onclick = () => { URL.revokeObjectURL(item.preview); references=references.filter(r=>r!==item); renderPreviews(); hideWhatsAppActions(); status('Imagen quitada.'); };
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
  hideWhatsAppActions();
  renderPreviews();status(errors.join(' ') || 'Fotos listas. Al continuar, en el celular se adjuntan al mensaje de WhatsApp.');
 });
 photoChoice.addEventListener('change', () => {
  hideWhatsAppActions();
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
  const message = withPhotoNote(text);
  const url = whatsappUrl(message);
  // Siempre abrir directo el chat del artista con el pedido escrito; compartir fotos queda como paso secundario.
  const sharable = references.length ? canSharePhotos(referenceFiles(), message) : false;
  revealWhatsApp(url, sharable);
  window.open(url,'_blank','noopener,noreferrer');
  status(!references.length ? 'Revisá el mensaje en WhatsApp antes de enviarlo.' : sharable
   ? 'Se abrió el chat de WhatsApp con el pedido. Después usá «Compartir fotos por WhatsApp» para mandar las imágenes al mismo chat.'
   : 'Se abrió el chat de WhatsApp con el pedido. Enviá las fotos en ese mismo chat.');
 };
 shareBtn.addEventListener('click', async () => {
  if (uploading || !references.length) return;
  const text = prepararMensajeObra();if (!text) return;
  const message = withPhotoNote(text);
  const files = referenceFiles();
  if (!canSharePhotos(files, message)) {
   status('Este navegador no puede adjuntar las fotos. Abrí el chat y envialas ahí.');
   return;
  }
  try {
   await navigator.share({ files, text: message });
   status('Revisá el mensaje en WhatsApp antes de enviarlo.');
  } catch (error) {
   if (error && error.name === 'AbortError') status('No se envió. Si cancelaste, podés intentar de nuevo.');
   else status('No se pudieron compartir las fotos. Abrí el chat de WhatsApp y envialas ahí.');
  }
 });
 for(const event of ['input','change']) $('tab-cotizacion').addEventListener(event,()=>{hideWhatsAppActions();});
 function applySite(config) {
  window.sitioActual=data.validateSite(config);
  for (const el of document.querySelectorAll('[data-setting]')) {
   const value=window.sitioActual.textos[el.dataset.setting];if (typeof value==='string') el.textContent=value;
  }
  $('bioText').textContent=window.sitioActual.textos.biografia;
  const foto=document.querySelector('img.artista-foto');if(foto&&window.sitioActual.fotoArtista){foto.src=window.sitioActual.fotoArtista;foto.classList.add('artista-foto-propia');}
  if($('bioCurso')){$('bioCurso').textContent=window.sitioActual.textos.introduccionCurso;$('bioCurso').dataset.listo='1';}
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
   if (cover) { const img=document.createElement('img');img.src=cover.url;img.alt=cat.name;img.className='album-cover-img';img.loading='lazy';window.EstudioRecorte?.aplicar(img,cover.edit);button.append(img); }
   else { const empty=document.createElement('div');empty.className='album-cover-img album-cover-empty';empty.setAttribute('aria-hidden','true');empty.innerHTML='<i class="fas fa-images"></i>';button.append(empty); }
   const title=document.createElement('div');title.className='album-title';title.textContent=cat.name;
   const count=document.createElement('span');count.className='album-count';count.textContent=items.length+(items.length===1?' foto':' fotos');button.append(title,count);albumGrid.append(button);
  }
  const main=$('mainGallery');main.replaceChildren();
  for (const item of visible) {
   const button=document.createElement('button');button.type='button';button.className='gallery-item '+item.category;button.dataset.galleryId=item.id;
   const img=document.createElement('img');img.src=item.url;img.alt=item.caption || item.alt || 'Obra de Harold Lezcano';img.loading='lazy';window.EstudioRecorte?.aplicar(img,item.edit);button.append(img);
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
