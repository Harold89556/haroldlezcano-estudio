// Editor liviano de fotos: recortar (marco con esquinas o arrastre), girar y elegir otra imagen.
const R = () => window.EstudioRecorte;
const TYPES = /^image\/(jpeg|png|webp|gif|avif)$/i;
const MAX = 8 * 1024 * 1024;
const MAX_SIDE = 2400;
function el(tag, props = {}, ...kids) { const n = document.createElement(tag); Object.assign(n, props); n.append(...kids); return n; }
function loadImage(src, cors) {
 return new Promise((resolve, reject) => {
  const img = new Image(); if (cors) img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img); img.onerror = () => reject(Error('No se pudo cargar la imagen.'));
  img.src = src;
 });
}
function tainted(img) {
 try { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 1, 1); x.getImageData(0, 0, 1, 1); return false; }
 catch { return true; }
}
// Quitar fondo en el navegador con MediaPipe Image Segmenter (Apache-2.0). La foto no se envía a ningún servicio:
// solo se descargan la librería y el modelo (selfie_multiclass_256x256) y el cálculo corre en este dispositivo.
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';
let segmenterPromise = null;
async function segmenter() {
 if (!segmenterPromise) segmenterPromise = (async () => {
  const vision = await import(MP + '/vision_bundle.mjs');
  const files = await vision.FilesetResolver.forVisionTasks(MP + '/wasm');
  return vision.ImageSegmenter.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' }, runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false });
 })().catch(e => { segmenterPromise = null; throw e; });
 return segmenterPromise;
}
export async function quitarFondo(source) {
 if (typeof window.__quitarFondoMock === 'function') return window.__quitarFondoMock(source);
 const seg = await segmenter();
 const result = seg.segment(source);
 const mask = result.confidenceMasks && result.confidenceMasks[0];
 if (!mask) throw Error('No se detectó la figura.');
 const mw = mask.width, mh = mask.height, bg = mask.getAsFloat32Array();
 const m = document.createElement('canvas'); m.width = mw; m.height = mh;
 const mctx = m.getContext('2d'); const data = mctx.createImageData(mw, mh);
 let kept = 0;
 for (let i = 0; i < bg.length; i++) { const a = Math.max(0, Math.min(1, (0.92 - bg[i]) / 0.25)); data.data[i * 4 + 3] = Math.round(a * 255); kept += a; }
 for (const r of result.confidenceMasks) r.close?.();
 if (kept < bg.length * 0.01) throw Error('No se detectó una persona en la foto.');
 mctx.putImageData(data, 0, 0);
 const out = document.createElement('canvas'); out.width = source.width; out.height = source.height;
 const ctx = out.getContext('2d'); ctx.drawImage(source, 0, 0);
 ctx.globalCompositeOperation = 'destination-in'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
 ctx.drawImage(m, 0, 0, out.width, out.height);
 return out;
}
function toBlob(canvas, type, q) { return new Promise((res, rej) => { try { canvas.toBlob(b => b ? res(b) : rej(Error('No se pudo exportar la imagen.')), type, q); } catch (e) { rej(e); } }); }

/** Abre el editor. onSave recibe {file} (imagen exportada) o {edit} (metadatos) y debe guardar. */
export function abrirEditor({ url, edit, title, onSave, soloArchivo = false }) {
 return new Promise(resolve => {
  let img = null, isTainted = false, file = null, objectURL = '', transparent = false, rot = 0, crop = { x: 0, y: 0, w: 1, h: 1 }, saving = false;
  const canvas = el('canvas', { className: 'editor-canvas' });
  const frame = el('div', { className: 'editor-frame' });
  for (const k of ['nw', 'ne', 'sw', 'se']) { const h = el('span', { className: 'editor-handle editor-' + k }); h.dataset.h = k; frame.append(h); }
  const wrap = el('div', { className: 'editor-wrap' }, canvas, frame);
  const stage = el('div', { className: 'editor-stage' }, wrap);
  const status = el('p', { className: 'editor-status', role: 'status' });
  const input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif,image/avif', hidden: true, id: 'editor-file' });
  const btn = (text, icon, cls = 'editor-btn') => { const b = el('button', { type: 'button', className: cls }); b.innerHTML = '<i class="fas ' + icon + '" aria-hidden="true"></i>'; b.append(el('span', { textContent: text })); return b; };
  const left = btn('Girar a la izquierda', 'fa-rotate-left'), right = btn('Girar a la derecha', 'fa-rotate-right'), choose = btn('Elegir otra imagen', 'fa-image'), reset = btn('Sin recorte', 'fa-expand'), removeBg = btn('Quitar fondo', 'fa-wand-magic-sparkles');
  const cancel = btn('Cancelar', 'fa-xmark', 'editor-btn editor-cancel'), save = btn('Guardar', 'fa-check', 'editor-btn editor-save');
  const tools = el('div', { className: 'editor-tools' }, left, right, reset, removeBg, choose);
  const bar = el('div', { className: 'editor-actions' }, cancel, save);
  const head = el('div', { className: 'editor-head' }, el('h2', { textContent: 'Editar foto' }), el('p', { textContent: 'Mové el marco o sus esquinas para recortar. ' + (title || '') }));
  const root = el('div', { className: 'photo-editor', id: 'photo-editor' }, head, stage, status, tools, input, bar);
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Editar foto');
  document.body.append(root); document.body.classList.add('editor-abierto');
  const enabled = v => { for (const b of root.querySelectorAll('button')) b.disabled = !v; };

  function draw() {
   if (!img) return;
   const sw = rot % 180 ? img.naturalHeight : img.naturalWidth, sh = rot % 180 ? img.naturalWidth : img.naturalHeight;
   const box = stage.getBoundingClientRect();
   const scale = Math.min((box.width - 24) / sw, (box.height - 24) / sh, 1e4) || 1;
   const w = Math.max(1, Math.round(sw * scale)), h = Math.max(1, Math.round(sh * scale));
   const dpr = Math.min(2, window.devicePixelRatio || 1);
   canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
   wrap.style.width = w + 'px'; wrap.style.height = h + 'px';
   const ctx = canvas.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(rot * Math.PI / 180);
   const dw = (rot % 180 ? canvas.height : canvas.width), dh = (rot % 180 ? canvas.width : canvas.height);
   ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
   placeFrame();
  }
  function placeFrame() { Object.assign(frame.style, { left: crop.x * 100 + '%', top: crop.y * 100 + '%', width: crop.w * 100 + '%', height: crop.h * 100 + '%' }); }
  async function setSource(src, opts = {}) {
   enabled(false); status.textContent = 'Cargando imagen…';
   try {
    try { img = await loadImage(src, !opts.local); isTainted = tainted(img); }
    catch { img = await loadImage(src, false); isTainted = true; }
    if (opts.local) isTainted = false;
    status.textContent = isTainted ? 'Esta foto está alojada fuera del estudio: el recorte y el giro se guardan como ajuste de vista, sin modificar el archivo.' : '';
    draw();
   } catch (e) { status.textContent = e.message; }
   finally { enabled(true); }
  }
  // Interacción con el marco: arrastrar para mover y esquinas para cambiar el tamaño.
  let drag = null; const MIN = 0.05;
  frame.addEventListener('pointerdown', e => {
   e.preventDefault(); frame.setPointerCapture(e.pointerId);
   drag = { h: e.target.dataset.h || 'move', x: e.clientX, y: e.clientY, start: { ...crop }, box: wrap.getBoundingClientRect() };
  });
  frame.addEventListener('pointermove', e => {
   if (!drag) return;
   const dx = (e.clientX - drag.x) / drag.box.width, dy = (e.clientY - drag.y) / drag.box.height, s = drag.start;
   let { x, y, w, h } = s;
   if (drag.h === 'move') { x = Math.min(1 - w, Math.max(0, s.x + dx)); y = Math.min(1 - h, Math.max(0, s.y + dy)); }
   else {
    let x2 = s.x + s.w, y2 = s.y + s.h;
    if (drag.h.includes('w')) x = Math.min(x2 - MIN, Math.max(0, s.x + dx)); else x2 = Math.max(x + MIN, Math.min(1, x2 + dx));
    if (drag.h.includes('n')) y = Math.min(y2 - MIN, Math.max(0, s.y + dy)); else y2 = Math.max(y + MIN, Math.min(1, y2 + dy));
    w = x2 - x; h = y2 - y;
   }
   crop = { x, y, w, h }; placeFrame();
  });
  const end = () => { drag = null; };
  frame.addEventListener('pointerup', end); frame.addEventListener('pointercancel', end);
  const turn = d => { const next = (rot + d + 360) % 360; crop = R().aRotado(R().aOriginal(crop, rot), next); rot = next; draw(); };
  left.onclick = () => turn(-90); right.onclick = () => turn(90);
  reset.onclick = () => { crop = { x: 0, y: 0, w: 1, h: 1 }; placeFrame(); };
  choose.onclick = () => input.click();
  input.onchange = async () => {
   const f = input.files[0]; input.value = ''; if (!f) return;
   if (!TYPES.test(f.type)) { status.textContent = 'Formato no compatible. Usá JPG, PNG, WEBP, GIF o AVIF.'; return; }
   if (!f.size || f.size > MAX) { status.textContent = 'La imagen supera 8 MB.'; return; }
   if (objectURL) URL.revokeObjectURL(objectURL);
   file = f; objectURL = URL.createObjectURL(f); rot = 0; transparent = false; crop = { x: 0, y: 0, w: 1, h: 1 };
   await setSource(objectURL, { local: true });
  };
  removeBg.onclick = async () => {
   if (!img) return;
   if (isTainted) { status.textContent = 'Esta foto está alojada fuera del estudio y no se le puede quitar el fondo. Usá «Elegir otra imagen» con el archivo original.'; return; }
   enabled(false); status.textContent = 'Quitando el fondo… puede tardar unos segundos (la primera vez descarga el modelo).';
   try {
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const src = document.createElement('canvas'); src.width = Math.max(1, Math.round(img.naturalWidth * k)); src.height = Math.max(1, Math.round(img.naturalHeight * k));
    src.getContext('2d').drawImage(img, 0, 0, src.width, src.height);
    const out = await quitarFondo(src);
    const blob = await toBlob(out, 'image/png');
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = URL.createObjectURL(blob); img = await loadImage(objectURL, false); isTainted = false; transparent = true;
    if (!file) file = new File([blob], 'foto.png', { type: 'image/png' });
    draw(); status.textContent = 'Fondo quitado. Podés seguir recortando o girando, y después Guardar.';
   } catch (e) { status.textContent = 'No se pudo quitar el fondo: ' + (e && e.message ? e.message : 'error desconocido') + '. La foto quedó como estaba.'; }
   finally { enabled(true); }
  };
  const onResize = () => draw(); window.addEventListener('resize', onResize);
  function close(result) {
   window.removeEventListener('resize', onResize); document.removeEventListener('keydown', onKey);
   if (objectURL) URL.revokeObjectURL(objectURL); root.remove(); document.body.classList.remove('editor-abierto'); resolve(result);
  }
  const onKey = e => { if (e.key === 'Escape' && !saving) close(false); }; document.addEventListener('keydown', onKey);
  cancel.onclick = () => close(false);
  async function exportFile() {
   const o = R().aOriginal(crop, rot);
   const sx = Math.round(o.x * img.naturalWidth), sy = Math.round(o.y * img.naturalHeight);
   const sw = Math.max(1, Math.round(o.w * img.naturalWidth)), sh = Math.max(1, Math.round(o.h * img.naturalHeight));
   const k = Math.min(1, MAX_SIDE / Math.max(sw, sh));
   const cw = Math.max(1, Math.round(sw * k)), ch = Math.max(1, Math.round(sh * k));
   const c = document.createElement('canvas'); c.width = rot % 180 ? ch : cw; c.height = rot % 180 ? cw : ch;
   const ctx = c.getContext('2d'); ctx.translate(c.width / 2, c.height / 2); ctx.rotate(rot * Math.PI / 180);
   ctx.drawImage(img, sx, sy, sw, sh, -cw / 2, -ch / 2, cw, ch);
   let blob = await toBlob(c, 'image/webp', 0.9);
   if (blob.type !== 'image/webp') blob = transparent ? await toBlob(c, 'image/png') : await toBlob(c, 'image/jpeg', 0.9);
   const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
   const base = (file && file.name !== 'foto.png' ? file.name : (url.split('?')[0].split('/').pop() || 'foto')).replace(/\.[a-z0-9]+$/i, '').slice(0, 60) || 'foto';
   const out = new File([blob], base + '-editada.' + ext, { type: blob.type });
   if (out.size > MAX) throw Error('La imagen recortada supera 8 MB.');
   return out;
  }
  save.onclick = async () => {
   if (!img || saving) return; saving = true; enabled(false); status.textContent = 'Guardando…';
   try {
    const full = crop.x < 0.001 && crop.y < 0.001 && crop.w > 0.999 && crop.h > 0.999;
    if (!file && !transparent && full && rot === 0 && !edit) { close(false); return; }
    let done = false;
    if (!isTainted) {
     try { await onSave({ file: await exportFile() }, t => { status.textContent = t; }); done = true; }
     catch (e) { if (e && e.name !== 'SecurityError') throw e; }
    }
    if (!done && soloArchivo) throw Error('Esta imagen no se puede guardar recortada. Usá «Elegir otra imagen».');
    if (!done) {
     const o = R().aOriginal(crop, rot); const p = v => Math.round(v * 10000) / 100;
     const meta = full && rot === 0 ? null : { x: p(o.x), y: p(o.y), w: Math.min(p(o.w), 100 - p(o.x)), h: Math.min(p(o.h), 100 - p(o.y)), r: rot };
     await onSave({ edit: meta }, t => { status.textContent = t; });
    }
    close(true);
   } catch (e) { status.textContent = e.message || String(e); saving = false; enabled(true); }
  };
  if (R().valido(edit)) { rot = edit.r; crop = R().aRotado({ x: edit.x / 100, y: edit.y / 100, w: edit.w / 100, h: edit.h / 100 }, rot); }
  setSource(url);
 });
}
