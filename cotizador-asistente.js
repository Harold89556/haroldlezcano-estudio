'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const parked = [];
  let indice = 0;
  let trabajo = '';

  function guia(key) {
    if (window.CotizadorVisual && typeof CotizadorVisual.item === 'function') return CotizadorVisual.item(key);
    const d = (window.ESTUDIO_GUIAS_DEFAULT && window.ESTUDIO_GUIAS_DEFAULT.items) || {};
    const o = (window.guiasActual && window.guiasActual.items) || {};
    const src = o[key] || d[key] || {};
    return { url: src.url || '', text: src.text || '' };
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
    { id: 'oleo', title: 'Cuadro al óleo', key: 'tecnica:Oleo', text: 'Pintura con óleo: colores profundos y un acabado que dura muchos años.' },
    { id: 'acrilico', title: 'Acrílico', key: 'tecnica:Acrilico', text: 'Pintura acrílica: colores vivos y secado más rápido.' },
    { id: 'carbonilla', title: 'Lápiz / Carbonilla', key: 'tecnica:Carbonilla', text: 'Dibujo a lápiz o carbonilla, en blanco y negro o a color.' },
    { id: 'escultura', title: 'Escultura', key: 'estilo:Escultura', text: 'Una pieza modelada a mano en tres dimensiones. No incluye fundición.' },
    { id: 'mural', title: 'Mural', key: 'estilo:Mural', text: 'Una obra grande pintada directo sobre la pared. El valor se acuerda según la pared.' },
    { id: 'restauracion', title: 'Restauración', key: 'estilo:Restauracion', text: 'Recuperar o mejorar una foto u obra dañada.' }
  ];

  function esPintura() { return trabajo === 'oleo' || trabajo === 'acrilico' || trabajo === 'carbonilla'; }

  function pasos() {
    const s = [{ id: 'trabajo', pregunta: '¿Qué tipo de trabajo buscás?', ayuda: 'Elegí la opción que más se parezca a lo que querés. En el siguiente paso te pedimos más detalles, siempre con imágenes de guía.' }];
    if (esPintura()) {
      s.push({ id: 'estilo', pregunta: '¿Qué estilo te gusta más?', ayuda: 'El estilo es la forma en que se pinta: más natural, con más detalle, con textura, con aspecto de boceto o abstracto.' });
      s.push({ id: 'tema', pregunta: '¿Qué querés que se vea en la obra?', ayuda: 'Retrato es una persona, una pareja o un animal. También podés pedir un paisaje, objetos o algo más libre.' });
      if (valor('tema') === 'Retrato') {
        s.push({ id: 'sujetos', pregunta: '¿Quiénes van a aparecer?', ayuda: 'El precio base ya incluye a una persona. Si hay más personas o una mascota, se suma al pedido.' });
        if (valor('estilo') !== 'Espatulado') {
          s.push({ id: 'fondo', pregunta: '¿Cómo querés el fondo?', ayuda: 'El fondo simple es liso o suave. El fondo detallado suma un paisaje, una habitación u otros elementos detrás.' });
        }
      }
      if (trabajo === 'carbonilla') {
        s.push({ id: 'color', pregunta: '¿El dibujo es en blanco y negro o a color?', ayuda: 'Las dos opciones son a lápiz o carbonilla; la diferencia es si se usa color.' });
      }
      if (trabajo === 'oleo' || trabajo === 'acrilico') {
        s.push({ id: 'forma', pregunta: '¿Qué forma tiene el lienzo?', ayuda: 'Lo más habitual es rectangular. También hay formatos redondos, ovalados o de seis lados.' });
      }
      s.push({ id: 'tamano', pregunta: '¿De qué tamaño lo querés?', ayuda: 'A la izquierda ves a una persona de 1,70 m para darte una idea del tamaño real. Si no está en la lista, elegí una medida personalizada.' });
      s.push({ id: 'marco', pregunta: '¿Lo querés con marco?', ayuda: 'Es opcional. Podés dejarlo sin marco (listo para colgar) o elegir el estilo que más te guste. Las fotos muestran cómo se ve cada uno en la pared.' });
    } else if (trabajo === 'escultura') {
      s.push({ id: 'tipo_escultura', pregunta: '¿Qué tipo de escultura buscás?', ayuda: 'Busto es cabeza y parte del pecho. Medio cuerpo llega hasta la cintura. Figura completa es de cuerpo entero. Relieve son formas que sobresalen de un fondo.' });
      s.push({ id: 'altura_escultura', pregunta: '¿Qué altura querés para la pieza?', ayuda: 'La altura se mide de la base al punto más alto. A la par ves una persona de 1,70 m para comparar.' });
    } else if (trabajo === 'mural') {
      s.push({ id: 'estilo_mural', pregunta: '¿Qué estilo querés para el mural?', ayuda: 'Podés pedir un mural más realista, más ilustrado o con aspecto de boceto. El precio se acuerda según la pared.' });
      s.push({ id: 'tamano_mural', pregunta: '¿Qué tamaño tiene la pared?', ayuda: 'Indicá el ancho y el alto en metros. Si la pared es alta, puede hacer falta andamio. El valor final se consulta.' });
    } else if (trabajo === 'restauracion') {
      s.push({ id: 'tipo_restauracion', pregunta: '¿Qué tipo de restauración necesitás?', ayuda: 'Digital es sobre una foto o archivo. Física es sobre una obra real, y se evalúa en persona.' });
    }
    if (trabajo) {
      s.push({ id: 'fotos', pregunta: '¿Tenés una foto de guía?', ayuda: 'Si tenés la foto que querés pintar o modelos de inspiración, cargala acá. Si no, pedimos asesoramiento y lo vemos juntos.' });
      s.push({ id: 'datos', pregunta: 'Tus datos para el pedido', ayuda: 'Con tu nombre preparamos el pedido. Si necesitás factura, completá también esos datos.' });
      s.push({ id: 'resumen', pregunta: 'Revisá tu pedido', ayuda: 'Este es el resumen y el precio estimado, con IVA incluido. Al enviar se arma el mensaje con todos los detalles para confirmarlo.' });
    }
    return s;
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
    if (paso.id === 'trabajo') return TRABAJOS.map((t) => ({ value: t.id, title: t.title, text: t.text, url: guia(t.key).url, selected: trabajo === t.id }));
    if (paso.id === 'estilo') {
      const list = [
        { value: 'Realista', key: 'estilo:Realista', title: 'Realista' },
        { value: 'Hiperrealista', key: 'estilo:Hiperrealista', title: 'Hiperrealista' }
      ];
      if (trabajo !== 'carbonilla') list.push({ value: 'Espatulado', key: 'estilo:Espatulado', title: 'Espatulado' });
      list.push({ value: 'Bocetado', key: 'estilo:Bocetado', title: 'Bocetado' });
      list.push({ value: 'Abstracto', key: 'estilo:Abstracto', title: 'Abstracto' });
      return list.map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('estilo') === o.value }));
    }
    if (paso.id === 'tema') {
      return [
        { value: 'Retrato', key: 'tema:Retrato', title: 'Retrato' },
        { value: 'Paisaje', key: 'tema:Paisaje', title: 'Paisaje' },
        { value: 'Bodegon', key: 'tema:Bodegon', title: 'Bodegón / objetos' }
      ].map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('tema') === o.value }));
    }
    if (paso.id === 'sujetos') {
      const p = Number(valor('personas') || 0);
      const m = Number(valor('mascotas') || 0);
      return [
        { value: '1', title: '1 persona', text: guia('sujetos:1').text, url: guia('sujetos:1').url, selected: p === 0 },
        { value: '2', title: '2 personas', text: guia('sujetos:2').text, url: guia('sujetos:2').url, selected: p >= 1 },
        { value: 'mascota', title: 'Con mascota', text: guia('sujetos:mascota').text, url: guia('sujetos:mascota').url, selected: m >= 1 }
      ];
    }
    if (paso.id === 'fondo') {
      const det = $('fondo') && $('fondo').checked;
      return [
        { value: 'simple', title: 'Fondo simple', text: guia('fondo:simple').text, url: guia('fondo:simple').url, selected: !det },
        { value: 'detallado', title: 'Fondo detallado', text: guia('fondo:detallado').text, url: guia('fondo:detallado').url, selected: !!det }
      ];
    }
    if (paso.id === 'color') {
      return [
        { value: 'Sin color', title: 'Blanco y negro', text: 'Dibujo en blanco y negro, sin color.', url: guia('tecnica:Carbonilla').url, selected: valor('color_lapiz') === 'Sin color' },
        { value: 'A color', title: 'A color', text: 'El mismo dibujo, pero con color.', url: guia('tecnica:Carbonilla').url, selected: valor('color_lapiz') === 'A color' }
      ];
    }
    if (paso.id === 'forma') {
      return [
        { value: 'Estandar', key: 'forma_lienzo:Estandar', title: 'Rectangular' },
        { value: 'Circular', key: 'forma_lienzo:Circular', title: 'Circular' },
        { value: 'Ovalado', key: 'forma_lienzo:Ovalado', title: 'Ovalado' },
        { value: 'Hexagonal', key: 'forma_lienzo:Hexagonal', title: 'Hexagonal' }
      ].map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('forma_lienzo') === o.value }));
    }
    if (paso.id === 'marco') {
      return [
        { value: 'SinMarco', key: 'enmarcado:SinMarco', title: 'Sin marco' },
        { value: 'Estandar', key: 'enmarcado:Estandar', title: 'Marco estándar' },
        { value: 'Cajon', key: 'enmarcado:Cajon', title: 'Marco cajón' },
        { value: 'Clasico', key: 'enmarcado:Clasico', title: 'Marco clásico' },
        { value: 'SemiRelieve', key: 'enmarcado:SemiRelieve', title: 'Semi relieve' },
        { value: 'GruesoRelieves', key: 'enmarcado:GruesoRelieves', title: 'Grueso con relieves' }
      ].map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('enmarcado') === o.value }));
    }
    if (paso.id === 'tipo_escultura') {
      return [
        { value: 'Busto', key: 'tipo_escultura:Busto', title: 'Busto' },
        { value: 'Medio cuerpo', key: 'tipo_escultura:Medio cuerpo', title: 'Medio cuerpo' },
        { value: 'Figura completa', key: 'tipo_escultura:Figura completa', title: 'Figura completa' },
        { value: 'Relieve', key: 'tipo_escultura:Relieve', title: 'Relieve' }
      ].map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('tipo_escultura') === o.value }));
    }
    if (paso.id === 'estilo_mural') {
      return [
        { value: 'Realista Mural', title: 'Realismo con detalles', text: 'Un mural con aspecto natural y detalle.', url: guia('estilo:Mural').url, selected: valor('estilo_mural') === 'Realista Mural' },
        { value: 'Ilustracion Mural', title: 'Ilustración / gráfico', text: 'Un mural más gráfico o ilustrado.', url: guia('estilo:Abstracto').url, selected: valor('estilo_mural') === 'Ilustracion Mural' },
        { value: 'Bocetado', title: 'Bocetado', text: guia('estilo:Bocetado').text, url: guia('estilo:Bocetado').url, selected: valor('estilo_mural') === 'Bocetado' }
      ];
    }
    if (paso.id === 'tipo_restauracion') {
      const url = guia('estilo:Restauracion').url;
      return [
        { value: 'Digital', title: 'Digital simple', text: 'Limpieza y arreglo de grietas o manchas en una foto o archivo.', url, selected: valor('tipo_restauracion') === 'Digital' },
        { value: 'Digital Compleja', title: 'Digital compleja', text: 'Reconstrucción más profunda de una imagen dañada.', url, selected: valor('tipo_restauracion') === 'Digital Compleja' },
        { value: 'Fisica', title: 'Física (obra real)', text: 'Restauración de una obra física. Se evalúa en persona.', url, selected: valor('tipo_restauracion') === 'Fisica' }
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
      img.src = opt.url; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
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
      add('Trabajo', TRABAJOS.find((t) => t.id === trabajo)?.title);
      add('Estilo', $('estilo')?.selectedOptions[0]?.text);
      add('Técnica', $('tecnica')?.selectedOptions[0]?.text);
      if (trabajo === 'carbonilla') add('Color', $('color_lapiz')?.selectedOptions[0]?.text);
      add('Tema', $('tema')?.selectedOptions[0]?.text);
      if (valor('tema') === 'Retrato') {
        add('Personas extra', valor('personas'));
        add('Mascotas extra', valor('mascotas'));
        add('Fondo', ($('fondo') && $('fondo').checked) ? 'Detallado' : 'Simple');
      }
      add('Forma', $('forma_lienzo')?.selectedOptions[0]?.text);
      add('Tamaño', $('tamano_predefinido')?.selectedOptions[0]?.text);
      add('Marco', $('enmarcado')?.selectedOptions[0]?.text);
    } else if (trabajo === 'escultura') {
      add('Trabajo', 'Escultura');
      add('Tipo', $('tipo_escultura')?.selectedOptions[0]?.text);
      add('Altura', valor('escultura_cm') + ' cm');
    } else if (trabajo === 'mural') {
      add('Trabajo', 'Mural');
      add('Estilo', $('estilo_mural')?.selectedOptions[0]?.text);
      add('Tamaño', valor('mural_ancho') + ' m × ' + valor('mural_alto') + ' m');
    } else if (trabajo === 'restauracion') {
      add('Trabajo', 'Restauración');
      add('Tipo', $('tipo_restauracion')?.selectedOptions[0]?.text);
    }
    add('Referencias', $('fotos_referencia')?.selectedOptions[0]?.text);
    add('Nombre', valor('envio_nombre'));
    const nota = trabajo === 'mural' ? 'El mural se cotiza a consultar, según la pared.' : 'IVA incluido. Envío aparte.';
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
    if (p.consultar) return 'A consultar';
    if (p.evaluar) return 'A evaluar';
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
      if (d && d.valida) return Math.round(d.ancho) + ' × ' + Math.round(d.alto) + ' cm';
      return 'Personalizado';
    }
    const parts = key.split('x').map(Number);
    if (parts.length >= 2 && parts.every(Number.isFinite)) return parts[0] + ' × ' + parts[1] + ' cm';
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
      cands.push({ tecnica: te, estilo: 'Bocetado', title: 'Bocetado · ' + etiquetaTamano(st) });
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
      add('trabajo', 'Técnica', TRABAJOS.find((t) => t.id === trabajo)?.title);
      add('estilo', 'Estilo', $('estilo')?.selectedOptions[0]?.text);
      add('tema', 'Tema', $('tema')?.selectedOptions[0]?.text);
      if (valor('tema') === 'Retrato') {
        const p = Number(valor('personas') || 0);
        const m = Number(valor('mascotas') || 0);
        const sujetos = p >= 1 ? '2 personas' : '1 persona';
        add('sujetos', 'Sujetos', m >= 1 ? sujetos + ' y mascota' : sujetos);
      }
      add('tamano', 'Tamaño', etiquetaTamano(valor('tamano_predefinido')));
    } else if (trabajo === 'escultura') {
      add('trabajo', 'Trabajo', 'Escultura');
      add('tipo_escultura', 'Tipo', $('tipo_escultura')?.selectedOptions[0]?.text);
      if (valor('escultura_cm')) add('altura_escultura', 'Altura', valor('escultura_cm') + ' cm');
    } else if (trabajo === 'mural') {
      add('trabajo', 'Trabajo', 'Mural');
      add('estilo_mural', 'Estilo', $('estilo_mural')?.selectedOptions[0]?.text);
      if (valor('mural_ancho') && valor('mural_alto')) {
        add('tamano_mural', 'Tamaño', valor('mural_ancho') + ' m × ' + valor('mural_alto') + ' m');
      }
    } else if (trabajo === 'restauracion') {
      add('trabajo', 'Trabajo', 'Restauración');
      add('tipo_restauracion', 'Tipo', $('tipo_restauracion')?.selectedOptions[0]?.text);
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
        ch.textContent = 'cambiar';
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
    if (paso.id === 'altura_escultura') {
      take($('grupo-altura-escultura'));
      take($('vista-escala-escultura') || $('vista-escala'));
      if (window.CotizadorVisual) {
        if (CotizadorVisual.updateEscalaEscultura) CotizadorVisual.updateEscalaEscultura();
        CotizadorVisual.updateEscala();
      }
    }
    if (paso.id === 'tamano_mural') take($('contenedor-murales'));
    if (paso.id === 'fotos') take($('step-fotos'));
    if (paso.id === 'datos') take($('step-envio'));
    if (paso.id === 'resumen') {
      extra.innerHTML = resumenHtml();
      take($('whatsapp-continuar'));
      take($('referencias-compartir'));
    }
    const total = lista.length;
    const n = $('asistente-paso-n');
    if (n) n.textContent = trabajo ? ('Paso ' + (indice + 1) + ' de ' + total) : 'Paso 1';
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
      enviar.textContent = 'Enviar pedido';
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
    if (enviar) { enviar.classList.remove('asistente-enviar'); enviar.textContent = 'Enviar pedido'; }
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
