/* Recorte y rotación guardados como datos (para fotos externas que el navegador no deja exportar). */
(function(){
 const ROT=[0,90,180,270];
 function valido(e){
  return !!(e&&typeof e==='object'&&[e.x,e.y,e.w,e.h].every(Number.isFinite)&&e.w>=1&&e.h>=1&&e.x>=0&&e.y>=0&&e.x+e.w<=100.01&&e.y+e.h<=100.01&&ROT.includes(e.r));
 }
 const soporta=typeof CSS!=='undefined'&&!!CSS.supports&&CSS.supports('object-view-box','inset(1% 1% 1% 1%)');
 function aplicar(img,edit){
  if(!img)return;
  for(const p of ['object-view-box','rotate','object-position'])img.style.removeProperty(p);
  delete img.dataset.edit;delete img.dataset.rot;
  if(!valido(edit))return;
  img.dataset.edit=JSON.stringify(edit);if(edit.r)img.dataset.rot=String(edit.r);
  const t=edit.y,l=edit.x,b=Math.max(0,100-edit.y-edit.h),r=Math.max(0,100-edit.x-edit.w);
  if(soporta)img.style.setProperty('object-view-box','inset('+t+'% '+r+'% '+b+'% '+l+'%)');
  else img.style.objectPosition=(l+edit.w/2)+'% '+(t+edit.h/2)+'%';
  if(edit.r)img.style.rotate=edit.r+'deg';
 }
 function copiar(desde,hacia){let e=null;try{e=desde&&desde.dataset.edit?JSON.parse(desde.dataset.edit):null;}catch{}aplicar(hacia,e);}
 // Convierte un rectángulo (0..1) entre el espacio original y el rotado (horario).
 function punto(x,y,r,inverso){
  if(!inverso){if(r===90)return[1-y,x];if(r===180)return[1-x,1-y];if(r===270)return[y,1-x];return[x,y];}
  if(r===90)return[y,1-x];if(r===180)return[1-x,1-y];if(r===270)return[1-y,x];return[x,y];
 }
 function rect(c,r,inverso){const a=punto(c.x,c.y,r,inverso),b=punto(c.x+c.w,c.y+c.h,r,inverso);return{x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),w:Math.abs(a[0]-b[0]),h:Math.abs(a[1]-b[1])};}
 window.EstudioRecorte={valido,aplicar,copiar,soporta,aRotado:(c,r)=>rect(c,r,false),aOriginal:(c,r)=>rect(c,r,true)};
})();
