const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const jsdom=require('jsdom');
const {JSDOM,VirtualConsole}=jsdom;
const base=__dirname,html=fs.readFileSync(path.join(base,'index.html'),'utf8');
function iniciar(hash=''){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://harold-lezcano-estudio.web.app/'+hash,runScripts:'outside-only',virtualConsole:vc});const w=dom.window;w.structuredClone=structuredClone;const opens=[];w.open=url=>opens.push(url);w.fetch=async()=>{throw Error('Red simulada sin conexión');};
 require('node:vm').runInContext(['estudio-datos.js','estudio-i18n.js','estudio-i18n-mas.js','cotizador.js','cotizador-visual.js','interfaz.js','cotizador-asistente.js','mejoras.js','estudio.js'].map(f=>fs.readFileSync(path.join(base,f),'utf8')).join('\n'),dom.getInternalVMContext());w.onload();w.onload=null;
 const d=w.document;const set=(id,v)=>{d.getElementById(id).value=String(v);};const price=()=>d.getElementById('precioFinal').textContent;
 const listo=()=>{w.switchTab('cotizacion');set('estilo','Realista');w.onEstiloChange();set('tecnica','Oleo');w.onTecnicaChange();set('tema','Retrato');w.onTemaChange();set('tamano_predefinido','30x40');w.handleTamanoChange();set('envio_nombre','Cliente de prueba');set('fotos_referencia','No, necesito asesoramiento');};
 return {w,d,set,price,opens,listo,errors};
}
const results=[];function test(name,fn){try{fn();results.push({prueba:name,resultado:'OK'});}catch(e){results.push({prueba:name,resultado:'FALLO',detalle:e.stack});process.exitCode=1;}}
test('1. Óleo 30x40 → Carbonilla sin TypeError',()=>{const a=iniciar();a.listo();a.set('tecnica','Carbonilla');a.w.onTecnicaChange();assert.equal(a.d.getElementById('tamano_predefinido').value,'');assert.ok(a.d.getElementById('tamano_predefinido').selectedIndex>=0);assert.equal(a.errors.length,0);});
test('2. Retrato con extras → Paisaje sin cargos invisibles',()=>{const a=iniciar();a.listo();a.set('personas',2);a.set('mascotas',1);a.w.calcular();assert.equal(a.price(),'1.220.000 ₲');a.set('tema','Paisaje');a.w.onTemaChange();assert.equal(a.price(),'700.000 ₲');assert.equal(a.d.getElementById('personas').value,'0');});
test('3. CM → IN → M conserva dimensión y precio',()=>{const a=iniciar();a.listo();a.set('tamano_predefinido','personalizado');a.set('ancho_cm',50);a.set('alto_cm',70);a.w.handleTamanoChange();const expected=a.price();for(const unit of ['in','m','cm']){a.w.setUnidad(unit,{currentTarget:a.d.getElementById('btn-uni-'+unit)});assert.equal(a.price(),expected);assert.equal(a.w.obtenerDimensiones().ancho,50);assert.equal(a.w.obtenerDimensiones().alto,70);}});
test('4. Estándar 30x40 y personalizado (ambas orientaciones)',()=>{const a=iniciar();a.listo();const expected=a.price();for(const [w,h] of [[30,40],[40,30]]){a.set('tamano_predefinido','personalizado');a.set('ancho_cm',w);a.set('alto_cm',h);a.w.handleTamanoChange();assert.equal(a.price(),expected);}});
test('5. Circular: WhatsApp usa diámetro sin alto viejo',()=>{const a=iniciar();a.listo();a.set('forma_lienzo','Circular');a.w.onFormaChange();a.set('tamano_predefinido','personalizado');a.set('ancho_cm',50);a.set('alto_cm',999);a.w.handleTamanoChange();a.w.enviarObra();assert.equal(a.opens.length,1);const txt=new URL(a.opens[0]).searchParams.get('text');assert.match(txt,/Diámetro 50 cm/);assert.ok(!txt.includes('999'));});
test('6. Factura legal: mismo precio final e IVA incluido, sin desglose',()=>{const a=iniciar();a.listo();assert.equal(a.price(),'700.000 ₲');a.d.getElementById('factura').checked=true;a.w.toggleFactura();assert.equal(a.price(),'700.000 ₲');assert.match(a.d.querySelector('.nota').textContent,/IVA incluido/);assert.ok(!/Base:|IVA:|Seña:|Total:/.test(a.d.getElementById('desglose').textContent));assert.equal(a.d.getElementById('factura-datos').style.display,'block');a.set('razon','Estudio de prueba');a.set('ruc','80000000-1');a.w.enviarObra();assert.ok(a.opens.length);const text=new URL(a.opens.at(-1)).searchParams.get('text');assert.match(text,/700\.000 ₲ \(IVA incluido\)/);assert.ok(!/Base:|Seña:/.test(text));assert.match(text,/Factura Legal:\* Sí/);});
test('7. Restauración digital y compleja: contado al aprobar muestra',()=>{const a=iniciar();a.listo();a.set('estilo','Restauracion');a.w.onEstiloChange();for(const tipo of ['Digital','Digital Compleja']){a.set('tipo_restauracion',tipo);a.w.updateUI();a.w.calcular();assert.equal(a.d.getElementById('pago-container').style.display,'none');assert.match(a.d.getElementById('desglose').textContent,/Contado al aprobar la muestra/);assert.ok(!a.d.getElementById('desglose').textContent.includes('Seña'));a.w.enviarObra();assert.match(new URL(a.opens.at(-1)).searchParams.get('text'),/Contado \(Tras aprobar muestra\)/);}});
test('8. CSS escritorio: flex solo para active; inactivos ocultos',()=>{const css=fs.readFileSync(path.join(base,'style.css'),'utf8');assert.match(css,/#tab-cotizacion\.active\s*\{\s*display:\s*flex/);assert.match(css,/#tab-curso\.active\s*\{\s*display:\s*flex/);assert.ok(!/#tab-(cotizacion|curso)\s*\{\s*display:\s*flex/.test(css));assert.match(css,/\.tab-content:not\(\.active\)\s*\{[^}]*display:\s*none\s*!important/);const a=iniciar();assert.equal(a.d.querySelectorAll('.bottom-nav .tab-btn').length,3);assert.equal(a.d.getElementById('tab-galeria'),null);a.w.switchTab('cotizacion');a.w.switchTab('galeria');assert.equal(a.d.getElementById('tab-cotizacion').hidden,true);assert.equal(a.d.getElementById('tab-inicio').hidden,false);assert.ok(a.d.querySelector('#tab-inicio #galeria-inicio #vista-albumes'));assert.ok(a.d.querySelector('#tab-inicio img.artista-foto'));assert.equal(a.w.location.hash,'#galeria');});
test('9. Inscripción: bloquea vacío y edad menor de 8',()=>{const a=iniciar();a.w.enviarInscripcion();assert.equal(a.opens.length,0);a.set('c_nom','Alumno de prueba');a.set('c_edad',7);a.w.enviarInscripcion();assert.equal(a.opens.length,0);a.set('c_edad',8);a.w.enviarInscripcion();assert.equal(a.opens.length,1);});
test('10. Alt, selectores nativos, labels y rutas persistentes',()=>{const a=iniciar('#galeria/retrato/2');assert.equal(a.d.querySelectorAll('img:not([alt])').length,0);assert.equal(a.d.querySelectorAll('.custom-select-trigger').length,0);assert.equal(a.d.getElementById('imageModal').hidden,false);assert.ok(a.d.getElementById('modalImg').src.includes('1715876237156'));a.w.closeModal();assert.equal(a.w.location.hash,'#galeria/retrato');assert.equal(a.d.getElementById('imageModal').hidden,true);for(const c of a.d.querySelectorAll('input[id]:not([type=checkbox]), select[id], textarea[id]'))assert.ok(a.d.querySelector('label[for="'+c.id+'"]'),'label '+c.id);});
test('11. Conserva las 152 imágenes y los conteos por categoría',()=>{const a=iniciar();const seed=JSON.parse(fs.readFileSync(path.join(base,'galeria-seed.json'),'utf8'));assert.equal(seed.length,152);assert.equal(a.d.querySelectorAll('#mainGallery .gallery-item').length,152);for(const [cat,n] of Object.entries({retrato:42,paisaje:11,escultura:19,mural:26,abstracto:7,otros:47}))assert.equal(seed.filter(i=>i.category===cat).length,n);});
test('12. Precios remotos válidos actualizan óleo, carbonilla, extras y esculturas',()=>{const a=iniciar();a.listo();const p=a.w.EstudioDatos.clone(a.w.ESTUDIO_DEFAULTS.precios);p.matriz['30x40'].realista=810000;a.w.aplicarPrecios(a.w.EstudioDatos.validatePrices(p));assert.equal(a.price(),'810.000 ₲');a.set('estilo','Escultura');a.w.onEstiloChange();a.set('tipo_escultura','Busto');a.w.onTipoEsculturaChange();a.w.calcular();assert.equal(a.price(),'8.000.000 ₲');a.set('estilo','Mural');a.w.onEstiloChange();a.w.setUnidad('m',{currentTarget:a.d.getElementById('btn-uni-m')});a.set('mural_ancho','3');a.set('mural_alto','2');a.w.calcular();assert.equal(a.price(),'A consultar');});
test('13. Configuración malformada rechazada y mezcla de galería no pierde originales',()=>{const a=iniciar();const p=a.w.EstudioDatos.clone(a.w.ESTUDIO_DEFAULTS.precios);p.matriz['30x40'].realista=-1;assert.throws(()=>a.w.EstudioDatos.validatePrices(p));const seed=JSON.parse(fs.readFileSync(path.join(base,'galeria-seed.json'),'utf8'));const merged=a.w.EstudioDatos.mergeGallery(seed,[{id:'nueva',url:'https://example.com/foto.jpg',category:'otros',order:200,caption:''},{...seed[0],hidden:true}]);assert.equal(merged.length,153);assert.equal(merged.find(i=>i.id===seed[0].id).hidden,true);assert.ok(merged.some(i=>i.id==='nueva'));});
test('14. Sin porcentajes en selects y picker múltiple disponible',()=>{const a=iniciar();for(const opt of a.d.querySelectorAll('select option'))assert.ok(!opt.textContent.includes('%'));assert.equal(a.d.getElementById('referencias_archivos').multiple,true);assert.equal(a.d.getElementById('referencias_archivos').accept,'image/*');});
test('15. Personalizado 35x67 interpola por área (óleo y acrílico)',()=>{const a=iniciar();a.listo();a.set('tema','Paisaje');a.w.onTemaChange();a.set('tamano_predefinido','personalizado');a.w.handleTamanoChange();a.set('ancho_cm',35);a.set('alto_cm',67);a.w.calcular();assert.equal(a.price(),'1.131.000 ₲');a.set('tema','Retrato');a.w.onTemaChange();a.set('tamano_predefinido','personalizado');a.w.handleTamanoChange();a.set('ancho_cm',35);a.set('alto_cm',67);a.w.calcular();assert.equal(a.price(),'1.131.000 ₲');a.set('tecnica','Acrilico');a.w.onTecnicaChange();a.set('tema','Retrato');a.w.onTemaChange();a.set('tamano_predefinido','personalizado');a.w.handleTamanoChange();a.set('ancho_cm',35);a.set('alto_cm',67);a.w.calcular();assert.equal(a.price(),Math.round(1131000*0.85).toLocaleString('es-PY')+' ₲');a.set('ancho_cm',10);a.set('alto_cm',10);a.w.calcular();assert.ok(a.w.presupuesto().base>=85000);a.set('ancho_cm',200);a.set('alto_cm',200);a.w.calcular();assert.ok(a.w.presupuesto().base>0);});
test('16. Guías visuales: tarjetas y escala en cotizador',()=>{const a=iniciar();a.listo();assert.ok(a.d.querySelectorAll('#guias-estilo .guia-card').length>=4);const first=a.d.querySelector('#guias-estilo .guia-card');first.click();assert.ok(a.d.getElementById('estilo').value);assert.ok(a.d.querySelector('#guias-estilo .guia-card.active'));assert.equal(a.d.querySelector('#guias-estilo .guia-card.active').getAttribute('aria-selected'),'true');assert.ok(a.d.getElementById('vista-escala'));a.set('tamano_predefinido','30x40');a.w.handleTamanoChange();assert.match(a.d.getElementById('vista-escala').textContent,/Persona de 1,70 m/);});
test('17. Config del sitio: ventanas, desenfoque y valores por defecto',()=>{const a=iniciar();const D=a.w.EstudioDatos;const base=D.clone(a.w.ESTUDIO_DEFAULTS.sitio);const ok=D.validateSite({...base,ventanasOpacidad:0.8,fondoDesenfoque:12,fondoOpacidad:0.4});assert.equal(ok.ventanasOpacidad,0.8);assert.equal(ok.fondoDesenfoque,12);assert.equal(ok.fondoOpacidad,0.4);assert.equal(a.w.ESTUDIO_VENTANAS_OPACIDAD_DEFAULT,0.55);assert.equal(a.w.ESTUDIO_FONDO_DESENFOQUE_DEFAULT,0);assert.throws(()=>D.validateSite({...base,ventanasOpacidad:1.2}));assert.throws(()=>D.validateSite({...base,fondoDesenfoque:21}));assert.throws(()=>D.validateSite({...base,fondoDesenfoque:-1}));const plain=D.validateSite(base);assert.equal(plain.ventanasOpacidad,undefined);assert.equal(plain.fondoDesenfoque,undefined);});
test('18. Abstracto es un estilo, sin precio inventado, y las guías por defecto no usan fotos de la galería',()=>{const a=iniciar();a.listo();
  const estilos=[...a.d.querySelectorAll('#estilo option')].map(o=>o.value);
  assert.ok(estilos.includes('Abstracto'));
  const temas=[...a.d.querySelectorAll('#tema option')].map(o=>o.value);
  assert.ok(!temas.includes('Abstracto'));
  const guiaEstilos=[...a.d.querySelectorAll('#guias-estilo .guia-card')].map(c=>c.getAttribute('data-value'));
  assert.ok(guiaEstilos.includes('Abstracto'));
  assert.ok(![...a.d.querySelectorAll('#guias-tema .guia-card')].some(c=>c.getAttribute('data-value')==='Abstracto'));
  a.set('estilo','Abstracto');a.w.onEstiloChange();a.set('tecnica','Oleo');a.w.onTecnicaChange();a.set('tema','Paisaje');a.w.onTemaChange();a.set('tamano_predefinido','30x40');a.w.handleTamanoChange();a.w.calcular();
  assert.equal(a.price(),'A consultar');assert.equal(a.w.presupuesto().consultar,true);
  a.set('tecnica','Carbonilla');a.w.onTecnicaChange();a.set('color_lapiz','Sin color');a.set('tamano_predefinido','21x30');a.w.handleTamanoChange();a.w.calcular();
  const carb=a.w.presupuesto();assert.ok(carb&&!carb.consultar);assert.match(a.price(),/\d/);
  const items=a.w.ESTUDIO_GUIAS_DEFAULT.items;
  assert.ok(items['estilo:Abstracto']);
  for(const [k,v] of Object.entries(items)){
    assert.ok(v.url.startsWith('img/guias/'),k+' '+v.url);
    assert.ok(!/postimg|instagram|img\/galeria|\/galeria\//i.test(v.url),k+' '+v.url);
  }
});
test('19. Medidas personalizadas actualizan escala, select y unidades',()=>{const a=iniciar();a.listo();
  a.set('tamano_predefinido','70x100');a.w.handleTamanoChange();
  assert.equal(a.d.getElementById('ancho_cm').value,'70');
  assert.equal(a.d.getElementById('alto_cm').value,'100');
  assert.match(a.d.getElementById('vista-escala').textContent,/70\s*×\s*100/);
  const fire=(id,v)=>{a.d.getElementById(id).value=String(v);a.w.onMedidaManualInput();};
  fire('ancho_cm',200);fire('alto_cm',100);
  assert.equal(a.d.getElementById('tamano_predefinido').value,'personalizado');
  assert.equal(a.w.obtenerDimensiones().ancho,200);
  assert.equal(a.w.obtenerDimensiones().alto,100);
  assert.match(a.d.getElementById('vista-escala').textContent,/200\s*×\s*100/);
  const precioCustom=a.price();
  a.set('tamano_predefinido','70x100');a.w.handleTamanoChange();
  assert.equal(a.d.getElementById('ancho_cm').value,'70');
  assert.equal(a.d.getElementById('alto_cm').value,'100');
  assert.notEqual(a.price(),precioCustom);
  a.w.setUnidad('in',{currentTarget:a.d.getElementById('btn-uni-in')});
  assert.equal(a.w.obtenerDimensiones().ancho,70);
  assert.equal(a.w.obtenerDimensiones().alto,100);
  assert.ok(Math.abs(Number(a.d.getElementById('ancho_cm').value)-Number((70/2.54).toFixed(2)))<1e-9);
  fire('ancho_cm',(200/2.54).toPrecision(12));fire('alto_cm',(100/2.54).toPrecision(12));
  assert.equal(a.d.getElementById('tamano_predefinido').value,'personalizado');
  assert.ok(Math.abs(a.w.obtenerDimensiones().ancho-200)<1e-6);
  assert.ok(Math.abs(a.w.obtenerDimensiones().alto-100)<1e-6);
  a.w.setUnidad('cm',{currentTarget:a.d.getElementById('btn-uni-cm')});
  assert.ok(Math.abs(Number(a.d.getElementById('ancho_cm').value)-200)<1e-6);
});

test('20. Asistente: precio en vivo, chips y sugerencias de presupuesto',()=>{
  const a=iniciar();a.listo();
  a.set('tema','Paisaje');a.w.onTemaChange();
  a.set('tamano_predefinido','70x100');a.w.handleTamanoChange();
  a.w.AsistentePedido.abrir();
  a.d.querySelector('#asistente-opciones .guia-card[data-value="oleo"]').click();
  a.w.AsistentePedido.irA('tamano');
  const bar=a.d.getElementById('asistente-precio-bar');
  const vivo=a.d.getElementById('asistente-precio-vivo');
  assert.equal(bar.hidden,false);
  assert.match(vivo.textContent,/2\.715\.000/);
  assert.match(a.d.querySelector('#asistente-precio-bar .asistente-iva').textContent,/IVA incluido/);
  assert.ok(a.d.querySelector('.asistente-chip[data-paso="trabajo"]'));
  assert.ok(a.d.querySelector('.asistente-chip[data-paso="estilo"]'));
  assert.ok(a.d.querySelector('.asistente-chip[data-paso="tamano"]'));
  const sugs=a.w.AsistentePedido.sugerencias();
  const keys=sugs.map(s=>s.cambios.tamano_predefinido);
  assert.ok(keys.includes('50x70'),JSON.stringify(sugs));
  assert.ok(keys.includes('70x100'),JSON.stringify(sugs));
  assert.ok(keys.includes('100x120'),JSON.stringify(sugs));
  const actual=sugs.find(s=>s.actual);
  assert.equal(actual&&actual.cambios.tamano_predefinido,'70x100');
  sugs.forEach(s=>{assert.equal(/%/.test(s.precio||''),false);assert.ok(s.precio);});
  const chica=sugs.find(s=>s.cambios.tamano_predefinido==='50x70'&&!s.cambios.tecnica);
  a.w.AsistentePedido.aplicarSugerencia(chica);
  assert.equal(a.d.getElementById('tamano_predefinido').value,'50x70');
  assert.match(a.d.getElementById('asistente-precio-vivo').textContent,/1\.570\.000/);
  assert.match(a.d.getElementById('vista-escala').textContent,/50\s*×\s*70/);
  a.w.AsistentePedido.irA('trabajo');
  a.d.querySelector('#asistente-opciones .guia-card[data-value="acrilico"]').click();
  assert.equal(a.d.getElementById('tecnica').value,'Acrilico');
  assert.equal(a.d.getElementById('tamano_predefinido').value,'50x70');
  assert.match(a.d.getElementById('asistente-precio-vivo').textContent,/1\.334\.500/);
  // mural: A consultar, sin precios inventados
  a.d.querySelector('#asistente-opciones .guia-card[data-value="mural"]').click();
  a.w.setUnidad('m',{currentTarget:a.d.getElementById('btn-uni-m')});a.set('mural_ancho','3');a.set('mural_alto','2');a.w.calcular();
  a.w.AsistentePedido.irA('tamano_mural');
  assert.match(a.d.getElementById('asistente-precio-vivo').textContent,/A consultar/);
  assert.equal(a.w.AsistentePedido.sugerencias().length,0);
  assert.equal(/%/.test(a.d.getElementById('asistente-pedido').textContent),false);
});


test('21. Carbonilla muestra guías de dibujo, sin espatulado ni marcos de lienzo, y conserva la tarifa de la tabla',()=>{
  const a=iniciar();a.listo();
  a.set('tecnica','Carbonilla');a.w.onTecnicaChange();
  const estilosVis=[...a.d.querySelectorAll('#estilo option')].filter(o=>o.value&&!o.hidden).map(o=>o.value);
  assert.ok(estilosVis.includes('Realista'));
  assert.ok(estilosVis.includes('Hiperrealista'));
  assert.ok(estilosVis.includes('Bocetado'));
  assert.ok(!estilosVis.includes('Espatulado'),JSON.stringify(estilosVis));
  const cards=[...a.d.querySelectorAll('#guias-estilo .guia-card')].map(c=>c.getAttribute('data-value'));
  assert.ok(!cards.includes('Espatulado'),JSON.stringify(cards));
  const real=a.d.querySelector('#guias-estilo .guia-card[data-value="Realista"] img');
  assert.ok(real&&/carbonilla-estilo-realista/.test(real.getAttribute('src')),real&&real.getAttribute('src'));
  const hiper=a.d.querySelector('#guias-estilo .guia-card[data-value="Hiperrealista"] img');
  assert.ok(hiper&&/carbonilla-estilo-hiperrealista/.test(hiper.getAttribute('src')));
  const marcos=[...a.d.querySelectorAll('#enmarcado option')].filter(o=>o.value&&!o.hidden).map(o=>o.value);
  assert.deepEqual(marcos,['SinMarco','Estandar','Clasico']);
  assert.match(a.d.querySelector('#enmarcado option[value="Estandar"]').textContent,/paspartú|vidrio/i);
  a.set('estilo','Hiperrealista');a.w.onEstiloChange();
  a.set('color_lapiz','Sin color');
  a.set('tamano_predefinido','21x30');a.w.handleTamanoChange();a.w.calcular();
  const p=a.w.presupuesto();
  assert.ok(p&&!p.consultar);
  assert.match(a.price(),/\d/);
  const items=a.w.ESTUDIO_GUIAS_DEFAULT.items;
  assert.ok(items['estilo:Realista:Carbonilla'].url.startsWith('img/guias/carbonilla-'));
  assert.ok(items['estilo:Realista:Acrilico'].url.startsWith('img/guias/acrilico-'));
  for(const [k,v] of Object.entries(items)){
    assert.ok(v.url.startsWith('img/guias/'),k);
    assert.ok(!/postimg|instagram|img\/galeria|\/galeria\//i.test(v.url),k);
  }
  // el asistente resuelve la guía de dibujo
  a.w.AsistentePedido.abrir();
  a.d.querySelector('#asistente-opciones .guia-card[data-value="carbonilla"]').click();
  a.w.AsistentePedido.irA('estilo');
  const asImgs=[...a.d.querySelectorAll('#asistente-opciones .guia-card img')].map(i=>i.getAttribute('src')).join(' ');
  assert.match(asImgs,/carbonilla-estilo-realista/);
  assert.ok(!/img\/guias\/estilo-realista\.webp/.test(asImgs),asImgs);
  assert.ok(!a.d.querySelector('#asistente-opciones .guia-card[data-value="Espatulado"]'));
  const bocetoCard=a.d.querySelector('#asistente-opciones .guia-card[data-value="Bocetado"]');
  assert.match(bocetoCard && bocetoCard.textContent,/Boceto/);
  assert.ok(!/Monocromático/.test(bocetoCard.textContent));
});

test('22. Óleo y acrílico muestran Monocromático y conservan el precio de boceto',()=>{
  const a=iniciar();a.listo();
  a.set('tecnica','Oleo');a.w.onTecnicaChange();
  assert.equal(a.d.querySelector('#estilo option[value="Bocetado"]').textContent,'Monocromático');
  const imgO=a.d.querySelector('#guias-estilo .guia-card[data-value="Bocetado"] img');
  assert.ok(imgO&&/oleo-estilo-monocromatico/.test(imgO.getAttribute('src')),imgO&&imgO.getAttribute('src'));
  const txtO=a.d.querySelector('#guias-estilo .guia-card[data-value="Bocetado"]').textContent;
  assert.match(txtO,/Monocromático/);
  assert.match(txtO,/grisalla|bistre|ébauche/);
  a.set('estilo','Bocetado');a.set('tema','Retrato');
  a.set('enmarcado','SinMarco');a.set('tamano_predefinido','70x100');
  a.w.handleTamanoChange();a.w.calcular();
  const p=a.w.presupuesto();
  assert.ok(p&&!p.consultar);
  assert.equal(p.base,1785000);
  assert.match(a.price(),/1\.785\.000/);
  const items=a.w.ESTUDIO_GUIAS_DEFAULT.items;
  assert.match(items['estilo:Bocetado:Oleo'].url,/oleo-estilo-monocromatico/);
  assert.match(items['estilo:Bocetado:Acrilico'].url,/acrilico-estilo-monocromatico/);
  a.set('tecnica','Acrilico');a.w.onTecnicaChange();
  assert.equal(a.d.querySelector('#estilo option[value="Bocetado"]').textContent,'Monocromático');
  const imgA=a.d.querySelector('#guias-estilo .guia-card[data-value="Bocetado"] img');
  assert.ok(imgA&&/acrilico-estilo-monocromatico/.test(imgA.getAttribute('src')),imgA&&imgA.getAttribute('src'));
  a.set('tecnica','Carbonilla');a.w.onTecnicaChange();
  assert.equal(a.d.querySelector('#estilo option[value="Bocetado"]').textContent,'Boceto');
  a.w.AsistentePedido.abrir();
  a.d.querySelector('#asistente-opciones .guia-card[data-value="oleo"]').click();
  a.w.AsistentePedido.irA('estilo');
  const card=a.d.querySelector('#asistente-opciones .guia-card[data-value="Bocetado"]');
  assert.match(card.textContent,/Monocromático/);
  assert.ok(!/\bBocetado\b/.test(card.textContent),card.textContent);
  assert.match(card.querySelector('img').getAttribute('src'),/oleo-estilo-monocromatico/);
});

test('23. Escultura: el precio sube con la altura en vivo, el número se edita y el mínimo se respeta',()=>{
  const a=iniciar();a.listo();
  const input=a.d.getElementById('escultura_cm');
  assert.equal(input.hasAttribute('readonly'),false);
  assert.equal(input.getAttribute('type'),'number');
  assert.equal(input.getAttribute('inputmode'),'numeric');
  a.set('estilo','Escultura');a.w.onEstiloChange();
  a.set('tipo_escultura','Figura completa');a.w.onTipoEsculturaChange();a.w.calcular();
  assert.equal(input.min,'30');
  assert.equal(input.max,'200');
  a.set('escultura_cm','50');a.w.onEsculturaCmInput();
  assert.equal(a.w.presupuesto().base,6000000);
  assert.match(a.price(),/6\.000\.000/);
  a.set('escultura_cm','170');a.w.onEsculturaCmInput();
  assert.equal(a.w.presupuesto().base,20400000);
  assert.match(a.price(),/20\.400\.000/);
  assert.ok(a.price()!== '6.000.000 ₲');
  a.set('escultura_cm','100');a.w.onEsculturaCmInput();
  assert.equal(a.w.presupuesto().base,12000000);
  a.set('escultura_cm','10');a.w.onEsculturaCmBlur();
  assert.equal(input.value,'30');
  assert.equal(a.w.presupuesto().base,6000000);
  a.set('escultura_cm','999');a.w.onEsculturaCmBlur();
  assert.equal(input.value,'200');
  a.set('escultura_cm','30');a.w.onEsculturaCmBlur();
  a.w.stepEsc(-1);
  assert.equal(input.value,'30');
  a.set('tipo_escultura','Busto');a.w.onTipoEsculturaChange();
  a.set('escultura_cm','50');a.w.onEsculturaCmInput();
  assert.match(a.price(),/8\.000\.000/);
  a.set('tipo_escultura','Figura completa');a.w.onTipoEsculturaChange();
  a.w.AsistentePedido.abrir();
  a.d.querySelector('#asistente-opciones .guia-card[data-value="escultura"]').click();
  a.set('tipo_escultura','Figura completa');a.w.onTipoEsculturaChange();
  a.w.AsistentePedido.irA('altura_escultura');
  a.set('escultura_cm','50');a.w.onEsculturaCmInput();
  assert.match(a.d.getElementById('asistente-precio-vivo').textContent,/6\.000\.000/);
  assert.match(a.d.querySelector('#asistente-precio-bar').textContent,/IVA incluido/);
  a.set('escultura_cm','170');a.w.onEsculturaCmInput();
  assert.match(a.d.getElementById('asistente-precio-vivo').textContent,/20\.400\.000/);
  assert.match(a.d.getElementById('asistente-ayuda').textContent,/persona de 1,70/);
  const css=fs.readFileSync(path.join(base,'style.css'),'utf8');
  assert.match(css,/#asistente-ayuda[\s\S]*overflow-wrap:\s*anywhere/);
});


test('24. El ancho por defecto se muestra exactamente como 50, sin residuos de coma flotante',()=>{
  const a=iniciar();a.listo();
  a.set('forma_lienzo','Estandar');a.w.onFormaChange();
  a.set('tamano_predefinido','50x70');a.w.handleTamanoChange();
  assert.equal(a.d.getElementById('ancho_cm').value,'50');
  assert.equal(a.d.getElementById('alto_cm').value,'70');
  a.w.setUnidad('in',{currentTarget:a.d.getElementById('btn-uni-in')});
  a.w.setUnidad('m',{currentTarget:a.d.getElementById('btn-uni-m')});
  a.w.setUnidad('cm',{currentTarget:a.d.getElementById('btn-uni-cm')});
  assert.equal(a.d.getElementById('ancho_cm').value,'50');
  assert.equal(a.d.getElementById('alto_cm').value,'70');
  assert.ok(!/0{4,}|e-/.test(a.d.getElementById('ancho_cm').value));
});

test('25. Material, peso y consulta de escultura no humana',()=>{
  const a=iniciar();a.listo();
  a.set('estilo','Escultura');a.w.onEstiloChange();
  a.set('tipo_escultura','Figura completa');a.w.onTipoEsculturaChange();
  a.set('material_escultura','Fibra');a.w.onMaterialEsculturaChange();
  a.set('escultura_cm','170');a.w.onEsculturaCmInput();
  const fibra=a.w.presupuesto();
  assert.ok(fibra&&!fibra.consultar);
  assert.equal(fibra.base,20400000);
  const pFibra=a.w.pesoEsculturaKg('Figura completa',170,'Fibra');
  const pCem=a.w.pesoEsculturaKg('Figura completa',170,'Cemento');
  assert.ok(pFibra>=25&&pFibra<=60,String(pFibra));
  assert.ok(pCem>=80&&pCem<=200,String(pCem));
  assert.ok(pCem>pFibra);
  a.set('material_escultura','Cemento');a.w.onMaterialEsculturaChange();
  const cem=a.w.presupuesto();
  assert.equal(cem.base,Math.round(20400000*1.2/50000)*50000);
  assert.match(a.d.getElementById('escultura-peso-estimado').textContent,/Peso estimado/);
  a.set('tipo_escultura','Animal');a.w.onTipoEsculturaChange();a.w.calcular();
  const noH=a.w.presupuesto();
  assert.ok(noH&&noH.consultar&&noH.consultarArtista);
  assert.match(a.price(),/A consultar con el artista/);
});

test('26. Idioma y moneda del país, sin mostrar porcentajes al cliente',()=>{
  const a=iniciar();a.listo();
  a.w.EstudioI18n.setIdioma('en',{manual:true});
  a.w.EstudioI18n.setPais('US',{sinIdioma:true});
  assert.equal(a.d.getElementById('moneda').value,'USD');
  a.w.calcular();
  const txt=a.price();
  assert.ok(/US\$|USD/.test(txt),txt);
  assert.ok(!/%/.test(a.d.getElementById('tab-cotizacion').textContent));
  a.w.EstudioI18n.setIdioma('es',{manual:true});
  a.w.EstudioI18n.setPais('PY');
});


test('27. Traducciones restantes, textos del sitio y validación de textosI18n',()=>{
  const a=iniciar();a.listo();
  a.w.EstudioI18n.setIdioma('en',{manual:true});
  const oleo=a.d.querySelector('#tecnica option[value="Oleo"]');
  assert.match(oleo.textContent,/Oil/i);
  assert.ok(!/Técnica/.test(oleo.textContent));
  const boc=a.d.querySelector('#estilo option[value="Bocetado"]');
  assert.match(boc.textContent,/Monochromatic|Monochrome/i);
  const sub=a.d.querySelector('[data-setting="subtitulo"]');
  assert.match((sub&&sub.textContent)||a.w.EstudioI18n.textoSitio('subtitulo'),/Visual artist/i);
  a.w.AsistentePedido.abrir();
  const paint=a.d.querySelector('#asistente-opciones .guia-card[data-value="oleo"]');
  if(paint) paint.click();
  if(typeof a.w.AsistentePedido.irA==='function'){
    try{a.w.AsistentePedido.irA('tamano');}catch(e){}
  }
  if(typeof a.w.AsistentePedido.pintar==='function') a.w.AsistentePedido.pintar();
  const chipTxt=[...a.d.querySelectorAll('#asistente-chips .asistente-chip, #asistente-chips button')].map(el=>el.textContent).join(' | ');
  assert.match(chipTxt,/Technique/i);
  assert.ok(!/Técnica/.test(chipTxt),chipTxt);
  a.w.sitioActual={textos:{subtitulo:'Subtítulo en español',biografia:'Bio ES'},textosI18n:{en:{subtitulo:'English subtitle',biografia:''}}};
  assert.equal(a.w.EstudioI18n.textoSitio('subtitulo'),'English subtitle');
  assert.equal(a.w.EstudioI18n.textoSitio('biografia'),'Bio ES');
  const vacio=a.w.EstudioDatos.validateSite({...a.w.EstudioDatos.clone(a.w.ESTUDIO_DEFAULTS.sitio),textosI18n:{en:{subtitulo:'',biografia:'A short bio.'}}});
  assert.equal(vacio.textosI18n.en.subtitulo,'');
  assert.equal(vacio.textosI18n.en.biografia,'A short bio.');
  a.w.EstudioI18n.setIdioma('es',{manual:true});
  a.w.EstudioI18n.setPais('PY');
});


test('28. Guías distintas por tipo de escultura, hierro soldado y peso de chapa',()=>{
  const a=iniciar();a.listo();
  const items=a.w.ESTUDIO_GUIAS_DEFAULT.items;
  const tipos=['Busto','Medio cuerpo','Figura completa','Relieve','Animal','Abstracto','Objeto','Otro'];
  const urls=tipos.map(k=>items['tipo_escultura:'+k].url);
  assert.equal(new Set(urls).size,8);
  assert.ok(urls.every(u=>u.startsWith('img/guias/')&&u.endsWith('.webp')));
  assert.equal(items['tipo_escultura:Busto'].url,'img/guias/escultura-busto.webp');
  assert.equal(items['tipo_escultura:Relieve'].url,'img/guias/escultura-relieve.webp');
  for(const k of ['Animal','Abstracto','Objeto','Otro']){
    assert.notEqual(items['tipo_escultura:'+k].url,items['tipo_escultura:Busto'].url);
    assert.ok(!/estilo-escultura/.test(items['tipo_escultura:'+k].url),k);
  }
  assert.ok(items['material_escultura:Chapa'].url.includes('chapa'));
  assert.ok(items['material_escultura:Chatarra'].url.includes('chatarra'));
  const precios=a.w.ESTUDIO_DEFAULTS.precios;
  assert.equal(precios.materialesEscultura.Chapa,1.25);
  assert.equal(precios.materialesEscultura.Chatarra,1.15);
  assert.equal(precios.pesosEscultura.densidadAcero,7.85);
  const pChapa=a.w.pesoEsculturaKg('Figura completa',170,'Chapa');
  const pChat=a.w.pesoEsculturaKg('Figura completa',170,'Chatarra');
  assert.ok(pChapa>=60&&pChapa<=150,String(pChapa));
  assert.ok(pChat>=60&&pChat<=150,String(pChat));
  assert.ok(pChat!==pChapa);
  a.set('estilo','Escultura');a.w.onEstiloChange();
  a.set('tipo_escultura','Figura completa');a.w.onTipoEsculturaChange();
  a.set('material_escultura','Chapa');a.w.onMaterialEsculturaChange();
  a.set('escultura_cm','170');a.w.onEsculturaCmInput();
  const conChapa=a.w.presupuesto();
  assert.ok(conChapa&&!conChapa.consultar);
  assert.equal(conChapa.base,Math.round(20400000*1.25/50000)*50000);
  assert.match(a.d.getElementById('nota-tejido-metalico').textContent,/soldadas|antióxido|antioxido/i);
  assert.ok(!/Todas incluyen tejido/i.test(a.d.getElementById('nota-tejido-metalico').textContent));
  a.set('tipo_escultura','Animal');a.w.onTipoEsculturaChange();
  a.set('material_escultura','Chatarra');a.w.onMaterialEsculturaChange();
  a.w.calcular();
  const noH=a.w.presupuesto();
  assert.ok(noH&&noH.consultar&&noH.consultarArtista);
  assert.match(a.price(),/A consultar con el artista/);
  const mats=[...a.d.querySelectorAll('#material_escultura option')].map(o=>o.value);
  assert.ok(mats.includes('Chapa')&&mats.includes('Chatarra'));
  assert.ok(!/%/.test(a.d.getElementById('tab-cotizacion').textContent));
  const ok=a.w.EstudioDatos.validatePrices(a.w.EstudioDatos.clone(precios));
  assert.equal(ok.materialesEscultura.Chapa,1.25);
});


test('29. El país aplica idioma y moneda al momento, y el idioma manual se puede cambiar después',()=>{
  const a=iniciar();a.listo();
  a.w.EstudioI18n.setIdioma('en',{manual:true});
  a.w.EstudioI18n.setPais('BR');
  assert.equal(a.w.EstudioI18n.idioma,'pt');
  assert.equal(a.w.EstudioI18n.pais,'BR');
  assert.equal(a.d.getElementById('moneda').value,'BRL');
  assert.equal(a.d.getElementById('selector-idioma').value,'pt');
  assert.equal(a.d.getElementById('selector-pais').value,'BR');
  a.w.calcular();
  const txt=a.price();
  assert.ok(/R\$|BRL/.test(txt),txt);
  a.w.AsistentePedido.abrir();
  const oleo=a.d.querySelector('#asistente-opciones .guia-card[data-value="oleo"]');
  if(oleo) oleo.click();
  if(typeof a.w.AsistentePedido.actualizarBarra==='function') a.w.AsistentePedido.actualizarBarra();
  const barra=(a.d.getElementById('asistente-precio-vivo')||{}).textContent||'';
  assert.ok(/R\$|BRL/.test(barra),barra);
  const sugs=[...a.d.querySelectorAll('#asistente-sugerencias-grid, #asistente-sugerencias')].map(el=>el.textContent).join(' ');
  if(sugs.trim()) assert.ok(!/₲/.test(sugs)||/R\$|BRL/.test(sugs),sugs);
  a.w.EstudioI18n.setIdioma('es',{manual:true});
  assert.equal(a.w.EstudioI18n.idioma,'es');
  assert.equal(a.d.getElementById('moneda').value,'BRL');
  a.w.EstudioI18n.setPais('FR');
  assert.equal(a.w.EstudioI18n.idioma,'fr');
  assert.equal(a.d.getElementById('moneda').value,'EUR');
  a.w.EstudioI18n.setPais('US');
  assert.equal(a.w.EstudioI18n.idioma,'en');
  assert.equal(a.d.getElementById('moneda').value,'USD');
  a.w.EstudioI18n.setPais('PY');
  assert.equal(a.w.EstudioI18n.idioma,'es');
  assert.equal(a.d.getElementById('moneda').value,'PYG');
  a.w.EstudioI18n.setPais('AR');
  assert.equal(a.w.EstudioI18n.idioma,'es');
  assert.equal(a.d.getElementById('moneda').value,'ARS');
  a.w.EstudioI18n.setPais('IT');
  assert.equal(a.w.EstudioI18n.idioma,'it');
  assert.equal(a.d.getElementById('moneda').value,'EUR');
  a.w.EstudioI18n.setPais('DE');
  assert.equal(a.w.EstudioI18n.idioma,'de');
  assert.equal(a.d.getElementById('moneda').value,'EUR');
  a.w.EstudioI18n.setIdioma('es',{manual:true});
  a.w.EstudioI18n.setPais('PY');
});


test('30. Textos de material únicos, sin repetir la nota compartida',()=>{
  const a=iniciar();a.listo();
  const keys=['Cemento','Fibra','Arcilla','Chapa','Chatarra'];
  const fundicion=/No es fundición|We do not offer bronze|Não fazemos fundição|Nous ne proposons pas de fonte|Non facciamo fusioni|Wir bieten keinen Guss/i;
  const hierroNota=/Piezas soldadas|Welded pieces, with rust-proof|Peças soldadas, com tratamento|Pièces soudées, avec traitement|Pezzi saldati, con trattamento|Geschweißte Stücke mit Rostschutz/i;
  const tejido=/tejido metálico en el interior|metal mesh inside|malha metálica no interior|treillis métallique à l'intérieur|rete metallica all'interno|innen ein Metallgewebe/i;
  for(const lang of ['es','en','pt','fr','it','de']){
    a.w.EstudioI18n.setIdioma(lang,{manual:true});
    for(const k of keys){
      const txt=a.w.EstudioI18n.t('guia.material_escultura:'+k);
      assert.ok(txt&&txt.length>8,lang+' '+k+' '+txt);
      assert.ok(!fundicion.test(txt),lang+' '+txt);
      if(k==='Chapa'||k==='Chatarra') assert.ok(!hierroNota.test(txt),lang+' '+txt);
      else assert.ok(!tejido.test(txt),lang+' '+txt);
    }
    const ayuda=a.w.EstudioI18n.t('wizard.material.ayuda');
    assert.ok(ayuda&&ayuda.length>40,lang+' ayuda');
    assert.ok(/soldad|weld|antiferrugem|antirouille|antiruggine|Rostschutz|antióxido|rust-proof/i.test(ayuda),lang+' '+ayuda);
  }
  a.w.EstudioI18n.setIdioma('es',{manual:true});
  a.w.AsistentePedido.abrir();
  const esc=a.d.querySelector('#asistente-opciones .guia-card[data-value="escultura"]');
  if(esc) esc.click();
  if(typeof a.w.AsistentePedido.irA==='function'){
    try{a.w.AsistentePedido.irA('material_escultura');}catch(e){}
  }
  if(typeof a.w.AsistentePedido.pintar==='function') a.w.AsistentePedido.pintar();
  const cards=[...a.d.querySelectorAll('#asistente-opciones .guia-card')];
  assert.ok(cards.length>=5,String(cards.length));
  for(const el of cards){
    const title=(el.querySelector('strong')||{}).textContent||'';
    const desc=(el.querySelector('span')||{}).textContent||'';
    assert.ok(title.trim(),el.textContent);
    assert.ok(desc.trim(),el.textContent);
    assert.notEqual(title.replace(/\.$/,'').trim().toLowerCase(),desc.replace(/\.$/,'').trim().toLowerCase(),el.textContent);
    assert.ok(!/Piezas soldadas|No es fundición|tejido metálico/i.test(title+' '+desc),el.textContent);
  }
  const chapa=cards.find(el=>/Chapa de hierro cortada/i.test(el.textContent));
  assert.ok(chapa,cards.map(el=>el.textContent).join(' | '));
  const ayudaEl=a.d.getElementById('asistente-ayuda');
  assert.ok(ayudaEl);
  assert.match(ayudaEl.textContent,/tejido metálico/i);
  assert.match(ayudaEl.textContent,/tratamiento antióxido|antioxido/i);
  assert.match(ayudaEl.textContent,/fundición|fundicion/i);
});

console.log(JSON.stringify(results,null,2));fs.writeFileSync(path.join(base,'resultados-pruebas.json'),JSON.stringify(results,null,2));

