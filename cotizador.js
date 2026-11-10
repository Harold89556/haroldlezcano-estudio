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
 if (!tasaVerificada) { cotizaciones=tasasRespaldo(); }
 if (typeof onTipoEsculturaChange === 'function') onTipoEsculturaChange();
 if (typeof calcular === 'function') calcular();
}

let cotizaciones=tasasRespaldo();
let tasaVerificada=false;
let tasaEstado='';
let tasaOrigen='respaldo';

let ultimoPresupuesto=null;
const valor=id=>document.getElementById(id)?.value||'';
const marcado=id=>Boolean(document.getElementById(id)?.checked);
const TIPOS_ESCULTURA_HUMANA=['Busto','Medio cuerpo','Figura completa','Relieve'];
function esEsculturaHumana(tipo){return TIPOS_ESCULTURA_HUMANA.includes(tipo||valor('tipo_escultura'));}
function unidadActualVal(){return (typeof window!=='undefined' && window.unidadActual)||'cm';}
function factorUnidad(u){return {cm:1,in:2.54,m:100}[u||unidadActualVal()]||1;}
function parseMedida(v){
 if(typeof v==='number')return v;
 return Number(String(v==null?'':v).trim().replace(/\s/g,'').replace(',', '.'));
}
function redondearMedida(n,u){
 const x=parseMedida(n);
 if(!Number.isFinite(x))return NaN;
 u=u||unidadActualVal();
 return u==='cm'?Math.round(x):Math.round(x*100)/100;
}
function textoMedida(n,u,comoInput){
 u=u||unidadActualVal();
 const r=redondearMedida(n,u);
 if(!Number.isFinite(r))return '';
 if(comoInput){
  if(u==='cm')return String(Math.round(r));
  return String(Number(r.toFixed(2)));
 }
 return r.toLocaleString('es-PY',{minimumFractionDigits:0,maximumFractionDigits:u==='cm'?0:2});
}
function aCm(v,u){
 const n=parseMedida(v);
 if(!Number.isFinite(n))return NaN;
 return redondearMedida(n*factorUnidad(u),'cm');
}
function deCm(cm,u){
 const n=Number(cm);
 if(!Number.isFinite(n))return NaN;
 return redondearMedida(n/factorUnidad(u),u||unidadActualVal());
}
function etiquetaUnidad(u){
 u=u||unidadActualVal();
 if(window.EstudioI18n&&typeof EstudioI18n.t==='function'){
  return EstudioI18n.t(u==='in'?'unidad.pulgadas':u==='m'?'unidad.metros':'unidad.centimetros');
 }
 return u==='in'?'pulgadas':u==='m'?'metros':'cm';
}
function formatoDesdeCm(cm,u){
 u=u||unidadActualVal();
 return textoMedida(deCm(cm,u),u)+' '+(u==='in'?'in':u);
}
function formatoParDesdeCm(w,h,u){
 u=u||unidadActualVal();
 return textoMedida(deCm(w,u),u)+' × '+textoMedida(deCm(h,u),u)+' '+(u==='in'?'in':u);
}
function asignarMedida(id,valorEnUnidad,u){
 const el=document.getElementById(id);
 if(!el)return;
 el.value=textoMedida(valorEnUnidad,u||unidadActualVal(),true);
}
function asignarMedidaDesdeCm(id,cm,u){
 asignarMedida(id,deCm(cm,u||unidadActualVal()),u||unidadActualVal());
}
function alturaEsculturaCm(){return aCm(valor('escultura_cm'),unidadActualVal());}
function muralAnchoCm(){return aCm(valor('mural_ancho'),unidadActualVal());}
function muralAltoCm(){return aCm(valor('mural_alto'),unidadActualVal());}
function factorMaterialEscultura(mat){
 const tab=(preciosActuales&&preciosActuales.materialesEscultura)||{};
 const f=Number(tab[mat||valor('material_escultura')||'Fibra']);
 return Number.isFinite(f)&&f>0?f:1;
}
function pesoEsculturaKg(tipo,cm,material){
 tipo=tipo||valor('tipo_escultura');
 cm=Number.isFinite(cm)?cm:alturaEsculturaCm();
 material=material||valor('material_escultura')||'Fibra';
 if(!esEsculturaHumana(tipo)||!Number.isFinite(cm)||cm<=0)return null;
 const p=(preciosActuales&&preciosActuales.pesosEscultura)||{};
 const h0=Number(p.refCm)||170;
 const a0=Number(p.areaRefCm2)||18000;
 const factorTipo=tipo==='Busto'?(Number(p.factorBusto)||0.38):tipo==='Medio cuerpo'?(Number(p.factorMedio)||0.62):tipo==='Relieve'?(Number(p.factorRelieve)||0.55):1;
 const escala=Math.max(0.05,cm/h0);
 const area=a0*escala*escala*factorTipo;
 const esHierro=material==='Chapa'||material==='Chatarra';
 const espesor=esHierro?(material==='Chatarra'?(Number(p.espesorChatarra)||0.75):(Number(p.espesorChapa)||0.5)):material==='Cemento'?(Number(p.espesorCemento)||2.2):material==='Arcilla'?(Number(p.espesorArcilla)||2.5):(Number(p.espesorFibra)||0.5);
 const dens=esHierro?(Number(p.densidadAcero)||7.85):material==='Cemento'?(Number(p.densidadCemento)||2.3):material==='Arcilla'?(Number(p.densidadArcilla)||2.4):(Number(p.densidadFibra)||1.8);
 const hierro0=esHierro?0:(tipo==='Busto'?(Number(p.hierroBusto)||6):tipo==='Medio cuerpo'?(Number(p.hierroMedio)||12):tipo==='Relieve'?(Number(p.hierroRelieve)||8):(Number(p.hierroFigura)||18));
 const kg=(area*espesor*dens)/1000+hierro0*escala*escala;
 return Math.max(0.5,Math.round(kg*10)/10);
}
function esMaterialHierro(mat){ mat=mat||(typeof valor==='function'?valor('material_escultura'):''); return mat==='Chapa'||mat==='Chatarra'; }
function tasasRespaldo(){
 const t=(preciosActuales&&preciosActuales.tasasRespaldo)||{};
 const base=(window.ESTUDIO_DEFAULTS&&window.ESTUDIO_DEFAULTS.precios&&window.ESTUDIO_DEFAULTS.precios.tasasRespaldo)||{};
 const out={PYG:1};
 for(const [k,v] of Object.entries(Object.assign({},base,t))){if(Number.isFinite(Number(v))&&Number(v)>0)out[k]=Number(v);}
 if(!out.USD&&AJUSTES&&AJUSTES.cambioUSD)out.USD=1/AJUSTES.cambioUSD;
 if(!out.EUR&&AJUSTES&&AJUSTES.cambioEUR&&out.USD)out.EUR=out.USD*AJUSTES.cambioEUR;
 if(!out.BRL&&AJUSTES&&AJUSTES.cambioBRL&&out.USD)out.BRL=out.USD*AJUSTES.cambioBRL;
 return out;
}
function monedasEnteras(){return {PYG:1,CLP:1,ARS:1,UYU:1,COP:1,KRW:1,JPY:1};}

function esRestauracionDigital(){return valor('estilo')==='Restauracion' && ['Digital','Digital Compleja'].includes(valor('tipo_restauracion'));}
function obtenerDimensiones(){
 const st=valor('tamano_predefinido'),te=valor('tecnica');
 const forma=te==='Carbonilla'?'Estandar':valor('forma_lienzo');
 let w,h;
 if(st==='personalizado'){
  w=aCm(valor('ancho_cm')); h=['Circular','Hexagonal'].includes(forma)?w:aCm(valor('alto_cm'));
 }else{[w,h]=(st||'').split('x').map(Number);}
 w=redondearMedida(w,'cm');h=redondearMedida(h,'cm');
 return {ancho:w,alto:h,forma,valida:Number.isFinite(w)&&Number.isFinite(h)&&w>=0.1&&h>=0.1&&w<=500&&h<=500};
}
function describirDimensiones(d){
 const u=unidadActualVal();
 const lado=cm=>formatoDesdeCm(cm,u)+(u!=='cm'?' ('+textoMedida(cm,'cm')+' cm)':'');
 if(d.forma==='Circular')return ((window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('escala.diametro'):'Diámetro')+' '+lado(d.ancho);
 if(d.forma==='Hexagonal')return lado(d.ancho);
 return formatoParDesdeCm(d.ancho,d.alto,u)+(u!=='cm'?' ('+textoMedida(d.ancho,'cm')+' × '+textoMedida(d.alto,'cm')+' cm)':'');
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
  const w=muralAnchoCm(),h=muralAltoCm();if(!(w>=100&&w<=2000&&h>=100&&h<=500))return null;
  return {t,dim:null,base:0,extras:0,marco:0,fondo:0,andamio:0,sub:0,recargo:0,iva:0,total:0,cuotas:false,digital:false,evaluar:false,consultar:true};
 }else if(t==='Escultura'){
  const tipo=valor('tipo_escultura'),cm=alturaEsculturaCm();
  if(!tipo)return null;
  if(!esEsculturaHumana(tipo)){
   return {t,dim:null,base:0,extras:0,marco:0,fondo:0,andamio:0,sub:0,recargo:0,iva:0,total:0,cuotas:false,digital:false,evaluar:false,consultar:true,consultarArtista:true,peso:null};
  }
  const cfg=ESCULTURA_TIPOS[tipo];
  if(!cfg||!Number.isFinite(cm)||cm<=0)return null;
  const usado=Math.min(cfg.max,Math.max(cfg.min,cm));
  base=precioEscultura(cfg,usado);
  const red=cfg.redondeo||50000;
  base=Math.round(base*factorMaterialEscultura()/red)*red;
  var pesoEst=pesoEsculturaKg(tipo,usado,valor('material_escultura')||'Fibra');
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
 return {t,dim,base,extras,marco,fondo,andamio,sub,recargo,iva:0,total:sub+recargo,cuotas,digital:esRestauracionDigital(),evaluar:t==='Restauracion'&&valor('tipo_restauracion')==='Fisica',consultar:false,peso:t==='Escultura'?(typeof pesoEst!=='undefined'?pesoEst:pesoEsculturaKg()):null};
}
function simboloMoneda(m){return ({PYG:'₲',USD:'US$',EUR:'€',BRL:'R$',ARS:'$',UYU:'$',CLP:'$',BOB:'Bs',GBP:'£',MXN:'$',COP:'$',PEN:'S/',CAD:'CA$',CHF:'CHF',CNY:'CN¥',JPY:'JP¥',KRW:'₩',INR:'₹',RUB:'₽',AUD:'A$'})[m]||m;}
function dinero(n,moneda){
 const m=moneda||valor('moneda')||'PYG';
 const loc=(window.EstudioI18n&&EstudioI18n.locale())||'es-PY';
 if(m==='PYG')return Math.round(n).toLocaleString('es-PY')+' ₲';
 const rate=cotizaciones[m];
 if(!Number.isFinite(rate)||rate<=0)return Math.round(n).toLocaleString('es-PY')+' ₲';
 const conv=n*rate;
 const entero=!!monedasEnteras()[m];
 const txt=entero?Math.round(conv).toLocaleString(loc):conv.toLocaleString(loc,{minimumFractionDigits:2,maximumFractionDigits:2});
 return txt+' '+simboloMoneda(m);
}
function dineroPYG(n){return dinero(n,'PYG');}

function calcular(){
 const foot=document.getElementById('sticky-footer');if(!foot)return;
 if(valor('tamano_predefinido')==='personalizado' && typeof errorCampo==='function') errorCampo('ancho_cm',obtenerDimensiones().valida?'':'Indicá medidas positivas entre 0,1 y 500 cm (o su equivalente).');
 const p=presupuesto();ultimoPresupuesto=p;
 if(!p||!document.getElementById('tab-cotizacion').classList.contains('active')){foot.style.display='none';actualizarVistasTamano();return;}
 const c=document.getElementById('cuotas');const allow=p.sub>=AJUSTES.cuotasMinimo&&p.t!=='Restauracion';
 if(c){const old=c.value;c.innerHTML='<option value="1">Contado (seña y saldo a partes iguales)</option>'+(allow?'<option value="3">Hasta '+AJUSTES.cuotasCantidad+' cuotas con tarjeta</option>':'');c.value=allow&&old==='3'?'3':'1';}
 const result=presupuesto();ultimoPresupuesto=result;
 document.getElementById('alerta-andamio').style.display=(result.consultar&&muralAltoCm()>=250)||result.andamio?'block':'none';
 if(result.consultar){
  const i18=(k,fb)=>window.EstudioI18n&&EstudioI18n.t?EstudioI18n.t(k):fb;
  document.getElementById('precioFinal').textContent=result.consultarArtista?i18('precio.consultarArtista','A consultar con el artista'):i18('precio.consultar','A consultar');
  document.getElementById('desglose').textContent=(valor('estilo')==='Mural'||result.t==='Mural')
   ? i18('precio.muralDetalle','El mural se cotiza de forma personalizada según la pared, el acceso y el nivel de detalle.')
   : result.consultarArtista
    ? i18('precio.artistaDetalle','Si no es una figura humana (busto, medio cuerpo, figura o relieve), el valor se consulta directamente con el artista.')
    : i18('precio.sinLista','Este estilo no tiene un precio fijo en la lista actual; el valor se acuerda según la obra.');
  document.querySelector('.nota').textContent=i18('precio.ivaEnvio','IVA incluido. Envío aparte.');
  const tasaEl=document.getElementById('tasa-info');
  if(tasaEl) tasaEl.textContent=((valor('moneda')||'PYG')==='PYG')?'':notaConversion();
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
 document.querySelector('.nota').textContent=(window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('precio.ivaEnvio'):'IVA incluido. Envío aparte.';
 document.getElementById('tasa-info').textContent=(valor('moneda')||'PYG')==='PYG'?'':notaConversion();
 const info=document.getElementById('info-cuotas');if(info)info.textContent=result.digital?'Contado al aprobar la muestra.':result.evaluar?'Condiciones a definir tras la evaluación.':result.cuotas?'Hasta '+AJUSTES.cuotasCantidad+' cuotas con tarjeta.':'Seña inicial y saldo contra entrega aprobada.';
 foot.style.display='flex';
 actualizarVistasTamano();
}
function actualizarVistasTamano(){
 if(window.CotizadorVisual){try{CotizadorVisual.updateEscala();CotizadorVisual.updateEscalaEscultura();CotizadorVisual.renderFondo();CotizadorVisual.renderSujetos();}catch(e){}}
 if(window.AsistentePedido&&typeof AsistentePedido.actualizarBarra==='function'){try{AsistentePedido.actualizarBarra();}catch(e){}}
}
async function leerTasas(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('Sin respuesta válida');return await r.json();}finally{clearTimeout(timer);}}
function notaConversion(){
 const i18=(k,fb)=>window.EstudioI18n&&EstudioI18n.t?EstudioI18n.t(k):fb;
 return i18('fx.nota','Conversión aproximada según cotización del día; el precio final se confirma en guaraníes');
}
const TASAS_CACHE_KEY='estudio-tasas-v1';
const TASAS_TTL=4*60*60*1000;
function leerCacheTasas(){
 try{
  const o=JSON.parse(localStorage.getItem(TASAS_CACHE_KEY)||'');
  if(!o||!o.rates||!Number.isFinite(o.ts))return null;
  return o;
 }catch{return null;}
}
function guardarCacheTasas(rates,ts,fuente){
 try{localStorage.setItem(TASAS_CACHE_KEY,JSON.stringify({rates,ts:ts||Date.now(),fuente:fuente||'api'}));}catch(e){}
}
function aplicarTasas(rates,ts,fuente){
 const next={PYG:1};
 for(const [k,v] of Object.entries(rates||{})){if(k!=='PYG'&&Number.isFinite(Number(v))&&Number(v)>0)next[k]=Number(v);}
 if(!next.USD)return false;
 const resp=tasasRespaldo();
 for(const [k,v] of Object.entries(resp)){if(!(k in next))next[k]=v;}
 cotizaciones=next;
 tasaVerificada=fuente!=='respaldo';
 tasaOrigen=fuente||'api';
 tasaEstado=notaConversion();
 return true;
}
async function actualizarTasasCambio(){
 const cached=typeof localStorage!=='undefined'?leerCacheTasas():null;
 if(cached&&Date.now()-cached.ts<TASAS_TTL&&aplicarTasas(cached.rates,cached.ts,cached.fuente||'cache')){
  calcular();return;
 }
 try{
  const data=await leerTasas('https://open.er-api.com/v6/latest/PYG');
  const r=data.rates;
  if(!r||!Number.isFinite(r.USD)||r.USD<=0)throw Error('Sin PYG');
  const rates={PYG:1};
  for(const k of Object.keys(tasasRespaldo())){if(k!=='PYG'&&Number.isFinite(r[k])&&r[k]>0)rates[k]=r[k];}
  const ts=(Number(data.time_last_update_unix)||0)*1000||Date.now();
  aplicarTasas(rates,ts,'open.er-api.com');
  guardarCacheTasas(rates,ts,'open.er-api.com');
  calcular();return;
 }catch(e){}
 try{
  const data=await leerTasas('https://open.er-api.com/v6/latest/USD');const r=data.rates;
  if(!r||!Number.isFinite(r.PYG)||r.PYG<=0)throw Error('Sin USD');
  const rates={PYG:1};
  for(const k of Object.keys(tasasRespaldo())){if(k!=='PYG'&&Number.isFinite(r[k])&&r[k]>0)rates[k]=r[k]/r.PYG;}
  const ts=(Number(data.time_last_update_unix)||0)*1000||Date.now();
  aplicarTasas(rates,ts,'open.er-api.com');
  guardarCacheTasas(rates,ts,'open.er-api.com');
  calcular();return;
 }catch(e){}
 if(cached&&aplicarTasas(cached.rates,cached.ts,'cache')){calcular();return;}
 aplicarTasas(tasasRespaldo(),Date.now(),'respaldo');
 calcular();
}
