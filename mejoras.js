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
function setRoute(hash,reemplazar=false){if(window.restaurandoRuta)return;if(location.hash!==hash)history[reemplazar?'replaceState':'pushState']({},'',hash);}
const nombresAlbum={retrato:'Retratos',paisaje:'Paisajes',escultura:'Esculturas',mural:'Murales',abstracto:'Abstractos',otros:'Otros'};
function restaurarRuta(){
 window.restaurandoRuta=true;
 const [ruta,album,foto]=location.hash.slice(1).split('/');const tab=ruta==='cursos'?'curso':ruta==='galeria'?'galeria':ruta==='cotizacion'?'cotizacion':'inicio';
 if(typeof modal!=='undefined'){modal.style.display='none';modal.hidden=true;}
 switchTab(tab,{currentTarget:document.querySelector('.tab-btn[data-tab="'+tab+'"]')});
 if(tab==='galeria'){
  if(nombresAlbum[album]){openAlbum(album,nombresAlbum[album]);document.querySelectorAll('.gallery-item').forEach(i=>i.classList.toggle('show',i.classList.contains(album)));if(foto){const imgs=document.querySelectorAll('.gallery-item.show img');const n=Number(foto);if(Number.isInteger(n)&&n>=1&&n<=imgs.length)openModal(imgs[n-1].src);}}
  else{document.getElementById('vista-albumes').style.display='grid';document.getElementById('vista-hojas').style.display='none';}
 }
 window.restaurandoRuta=false;
 if(ruta==='contacto')document.getElementById('contacto').scrollIntoView?.();
 actualizarTabsARIA();
}
function actualizarTabsARIA(){document.querySelectorAll('.tab-content').forEach(panel=>{panel.hidden=!panel.classList.contains('active');});document.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected',b.classList.contains('active')?'true':'false'));}
const switchOriginal=switchTab;
switchTab=function(t,e){switchOriginal(t,e);actualizarTabsARIA();};
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
 restaurarRuta();actualizarTasasCambio();
};
window.addEventListener('popstate',restaurarRuta);window.addEventListener('hashchange',restaurarRuta);
