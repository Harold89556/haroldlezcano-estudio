/* Guías visuales del cotizador: tarjetas con imagen + texto y vista de escala con persona de 1,70 m. */
(function () {
  const PERSONA_CM = 170;
  const GROUPS = {
    estilo: { select: 'estilo', label: 'Estilo' },
    tecnica: { select: 'tecnica', label: 'Técnica' },
    tema: { select: 'tema', label: 'Temática' },
    fondo: { select: null, label: 'Fondo del retrato' },
    forma_lienzo: { select: 'forma_lienzo', label: 'Formato' },
    enmarcado: { select: 'enmarcado', label: 'Enmarcado' },
    tipo_escultura: { select: 'tipo_escultura', label: 'Tipo de escultura' },
    sujetos: { select: null, label: 'Personas y mascotas' }
  };

  function defaults() {
    return window.ESTUDIO_GUIAS_DEFAULT || { items: {} };
  }
  function current() {
    return window.guiasActual || defaults();
  }
  function item(key) {
    const d = defaults().items[key] || {};
    const o = (current().items || {})[key] || {};
    return { url: o.url || d.url || '', text: o.text || d.text || '', kind: o.kind || d.kind || 'foto', storagePath: o.storagePath || '' };
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
    const media = document.createElement('div');
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
    const cap = document.createElement('div');
    cap.className = 'guia-cap';
    const t = document.createElement('strong');
    t.textContent = title;
    const p = document.createElement('span');
    p.textContent = g.text || '';
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
    const options = [...sel.options].filter(o => o.value);
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
      host.setAttribute('aria-label', 'Fondo del retrato');
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
      host.setAttribute('aria-label', 'Ejemplos de personas y mascotas');
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

  function personPath(x, groundY, scale, labelY) {
    // Silueta adulta ~170 cm: cabeza + torso + piernas. scale = px per cm.
    const h = PERSONA_CM * scale;
    const head = 18 * scale;
    const cx = x;
    const top = groundY - h;
    const ly = labelY == null ? groundY + 16 : labelY;
    return [
      `<ellipse cx="${cx}" cy="${top + head * 0.55}" rx="${head * 0.42}" ry="${head * 0.5}" fill="#c8c8c8"/>`,
      `<path d="M${cx - 12 * scale} ${top + head * 1.05} L${cx + 12 * scale} ${top + head * 1.05} L${cx + 14 * scale} ${top + 70 * scale} L${cx + 10 * scale} ${groundY} L${cx + 2 * scale} ${groundY} L${cx} ${top + 95 * scale} L${cx - 2 * scale} ${groundY} L${cx - 10 * scale} ${groundY} L${cx - 14 * scale} ${top + 70 * scale} Z" fill="#9a9a9a"/>`,
      `<text x="${cx}" y="${ly}" text-anchor="middle" fill="#d4af37" font-size="11">Persona de 1,70 m</text>`
    ].join('');
  }

  function layoutScale(artWcm, artHcm) {
    // Vista más alta: la persona usa ~75% de la altura útil; si la obra es más grande, se reduce todo a escala.
    const W = 360, H = 280;
    const topPad = 24, bottomPad = 28, sidePad = 14, gap = 18;
    const usableH = H - topPad - bottomPad;
    const usableW = W - sidePad * 2;
    const personWcm = 30;
    let scale = (usableH * 0.78) / PERSONA_CM;
    const fitH = Math.max(PERSONA_CM, artHcm);
    if (fitH * scale > usableH) scale = usableH / fitH;
    let artW = Math.max(4, artWcm * scale);
    let artH = Math.max(4, artHcm * scale);
    let personW = personWcm * scale;
    const needW = personW + gap + artW;
    if (needW > usableW) {
      scale *= usableW / needW;
      artW = Math.max(4, artWcm * scale);
      artH = Math.max(4, artHcm * scale);
      personW = personWcm * scale;
    }
    const ground = H - bottomPad;
    const personX = Math.max(sidePad + personW / 2 + 4, sidePad + 72);
    const artX = personX + personW / 2 + gap;
    const artY = ground - artH;
    const labelY = Math.min(H - 8, ground + 18);
    return { W, H, scale, ground, personX, artX, artY, artW, artH, labelY, sidePad };
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

  function updateEscala() {
    const el = ensureEscala();
    if (!el) return;
    const cuadros = document.getElementById('contenedor-cuadros');
    if (!cuadros || cuadros.style.display === 'none') { el.hidden = true; return; }
    el.hidden = false;
    const dim = typeof obtenerDimensiones === 'function' ? obtenerDimensiones() : null;
    if (!dim || !dim.valida) {
      el.innerHTML = '<p class="vista-escala-nota">Elegí un tamaño para ver la obra al lado de una persona de 1,70 m.</p>';
      return;
    }
    const forma = document.getElementById('forma_lienzo')?.value || 'Estandar';
    const artHcm = forma === 'Circular' ? dim.ancho : dim.alto;
    const artWcm = dim.ancho;
    const L = layoutScale(artWcm, artHcm);
    let fill = 'rgba(212,175,55,0.25)';
    let imageTag = '';
    const ref = document.querySelector('#referencias-previews img');
    if (ref && ref.src) {
      const clipId = 'clip-obra';
      imageTag = `<defs><clipPath id="${clipId}">${artworkShape(forma, L.artX, L.artY, L.artW, L.artH, '#000').replace(/fill="[^"]*"/, 'fill="#fff"').replace(/ stroke="[^"]*"/g, '').replace(/ stroke-width="[^"]*"/g, '')}</clipPath></defs>` +
        `<image href="${ref.src}" x="${L.artX}" y="${L.artY}" width="${L.artW}" height="${L.artH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" opacity="0.95"/>`;
      fill = 'transparent';
    }
    const label = forma === 'Circular'
      ? `Diámetro ${Math.round(dim.ancho)} cm`
      : `${Math.round(dim.ancho)} × ${Math.round(dim.alto)} cm`;
    const labelX = Math.min(L.W - L.sidePad, Math.max(L.sidePad + 40, L.artX + L.artW / 2));
    const labelTop = Math.max(14, L.artY - 8);
    el.innerHTML = `<svg viewBox="0 0 ${L.W} ${L.H}" role="img" aria-label="Comparación de tamaño: obra ${label} junto a una persona de 1,70 metros">${imageTag}${personPath(L.personX, L.ground, L.scale, L.labelY)}${artworkShape(forma, L.artX, L.artY, L.artW, L.artH, fill)}<text x="${labelX}" y="${labelTop}" text-anchor="middle" fill="#e5ca72" font-size="12">${label}</text><line x1="${L.sidePad}" y1="${L.ground}" x2="${L.W - L.sidePad}" y2="${L.ground}" stroke="#444" stroke-width="1"/></svg><p class="vista-escala-nota">La obra se muestra a escala real junto a una persona adulta de 1,70 m.</p>`;
  }

  function updateEscalaEscultura() {
    const el = ensureEscalaEscultura();
    if (!el) return;
    const cont = document.getElementById('contenedor-escultura');
    if (!cont || cont.style.display === 'none') { el.hidden = true; return; }
    const tipo = document.getElementById('tipo_escultura')?.value;
    const cm = Number(document.getElementById('escultura_cm')?.value || 0);
    if (!tipo || !cm) { el.hidden = true; return; }
    el.hidden = false;
    const artHcm = cm;
    const artWcm = cm * (tipo === 'Relieve' ? 1.1 : tipo === 'Busto' ? 0.7 : tipo === 'Medio cuerpo' ? 0.55 : 0.4);
    const L = layoutScale(artWcm, artHcm);
    const label = `${tipo}: ${cm} cm`;
    const labelX = Math.min(L.W - L.sidePad, Math.max(L.sidePad + 40, L.artX + L.artW / 2));
    const labelTop = Math.max(14, L.artY - 8);
    el.innerHTML = `<svg viewBox="0 0 ${L.W} ${L.H}" role="img" aria-label="Escultura de ${cm} cm junto a una persona de 1,70 m">${personPath(L.personX, L.ground, L.scale, L.labelY)}<rect x="${L.artX}" y="${L.artY}" width="${L.artW}" height="${L.artH}" rx="6" fill="rgba(180,180,180,0.35)" stroke="#d4af37" stroke-width="2"/><text x="${labelX}" y="${labelTop}" text-anchor="middle" fill="#e5ca72" font-size="12">${label}</text><line x1="${L.sidePad}" y1="${L.ground}" x2="${L.W - L.sidePad}" y2="${L.ground}" stroke="#444" stroke-width="1"/></svg><p class="vista-escala-nota">Altura de la pieza a escala junto a una persona de 1,70 m.</p>`;
  }

  function refreshAll() {
    fillSelect('estilo');
    fillSelect('tecnica');
    fillSelect('tema');
    fillSelect('forma_lienzo');
    fillSelect('enmarcado');
    fillSelect('tipo_escultura');
    renderFondo();
    renderSujetos();
    updateEscala();
    updateEscalaEscultura();
  }

  window.CotizadorVisual = {
    refreshAll, updateEscala, updateEscalaEscultura, renderFondo, renderSujetos, item, defaults, current, GROUPS, svgData
  };
})();
