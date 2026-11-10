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
      s.push({ id: 'estilo', pregunta: '¿Qué estilo te gusta más?', ayuda: 'El estilo es la forma en que se pinta: más natural, con más detalle, con textura o con aspecto de boceto.' });
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
      return list.map((o) => ({ ...o, text: guia(o.key).text, url: guia(o.key).url, selected: valor('estilo') === o.value }));
    }
    if (paso.id === 'tema') {
      return [
        { value: 'Retrato', key: 'tema:Retrato', title: 'Retrato' },
        { value: 'Paisaje', key: 'tema:Paisaje', title: 'Paisaje' },
        { value: 'Bodegon', key: 'tema:Bodegon', title: 'Bodegón / objetos' },
        { value: 'Abstracto', key: 'tema:Abstracto', title: 'Abstracto' }
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
        { value: 'Ilustracion Mural', title: 'Ilustración / gráfico', text: 'Un mural más gráfico o ilustrado.', url: guia('tema:Abstracto').url, selected: valor('estilo_mural') === 'Ilustracion Mural' },
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
    if (paso.id === 'estilo') return ['Realista', 'Hiperrealista', 'Espatulado', 'Bocetado'].includes(valor('estilo'));
    if (paso.id === 'tema') return !!valor('tema');
    if (paso.id === 'sujetos') return true;
    if (paso.id === 'fondo' || paso.id === 'color' || paso.id === 'forma' || paso.id === 'marco') return true;
    if (paso.id === 'tipo_escultura') return !!valor('tipo_escultura');
    if (paso.id === 'estilo_mural') return !!valor('estilo_mural');
    if (paso.id === 'tipo_restauracion') return !!valor('tipo_restauracion');
    if (paso.id === 'tamano') return !!valor('tamano_predefinido');
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

  window.AsistentePedido = { abrir, cerrar, pintar, iniciar };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
