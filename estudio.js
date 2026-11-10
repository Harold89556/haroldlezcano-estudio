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
 function withPhotoLinks(text, urls) {
  if (!urls.length) return text;
  return text + '\n📸 *Foto' + (urls.length===1?'':'s') + ' de referencia:*\n' + urls.map((u,i)=> (urls.length>1? (i+1)+'. ' : '') + u).join('\n') + '\n';
 }
 async function compressReference(file) {
  const maxSide = 2000;
  let bitmap = null;
  try { bitmap = await createImageBitmap(file); } catch {}
  if (!bitmap) {
   const url = URL.createObjectURL(file);
   try {
    const img = await new Promise((resolve, reject) => { const i=new Image(); i.onload=()=>resolve(i); i.onerror=reject; i.src=url; });
    const c = document.createElement('canvas'); const scale=Math.min(1, maxSide/Math.max(img.naturalWidth, img.naturalHeight));
    c.width=Math.max(1, Math.round(img.naturalWidth*scale)); c.height=Math.max(1, Math.round(img.naturalHeight*scale));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const blob = await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('No se pudo comprimir.')),'image/webp',0.85)).catch(()=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('No se pudo comprimir.')),'image/jpeg',0.88)));
    return new File([blob], 'referencia.webp', { type: blob.type || 'image/webp' });
   } finally { URL.revokeObjectURL(url); }
  }
  try {
   const scale=Math.min(1, maxSide/Math.max(bitmap.width, bitmap.height));
   const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(bitmap.width*scale)); c.height=Math.max(1,Math.round(bitmap.height*scale));
   c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);
   const blob = await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('No se pudo comprimir.')),'image/webp',0.85)).catch(()=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('No se pudo comprimir.')),'image/jpeg',0.88)));
   const ext = (blob.type||'').includes('jpeg') ? 'jpg' : 'webp';
   return new File([blob], 'referencia.'+ext, { type: blob.type || 'image/webp' });
  } finally { bitmap.close?.(); }
 }
 function openWhatsAppSafely(url) {
  // Misma pulsación: si hay ventana en blanco abierta al inicio, se redirige; si el navegador la bloquea, queda el botón de continuar.
  try {
   if (window.__waPopup && !window.__waPopup.closed) { window.__waPopup.location.href = url; return true; }
  } catch {}
  const opened = window.open(url,'_blank','noopener,noreferrer');
  return !!opened;
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
  renderPreviews();status(errors.join(' ') || 'Fotos listas. Al continuar se suben y el mensaje de WhatsApp lleva el enlace.');
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
  if (!references.length) {
   const url = whatsappUrl(text);
   revealWhatsApp(url, false);
   openWhatsAppSafely(url);
   status('Revisá el mensaje en WhatsApp antes de enviarlo.');
   return;
  }
  // Abrir ventana en el mismo toque para que el celular no bloquee WhatsApp después de subir.
  try { window.__waPopup = window.open('about:blank','_blank'); } catch { window.__waPopup = null; }
  uploading = true; lockQuote(true); hideWhatsAppActions();
  const links = [];
  try {
   const api = await firebase();
   const pedido = (crypto.randomUUID && crypto.randomUUID()) || (api.newId());
   for (let i = 0; i < references.length; i++) {
    status('Subiendo foto ' + (i+1) + ' de ' + references.length + '…');
    const compressed = await compressReference(references[i].file);
    if (compressed.size > 8*1024*1024) throw Error('La foto comprimida supera 8 MB.');
    const ext = (compressed.type||'').includes('jpeg') ? 'jpg' : 'webp';
    const path = 'pedidos/' + pedido + '/' + (i+1) + '.' + ext;
    const url = await api.uploadReference(compressed, path, p => { if (p>=90) status('Subiendo foto ' + (i+1) + ' de ' + references.length + '…'); });
    links.push(url); references[i].url = url; references[i].path = path;
   }
   const message = withPhotoLinks(text, links);
   const wa = whatsappUrl(message);
   revealWhatsApp(wa, false);
   openWhatsAppSafely(wa);
   status('Se abrió WhatsApp con el pedido y el enlace de ' + (links.length===1?'tu foto':'tus fotos') + ' de referencia. Revisá el mensaje antes de enviarlo.');
  } catch (error) {
   try { if (window.__waPopup && !window.__waPopup.closed) window.__waPopup.close(); } catch {}
   window.__waPopup = null;
   const message = withPhotoNote(text);
   const wa = whatsappUrl(message);
   const sharable = canSharePhotos(referenceFiles(), message);
   revealWhatsApp(wa, sharable);
   openWhatsAppSafely(wa);
   const why = (error && error.message) ? error.message : 'sin conexión';
   status('No se pudo subir ' + (references.length===1?'la foto':'las fotos') + ' (' + why + '). Se abrió WhatsApp: enviá ' + (references.length===1?'la imagen':'las imágenes') + ' en ese mismo chat' + (sharable ? ' o usá «Compartir fotos por WhatsApp».' : '.'));
  } finally {
   uploading = false; lockQuote(false); window.__waPopup = null; renderPreviews();
  }
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

 function direccionEstudio(sitio){
  const txt=(sitio&&sitio.textos)||{};
  let raw=(txt.direccionCurso||txt.contacto||'Las Residentas 460, Fernando de la Mora, Paraguay');
  return String(raw).replace(/📍/g,'').replace(/^Harold Lezcano\s*[·•]\s*/i,'').replace(/\.\s*$/,'').trim();
 }
 function mapsDesdeSitio(sitio){
  const address=direccionEstudio(sitio);
  let query=address;
  try{
    const u=new URL(sitio&&sitio.mapaCurso||'');
    if(/google\.com$|maps\.google\.|goo\.gl$|maps\.app\.goo\.gl/.test(u.hostname)){
      const q=u.searchParams.get('q');
      if(q) query=q;
      const place=u.pathname.match(/\/maps\/place\/([^/]+)/);
      if(place) query=decodeURIComponent(place[1].replace(/\+/g,' '));
    }
  }catch{}
  const enc=encodeURIComponent(query);
  return {address, query, embed:'https://www.google.com/maps?q='+enc+'&output=embed', dir:'https://www.google.com/maps/dir/?api=1&destination='+enc};
 }
 function aplicarMapa(sitio){
  const m=mapsDesdeSitio(sitio||window.sitioActual||window.ESTUDIO_DEFAULTS.sitio);
  for(const iframe of document.querySelectorAll('.mapa-embed')) iframe.src=m.embed;
  for(const a of document.querySelectorAll('.btn-como-llegar')){ a.href=m.dir; a.hidden=false; }
 }

 function textoSitio(key){
  if(window.EstudioI18n&&typeof EstudioI18n.textoSitio==='function') return EstudioI18n.textoSitio(key);
  const sitio=window.sitioActual||window.ESTUDIO_DEFAULTS.sitio;
  return (sitio&&sitio.textos&&sitio.textos[key])||'';
 }
 function aplicarTextosSitio(){
  const sitio=window.sitioActual||window.ESTUDIO_DEFAULTS.sitio;
  if(!sitio||!sitio.textos) return;
  for (const el of document.querySelectorAll('[data-setting]')) {
   const value=textoSitio(el.dataset.setting);if (typeof value==='string') el.textContent=value;
  }
  if($('bioText')) $('bioText').textContent=textoSitio('biografia');
  if($('bioCurso')){$('bioCurso').textContent=textoSitio('introduccionCurso');$('bioCurso').dataset.listo='1';}
  const matricula=document.getElementById('curso-matricula-unica');
  if(matricula && window.preciosActuales){
   const n=window.preciosActuales.cursos.matricula.toLocaleString((window.EstudioI18n&&EstudioI18n.locale&&EstudioI18n.locale())||'es-PY');
   matricula.textContent=(window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('curso.matriculaUnica',{n}):('(Matrícula única: '+n+' Gs.)');
  }
 }
 function applySite(config) {
  window.sitioActual=data.validateSite(config);
  const foto=document.querySelector('img.artista-foto');if(foto&&window.sitioActual.fotoArtista){foto.src=window.sitioActual.fotoArtista;foto.classList.add('artista-foto-propia');}
    const bg=document.querySelector('.page-background');
  if(bg){
   const url=window.sitioActual.fondoImagen||window.ESTUDIO_FONDO_DEFAULT;
   const op=Number.isFinite(window.sitioActual.fondoOpacidad)?window.sitioActual.fondoOpacidad:window.ESTUDIO_FONDO_OPACIDAD_DEFAULT;
   const vent=Number.isFinite(window.sitioActual.ventanasOpacidad)?window.sitioActual.ventanasOpacidad:window.ESTUDIO_VENTANAS_OPACIDAD_DEFAULT;
   const blur=Number.isFinite(window.sitioActual.fondoDesenfoque)?window.sitioActual.fondoDesenfoque:window.ESTUDIO_FONDO_DESENFOQUE_DEFAULT;
   bg.style.setProperty('--fondo-url','url("'+url.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")');
   bg.style.setProperty('--fondo-opacidad',String(op));
   bg.style.setProperty('--fondo-desenfoque',blur+'px');
   document.documentElement.style.setProperty('--ventanas-opacidad',String(vent));
  }
  aplicarTextosSitio();
  aplicarMapa(window.sitioActual);
 }
 function applyCoursePrices() {
  for (const el of document.querySelectorAll('[data-price]')) el.textContent=preciosActuales.cursos[el.dataset.price].toLocaleString('es-PY');
  const pagPh=document.querySelector('#c_pag option[value=""]');
  if(pagPh){
   const n=preciosActuales.cursos.matricula.toLocaleString((window.EstudioI18n&&EstudioI18n.locale&&EstudioI18n.locale())||'es-PY');
   pagPh.textContent=(window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('opt.pago.ph',{n}):('Pago de Matrícula ('+n+' Gs.)...');
  }
  aplicarTextosSitio();
 }
 if($('mapa-curso')) $('mapa-curso').addEventListener('click',()=>window.open(window.sitioActual.mapaCurso,'_blank','noopener,noreferrer'));
 function renderGallery() {
  const visible=gallery.filter(item=>!item.hidden);
  const albumGrid=$('vista-albumes');albumGrid.replaceChildren();
  const allCategories=[...categories];
  for (const item of visible) if (!allCategories.some(c=>c.id===item.category)) allCategories.push({id:item.category,name:item.category});
  for (const cat of allCategories) {
   const items=visible.filter(item=>item.category===cat.id);
   const cover=items.find(item=>item.cover)||items[0];
   const albumName=(window.EstudioI18n&&EstudioI18n.t&&EstudioI18n.t('album.'+cat.id) && EstudioI18n.t('album.'+cat.id)!=='album.'+cat.id)?EstudioI18n.t('album.'+cat.id):cat.name;
   nombresAlbum[cat.id]=albumName;
   const button=document.createElement('button');button.type='button';button.className='album-book';button.dataset.album=cat.id;
   button.addEventListener('click',()=>openAlbum(cat.id,nombresAlbum[cat.id]||cat.name));
   if (cover) { const img=document.createElement('img');img.src=cover.url;img.alt=albumName;img.className='album-cover-img';img.loading='lazy';window.EstudioRecorte?.aplicar(img,cover.edit);button.append(img); }
   else { const empty=document.createElement('div');empty.className='album-cover-img album-cover-empty';empty.setAttribute('aria-hidden','true');empty.innerHTML='<i class="fas fa-images"></i>';button.append(empty); }
   const title=document.createElement('div');title.className='album-title';title.textContent=albumName;
   const fotoPal=(window.EstudioI18n&&EstudioI18n.t)?(items.length===1?EstudioI18n.t('comun.foto'):EstudioI18n.t('comun.fotos')):(items.length===1?' foto':' fotos');
   const count=document.createElement('span');count.className='album-count';count.textContent=items.length+' '+fotoPal;button.append(title,count);albumGrid.append(button);
  }
  const main=$('mainGallery');main.replaceChildren();
  for (const item of visible) {
   const button=document.createElement('button');button.type='button';button.className='gallery-item '+item.category;button.dataset.galleryId=item.id;
   const cap=(window.EstudioI18n&&EstudioI18n.captionDe)?EstudioI18n.captionDe(item):(item.caption||'');
   const img=document.createElement('img');img.src=item.url;img.alt=cap || item.alt || 'Obra de Harold Lezcano';img.loading='lazy';window.EstudioRecorte?.aplicar(img,item.edit);button.append(img);
   if (cap) { const caption=document.createElement('span');caption.className='gallery-caption';caption.textContent=cap;button.append(caption); }
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
    api.readConfig('guias').then(config=>{if(config){window.guiasActual=data.validateGuias(config);if(window.CotizadorVisual)CotizadorVisual.refreshAll();}}),
    api.readGallery().then(items=>{gallery=data.mergeGallery(seed,items);})
   ]);
   renderGallery();
  } catch { /* El HTML original y los precios de respaldo permanecen disponibles. */ }
 }
 window.aplicarTextosSitio=aplicarTextosSitio;window.textoSitio=textoSitio;
 applyCoursePrices();
 loadRemote();
})();
