'use strict';
function errorCampo(id,mensaje){const c=document.getElementById(id),err=document.getElementById('error-'+id);if(c){c.setAttribute('aria-invalid',mensaje?'true':'false');}if(err)err.textContent=mensaje;return !mensaje;}
function validarInscripcion(){
 const nombre=valor('c_nom').trim(),edad=Number(valor('c_edad'));
 let ok=errorCampo('c_nom',nombre?'':'Escribí tu nombre y apellido.');
 ok=errorCampo('c_edad',Number.isInteger(edad)&&edad>=8&&edad<=120?'':'Indicá una edad válida, desde 8 años.')&&ok;
 if(!ok)document.querySelector('#tab-curso [aria-invalid=true]')?.focus();return ok;
}
function validarObra(){
 document.querySelectorAll('#tab-cotizacion .field-error').forEach(e=>e.textContent='');document.querySelectorAll('#tab-cotizacion [aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));
 let ok=true;function pedir(id,msg){if(!valor(id).trim())ok=errorCampo(id,msg)&&ok;}
 pedir('estilo','Elegí un estilo o tipo de obra.');
 const est=valor('estilo');
 if(['Mural','Escultura','Restauracion'].includes(est)){
  if(est==='Mural'){pedir('mural_ancho','Elegí el ancho.');pedir('mural_alto','Elegí el alto.');}
  if(est==='Escultura')pedir('tipo_escultura','Elegí el tipo de escultura.');
  if(est==='Restauracion')pedir('tipo_restauracion','Elegí el tipo de restauración.');
 }else{
  pedir('tecnica','Elegí una técnica.');pedir('tema','Elegí una temática.');pedir('tamano_predefinido','Elegí un tamaño.');
  if(valor('tecnica')==='Carbonilla')pedir('color_lapiz','Elegí la opción de lápiz.');
  if(valor('tamano_predefinido')==='personalizado'&&!obtenerDimensiones().valida)ok=errorCampo('ancho_cm','Indicá medidas positivas, entre 0,1 y 500 cm (o su equivalente).')&&ok;
 }
 pedir('fotos_referencia','Indicá si tenés imágenes de referencia.');pedir('envio_nombre','Escribí tu nombre y apellido.');
 if(valor('envio_pais')==='Internacional'){pedir('envio_pais_int','Indicá tu país.');pedir('envio_ciudad_int','Indicá tu ciudad.');}
 if(marcado('factura')){pedir('razon','Indicá la razón social.');pedir('ruc','Indicá el RUC.');}
 if(!presupuesto()&&ok){ok=errorCampo('tamano_predefinido','Revisá las especificaciones y medidas.');}
 if(!ok)document.querySelector('#tab-cotizacion [aria-invalid=true]')?.focus();return ok;
}
var nombresAlbum=window.nombresAlbum||{retrato:"Retratos",paisaje:"Paisajes",sacro:"Arte sacro",bodegones:"Bodegones",animales:"Animales",personajes:"Personajes e ilustración",vehiculos:"Vehículos",abstracto:"Abstracción",mural:"Arte mural",escultura:"Escultura",estudio:"Estudio",otros:"Otras obras"};
window.nombresAlbum=nombresAlbum;
function setRoute(hash,reemplazar=false){
 if(window.restaurandoRuta)return;
 const want=normalizarHash(hash);
 const prev=(history.state&&history.state.estudio)||{};
 const stack=Array.isArray(prev.stack)&&prev.stack.length?prev.stack.slice():[normalizarHash(location.hash||'#inicio')];
 if(reemplazar){
  if(stack.length)stack[stack.length-1]=want;else stack.push(want);
 }else if(normalizarHash(location.hash||'#inicio')!==want){
  stack.push(want);
 }else if(!stack.includes(want)){
  stack.push(want);
 }
 const data={estudio:{route:want,stack:stack,pushed:!reemplazar}};
 if(normalizarHash(location.hash||'#inicio')===want){history.replaceState(data,'',want);return;}
 history[reemplazar?'replaceState':'pushState'](data,'',want);
}
function normalizarHash(hash){
 let h=String(hash||'#inicio');
 if(h.charAt(0)!=='#')h='#'+h;
 if(h==='#'||h==='#inicio')return '#inicio';
 return h;
}
function albumExiste(id){
 if(!id)return false;
 const cats=(window.sitioActual&&sitioActual.categorias)||(window.ESTUDIO_DEFAULTS&&ESTUDIO_DEFAULTS.categorias)||[];
 if(cats.some(c=>c.id===id))return true;
 return !!(document.querySelector('[data-album="'+id+'"]')||document.querySelector('#mainGallery .gallery-item.'+id));
}
function tituloAlbum(id){
 const cats=(window.sitioActual&&sitioActual.categorias)||(window.ESTUDIO_DEFAULTS&&ESTUDIO_DEFAULTS.categorias)||[];
 const book=document.querySelector('[data-album="'+id+'"] .album-title');
 const cat=cats.find(c=>c.id===id)||{id:id,name:book&&book.textContent.trim()?book.textContent.trim():id};
 if(window.EstudioI18n&&typeof EstudioI18n.nombreDeAlbum==='function')return EstudioI18n.nombreDeAlbum(cat);
 if(book&&book.textContent.trim())return book.textContent.trim();
 return cat.name||id;
}
function cadenaDe(hash){
 const h=normalizarHash(hash);
 const parts=h.slice(1).split('/').filter(Boolean);
 if(!parts.length||parts[0]==='inicio')return ['#inicio'];
 if(parts[0]==='galeria'){
  const c=['#inicio','#galeria'];
  if(parts[1])c.push('#galeria/'+parts[1]);
  if(parts[2])c.push('#galeria/'+parts[1]+'/'+parts[2]);
  return c;
 }
 if(parts[0]==='cotizacion'){
  const c=['#inicio','#cotizacion'];
  if(parts[1]&&parts[1]!=='trabajo')c.push('#cotizacion/'+parts[1]);
  return c;
 }
 if(parts[0]==='cursos'||parts[0]==='contacto')return ['#inicio',h];
 return [h];
}
function sembrarHistorial(){
 if(window.__historialSembrado)return;
 window.__historialSembrado=true;
 const landing=normalizarHash(location.hash||'#inicio');
 const chain=cadenaDe(landing);
 const base=location.pathname+location.search;
 window.restaurandoRuta=true;
 try{
  history.replaceState({estudio:{route:chain[0],stack:chain.slice(0,1),pushed:false}},'',base+chain[0]);
  for(let i=1;i<chain.length;i++){
   history.pushState({estudio:{route:chain[i],stack:chain.slice(0,i+1),pushed:true}},'',base+chain[i]);
  }
 }finally{window.restaurandoRuta=false;}
}
function parentHash(hash){
 const h=normalizarHash(hash||location.hash||'#inicio');
 const parts=h.slice(1).split('/').filter(Boolean);
 if(!parts.length||parts[0]==='inicio')return null;
 if(parts[0]==='galeria'){
  if(parts.length>=3)return '#galeria/'+parts[1];
  if(parts.length===2)return '#galeria';
  return '#inicio';
 }
 if(parts[0]==='cotizacion'){
  if(parts[1]&&window.AsistentePedido&&typeof AsistentePedido.pasoAnterior==='function'){
   const prev=AsistentePedido.pasoAnterior(parts[1]);
   return prev?'#cotizacion/'+prev:'#cotizacion';
  }
  if(parts[1])return '#cotizacion';
  return window.__rutaAntesDeCotizar||'#inicio';
 }
 if(parts[0]==='cursos'||parts[0]==='contacto')return '#inicio';
 return '#inicio';
}
function historialSincrono(){return /jsdom/i.test(navigator.userAgent||'');}
function aplicarHash(dest,stack){
 window.restaurandoRuta=true;
 const next=stack&&stack.length?stack:[dest];
 history.replaceState({estudio:{route:dest,stack:next,pushed:next.length>1}},'',dest);
 window.restaurandoRuta=false;
 restaurarRuta();
}
function volverRuta(){
 if(cerrarOverlaySiAbierto(true))return true;
 const parent=parentHash(location.hash);
 if(parent===null)return false;
 const st=history.state&&history.state.estudio;
 const stack=st&&Array.isArray(st.stack)?st.stack:[];
 const nextStack=stack.length>1?stack.slice(0,-1):[parent];
 if(historialSincrono()||!(st&&st.pushed&&stack.length>1)){
  aplicarHash(parent,nextStack);
  return true;
 }
 history.back();
 return true;
}
function cerrarHasta(dest){
 const want=normalizarHash(dest||'#inicio');
 const st=history.state&&history.state.estudio;
 const stack=st&&Array.isArray(st.stack)?st.stack.slice():[normalizarHash(location.hash||'#inicio')];
 let idx=-1;
 for(let i=stack.length-1;i>=0;i--){if(normalizarHash(stack[i])===want){idx=i;break;}}
 if(idx<0){
  for(let i=stack.length-1;i>=0;i--){if(!String(stack[i]).startsWith('#cotizacion')){idx=i;break;}}
 }
 const next=idx>=0?stack.slice(0,idx+1):[want];
 if(historialSincrono()||!(idx>=0&&idx<stack.length-1&&st)){
  aplicarHash(want,next);
  return;
 }
 history.go(-(stack.length-1-idx));
}
function abrirOverlay(nombre){
 if(window.restaurandoRuta)return;
 const st=(history.state&&history.state.estudio)||{route:normalizarHash(location.hash||'#inicio'),stack:[normalizarHash(location.hash||'#inicio')]};
 if(st.overlay===nombre)return;
 history.pushState({estudio:Object.assign({},st,{overlay:nombre,pushed:true})},'',location.href);
}
function cerrarOverlay(nombre){
 if(window.restaurandoRuta)return;
 const st=history.state&&history.state.estudio;
 if(st&&st.overlay===nombre){history.back();return;}
 aplicarOverlay(null);
}
function aplicarOverlay(nombre){
 const lista=document.getElementById('pais-lista');
 const btn=document.getElementById('pais-btn');
 if(lista&&!lista.hidden&&nombre!=='pais'){
  lista.hidden=true;
  if(btn)btn.setAttribute('aria-expanded','false');
 }
}
function cerrarOverlaySiAbierto(desdeVolver){
 const st=history.state&&history.state.estudio;
 const lista=document.getElementById('pais-lista');
 if(lista&&!lista.hidden){
  if(desdeVolver&&st&&st.overlay==='pais'){history.back();return true;}
  window.restaurandoRuta=true;
  lista.hidden=true;
  const btn=document.getElementById('pais-btn');
  if(btn)btn.setAttribute('aria-expanded','false');
  window.restaurandoRuta=false;
  return !desdeVolver;
 }
 const editor=document.getElementById('photo-editor');
 if(editor&&desdeVolver&&st&&st.overlay==='editor'){history.back();return true;}
 return false;
}
function restaurarRuta(){
 if(window.__aplicandoRuta)return;
 window.restaurandoRuta=true;
 window.__aplicandoRuta=true;
 try{
  const st=history.state&&history.state.estudio;
  aplicarOverlay(st&&st.overlay);
  const [ruta,album,foto]=(location.hash||'#inicio').slice(1).split('/');
  const tab=ruta==='cursos'?'curso':ruta==='cotizacion'?'cotizacion':'inicio';
  if(ruta!=='galeria'||!foto){
   if(typeof modal!=='undefined'&&modal&&!modal.hidden){modal.style.display='none';modal.hidden=true;document.body.classList.remove('visor-abierto');}
  }
  switchTab(ruta==='galeria'&&!album?'galeria':tab,{currentTarget:document.querySelector('.tab-btn[data-tab="'+tab+'"]')});
  if(ruta==='cotizacion'){
   const paso=album||'trabajo';
   if(window.AsistentePedido&&typeof AsistentePedido.restaurarPaso==='function')AsistentePedido.restaurarPaso(paso);
  }else if(window.AsistentePedido&&typeof AsistentePedido.cerrar==='function'){
   AsistentePedido.cerrar({silencioso:true});
  }
  if(ruta==='galeria'){
   if(albumExiste(album)){
    openAlbum(album,tituloAlbum(album));
    document.querySelectorAll('.gallery-item').forEach(i=>i.classList.toggle('show',i.classList.contains(album)));
    if(foto){
     const imgs=document.querySelectorAll('.gallery-item.show img');
     const n=Number(foto);
     if(Number.isInteger(n)&&n>=1&&n<=imgs.length)openModal(imgs[n-1].src);
    }
    document.getElementById('galeria-inicio')?.scrollIntoView?.({block:'start'});
   }else{
    document.getElementById('vista-albumes').style.display='grid';
    document.getElementById('vista-hojas').style.display='none';
   }
  }else if(tab==='inicio'){
   document.getElementById('vista-albumes').style.display='grid';
   document.getElementById('vista-hojas').style.display='none';
  }
  if(ruta==='contacto')document.getElementById('contacto').scrollIntoView?.();
  actualizarTabsARIA();
 }finally{
  window.restaurandoRuta=false;
  window.__aplicandoRuta=false;
 }
}
function actualizarTabsARIA(){document.querySelectorAll('.tab-content').forEach(panel=>{panel.hidden=!panel.classList.contains('active');});document.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected',b.classList.contains('active')?'true':'false'));}
const switchOriginal=switchTab;
switchTab=function(t,e){
 if(t==='cotizacion'&&!window.restaurandoRuta){
  const h=normalizarHash(location.hash||'#inicio');
  if(!h.startsWith('#cotizacion'))window.__rutaAntesDeCotizar=h;
 }
 switchOriginal(t,e);actualizarTabsARIA();
};
const onloadOriginal=window.onload;
window.onload=function(){
 onloadOriginal();
 document.querySelectorAll('.tab-btn').forEach(btn=>{const key=btn.dataset.tab;btn.id='pestana-'+key;btn.setAttribute('role','tab');btn.setAttribute('aria-controls','tab-'+key);document.getElementById('tab-'+key).setAttribute('role','tabpanel');document.getElementById('tab-'+key).setAttribute('aria-labelledby',btn.id);});
 document.querySelector('.tab-container').setAttribute('role','tablist');
 document.querySelector('.tab-container').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=Array.from(document.querySelectorAll('.tab-btn'));let n=tabs.indexOf(document.activeElement);const L=tabs.length;n=e.key==='Home'?0:e.key==='End'?L-1:(n+(e.key==='ArrowRight'?1:-1)+L)%L;tabs[n].focus();tabs[n].click();});
 document.addEventListener('keydown',e=>{
  if(modal.hidden||modal.style.display==='none')return;
  if(e.key==='Escape'){e.preventDefault();closeModal();}
  if(e.key==='ArrowLeft'){e.preventDefault();changeImg(-1);}if(e.key==='ArrowRight'){e.preventDefault();changeImg(1);}
  if(e.key==='Tab'){const f=Array.from(modal.querySelectorAll('button'));const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
 document.querySelectorAll('input,select,textarea').forEach(c=>{c.addEventListener('input',()=>errorCampo(c.id,''));c.addEventListener('change',()=>errorCampo(c.id,''));});
 sembrarHistorial();restaurarRuta();actualizarTasasCambio();
};
window.addEventListener('popstate',restaurarRuta);
window.EstudioRuta={setRoute,restaurarRuta,volverRuta,cerrarHasta,abrirOverlay,cerrarOverlay,normalizarHash,parentHash,sembrarHistorial};
