/* Guías visuales del cotizador: tarjetas con imagen + texto y vista de escala con persona de 1,70 m. */
(function () {
  const PERSONA_CM = 170;
  const PERSONA_SRC = 'img/persona-escala-170.webp';
  const PERSONA_IMG_W = 302;
  const PERSONA_IMG_H = 1020;
  const PERSONA_W_CM = PERSONA_CM * (PERSONA_IMG_W / PERSONA_IMG_H);
  const CENTRO_IDEAL_CM = 158;
  const MIN_BOTTOM_CM = 30;
  const TECHO_CM = 280;
  const MURAL_BASE_CM = 15;
  const GROUPS = {
    estilo: { select: 'estilo', label: 'Estilo' },
    tecnica: { select: 'tecnica', label: 'Técnica' },
    tema: { select: 'tema', label: 'Temática' },
    fondo: { select: null, label: 'Fondo del retrato' },
    forma_lienzo: { select: 'forma_lienzo', label: 'Formato' },
    enmarcado: { select: 'enmarcado', label: 'Enmarcado' },
    tipo_escultura: { select: 'tipo_escultura', label: 'Tipo de escultura' },
    material_escultura: { select: 'material_escultura', label: 'Material' },
    sujetos: { select: null, label: 'Personas y mascotas' }
  };

  function defaults() {
    return window.ESTUDIO_GUIAS_DEFAULT || { items: {} };
  }
  function current() {
    return window.guiasActual || defaults();
  }
  function tecnicaActual() {
    return document.getElementById('tecnica')?.value || '';
  }
  function estiloActual() {
    return document.getElementById('estilo')?.value || '';
  }
  function tipoEsculturaActual() {
    return document.getElementById('tipo_escultura')?.value || '';
  }
  function clavesGuia(key) {
    const te = tecnicaActual();
    const es = estiloActual();
    const tipoEsc = tipoEsculturaActual();
    const special = /Mural|Escultura|Restauracion/.test(key);
    const yaTecnica = /:(Oleo|Acrilico|Carbonilla)$/.test(key);
    const styleable = /^(tema|fondo|enmarcado|sujetos|forma_lienzo|color):/.test(key);
    const yaEstilo = styleable && /:(Realista|Hiperrealista|Abstracto|Espatulado|Bocetado)(:|$)/.test(key);
    const keys = [];
    const tiposMaterial = ['Relieve','Animal','Busto','Medio cuerpo','Figura completa','Abstracto','Objeto','Otro'];
    if (/^material_escultura:/.test(key) && tiposMaterial.includes(tipoEsc) && !key.endsWith(':' + tipoEsc)) {
      keys.push(key + ':' + tipoEsc);
      keys.push(key);
      return keys;
    }
    if (/:Relieve$/.test(key) || special || yaTecnica) {
      keys.push(key);
      return keys;
    }
    const noCaerEnOleo = te === 'Acrilico' || te === 'Carbonilla';
    if (yaEstilo) {
      if (te) keys.push(key + ':' + te);
      if (!noCaerEnOleo) keys.push(key);
      if (!keys.length) keys.push(key);
      return keys;
    }
    if (styleable) {
      if (es && te) keys.push(key + ':' + es + ':' + te);
      if (te) keys.push(key + ':' + te);
      if (!noCaerEnOleo) {
        if (es) keys.push(key + ':' + es);
        keys.push(key);
      }
      if (!keys.length) keys.push(key);
      return keys;
    } else if (te && /^(estilo):/.test(key)) {
      keys.push(key + ':' + te);
    }
    keys.push(key);
    return keys;
  }
  function item(key) {
    const dAll = defaults().items || {};
    const oAll = (current().items || {});
    const acc = { url: '', text: '', kind: 'foto', storagePath: '' };
    for (const k of clavesGuia(key)) {
      const d = dAll[k] || {};
      const o = oAll[k] || {};
      if (!acc.url) acc.url = o.url || d.url || '';
      if (!acc.text) acc.text = o.text || d.text || '';
      if (!acc.storagePath) acc.storagePath = o.storagePath || d.storagePath || '';
      if (o.kind || d.kind) acc.kind = o.kind || d.kind || acc.kind;
      if (acc.url && acc.text) break;
    }
    return acc;
  }

  /* Recorte de la zona pintada en las fotos de Tema (fracción x,y,w,h). */
  const CORTES_TEMA = {
    'tema-abstracto-campo-color.webp': [0.12, 0.16, 0.68, 0.70],
    'tema-abstracto-emocion.webp': [0.12, 0.15, 0.70, 0.66],
    'tema-abstracto-geometrico.webp': [0.27, 0.16, 0.51, 0.67],
    'tema-abstracto-gestual.webp': [0.17, 0.13, 0.62, 0.76],
    'tema-abstracto-materia.webp': [0.16, 0.11, 0.62, 0.78],
    'tema-bodegon-abstracto.webp': [0.20, 0.08, 0.70, 0.68],
    'tema-bodegon-espatulado.webp': [0.16, 0.08, 0.72, 0.70],
    'tema-bodegon-hiperrealista.webp': [0.06, 0.09, 0.88, 0.74],
    'tema-bodegon-monocromatico.webp': [0.17, 0.14, 0.76, 0.70],
    'tema-bodegon.webp': [0.20, 0.18, 0.60, 0.62],
    'tema-paisaje-abstracto.webp': [0.20, 0.14, 0.67, 0.74],
    'tema-paisaje-espatulado.webp': [0.22, 0.13, 0.62, 0.76],
    'tema-paisaje-hiperrealista.webp': [0.14, 0.14, 0.72, 0.62],
    'tema-paisaje-monocromatico.webp': [0.14, 0.14, 0.78, 0.70],
    'tema-paisaje.webp': [0.29, 0.18, 0.57, 0.61],
    'tema-retrato-abstracto.webp': [0.18, 0.12, 0.62, 0.76],
    'tema-retrato-espatulado.webp': [0.16, 0.11, 0.60, 0.78],
    'tema-retrato-hiperrealista.webp': [0.21, 0.12, 0.63, 0.80],
    'tema-retrato-monocromatico.webp': [0.18, 0.14, 0.62, 0.74],
    'tema-retrato.webp': [0.22, 0.11, 0.54, 0.75],
    'acrilico-tema-abstracto-campo-color.webp': [0.11, 0.11, 0.82, 0.79],
    'acrilico-tema-abstracto-emocion.webp': [0.10, 0.16, 0.80, 0.70],
    'acrilico-tema-abstracto-geometrico.webp': [0.17, 0.08, 0.73, 0.87],
    'acrilico-tema-abstracto-gestual.webp': [0.07, 0.14, 0.86, 0.68],
    'acrilico-tema-abstracto-materia.webp': [0.14, 0.08, 0.70, 0.82],
    'acrilico-tema-bodegon-espatulado.webp': [0.06, 0.08, 0.88, 0.76],
    'acrilico-tema-bodegon-hiperrealista.webp': [0.06, 0.09, 0.84, 0.86],
    'acrilico-tema-bodegon-monocromatico.webp': [0.17, 0.17, 0.71, 0.69],
    'acrilico-tema-bodegon.webp': [0.12, 0.08, 0.76, 0.76],
    'acrilico-tema-paisaje-espatulado.webp': [0.05, 0.10, 0.90, 0.76],
    'acrilico-tema-paisaje-hiperrealista.webp': [0.06, 0.10, 0.88, 0.76],
    'acrilico-tema-paisaje-monocromatico.webp': [0.08, 0.16, 0.85, 0.75],
    'acrilico-tema-paisaje.webp': [0.07, 0.14, 0.86, 0.68],
    'acrilico-tema-retrato-espatulado.webp': [0.16, 0.08, 0.68, 0.84],
    'acrilico-tema-retrato-hiperrealista.webp': [0.21, 0.11, 0.63, 0.82],
    'acrilico-tema-retrato-monocromatico.webp': [0.12, 0.10, 0.76, 0.72],
    'acrilico-tema-retrato.webp': [0.16, 0.07, 0.68, 0.86],
  };
  const CORTE_TEMA_DEFECTO = [0.12, 0.12, 0.76, 0.72];

  function nombreArchivo(url) {
    return String(url || '').split('?')[0].split('#')[0].split('/').pop() || '';
  }
  function corteDeUrl(url) {
    const name = nombreArchivo(url);
    return CORTES_TEMA[name] || CORTE_TEMA_DEFECTO;
  }
  function urlTemaActual() {
    const tema = document.getElementById('tema')?.value || '';
    if (!tema) return '';
    return item('tema:' + tema).url || '';
  }
  function aplicarCorte(img, corte, caja) {
    const aplicar = () => {
      const W = caja.clientWidth, H = caja.clientHeight;
      const nw = img.naturalWidth, nh = img.naturalHeight;
      if (!W || !H || !nw || !nh) return;
      const cx = corte[0], cy = corte[1], cw = Math.max(0.05, corte[2]), ch = Math.max(0.05, corte[3]);
      const sx = cx * nw, sy = cy * nh, sw = cw * nw, sh = ch * nh;
      const scale = Math.max(W / sw, H / sh);
      img.style.width = (nw * scale) + 'px';
      img.style.height = (nh * scale) + 'px';
      img.style.maxWidth = 'none';
      img.style.left = (-sx * scale) + 'px';
      img.style.top = (-sy * scale) + 'px';
    };
    if (img.complete && img.naturalWidth) aplicar();
    else img.addEventListener('load', aplicar, { once: true });
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(aplicar);
      ro.observe(caja);
    }
  }
  function mediaForma(shape, fallbackUrl) {
    const url = urlTemaActual() || fallbackUrl || '';
    const media = document.createElement('div');
    const shapeClass = String(shape || 'Estandar').toLowerCase();
    media.className = 'guia-media';
    media.dataset.formaShape = shape;
    media.dataset.formaSrc = url;
    if (!url) {
      media.innerHTML = '<span class="guia-placeholder" aria-hidden="true"></span>';
      return media;
    }
    if (!urlTemaActual()) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = '';
      img.src = url;
      media.append(img);
      return media;
    }
    media.classList.add('guia-media-forma');
    const hang = document.createElement('div');
    hang.className = 'forma-hang forma-hang--' + shapeClass;
    const canvas = document.createElement('div');
    canvas.className = 'forma-canvas forma-canvas--' + shapeClass;
    const img = document.createElement('img');
    img.loading = 'eager';
    img.decoding = 'sync';
    img.alt = '';
    img.src = url;
    canvas.append(img);
    hang.append(canvas);
    media.append(hang);
    aplicarCorte(img, corteDeUrl(url), canvas);
    return media;
  }

  function svgData(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function ensureHost(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return null;
    let host = document.getElementById('guias-' + selectId);
    if (!host) {
      host = document.createElement('div');
      host.id = 'guias-' + selectId;
      host.className = 'guia-grid';
      host.setAttribute('role', 'listbox');
      host.setAttribute('aria-label', sel.previousElementSibling?.textContent || selectId);
      sel.insertAdjacentElement('beforebegin', host);
      sel.classList.add('guia-select-nativo');
    }
    return host;
  }

  function card(key, value, title, selected, onPick) {
    const g = item(key);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guia-card' + (selected ? ' active' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    btn.dataset.value = value;
    let media;
    if (key.startsWith('forma_lienzo:')) {
      media = mediaForma(value, g.url);
      btn.dataset.formaShape = value;
      btn.dataset.formaSrc = media.dataset.formaSrc || '';
    } else {
      media = document.createElement('div');
      media.className = 'guia-media';
      if (g.url) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        img.src = g.url;
        media.append(img);
      } else {
        media.innerHTML = '<span class="guia-placeholder" aria-hidden="true"></span>';
      }
    }
    const cap = document.createElement('div');
    cap.className = 'guia-cap';
    const t = document.createElement('strong');
    t.textContent = title;
    const p = document.createElement('span');
    let guideText = g.text || '';
    if (window.EstudioI18n && EstudioI18n.t) {
      const keys = (typeof clavesGuia === 'function') ? clavesGuia(key) : [key];
      for (const k of keys) {
        const tr = EstudioI18n.t('guia.' + k);
        if (tr && tr !== ('guia.' + k)) { guideText = tr; break; }
      }
    }
    p.textContent = guideText;

    cap.append(t, p);
    btn.append(media, cap);
    btn.addEventListener('click', () => onPick(value));
    return btn;
  }

  function fillSelect(selectId, mapValueTitle) {
    const sel = document.getElementById(selectId);
    const host = ensureHost(selectId);
    if (!sel || !host) return;
    host.replaceChildren();
    const options = [...sel.options].filter(o => o.value && !o.hidden);
    for (const o of options) {
      const title = mapValueTitle?.[o.value] || o.text.replace(/\s*\(.*?\)\s*$/, '').trim();
      const key = selectId + ':' + o.value;
      host.append(card(key, o.value, title, sel.value === o.value, (v) => {
        sel.value = v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        fillSelect(selectId, mapValueTitle);
      }));
    }
  }

  function renderFondo() {
    const box = document.getElementById('contenedor-fondo');
    if (!box) return;
    let host = document.getElementById('guias-fondo');
    if (!host) {
      host = document.createElement('div');
      host.id = 'guias-fondo';
      host.className = 'guia-grid';
      host.setAttribute('role', 'listbox');
      host.setAttribute('aria-label', (window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('guia.aria.fondo'):'Fondo del retrato');
      box.insertAdjacentElement('afterbegin', host);
    }
    const checked = document.getElementById('fondo')?.checked;
    host.replaceChildren(
      card('fondo:simple', '0', 'Fondo simple', !checked, () => {
        const f = document.getElementById('fondo'); if (f) { f.checked = false; f.dispatchEvent(new Event('change', { bubbles: true })); }
        renderFondo();
      }),
      card('fondo:detallado', '1', 'Fondo detallado', !!checked, () => {
        const f = document.getElementById('fondo'); if (f) { f.checked = true; f.dispatchEvent(new Event('change', { bubbles: true })); }
        renderFondo();
      })
    );
  }

  function renderSujetos() {
    const box = document.getElementById('retratos-extras');
    if (!box) return;
    let host = document.getElementById('guias-sujetos');
    if (!host) {
      host = document.createElement('div');
      host.id = 'guias-sujetos';
      host.className = 'guia-grid';
      host.setAttribute('role', 'listbox');
      host.setAttribute('aria-label', (window.EstudioI18n&&EstudioI18n.t)?EstudioI18n.t('guia.aria.sujetos'):'Ejemplos de personas y mascotas');
      const title = box.querySelector('.card-title');
      if (title) title.insertAdjacentElement('afterend', host);
      else box.insertAdjacentElement('afterbegin', host);
    }
    const p = Number(document.getElementById('personas')?.value || 0);
    const m = Number(document.getElementById('mascotas')?.value || 0);
    const pick = (personas, mascotas) => {
      const pe = document.getElementById('personas');
      const ma = document.getElementById('mascotas');
      if (pe) pe.value = String(personas);
      if (ma) ma.value = String(mascotas);
      if (typeof calcular === 'function') calcular();
      renderSujetos();
    };
    host.replaceChildren(
      card('sujetos:1', '1', '1 persona', p === 0 && m === 0, () => pick(0, 0)),
      card('sujetos:2', '2', '2 personas', p === 1 && m === 0, () => pick(1, 0)),
      card('sujetos:mascota', 'm', 'Persona + mascota', m >= 1, () => pick(Math.max(p, 0), Math.max(m, 1)))
    );
  }

  function ensureEscala() {
    let el = document.getElementById('vista-escala');
    if (el) return el;
    const step = document.getElementById('step-tamano') || document.getElementById('contenedor-cuadros');
    if (!step) return null;
    el = document.createElement('div');
    el.id = 'vista-escala';
    el.className = 'vista-escala';
    el.setAttribute('aria-live', 'polite');
    const after = document.getElementById('tamano_manual_container') || step;
    after.insertAdjacentElement('afterend', el);
    return el;
  }

  function ensureEscalaEscultura() {
    let el = document.getElementById('vista-escala-escultura');
    if (el) return el;
    const grupo = document.getElementById('grupo-altura-escultura');
    if (!grupo) return null;
    el = document.createElement('div');
    el.id = 'vista-escala-escultura';
    el.className = 'vista-escala';
    el.setAttribute('aria-live', 'polite');
    grupo.insertAdjacentElement('afterend', el);
    return el;
  }

  function i18nEscala(key, fb, vars) {
    if (window.EstudioI18n && typeof EstudioI18n.t === 'function') {
      const s = vars ? EstudioI18n.t(key, vars) : EstudioI18n.t(key);
      if (s && s !== key) return s;
    }
    if (vars && typeof fb === 'string') {
      let s = fb;
      Object.keys(vars).forEach((k) => { s = s.replaceAll('{' + k + '}', String(vars[k])); });
      return s;
    }
    return fb;
  }
  function formatoMedidaEscala(cm) {
    return (typeof formatoDesdeCm === 'function') ? formatoDesdeCm(cm) : (Math.round(cm) + ' cm');
  }
  function formatoParEscala(w, h) {
    return (typeof formatoParDesdeCm === 'function') ? formatoParDesdeCm(w, h) : (formatoMedidaEscala(w) + ' × ' + formatoMedidaEscala(h));
  }
  /* Colgado de curador: centro a 158 cm (altura del rostro). Si el borde inferior
     quedaría bajo 30 cm o el superior sobre un techo de 280 cm, se sube la base a 30 cm
     y se extiende el techo si hace falta. */
  function colgadoCurador(artHcm) {
    artHcm = Number(artHcm);
    if (!Number.isFinite(artHcm) || artHcm <= 0) return null;
    const ideal = CENTRO_IDEAL_CM;
    let bottom = ideal - artHcm / 2;
    let top = bottom + artHcm;
    const elevado = bottom < MIN_BOTTOM_CM || top > TECHO_CM;
    if (elevado) {
      bottom = MIN_BOTTOM_CM;
      top = bottom + artHcm;
    }
    return {
      bottomCm: bottom,
      topCm: top,
      centerCm: bottom + artHcm / 2,
      techoCm: Math.max(TECHO_CM, top + 8),
      elevado: !!elevado
    };
  }
  function colgadoMural(artHcm) {
    artHcm = Number(artHcm);
    if (!Number.isFinite(artHcm) || artHcm <= 0) return null;
    let bottom = MURAL_BASE_CM;
    if (bottom + artHcm > TECHO_CM) bottom = Math.max(0, Math.min(MURAL_BASE_CM, TECHO_CM - artHcm));
    if (artHcm >= TECHO_CM) bottom = 0;
    const top = bottom + artHcm;
    return {
      bottomCm: bottom,
      topCm: top,
      centerCm: bottom + artHcm / 2,
      techoCm: Math.max(TECHO_CM, top + 8),
      elevado: false
    };
  }
  function personFigure(x, groundY, scale, labelY) {
    const h = PERSONA_CM * scale;
    const w = PERSONA_W_CM * scale;
    const x0 = x - w / 2;
    const y0 = groundY - h;
    const ly = labelY == null ? groundY + 16 : labelY;
    const markX = Math.max(7, x0 - 9);
    const persona = i18nEscala('escala.persona', 'Persona de 1,70 m');
    const extra = (typeof unidadActualVal === 'function' && unidadActualVal() === 'in') ? ' (67 in)' : '';
    return [
      `<image href="${PERSONA_SRC}" x="${x0.toFixed(2)}" y="${y0.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" preserveAspectRatio="xMidYMax meet" data-persona-cm="${PERSONA_CM}"/>`,
      `<line x1="${markX.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${markX.toFixed(2)}" y2="${groundY.toFixed(2)}" stroke="#d4af37" stroke-width="1.2"/>`,
      `<line x1="${(markX - 3).toFixed(2)}" y1="${y0.toFixed(2)}" x2="${(markX + 3).toFixed(2)}" y2="${y0.toFixed(2)}" stroke="#d4af37" stroke-width="1.2"/>`,
      `<line x1="${(markX - 3).toFixed(2)}" y1="${groundY.toFixed(2)}" x2="${(markX + 3).toFixed(2)}" y2="${groundY.toFixed(2)}" stroke="#d4af37" stroke-width="1.2"/>`,
      `<text x="${x.toFixed(2)}" y="${ly}" text-anchor="middle" fill="#d4af37" font-size="11">${persona}${extra}</text>`
    ].join('');
  }
  function wallAndFloor(L, worldTopCm) {
    const wallTop = L.ground - worldTopCm * L.scale;
    const wallX = Math.max(L.sidePad, L.artX - 7);
    const y = Math.max(4, wallTop - 6);
    return [
      `<rect x="${wallX.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(8, L.W - wallX - 6).toFixed(2)}" height="${(L.ground - y).toFixed(2)}" fill="rgba(255,255,255,0.035)" stroke="none"/>`,
      `<line x1="${wallX.toFixed(2)}" y1="${L.ground.toFixed(2)}" x2="${wallX.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#555" stroke-width="1.5"/>`,
      `<line x1="${L.sidePad}" y1="${L.ground}" x2="${L.W - L.sidePad}" y2="${L.ground}" stroke="#444" stroke-width="1.2"/>`
    ].join('');
  }
  function floorLine(L) {
    return `<line x1="${L.sidePad}" y1="${L.ground}" x2="${L.W - L.sidePad}" y2="${L.ground}" stroke="#444" stroke-width="1.2"/>`;
  }
  function layoutScale(artWcm, worldTopCm) {
    /* Encaja persona de 170 cm y lo más alto de la escena (obra, techo) en el recuadro. */
    const W = 360, H = 300;
    const topPad = 28, bottomPad = 36, sidePad = 12, gap = 14;
    const usableH = H - topPad - bottomPad;
    const usableW = W - sidePad * 2;
    const fitH = Math.max(PERSONA_CM, Number(worldTopCm) || 0, 1);
    let scale = usableH / fitH;
    let personW = PERSONA_W_CM * scale;
    let artW = Math.max(4, artWcm * scale);
    const needW = 12 + personW + gap + artW;
    if (needW > usableW) {
      scale *= usableW / needW;
      personW = PERSONA_W_CM * scale;
      artW = Math.max(4, artWcm * scale);
    }
    const ground = H - bottomPad;
    const personX = sidePad + 12 + personW / 2;
    const artX = personX + personW / 2 + gap;
    const labelY = Math.min(H - 8, ground + 18);
    return { W, H, scale, ground, personX, artX, artW, labelY, sidePad, personW };
  }

  function artworkShape(forma, x, y, w, h, fill) {
    if (forma === 'Circular') {
      const r = Math.min(w, h) / 2;
      return `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${r}" fill="${fill}" stroke="#d4af37" stroke-width="2"/>`;
    }
    if (forma === 'Ovalado') {
      return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="#d4af37" stroke-width="2"/>`;
    }
    if (forma === 'Hexagonal') {
      const cx = x + w / 2, cy = y + h / 2;
      const pts = [0, 1, 2, 3, 4, 5].map(i => {
        const a = Math.PI / 6 + i * Math.PI / 3;
        return `${cx + (w / 2) * Math.cos(a)},${cy + (h / 2) * Math.sin(a)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${fill}" stroke="#d4af37" stroke-width="2"/>`;
    }
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="#d4af37" stroke-width="2"/>`;
  }

  function worldTopVista(colg) {
    /* Para obras habituales no encogemos a un techo de 280 cm: basta la persona y un poco de muro sobre la obra.
       Solo si el curador extendió el techo (obras muy altas) se muestra esa altura. */
    if (!colg) return PERSONA_CM;
    if (colg.techoCm > TECHO_CM) return Math.max(PERSONA_CM, colg.techoCm);
    return Math.max(PERSONA_CM, (colg.topCm || 0) + 12);
  }
  function etiquetaCentro(centerCm) {
    const n = formatoMedidaEscala(centerCm);
    return i18nEscala('escala.centroA', 'Centro a {n}', { n: n });
  }
  function etiquetaBase(bottomCm) {
    const n = formatoMedidaEscala(bottomCm);
    return i18nEscala('escala.baseA', 'Base a {n}', { n: n });
  }
  function labelObra(dimText, extra, L, artX, artY, artW) {
    const labelX = Math.min(L.W - L.sidePad, Math.max(L.sidePad + 40, artX + artW / 2));
    let labelTop = artY - (extra ? 20 : 8);
    let anchor = 'middle';
    if (labelTop < 12) {
      labelTop = Math.max(12, artY + 14);
      /* si no hay aire arriba, el texto va a la derecha de la obra */
    }
    const line2 = extra ? `<tspan x="${labelX}" dy="13">${extra}</tspan>` : '';
    return `<text x="${labelX}" y="${Math.max(12, labelTop)}" text-anchor="${anchor}" fill="#e5ca72" font-size="11"><tspan x="${labelX}" dy="0">${dimText}</tspan>${line2}</text>`;
  }
  function updateEscala() {
    const el = ensureEscala();
    if (!el) return;
    const est = document.getElementById('estilo')?.value || '';
    const esMural = est === 'Mural';
    const enAsistente = el.classList.contains('en-asistente');
    const cuadros = document.getElementById('contenedor-cuadros');
    const murales = document.getElementById('contenedor-murales');
    if (!enAsistente) {
      const visibleCuadro = cuadros && cuadros.style.display !== 'none';
      const visibleMural = murales && murales.style.display !== 'none';
      if (!(esMural ? visibleMural : visibleCuadro)) { el.hidden = true; return; }
      if (esMural && murales && el.parentNode !== murales.parentNode) {
        murales.insertAdjacentElement('afterend', el);
      }
    }
    el.hidden = false;
    let artWcm, artHcm, forma = 'Estandar', colg, modo = esMural ? 'mural' : 'cuadro';
    if (esMural) {
      artWcm = (typeof muralAnchoCm === 'function') ? muralAnchoCm() : Number(document.getElementById('mural_ancho')?.value);
      artHcm = (typeof muralAltoCm === 'function') ? muralAltoCm() : Number(document.getElementById('mural_alto')?.value);
      if (!Number.isFinite(artWcm) || !Number.isFinite(artHcm) || artWcm < 1 || artHcm < 1) {
        el.innerHTML = '<p class="vista-escala-nota">'+i18nEscala('escala.elegi','Elegí un tamaño para ver la obra al lado de una persona de 1,70 m.')+'</p>';
        return;
      }
      colg = colgadoMural(artHcm);
    } else {
      const dim = typeof obtenerDimensiones === 'function' ? obtenerDimensiones() : null;
      if (!dim || !dim.valida) {
        el.innerHTML = '<p class="vista-escala-nota">'+i18nEscala('escala.elegi','Elegí un tamaño para ver la obra al lado de una persona de 1,70 m.')+'</p>';
        return;
      }
      forma = document.getElementById('forma_lienzo')?.value || 'Estandar';
      artHcm = forma === 'Circular' ? dim.ancho : dim.alto;
      artWcm = dim.ancho;
      colg = colgadoCurador(artHcm);
    }
    if (!colg) { el.hidden = true; return; }
    const worldTop = worldTopVista(colg);
    const L = layoutScale(artWcm, worldTop);
    const artW = Math.max(4, artWcm * L.scale);
    const artH = Math.max(4, artHcm * L.scale);
    const artX = L.artX;
    const artY = L.ground - colg.topCm * L.scale;
    let fill = 'rgba(212,175,55,0.25)';
    let imageTag = '';
    const ref = document.querySelector('#referencias-previews img');
    if (!esMural && ref && ref.src) {
      const clipId = 'clip-obra';
      imageTag = `<defs><clipPath id="${clipId}">${artworkShape(forma, artX, artY, artW, artH, '#000').replace(/fill="[^"]*"/, 'fill="#fff"').replace(/ stroke="[^"]*"/g, '').replace(/ stroke-width="[^"]*"/g, '')}</clipPath></defs>` +
        `<image href="${ref.src}" x="${artX}" y="${artY}" width="${artW}" height="${artH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" opacity="0.95"/>`;
      fill = 'transparent';
    }
    const dimText = esMural
      ? formatoParEscala(artWcm, artHcm)
      : (forma === 'Circular'
        ? (i18nEscala('escala.diametro','Diámetro') + ' ' + formatoMedidaEscala(artWcm))
        : formatoParEscala(artWcm, forma === 'Circular' ? artWcm : artHcm));
    const extra = esMural ? etiquetaBase(colg.bottomCm) : etiquetaCentro(colg.centerCm);
    const nota = esMural
      ? i18nEscala('escala.notaMural','El mural se muestra a escala sobre el muro, junto a una persona de 1,70 m.')
      : i18nEscala('escala.notaCuadro','La obra se muestra a escala real junto a una persona adulta de 1,70 m.');
    const uni = (typeof unidadActualVal==='function'&&unidadActualVal()==='in')?' (67 in).':'';
    el.innerHTML = `<svg viewBox="0 0 ${L.W} ${L.H}" role="img" data-scale="${L.scale}" data-persona-cm="${PERSONA_CM}" data-art-center-cm="${colg.centerCm}" data-art-bottom-cm="${colg.bottomCm}" data-art-top-cm="${colg.topCm}" data-modo="${modo}" aria-label="Comparación de tamaño: obra ${dimText} junto a una persona de 1,70 metros">${wallAndFloor(L, worldTop)}${imageTag}${personFigure(L.personX, L.ground, L.scale, L.labelY)}${artworkShape(forma, artX, artY, artW, artH, fill)}${labelObra(dimText, extra, L, artX, artY, artW)}</svg><p class="vista-escala-nota">${nota}${uni}</p>`;
  }

  function updateEscalaEscultura() {
    const el = ensureEscalaEscultura();
    if (!el) return;
    const cont = document.getElementById('contenedor-escultura');
    const grupo = document.getElementById('grupo-altura-escultura');
    const enAsistente = !!(grupo && grupo.classList.contains('en-asistente'));
    if (!enAsistente && (!cont || cont.style.display === 'none')) { el.hidden = true; return; }
    const tipo = document.getElementById('tipo_escultura')?.value;
    const cm = (typeof alturaEsculturaCm==='function')?alturaEsculturaCm():Number(document.getElementById('escultura_cm')?.value || 0);
    if (!tipo || !Number.isFinite(cm) || cm<=0) { el.hidden = true; return; }
    el.hidden = false;
    const artHcm = cm;
    const wLeido = (tipo === 'Relieve' && typeof anchoEsculturaCm === 'function') ? anchoEsculturaCm() : NaN;
    const artWcm = (tipo === 'Relieve')
      ? ((Number.isFinite(wLeido) && wLeido > 0) ? wLeido : cm * 1.1)
      : cm * (tipo === 'Busto' ? 0.7 : tipo === 'Medio cuerpo' ? 0.55 : 0.4);
    const esRelieve = tipo === 'Relieve';
    const colg = esRelieve ? colgadoCurador(artHcm) : { bottomCm: 0, topCm: artHcm, centerCm: artHcm / 2, techoCm: Math.max(PERSONA_CM, artHcm), elevado: false };
    const worldTop = worldTopVista(colg);
    const L = layoutScale(artWcm, worldTop);
    const artW = Math.max(4, artWcm * L.scale);
    const artH = Math.max(4, artHcm * L.scale);
    const artX = L.artX;
    const artY = L.ground - colg.topCm * L.scale;
    const dimText = esRelieve
      ? formatoParEscala(artWcm, artHcm)
      : (`${tipo}: ` + formatoMedidaEscala(artHcm));
    const extra = esRelieve ? etiquetaCentro(colg.centerCm) : '';
    const wall = esRelieve
      ? wallAndFloor(L, worldTop) + `<rect x="${artX + 3}" y="${artY + 3}" width="${Math.max(2, artW * 0.08)}" height="${artH}" rx="1" fill="rgba(80,80,80,0.35)"/>`
      : floorLine(L);
    const aria = esRelieve ? `Relieve de ${Math.round(artWcm)} × ${Math.round(artHcm)} cm junto a una persona de 1,70 m` : `Escultura de ${cm} cm junto a una persona de 1,70 m`;
    const nota = esRelieve
      ? i18nEscala('escala.notaRelieve','Tamaño del panel a escala, colgado, junto a una persona de 1,70 m.')
      : i18nEscala('escala.notaEscultura','Altura de la pieza a escala junto a una persona de 1,70 m.');
    const uni = (typeof unidadActualVal==='function'&&unidadActualVal()==='in')?' (67 in).':'';
    el.innerHTML = `<svg viewBox="0 0 ${L.W} ${L.H}" role="img" data-scale="${L.scale}" data-persona-cm="${PERSONA_CM}" data-art-center-cm="${colg.centerCm}" data-art-bottom-cm="${colg.bottomCm}" data-art-top-cm="${colg.topCm}" data-modo="${esRelieve?'relieve':'escultura'}" aria-label="${aria}">${wall}${personFigure(L.personX, L.ground, L.scale, L.labelY)}<rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" rx="${esRelieve?2:6}" fill="rgba(180,180,180,0.35)" stroke="#d4af37" stroke-width="2"/>${labelObra(dimText, extra, L, artX, artY, artW)}</svg><p class="vista-escala-nota">${nota}${uni}</p>`;
  }

  function refreshAll() {
    fillSelect('estilo');
    fillSelect('tecnica');
    fillSelect('tema');
    fillSelect('forma_lienzo');
    fillSelect('enmarcado');
    fillSelect('tipo_escultura');
    fillSelect('material_escultura');
    renderFondo();
    renderSujetos();
    updateEscala();
    updateEscalaEscultura();
  }

  window.CotizadorVisual = {
    refreshAll, updateEscala, updateEscalaEscultura, renderFondo, renderSujetos, item, defaults, current, GROUPS, svgData, clavesGuia, estiloActual, tecnicaActual, mediaForma, urlTemaActual, corteDeUrl, colgadoCurador, colgadoMural, personFigure, PERSONA_CM, PERSONA_W_CM, PERSONA_SRC, CENTRO_IDEAL_CM, MIN_BOTTOM_CM, TECHO_CM
  };
})();
