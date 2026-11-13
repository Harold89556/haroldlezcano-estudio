'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const i18n = (k, fb, vars) => { if (fb && typeof fb === 'object' && !Array.isArray(fb)) { vars = fb; fb = undefined; } const s = (window.EstudioI18n && EstudioI18n.t) ? EstudioI18n.t(k, vars) : (fb || k); return s; };
  const parked = [];
  let indice = 0;
  let trabajo = '';

  function tecnicaGuia() {
    return valor('tecnica') || (trabajo === 'oleo' ? 'Oleo' : trabajo === 'acrilico' ? 'Acrilico' : trabajo === 'carbonilla' ? 'Carbonilla' : '');
  }
  function guia(key) {
    const te = tecnicaGuia();
    const special = /Mural|Escultura|Restauracion/.test(key);
    const keys = [];
    if (te && !special && /^(estilo|tema|fondo|enmarcado|sujetos):/.test(key)) keys.push(key + ':' + te);
    keys.push(key);
    if (window.CotizadorVisual && typeof CotizadorVisual.item === 'function') {
      for (const k of keys) {
        const src = CotizadorVisual.item(k);
        if (src && (src.url || src.text)) return { url: src.url || '', text: src.text || '' };
      }
    }
    const d = (window.ESTUDIO_GUIAS_DEFAULT && window.ESTUDIO_GUIAS_DEFAULT.items) || {};
    const o = (window.guiasActual && window.guiasActual.items) || {};
    for (const k of keys) {
      const src = o[k] || d[k];
      if (src && (src.url || src.text)) return { url: src.url || '', text: src.text || '' };
    }
    return { url: '', text: '' };
  }

  function setVal(id, value) {
    const el = $(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (el.onchange) { /* native handler already via attribute + event */ }
  }

  function take(el) {
    if (!el || el.dataset.asistentePark) return;
    parked.push({ el, parent: el.parentNode, next: el.nextSibling });
    el.dataset.asistentePark = '1';
    el.classList.add('en-asistente');
    $('asistente-extra').appendChild(el);
  }

  function restoreParked() {
    for (let i = parked.length - 1; i >= 0; i--) {
      const p = parked[i];
      p.el.classList.remove('en-asistente');
      delete p.el.dataset.asistentePark;
      if (p.next && p.next.parentNode === p.parent) p.parent.insertBefore(p.el, p.next);
      else if (p.parent) p.parent.appendChild(p.el);
    }
    parked.length = 0;
  }

  const TRABAJOS = [
    { id: 'oleo', titleKey: 'trabajo.oleo', textKey: 'trabajo.oleo.text', key: 'tecnica:Oleo' },
    { id: 'acrilico', titleKey: 'trabajo.acrilico', textKey: 'trabajo.acrilico.text', key: 'tecnica:Acrilico' },
    { id: 'carbonilla', titleKey: 'trabajo.carbonilla', textKey: 'trabajo.carbonilla.text', key: 'tecnica:Carbonilla' },
    { id: 'escultura', titleKey: 'trabajo.escultura', textKey: 'trabajo.escultura.text', key: 'estilo:Escultura' },
    { id: 'mural', titleKey: 'trabajo.mural', textKey: 'trabajo.mural.text', key: 'estilo:Mural' },
    { id: 'restauracion', titleKey: 'trabajo.restauracion', textKey: 'trabajo.restauracion.text', key: 'estilo:Restauracion' }
  ];

  function esPintura() { return trabajo === 'oleo' || trabajo === 'acrilico' || trabajo === 'carbonilla'; }

  function pasos() {
    const s = [{ id: 'trabajo', pregunta: i18n('wizard.trabajo.pregunta'), ayuda: i18n('wizard.trabajo.ayuda') }];
    if (esPintura()) {
      s.push({ id: 'estilo', pregunta: trabajo === 'carbonilla' ? i18n('wizard.estilo.preguntaCarbonilla') : i18n('wizard.estilo.pregunta'), ayuda: trabajo === 'carbonilla' ? i18n('wizard.estilo.ayudaCarbonilla') : i18n('wizard.estilo.ayuda') });
      s.push({ id: 'tema', pregunta: i18n('wizard.tema.pregunta2'), ayuda: i18n('wizard.tema.ayuda2') });
      if (valor('tema') === 'Retrato') {
        s.push({ id: 'sujetos', pregunta: i18n('wizard.sujetos.pregunta2'), ayuda: i18n('wizard.sujetos.ayuda2') });
        if (valor('estilo') !== 'Espatulado') {
          s.push({ id: 'fondo', pregunta: i18n('wizard.fondo.pregunta2'), ayuda: i18n('wizard.fondo.ayuda2') });
        }
      }
      if (trabajo === 'carbonilla') {
        s.push({ id: 'color', pregunta: i18n('wizard.color.pregunta2'), ayuda: i18n('wizard.color.ayuda2') });
      }
      if (trabajo === 'oleo' || trabajo === 'acrilico') {
        s.push({ id: 'forma', pregunta: i18n('wizard.forma.pregunta2'), ayuda: i18n('wizard.forma.ayuda2') });
      }
      s.push({ id: 'tamano', pregunta: i18n('wizard.tamano.pregunta'), ayuda: trabajo === 'carbonilla' ? i18n('wizard.tamano.ayudaCarbonilla') : i18n('wizard.tamano.ayuda') });
      s.push({ id: 'marco', pregunta: i18n('wizard.marco.pregunta2'), ayuda: trabajo === 'carbonilla' ? i18n('wizard.marco.ayudaCarbonilla2') : i18n('wizard.marco.ayudaPintura') });
    } else if (trabajo === 'escultura') {
      s.push({ id: 'tipo_escultura', pregunta: i18n('wizard.tipoEscultura.pregunta'), ayuda: i18n('wizard.tipoEscultura.ayuda') });
      s.push({ id: 'material_escultura', pregunta: i18n('wizard.material.pregunta'), ayuda: i18n('wizard.material.ayuda') });
      s.push({ id: 'altura_escultura', pregunta: i18n('wizard.altura.pregunta'), ayuda: i18n('wizard.altura.ayuda') });
    } else if (trabajo === 'mural') {
      s.push({ id: 'estilo_mural', pregunta: i18n('wizard.estiloMural.pregunta'), ayuda: i18n('wizard.estiloMural.pregunta') });
      s.push({ id: 'tamano_mural', pregunta: i18n('wizard.tamanoMural.pregunta'), ayuda: i18n('wizard.tamanoMural.ayuda') });
    } else if (trabajo === 'restauracion') {
      s.push({ id: 'tipo_restauracion', pregunta: i18n('wizard.restauracion.pregunta2'), ayuda: i18n('wizard.restauracion.ayuda2') });
    }
    if (trabajo) {
      s.push({ id: 'fotos', pregunta: trabajo === 'restauracion' ? i18n('wizard.fotos.preguntaRest') : i18n('wizard.fotos.pregunta'), ayuda: trabajo === 'restauracion' ? i18n('wizard.fotos.ayudaRest2') : i18n('wizard.fotos.ayuda2') });
      s.push({ id: 'datos', pregunta: i18n('wizard.datos.pregunta'), ayuda: trabajo === 'restauracion' ? i18n('wizard.datos.ayudaRest2') : i18n('wizard.datos.ayuda2') });
      s.push({ id: 'resumen', pregunta: i18n('wizard.resumen.pregunta'), ayuda: i18n('wizard.resumen.ayuda') });
    }
    return s;
  }


  function etiquetaOpcion(id) {
    const el = $(id);
    const opt = el && el.selectedOptions && el.selectedOptions[0];
    if (!opt || !opt.value) return '';
    const key = opt.getAttribute('data-i18n-option');
    if (key) return i18n(key, opt.textContent);
    return opt.textContent || '';
  }
  function textoGuia(key) {
    const g = guia(key);
    const tr = i18n('guia.' + key, g.text || '');
    return tr || g.text || '';
  }
  function valor(id) { return ($(id) && $(id).value) || ''; }

  function aplicarTrabajo(id) {
    trabajo = id;
    if (id === 'oleo' || id === 'acrilico' || id === 'carbonilla') {
      const est = valor('estilo');
      if (est === 'Mural' || est === 'Escultura' || est === 'Restauracion' || !est) {
        // leave estilo empty until that step; clear special types
        const sel = $('estilo');
        if (sel) sel.value = '';
      }
      setVal('tecnica', id === 'oleo' ? 'Oleo' : id === 'acrilico' ? 'Acrilico' : 'Carbonilla');
    } else if (id === 'escultura') {
      setVal('estilo', 'Escultura');
    } else if (id === 'mural') {
      setVal('estilo', 'Mural');
    } else if (id === 'restauracion') {
      setVal('estilo', 'Restauracion');
    }
  }

  function opcionesDe(paso) {
    if (paso.id === 'trabajo') return TRABAJOS.map((t) => ({ value: t.id, title: i18n(t.titleKey, t.titleKey), text: i18n(t.textKey, t.textKey), url: guia(t.key).url, selected: trabajo === t.id }));
    if (paso.id === 'estilo') {
      const list = [
        { value: 'Realista', key: 'estilo:Realista', title: trabajo === 'carbonilla' ? i18n('card.realistaDet') : i18n('card.realista') },
        { value: 'Hiperrealista', key: 'estilo:Hiperrealista', title: trabajo === 'carbonilla' ? i18n('card.hiperGrafito') : i18n('card.hiper') }
      ];
      if (trabajo !== 'carbonilla') list.push({ value: 'Espatulado', key: 'estilo:Espatulado', title: i18n('card.espatulado') });
      list.push({ value: 'Bocetado', key: 'estilo:Bocetado', title: trabajo === 'carbonilla' ? i18n('card.bocetoTrazo') : i18n('card.monocromatico') });
      list.push({ value: 'Abstracto', key: 'estilo:Abstracto', title: i18n('card.abstracto') });
      return list.map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('estilo') === o.value }));
    }
    if (paso.id === 'tema') {
      return [
        { value: 'Retrato', key: 'tema:Retrato', title: i18n('card.retrato') },
        { value: 'Paisaje', key: 'tema:Paisaje', title: i18n('card.paisaje') },
        { value: 'Bodegon', key: 'tema:Bodegon', title: i18n('card.bodegon') }
      ].map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('tema') === o.value }));
    }
    if (paso.id === 'sujetos') {
      const p = Number(valor('personas') || 0);
      const m = Number(valor('mascotas') || 0);
      return [
        { value: '1', title: i18n('sujetos.una'), text: textoGuia('sujetos:1'), url: guia('sujetos:1').url, selected: p === 0 },
        { value: '2', title: i18n('sujetos.dos'), text: textoGuia('sujetos:2'), url: guia('sujetos:2').url, selected: p >= 1 },
        { value: 'mascota', title: i18n('card.conMascota'), text: textoGuia('sujetos:mascota'), url: guia('sujetos:mascota').url, selected: m >= 1 }
      ];
    }
    if (paso.id === 'fondo') {
      const det = $('fondo') && $('fondo').checked;
      return [
        { value: 'simple', title: i18n('card.fondoSimple'), text: i18n('guia.fondo:simple', guia('fondo:simple').text), url: guia('fondo:simple').url, selected: !det },
        { value: 'detallado', title: i18n('card.fondoDetallado'), text: i18n('guia.fondo:detallado', guia('fondo:detallado').text), url: guia('fondo:detallado').url, selected: !!det }
      ];
    }
    if (paso.id === 'color') {
      return [
        { value: 'Sin color', title: i18n('card.bn'), text: i18n('card.bn.text'), url: guia('color:Sin color').url, selected: valor('color_lapiz') === 'Sin color' },
        { value: 'A color', title: i18n('card.aColor'), text: i18n('card.aColor.text'), url: guia('color:A color').url, selected: valor('color_lapiz') === 'A color' }
      ];
    }
    if (paso.id === 'forma') {
      return [
        { value: 'Estandar', key: 'forma_lienzo:Estandar', title: i18n('card.rectangular') },
        { value: 'Circular', key: 'forma_lienzo:Circular', title: i18n('card.circular') },
        { value: 'Ovalado', key: 'forma_lienzo:Ovalado', title: i18n('card.ovalado') },
        { value: 'Hexagonal', key: 'forma_lienzo:Hexagonal', title: i18n('card.hexagonal') }
      ].map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('forma_lienzo') === o.value }));
    }
    if (paso.id === 'marco') {
      let list = [
        { value: 'SinMarco', key: 'enmarcado:SinMarco', title: trabajo === 'carbonilla' ? i18n('card.sinMarcoPapel') : i18n('card.sinMarco') },
        { value: 'Estandar', key: 'enmarcado:Estandar', title: trabajo === 'carbonilla' ? i18n('card.marcoEstandarPapel') : i18n('card.marcoEstandar') },
        { value: 'Cajon', key: 'enmarcado:Cajon', title: i18n('card.marcoCajon') },
        { value: 'Clasico', key: 'enmarcado:Clasico', title: trabajo === 'carbonilla' ? i18n('card.marcoClasicoPapel') : i18n('card.marcoClasico') },
        { value: 'SemiRelieve', key: 'enmarcado:SemiRelieve', title: i18n('card.marcoSemi') },
        { value: 'GruesoRelieves', key: 'enmarcado:GruesoRelieves', title: i18n('card.marcoGrueso') }
      ];
      if (trabajo === 'carbonilla') list = list.filter((o) => ['SinMarco', 'Estandar', 'Clasico'].includes(o.value));
      return list.map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('enmarcado') === o.value }));
    }
    if (paso.id === 'tipo_escultura') {
      return [
        { value: 'Busto', key: 'tipo_escultura:Busto', title: i18n('escultura.busto') },
        { value: 'Medio cuerpo', key: 'tipo_escultura:Medio cuerpo', title: i18n('escultura.medio') },
        { value: 'Figura completa', key: 'tipo_escultura:Figura completa', title: i18n('escultura.figura') },
        { value: 'Relieve', key: 'tipo_escultura:Relieve', title: i18n('escultura.relieve') },
        { value: 'Animal', key: 'tipo_escultura:Animal', title: i18n('escultura.animal') },
        { value: 'Abstracto', key: 'tipo_escultura:Abstracto', title: i18n('escultura.abstracto') },
        { value: 'Objeto', key: 'tipo_escultura:Objeto', title: i18n('escultura.objeto') },
        { value: 'Otro', key: 'tipo_escultura:Otro', title: i18n('escultura.otro') }
      ].map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('tipo_escultura') === o.value }));
    }
    if (paso.id === 'material_escultura') {
      return [
        { value: 'Fibra', key: 'material_escultura:Fibra', title: i18n('escultura.fibra'), hierro:false },
        { value: 'Cemento', key: 'material_escultura:Cemento', title: i18n('escultura.cemento'), hierro:false },
        { value: 'Arcilla', key: 'material_escultura:Arcilla', title: i18n('escultura.arcilla'), hierro:false },
        { value: 'Chapa', key: 'material_escultura:Chapa', title: i18n('escultura.chapa'), hierro:true },
        { value: 'Chatarra', key: 'material_escultura:Chatarra', title: i18n('escultura.chatarra'), hierro:true }
      ].map((o) => ({ ...o, text: textoGuia(o.key), url: guia(o.key).url, selected: valor('material_escultura') === o.value }));
    }
    if (paso.id === 'estilo_mural') {
      return [
        { value: 'Realista Mural', title: i18n('card.muralRealista'), text: i18n('card.muralRealista.text'), url: guia('estilo_mural:Realista Mural').url, selected: valor('estilo_mural') === 'Realista Mural' },
        { value: 'Ilustracion Mural', title: i18n('card.muralIlus'), text: i18n('card.muralIlus.text'), url: guia('estilo_mural:Ilustracion Mural').url, selected: valor('estilo_mural') === 'Ilustracion Mural' },
        { value: 'Bocetado', title: i18n('card.muralBoceto'), text: i18n('card.muralBoceto.text'), url: guia('estilo_mural:Bocetado').url, selected: valor('estilo_mural') === 'Bocetado' }
      ];
    }
    if (paso.id === 'tipo_restauracion') {
      return [
        { value: 'Digital', title: i18n('card.restDigital'), text: i18n('card.restDigital.text'), url: guia('tipo_restauracion:Digital').url, selected: valor('tipo_restauracion') === 'Digital' },
        { value: 'Digital Compleja', title: i18n('card.restCompleja'), text: i18n('card.restCompleja.text'), url: guia('tipo_restauracion:Digital Compleja').url, selected: valor('tipo_restauracion') === 'Digital Compleja' },
        { value: 'Fisica', title: i18n('card.restFisica'), text: i18n('card.restFisica.text'), url: guia('tipo_restauracion:Fisica').url, selected: valor('tipo_restauracion') === 'Fisica' }
      ];
    }
    return [];
  }

  function elegir(paso, value) {
    if (paso.id === 'trabajo') aplicarTrabajo(value);
    else if (paso.id === 'estilo') setVal('estilo', value);
    else if (paso.id === 'tema') setVal('tema', value);
    else if (paso.id === 'sujetos') {
      if (value === '1') setVal('personas', '0');
      else if (value === '2') setVal('personas', '1');
      else if (value === 'mascota') {
        const cur = Number(valor('mascotas') || 0);
        const input = $('mascotas');
        if (input) { input.value = cur >= 1 ? '0' : '1'; if (window.calcular) calcular(); }
      }
      if (window.CotizadorVisual) CotizadorVisual.renderSujetos();
    } else if (paso.id === 'fondo') {
      if ($('fondo')) { $('fondo').checked = value === 'detallado'; if (window.calcular) calcular(); }
    } else if (paso.id === 'color') setVal('color_lapiz', value);
    else if (paso.id === 'forma') { setVal('forma_lienzo', value); if (window.onFormaChange) onFormaChange(); }
    else if (paso.id === 'marco') setVal('enmarcado', value);
    else if (paso.id === 'tipo_escultura') setVal('tipo_escultura', value);
    else if (paso.id === 'material_escultura') { setVal('material_escultura', value); if (window.onMaterialEsculturaChange) onMaterialEsculturaChange(); }
    else if (paso.id === 'estilo_mural') setVal('estilo_mural', value);
    else if (paso.id === 'tipo_restauracion') setVal('tipo_restauracion', value);
    pintar();
  }

  function puedeSeguir(paso) {
    if (paso.id === 'trabajo') return !!trabajo;
    if (paso.id === 'estilo') return ['Realista', 'Hiperrealista', 'Espatulado', 'Bocetado', 'Abstracto'].includes(valor('estilo'));
    if (paso.id === 'tema') return !!valor('tema');
    if (paso.id === 'sujetos') return true;
    if (paso.id === 'fondo' || paso.id === 'color' || paso.id === 'forma' || paso.id === 'marco') return true;
    if (paso.id === 'tipo_escultura') return !!valor('tipo_escultura');
    if (paso.id === 'material_escultura') return !!valor('material_escultura');
    if (paso.id === 'estilo_mural') return !!valor('estilo_mural');
    if (paso.id === 'tipo_restauracion') return !!valor('tipo_restauracion');
    if (paso.id === 'tamano') {
      if (!valor('tamano_predefinido')) return false;
      return typeof obtenerDimensiones !== 'function' || obtenerDimensiones().valida;
    }
    if (paso.id === 'altura_escultura') return !!valor('tipo_escultura');
    if (paso.id === 'tamano_mural') return !!valor('mural_ancho') && !!valor('mural_alto');
    if (paso.id === 'fotos') return !!valor('fotos_referencia');
    if (paso.id === 'datos') return !!(valor('envio_nombre') || '').trim();
    if (paso.id === 'resumen') return true;
    return false;
  }

  function card(opt, paso) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guia-card' + (opt.selected ? ' active' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
    btn.dataset.value = opt.value;
    const media = document.createElement('div');
    media.className = 'guia-media';
    if (opt.url) {
      const img = document.createElement('img');
      img.src = opt.url; img.alt = ''; img.loading = 'eager'; img.decoding = 'sync';
      media.append(img);
    }
    const cap = document.createElement('div');
    cap.className = 'guia-cap';
    const t = document.createElement('strong'); t.textContent = opt.title;
    const p = document.createElement('span'); p.textContent = opt.text || '';
    cap.append(t, p);
    btn.append(media, cap);
    btn.addEventListener('click', () => elegir(paso, opt.value));
    return btn;
  }

  function resumenHtml() {
    const precio = ($('precioFinal') && $('precioFinal').textContent) || '';
    const filas = [];
    const add = (k, v) => { if (v) filas.push('<li><strong>' + k + ':</strong> ' + v + '</li>'); };
    if (esPintura()) {
      add(i18n('chip.trabajo'), i18n((TRABAJOS.find((t) => t.id === trabajo)||{}).titleKey));
      add(i18n('chip.estilo'), etiquetaOpcion('estilo'));
      add(i18n('chip.tecnica'), etiquetaOpcion('tecnica'));
      if (trabajo === 'carbonilla') add(i18n('chip.color'), etiquetaOpcion('color_lapiz'));
      add(i18n('chip.tema'), etiquetaOpcion('tema'));
      if (valor('tema') === 'Retrato') {
        add(i18n('chip.personasExtra'), valor('personas'));
        add(i18n('chip.mascotasExtra'), valor('mascotas'));
        add(i18n('chip.fondo'), ($('fondo') && $('fondo').checked) ? i18n('chip.detallado') : i18n('chip.simple'));
      }
      add(i18n('chip.forma'), etiquetaOpcion('forma_lienzo'));
      add(i18n('chip.tamano'), etiquetaOpcion('tamano_predefinido')||($('tamano_predefinido')?.selectedOptions[0]?.text)||'');
      add(i18n('chip.marco'), etiquetaOpcion('enmarcado'));
    } else if (trabajo === 'escultura') {
      add(i18n('chip.trabajo'), i18n('trabajo.escultura'));
      add(i18n('chip.tipo'), etiquetaOpcion('tipo_escultura'));
      add(i18n('escultura.material','Material'), etiquetaOpcion('material_escultura'));
      if (typeof alturaEsculturaCm==='function' && Number.isFinite(alturaEsculturaCm())) add(i18n('chip.altura'), formatoDesdeCm(alturaEsculturaCm()));
      const kg = typeof pesoEsculturaKg==='function' ? pesoEsculturaKg() : null;
      if (Number.isFinite(kg)) add(i18n('chip.peso'), i18n('escultura.peso',{n: kg>=20?Math.round(kg):kg}));
    } else if (trabajo === 'mural') {
      add(i18n('chip.trabajo'), i18n('trabajo.mural'));
      add(i18n('chip.estilo'), etiquetaOpcion('estilo_mural'));
      if (typeof muralAnchoCm==='function') add(i18n('chip.tamano'), (typeof formatoParDesdeCm==='function')?formatoParDesdeCm(muralAnchoCm(),muralAltoCm()):(formatoDesdeCm(muralAnchoCm()) + ' × ' + formatoDesdeCm(muralAltoCm())));
    } else if (trabajo === 'restauracion') {
      add(i18n('chip.trabajo'), i18n('trabajo.restauracion'));
      add(i18n('chip.tipo'), etiquetaOpcion('tipo_restauracion'));
    }
    add(i18n('chip.referencias'), etiquetaOpcion('fotos_referencia'));
    add(i18n('chip.nombre'), valor('envio_nombre'));
    const nota = trabajo === 'mural' ? i18n('precio.muralDetalle') : i18n('precio.ivaEnvio');
    return '<ul class="asistente-resumen">' + filas.join('') + '</ul><p class="asistente-precio" id="asistente-precio">' + precio + '</p><p class="vista-escala-nota">' + nota + '</p>';
  }


  function irA(id) {
    const lista = pasos();
    const i = lista.findIndex((p) => p.id === id);
    if (i < 0) return;
    indice = i;
    pintar();
  }

  function textoPrecioDe(p) {
    if (!p) return '';
    if (p.consultar) return p.consultarArtista ? i18n('precio.consultarArtista') : i18n('precio.consultar');
    if (p.evaluar) return i18n('precio.consultar');
    return typeof dinero === 'function' ? dinero(p.total) : '';
  }

  function precioListo() {
    return typeof presupuesto === 'function' && !!presupuesto();
  }

  function peekPresupuesto(cambios) {
    const prev = {};
    Object.keys(cambios).forEach((id) => {
      const el = $(id);
      if (!el) return;
      prev[id] = el.value;
      el.value = cambios[id];
    });
    let p = null;
    try { p = typeof presupuesto === 'function' ? presupuesto() : null; }
    finally {
      Object.keys(prev).forEach((id) => { const el = $(id); if (el) el.value = prev[id]; });
    }
    return p;
  }

  function etiquetaTamano(key) {
    if (!key || key === 'personalizado') {
      const d = typeof obtenerDimensiones === 'function' ? obtenerDimensiones() : null;
      if (d && d.valida) return (typeof formatoParDesdeCm==='function') ? formatoParDesdeCm(d.ancho,d.alto) : (typeof formatoDesdeCm==='function') ? (formatoDesdeCm(d.ancho)+' × '+formatoDesdeCm(d.alto)) : (Math.round(d.ancho) + ' × ' + Math.round(d.alto) + ' cm');
      return 'Personalizado';
    }
    const parts = key.split('x').map(Number);
    if (parts.length >= 2 && parts.every(Number.isFinite)) return (typeof formatoParDesdeCm==='function') ? formatoParDesdeCm(parts[0],parts[1]) : (typeof formatoDesdeCm==='function') ? (formatoDesdeCm(parts[0])+' × '+formatoDesdeCm(parts[1])) : (parts[0] + ' × ' + parts[1] + ' cm');
    return key;
  }

  function clavesDeTabla() {
    if (typeof familiaClaves === 'function') {
      const d = typeof obtenerDimensiones === 'function' ? obtenerDimensiones() : null;
      if (d && d.valida) return familiaClaves(d).slice();
    }
    return valor('tecnica') === 'Carbonilla' ? ['15x21', '21x30', '30x42', '42x59'] : ['30x40', '40x50', '50x70', '70x100', '100x120'];
  }

  function alternativaEconomica(p0, st) {
    if (!p0 || p0.consultar) return null;
    const te = valor('tecnica');
    const est = valor('estilo');
    const cands = [];
    if (te === 'Oleo') cands.push({ tecnica: 'Acrilico', estilo: est, title: 'Acrílico · ' + etiquetaTamano(st) });
    if (te === 'Acrilico') { /* óleo no es más barato */ }
    if (est !== 'Bocetado' && est !== 'Abstracto' && te !== 'Carbonilla') {
      cands.push({ tecnica: te, estilo: 'Bocetado', title: 'Monocromático · ' + etiquetaTamano(st) });
    }
    let best = null;
    cands.forEach((c) => {
      const cambios = { tecnica: c.tecnica, estilo: c.estilo };
      if (st) cambios.tamano_predefinido = st;
      const p = peekPresupuesto(cambios);
      if (!p || p.consultar || !(p.total < p0.total)) return;
      if (!best || p.total < best.total) best = { ...c, total: p.total, precio: textoPrecioDe(p), cambios };
    });
    if (!best) return null;
    return { id: 'alt', title: best.title, precio: best.precio, actual: false, economica: true, cambios: best.cambios };
  }

  function sugerenciasPresupuesto() {
    if (!esPintura() || !precioListo()) return [];
    const p0 = presupuesto();
    if (!p0 || p0.consultar) return [];
    const st = valor('tamano_predefinido');
    const keys = clavesDeTabla();
    let idx = keys.indexOf(st);
    if (idx < 0) {
      const d = typeof obtenerDimensiones === 'function' ? obtenerDimensiones() : null;
      const area = d && d.valida ? d.ancho * d.alto : 0;
      idx = keys.findIndex((k) => {
        const [w, h] = k.split('x').map(Number);
        return w * h >= area;
      });
      if (idx < 0) idx = keys.length;
    }
    const picked = [];
    const take = (i) => {
      if (i >= 0 && i < keys.length && !picked.includes(keys[i])) picked.push(keys[i]);
    };
    const curEnTabla = st && keys.includes(st);
    if (curEnTabla) {
      take(idx - 1);
      take(idx);
      take(idx + 1);
      take(idx + 2);
      if (picked.length < 3) take(idx - 2);
    } else {
      if (idx >= keys.length) { take(keys.length - 2); take(keys.length - 1); }
      else if (idx <= 0) { take(0); take(1); take(2); }
      else { take(idx - 1); take(idx); take(idx + 1); }
    }
    const alt = alternativaEconomica(p0, st);
    const maxSizes = alt ? 3 : 4;
    const sizeKeys = curEnTabla
      ? picked.filter((k) => k === st || true).slice(0, maxSizes)
      : picked.slice(0, maxSizes);
    // Prefer keeping current + smaller + larger when we must trim
    if (curEnTabla && sizeKeys.length > maxSizes) {
      /* already sliced */
    }
    if (curEnTabla && sizeKeys.length === maxSizes && !sizeKeys.includes(st)) {
      sizeKeys[sizeKeys.length - 1] = st;
    }
    const out = [];
    if (!curEnTabla && st) {
      out.push({
        id: 'actual',
        title: etiquetaTamano(st),
        precio: textoPrecioDe(p0),
        actual: true,
        cambios: { tamano_predefinido: st }
      });
    }
    sizeKeys.forEach((k) => {
      const p = peekPresupuesto({ tamano_predefinido: k });
      if (!p || p.consultar) return;
      out.push({
        id: 'tam-' + k,
        title: etiquetaTamano(k),
        precio: textoPrecioDe(p),
        actual: k === st,
        cambios: { tamano_predefinido: k }
      });
    });
    // avoid duplicating current custom vs first card
    const seen = new Set();
    const uniq = [];
    out.forEach((s) => {
      const key = s.cambios.tamano_predefinido + '|' + (s.cambios.tecnica || '') + '|' + (s.cambios.estilo || '');
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(s);
    });
    const sizesOnly = uniq.slice(0, maxSizes);
    if (alt) sizesOnly.push(alt);
    return sizesOnly.slice(0, 4);
  }

  function aplicarSugerencia(sug) {
    if (!sug || !sug.cambios) return;
    if (sug.cambios.tecnica) {
      const te = sug.cambios.tecnica;
      trabajo = te === 'Oleo' ? 'oleo' : te === 'Acrilico' ? 'acrilico' : te === 'Carbonilla' ? 'carbonilla' : trabajo;
      setVal('tecnica', te);
    }
    if (sug.cambios.estilo) setVal('estilo', sug.cambios.estilo);
    if (sug.cambios.tamano_predefinido) {
      setVal('tamano_predefinido', sug.cambios.tamano_predefinido);
      if (typeof handleTamanoChange === 'function') handleTamanoChange();
    }
    if (typeof calcular === 'function') calcular();
    pintar();
  }

  function chipsDe() {
    if (!precioListo()) return [];
    const lista = pasos();
    const has = (id) => lista.some((p) => p.id === id);
    const items = [];
    const add = (id, label, texto) => {
      if (!has(id) || !texto) return;
      items.push({ id, label, texto });
    };
    if (esPintura()) {
      add('trabajo', i18n('chip.tecnica'), i18n((TRABAJOS.find((t) => t.id === trabajo)||{}).titleKey));
      add('estilo', i18n('chip.estilo'), etiquetaOpcion('estilo'));
      add('tema', i18n('chip.tema'), etiquetaOpcion('tema'));
      if (valor('tema') === 'Retrato') {
        const p = Number(valor('personas') || 0);
        const m = Number(valor('mascotas') || 0);
        const sujetos = p >= 1 ? i18n('sujetos.dos') : i18n('sujetos.una');
        add('sujetos', i18n('chip.sujetos'), m >= 1 ? sujetos + i18n('chip.yMascota') : sujetos);
      }
      add('tamano', i18n('chip.tamano'), etiquetaTamano(valor('tamano_predefinido')));
    } else if (trabajo === 'escultura') {
      add('trabajo', i18n('chip.trabajo'), i18n('trabajo.escultura'));
      add('tipo_escultura', i18n('chip.tipo'), etiquetaOpcion('tipo_escultura'));
      add('material_escultura', i18n('escultura.material','Material'), etiquetaOpcion('material_escultura'));
      if (typeof alturaEsculturaCm==='function' && Number.isFinite(alturaEsculturaCm()) && alturaEsculturaCm()>0) add('altura_escultura', i18n('chip.altura'), formatoDesdeCm(alturaEsculturaCm()));
    } else if (trabajo === 'mural') {
      add('trabajo', i18n('chip.trabajo'), i18n('trabajo.mural'));
      add('estilo_mural', i18n('chip.estilo'), etiquetaOpcion('estilo_mural'));
      if (valor('mural_ancho') && valor('mural_alto')) {
        add('tamano_mural', i18n('chip.tamano'), (typeof formatoParDesdeCm==='function') ? formatoParDesdeCm(muralAnchoCm(),muralAltoCm()) : (typeof formatoDesdeCm==='function') ? (formatoDesdeCm(muralAnchoCm())+' × '+formatoDesdeCm(muralAltoCm())) : (valor('mural_ancho')+' × '+valor('mural_alto')));
      }
    } else if (trabajo === 'restauracion') {
      add('trabajo', i18n('chip.trabajo'), i18n('trabajo.restauracion'));
      add('tipo_restauracion', i18n('chip.tipo'), etiquetaOpcion('tipo_restauracion'));
    }
    return items;
  }

  function actualizarBarra() {
    const root = $('asistente-pedido');
    const bar = $('asistente-precio-bar');
    const vivo = $('asistente-precio-vivo');
    const chips = $('asistente-chips');
    const sugBox = $('asistente-sugerencias');
    const sugGrid = $('asistente-sugerencias-grid');
    if (!root || root.hidden) return;
    const listo = precioListo();
    const p = listo ? presupuesto() : null;
    const txt = textoPrecioDe(p);
    if (bar) bar.hidden = !listo;
    if (vivo && listo) vivo.textContent = txt;
    if ($('asistente-precio') && listo) $('asistente-precio').textContent = txt;
    const pie = root.querySelector('.asistente-pie');
    if (pie) pie.classList.toggle('con-precio', listo);
    const chipItems = chipsDe();
    if (chips) {
      chips.hidden = !chipItems.length;
      chips.replaceChildren();
      chipItems.forEach((c) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'asistente-chip';
        btn.dataset.paso = c.id;
        btn.innerHTML = '';
        const lab = document.createElement('span');
        lab.textContent = c.label + ': ' + c.texto + ' · ';
        const ch = document.createElement('span');
        ch.className = 'cambiar';
        ch.textContent = i18n('comun.cambiar');
        btn.append(lab, ch);
        btn.setAttribute('aria-label', 'Cambiar ' + c.label);
        btn.addEventListener('click', () => irA(c.id));
        chips.append(btn);
      });
    }
    const sugs = listo ? sugerenciasPresupuesto() : [];
    if (sugBox && sugGrid) {
      sugBox.hidden = sugs.length === 0;
      sugGrid.replaceChildren();
      sugs.forEach((s) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'asistente-sug' + (s.actual ? ' actual' : '');
        if (s.cambios.tamano_predefinido) btn.dataset.tamano = s.cambios.tamano_predefinido;
        if (s.cambios.tecnica) btn.dataset.tecnica = s.cambios.tecnica;
        if (s.cambios.estilo) btn.dataset.estilo = s.cambios.estilo;
        const t = document.createElement('strong');
        t.textContent = s.title;
        const pr = document.createElement('span');
        pr.className = 'sug-precio';
        pr.textContent = s.precio;
        btn.append(t, pr);
        if (s.actual || s.economica) {
          const n = document.createElement('span');
          n.className = 'sug-nota';
          n.textContent = s.actual ? 'Actual' : 'Más económica';
          btn.append(n);
        }
        btn.addEventListener('click', () => aplicarSugerencia(s));
        sugGrid.append(btn);
      });
    }
  }

  function pintar() {
    const root = $('asistente-pedido');
    if (!root || root.hidden) return;
    restoreParked();
    const lista = pasos();
    if (indice >= lista.length) indice = lista.length - 1;
    if (indice < 0) indice = 0;
    const paso = lista[indice];
    $('asistente-pregunta').textContent = paso.pregunta;
    $('asistente-ayuda').textContent = paso.ayuda || '';
    const grid = $('asistente-opciones');
    grid.replaceChildren();
    const opts = opcionesDe(paso);
    if (opts.length) {
      grid.hidden = false;
      opts.forEach((o) => grid.append(card(o, paso)));
    } else {
      grid.hidden = true;
    }
    const extra = $('asistente-extra');
    extra.replaceChildren();
    if (paso.id === 'tamano') {
      take($('step-unidad'));
      take($('formato-lienzo-container'));
      take($('step-tamano'));
      take($('tamano_manual_container'));
      take($('vista-escala'));
      if (window.CotizadorVisual) CotizadorVisual.updateEscala();
    }
    if (paso.id === 'material_escultura') {
      /* las tarjetas ya muestran el material; la nota queda en la ayuda */
    }
    if (paso.id === 'altura_escultura') {
      take($('step-unidad'));
      take($('grupo-altura-escultura'));
      take($('vista-escala-escultura') || $('vista-escala'));
      if (window.CotizadorVisual) {
        if (CotizadorVisual.updateEscalaEscultura) CotizadorVisual.updateEscalaEscultura();
        CotizadorVisual.updateEscala();
      }
    }
    if (paso.id === 'tamano_mural') { take($('step-unidad')); take($('contenedor-murales')); }
    if (paso.id === 'fotos') {
      take($('step-fotos'));
      const lab = document.querySelector('#step-fotos label[for="fotos_referencia"]');
      if (lab) lab.textContent = trabajo === 'restauracion' ? 'Foto de la obra' : 'Imágenes de referencia';
      const optSi = document.querySelector('#fotos_referencia option[value="Sí, quiero cargar fotos de guía"]');
      if (optSi) optSi.textContent = trabajo === 'restauracion' ? 'Sí, quiero cargar una foto de la obra' : 'Sí, quiero cargar fotos de guía';
      const up = document.querySelector('#step-fotos label[for="referencias_archivos"]');
      if (up) up.textContent = trabajo === 'restauracion' ? 'Cargá una foto de la obra o de la imagen a restaurar' : 'Cargá la foto de guía o la imagen de referencia';
    }
    if (paso.id === 'datos') {
      take($('step-envio'));
      take($('step-idea'));
      const ideaLab = document.querySelector('#step-idea label[for="idea_cliente"]');
      const idea = $('idea_cliente');
      if (ideaLab) ideaLab.textContent = trabajo === 'restauracion' ? 'Describí el daño o lo que querés recuperar' : 'Contame tu idea (opcional)';
      if (idea) idea.placeholder = trabajo === 'restauracion'
        ? 'Por ejemplo: rotura, manchas, decoloración, partes faltantes…'
        : 'Describí detalles, la paleta de colores o la emoción que buscás...';
    }
    if (paso.id === 'resumen') {
      extra.innerHTML = resumenHtml();
      take($('whatsapp-continuar'));
      take($('referencias-compartir'));
    }
    const total = lista.length;
    const n = $('asistente-paso-n');
    if (n) n.textContent = trabajo ? i18n('wizard.paso', { n: indice + 1, total: total }) : i18n('wizard.paso1');
    const bar = $('asistente-progreso-bar');
    if (bar) bar.style.width = trabajo ? (Math.round(((indice + 1) / total) * 100) + '%') : '8%';
    const atras = $('asistente-atras');
    const sig = $('asistente-siguiente');
    const enviar = $('enviar-obra');
    atras.disabled = indice === 0;
    const ultimo = paso.id === 'resumen';
    sig.hidden = ultimo;
    sig.disabled = !puedeSeguir(paso);
    if (enviar) {
      enviar.textContent = i18n('comun.enviar');
      if (ultimo) {
        take(enviar);
        enviar.hidden = false;
        enviar.classList.add('asistente-enviar');
      } else {
        enviar.classList.remove('asistente-enviar');
      }
    }
    if (window.calcular) calcular();
    if (paso.id === 'resumen' && $('asistente-precio') && $('precioFinal')) {
      $('asistente-precio').textContent = $('precioFinal').textContent;
    }
    actualizarAcciones();
  }

  function actualizarAcciones() {
    const root = $('asistente-pedido');
    if (!root || root.hidden) return;
    const lista = pasos();
    const paso = lista[indice];
    if (!paso) return;
    const atras = $('asistente-atras');
    const sig = $('asistente-siguiente');
    if (atras) atras.disabled = indice === 0;
    const ultimo = paso.id === 'resumen';
    if (sig) {
      sig.hidden = ultimo;
      sig.disabled = !puedeSeguir(paso);
    }
    if (paso.id === 'resumen' && $('asistente-precio') && $('precioFinal')) {
      $('asistente-precio').textContent = $('precioFinal').textContent;
    }
    actualizarBarra();
  }

  function abrir() {
    const root = $('asistente-pedido');
    if (!root) return;
    root.hidden = false;
    document.body.classList.add('asistente-abierto');
    document.body.style.overflow = 'hidden';
    indice = 0;
    pintar();
    const close = $('asistente-cerrar');
    if (close) close.focus();
  }

  function cerrar() {
    const root = $('asistente-pedido');
    if (!root) return;
    restoreParked();
    const enviar = $('enviar-obra');
    if (enviar) { enviar.classList.remove('asistente-enviar'); enviar.textContent = i18n('comun.enviar'); }
    root.hidden = true;
    document.body.classList.remove('asistente-abierto');
    document.body.style.overflow = '';
  }

  function siguiente() {
    const lista = pasos();
    const paso = lista[indice];
    if (!paso || !puedeSeguir(paso)) return;
    if (indice < lista.length - 1) { indice += 1; pintar(); }
  }

  function atras() {
    if (indice > 0) { indice -= 1; pintar(); }
  }

  function iniciar() {
    if (!$('asistente-pedido')) return;
    $('asistente-cerrar').addEventListener('click', () => {
      cerrar();
      if (typeof switchTab === 'function') switchTab('inicio');
    });
    $('asistente-atras').addEventListener('click', atras);
    $('asistente-siguiente').addEventListener('click', siguiente);
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && !$('asistente-pedido').hidden) {
        ev.preventDefault();
        $('asistente-cerrar').click();
      }
    });
    if (typeof window.switchTab === 'function' && !window.switchTab.__conAsistente) {
      const orig = window.switchTab;
      window.switchTab = function (t, e) {
        const r = orig.apply(this, arguments);
        if (t === 'cotizacion') abrir();
        else if (!$('asistente-pedido').hidden) cerrar();
        return r;
      };
      window.switchTab.__conAsistente = true;
    }
    $('asistente-pedido').addEventListener('change', actualizarAcciones);
    $('asistente-pedido').addEventListener('input', actualizarAcciones);
    document.querySelectorAll('[data-abrir-asistente]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (typeof switchTab === 'function') switchTab('cotizacion', ev);
        else abrir();
      });
    });
    if (location.hash === '#cotizacion' || document.body.dataset.pantalla === 'cotizacion') abrir();
  }

  window.AsistentePedido = { abrir, cerrar, pintar, iniciar, irA, aplicarSugerencia, sugerencias: sugerenciasPresupuesto, actualizarBarra };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
