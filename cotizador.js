"use strict";
let preciosActuales = structuredClone(window.ESTUDIO_DEFAULTS.precios);
let MATRIZ_PRECIOS = preciosActuales.matriz;
let ESCULTURA_TIPOS = preciosActuales.escultura;
let AJUSTES = preciosActuales.ajustes;
function aplicarPrecios(config) {
 preciosActuales = structuredClone(config);
 MATRIZ_PRECIOS = preciosActuales.matriz;
 ESCULTURA_TIPOS = preciosActuales.escultura;
 AJUSTES = preciosActuales.ajustes;
 if (!tasaVerificada) { cotizaciones={PYG:1,USD:1/AJUSTES.cambioUSD,EUR:AJUSTES.cambioEUR/AJUSTES.cambioUSD,BRL:AJUSTES.cambioBRL/AJUSTES.cambioUSD}; tasaEstado='Respaldo estimado: '+AJUSTES.cambioUSD.toLocaleString('es-PY')+' ₲ por USD; conversión orientativa, sin actualización verificada.'; }
 if (typeof onTipoEsculturaChange === 'function') onTipoEsculturaChange();
 if (typeof calcular === 'function') calcular();
}

let cotizaciones={PYG:1,USD:1/AJUSTES.cambioUSD,EUR:AJUSTES.cambioEUR/AJUSTES.cambioUSD,BRL:AJUSTES.cambioBRL/AJUSTES.cambioUSD};
let tasaVerificada=false;
let tasaEstado='Respaldo estimado: 5.880 ₲ por USD; conversión orientativa, sin actualización verificada.';
let ultimoPresupuesto=null;
const valor=id=>document.getElementById(id)?.value||'';
const marcado=id=>Boolean(document.getElementById(id)?.checked);
function esRestauracionDigital(){return valor('estilo')==='Restauracion' && ['Digital','Digital Compleja'].includes(valor('tipo_restauracion'));}
function obtenerDimensiones(){
 const st=valor('tamano_predefinido'),te=valor('tecnica');
 const forma=te==='Carbonilla'?'Estandar':valor('forma_lienzo');
 let w,h;
 if(st==='personalizado'){
  const factor={cm:1,in:2.54,m:100}[typeof unidadActual==='undefined'?'cm':unidadActual];
  w=Number(valor('ancho_cm'))*factor; h=['Circular','Hexagonal'].includes(forma)?w:Number(valor('alto_cm'))*factor;
 }else{[w,h]=(st||'').split('x').map(Number);}
 w=Math.round(w*1e8)/1e8;h=Math.round(h*1e8)/1e8;
 return {ancho:w,alto:h,forma,valida:Number.isFinite(w)&&Number.isFinite(h)&&w>=0.1&&h>=0.1&&w<=500&&h<=500};
}
function describirDimensiones(d){
 const n=x=>Number(x.toFixed(6)).toLocaleString('es-PY');
 if(d.forma==='Circular')return 'Diámetro '+n(d.ancho)+' cm';
 if(d.forma==='Hexagonal')return n(d.ancho)+' cm de ancho máximo entre vértices opuestos (hexágono regular)';
 return n(d.ancho)+' × '+n(d.alto)+' cm';
}
function claveEstandar(d){
 const keys=valor('tecnica')==='Carbonilla'?['15x21','21x30','30x42','42x59']:['Circular','Hexagonal'].includes(d.forma)?['30x30','50x50','70x70','100x100']:['30x40','40x50','50x70','70x100','100x120'];
 return keys.find(key=>{let [w,h]=key.split('x').map(Number);return (Math.abs(d.ancho-w)<0.00001&&Math.abs(d.alto-h)<0.00001)||(Math.abs(d.ancho-h)<0.00001&&Math.abs(d.alto-w)<0.00001);});
}
function familiaClaves(d){return valor('tecnica')==='Carbonilla'?['15x21','21x30','30x42','42x59']:['Circular','Hexagonal'].includes(d.forma)?['30x30','50x50','70x70','100x100']:['30x40','40x50','50x70','70x100','100x120'];}
function interpolarImporte(area,filas,leer,principal){
 const pts=filas.map(f=>({a:f.area,v:Number(leer(f.cfg))})).filter(p=>Number.isFinite(p.v));if(!pts.length)return 0;if(pts.length===1)return Math.round(pts[0].v*area/pts[0].a/1000)*1000;
 let i=pts.findIndex(p=>p.a>=area);if(i<=0)i=1;if(i<0||i>=pts.length)i=pts.length-1;
 const p0=pts[i-1],p1=pts[i];let v=p0.v+(area-p0.a)/(p1.a-p0.a)*(p1.v-p0.v);
 if(area<pts[0].a){const prop=pts[0].v*area/pts[0].a;v=Math.max(v,prop,principal?Math.min(100000,pts[0].v):0);}
 return Math.max(0,Math.round(v/1000)*1000);
}
function configPorArea(d){
 const area=d.ancho*d.alto;const filas=familiaClaves(d).map(k=>{const [w,h]=k.split('x').map(Number);return {area:w*h,cfg:MATRIZ_PRECIOS[k]};}).filter(f=>f.cfg).sort((a,b)=>a.area-b.area);
 if(!filas.length)return null;const c={};
 for(const key of ['realista','hiper','espatulado','boceto','base'])if(filas.some(f=>f.cfg[key]!=null))c[key]=interpolarImporte(area,filas,cfg=>cfg[key],true);
 c.extraPersona=interpolarImporte(area,filas,cfg=>cfg.extraPersona,false);
 c.marcos={};for(const m of Object.keys(filas[0].cfg.marcos||{}))c.marcos[m]=interpolarImporte(area,filas,cfg=>cfg.marcos?.[m],false);
 return c;
}
function precioEscultura(cfg,cm){
 if(!cfg||!Number.isFinite(cm))return 0;
 const pts=Object.entries(cfg.alturas||{}).map(([h,v])=>({h:Number(h),v:Number(v)})).filter(p=>Number.isFinite(p.h)&&p.h>0&&Number.isFinite(p.v)).sort((a,b)=>a.h-b.h);
 let raw;
 if(pts.length>=2){
  let i=pts.findIndex(p=>p.h>=cm);if(i<=0)i=1;if(i<0||i>=pts.length)i=pts.length-1;
  const p0=pts[i-1],p1=pts[i];
  raw=p0.h===p1.h?p0.v:p0.v+(cm-p0.h)/(p1.h-p0.h)*(p1.v-p0.v);
  if(cm<pts[0].h)raw=pts[0].v*cm/pts[0].h;
  if(cm>pts[pts.length-1].h)raw=pts[pts.length-1].v*cm/pts[pts.length-1].h;
 }else if(pts.length===1){
  raw=pts[0].v*cm/pts[0].h;
 }else{
  raw=(Number(cfg.fijo)||0)+cm*(Number(cfg.porCm)||0);
 }
 if(Number.isFinite(Number(cfg.minimo)))raw=Math.max(Number(cfg.minimo),raw);
 const step=Number(cfg.redondeo)||1;
 return Math.max(0,Math.round(raw/step)*step);
}
function presupuesto(){
 const est=valor('estilo'),te=valor('tecnica');const t=['Mural','Escultura','Restauracion'].includes(est)?est:valor('tema');
 let base=0,extras=0,marco=0,fondo=0,andamio=0,dim=null;
 if(!est||!t)return null;
 if(t==='Mural'){
  const w=Number(valor('mural_ancho')),h=Number(valor('mural_alto'));if(w<1||w>20||h<1||h>5)return null;
  return {t,dim:null,base:0,extras:0,marco:0,fondo:0,andamio:0,sub:0,recargo:0,iva:0,total:0,cuotas:false,digital:false,evaluar:false,consultar:true};
 }else if(t==='Escultura'){
  const tipo=valor('tipo_escultura'),cfg=ESCULTURA_TIPOS[tipo],cm=Number(valor('escultura_cm'));
  if(!cfg||!Number.isFinite(cm)||cm<=0)return null;
  const usado=Math.min(cfg.max,Math.max(cfg.min,cm));
  base=precioEscultura(cfg,usado);
 }else if(t==='Restauracion'){
  const rest=valor('tipo_restauracion');if(!rest)return null;base=rest==='Digital'?AJUSTES.restauracionDigital:rest==='Digital Compleja'?AJUSTES.restauracionDigitalCompleja:0;
 }else{
  if(!te)return null;dim=obtenerDimensiones();if(!dim.valida)return null;
  let config=MATRIZ_PRECIOS[claveEstandar(dim)]||configPorArea(dim);
  if(!config)return null;
  if(est==='Abstracto'&&te!=='Carbonilla'){
   return {t,dim,base:0,extras:0,marco:0,fondo:0,andamio:0,sub:0,recargo:0,iva:0,total:0,cuotas:false,digital:false,evaluar:false,consultar:true};
  }
  if(te==='Carbonilla'){base=config.base ?? AJUSTES.carbonillaRespaldo;if(valor('color_lapiz')==='A color')base=Math.round(base*AJUSTES.carbonillaColor);}
  else{
   base=config[est==='Hiperrealista'?'hiper':est==='Espatulado'?'espatulado':est==='Bocetado'?'boceto':'realista'];
   if(te==='Acrilico')base=Math.round(base*AJUSTES.acrilico);
   if(dim.forma==='Circular')base=Math.round(base*AJUSTES.circular);
   if(dim.forma==='Ovalado')base=Math.round(base*AJUSTES.ovalado);
  }
  if(t==='Retrato'){
   extras=Math.max(0,Number(valor('personas'))||0)*config.extraPersona+Math.max(0,Number(valor('mascotas'))||0)*Math.round(config.extraPersona*AJUSTES.mascota);
   if(est!=='Espatulado'&&marcado('fondo'))fondo=Math.round(base*AJUSTES.fondo);
  }
  marco=config.marcos?.[valor('enmarcado')]||0;
 }
 const sub=base+extras+marco+fondo+andamio;
 const cuotas=valor('cuotas')==='3'&&sub>=AJUSTES.cuotasMinimo&&t!=='Restauracion';
 // Los precios de la matriz ya incluyen IVA. La factura solo pide datos fiscales; no suma nada.
 const recargo=cuotas?sub*AJUSTES.tarjeta:0;
 return {t,dim,base,extras,marco,fondo,andamio,sub,recargo,iva:0,total:sub+recargo,cuotas,digital:esRestauracionDigital(),evaluar:t==='Restauracion'&&valor('tipo_restauracion')==='Fisica',consultar:false};
}
function dinero(n){const m=valor('moneda')||'PYG';return m==='PYG'?Math.round(n).toLocaleString('es-PY')+' ₲':(n*cotizaciones[m]).toFixed(2)+' '+m;}
function calcular(){
 const foot=document.getElementById('sticky-footer');if(!foot)return;
 if(valor('tamano_predefinido')==='personalizado' && typeof errorCampo==='function') errorCampo('ancho_cm',obtenerDimensiones().valida?'':'Indicá medidas positivas entre 0,1 y 500 cm (o su equivalente).');
 const p=presupuesto();ultimoPresupuesto=p;
 if(!p||!document.getElementById('tab-cotizacion').classList.contains('active')){foot.style.display='none';actualizarVistasTamano();return;}
 const c=document.getElementById('cuotas');const allow=p.sub>=AJUSTES.cuotasMinimo&&p.t!=='Restauracion';
 if(c){const old=c.value;c.innerHTML='<option value="1">Contado (seña y saldo a partes iguales)</option>'+(allow?'<option value="3">Hasta '+AJUSTES.cuotasCantidad+' cuotas con tarjeta</option>':'');c.value=allow&&old==='3'?'3':'1';}
 const result=presupuesto();ultimoPresupuesto=result;
 document.getElementById('alerta-andamio').style.display=(result.consultar&&Number(valor('mural_alto'))>=2.5)||result.andamio?'block':'none';
 if(result.consultar){
  document.getElementById('precioFinal').textContent='A consultar';
  document.getElementById('desglose').textContent=(valor('estilo')==='Mural'||result.t==='Mural')
   ? 'El mural se cotiza de forma personalizada según la pared, el acceso y el nivel de detalle.'
   : 'Este estilo no tiene un precio fijo en la lista actual; el valor se acuerda según la obra.';
  document.querySelector('.nota').textContent='IVA incluido. Envío aparte.';
  document.getElementById('tasa-info').textContent='';
  const infoM=document.getElementById('info-cuotas');if(infoM)infoM.textContent='Las condiciones se acuerdan al consultar.';
  foot.style.display='flex';
  actualizarVistasTamano();
  return;
 }
 document.getElementById('precioFinal').textContent=result.evaluar?'A evaluar':dinero(result.total);
 // Un solo precio final; sin Base/IVA/Seña ni otros importes debajo.
 let detalle='';
 if(result.evaluar) detalle='Evaluación directa en taller para presupuesto formal.';
 else if(result.digital) detalle='Contado al aprobar la muestra.';
 else if(result.cuotas) detalle='Hasta '+AJUSTES.cuotasCantidad+' cuotas con tarjeta.';
 document.getElementById('desglose').textContent=detalle;
 document.querySelector('.nota').textContent='IVA incluido. Envío aparte.';
 document.getElementById('tasa-info').textContent=(valor('moneda')||'PYG')==='PYG'?'':tasaEstado;
 const info=document.getElementById('info-cuotas');if(info)info.textContent=result.digital?'Contado al aprobar la muestra.':result.evaluar?'Condiciones a definir tras la evaluación.':result.cuotas?'Hasta '+AJUSTES.cuotasCantidad+' cuotas con tarjeta.':'Seña inicial y saldo contra entrega aprobada.';
 foot.style.display='flex';
 actualizarVistasTamano();
}
function actualizarVistasTamano(){
 if(window.CotizadorVisual){try{CotizadorVisual.updateEscala();CotizadorVisual.updateEscalaEscultura();CotizadorVisual.renderFondo();CotizadorVisual.renderSujetos();}catch(e){}}
 if(window.AsistentePedido&&typeof AsistentePedido.actualizarBarra==='function'){try{AsistentePedido.actualizarBarra();}catch(e){}}
}
async function leerTasas(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('Sin respuesta válida');return await r.json();}finally{clearTimeout(timer);}}
async function actualizarTasasCambio(){
 try{
  const data=await leerTasas('https://open.er-api.com/v6/latest/USD');const r=data.rates;
  if(!r||![r.PYG,r.EUR,r.BRL].every(n=>Number.isFinite(n)&&n>0)||!Number.isFinite(data.time_last_update_unix)||data.time_last_update_unix<=0)throw Error('Tasas inválidas');
  tasaVerificada=true;
  cotizaciones={PYG:1,USD:1/r.PYG,EUR:r.EUR/r.PYG,BRL:r.BRL/r.PYG};
  tasaEstado='Conversión orientativa. Tasas actualizadas: '+new Date(data.time_last_update_unix*1000).toLocaleString('es-PY',{timeZone:'America/Asuncion'})+' (hora de Paraguay). Presupuesto final a confirmar en guaraníes.';
 }catch{
  try{const data=await leerTasas('https://dolar.melizeche.com/api/1.0/');const rate=Number(data?.dolarpy?.bcp?.venta);if(!Number.isFinite(rate)||rate<=0)throw Error('Respaldo inválido');tasaVerificada=true;cotizaciones={PYG:1,USD:1/rate,EUR:AJUSTES.cambioEUR/rate,BRL:AJUSTES.cambioBRL/rate};tasaEstado='Conversión orientativa de respaldo, consultada '+new Date().toLocaleString('es-PY',{timeZone:'America/Asuncion'})+' (hora de Paraguay). Fecha de tasa no verificada; EUR y BRL estimados.';}catch{/* Mantener respaldo claramente identificado. */}
 }
 calcular();
}
