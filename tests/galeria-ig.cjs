const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const base = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(base, file), 'utf8');
const catalog = JSON.parse(read('galeria-ig.json'));
const html = read('index.html').replace(/<script src="([^"]+)"><\/script>/g,
  (_, file) => '<script>' + read(file) + '</script>');

async function loading(fetch, expected) {
  const dom = new JSDOM(html, {
    url: 'https://harold-lezcano-estudio.web.app/#galeria', runScripts: 'dangerously',
    beforeParse(w) { w.structuredClone = structuredClone; w.fetch = fetch; w.open = () => {}; }
  });
  try {
    await new Promise(resolve => dom.window.addEventListener('load', resolve));
    await new Promise(resolve => setImmediate(resolve));
    const d = dom.window.document;
    assert.equal(d.querySelectorAll('#mainGallery .gallery-item').length, expected);
    if (expected > 152) {
      assert.equal(d.querySelector('[data-gallery-id="ig-001"] img').src,
        'https://harold-lezcano-estudio.web.app/galeria-ig/001.jpg');
      assert.equal(d.querySelectorAll('.gallery-caption').length, 0);
      const total = [...d.querySelectorAll('.album-count')].reduce((n, el) => n + parseInt(el.textContent), 0);
      assert.equal(total, expected);
    }
  } finally { dom.window.close(); }
}

(async () => {
  assert.equal(catalog.length, 321);
  assert.equal(new Set(catalog.map(item => item.id)).size, 321);
  for (const [n, item] of catalog.entries()) {
    assert.equal(item.order, n + 152);
    assert.equal(item.caption, '');
    assert.equal(item.hidden, false);
    assert.equal(item.cover, false);
    assert.equal(item.storagePath, '');
    assert.match(item.url, /^\/galeria-ig\/\d{3}\.jpg$/);
    assert.ok(fs.existsSync(path.join(base, item.url)));
  }
  const context = { window: {}, URL };
  vm.runInNewContext(read('estudio-datos.js'), context);
  const merge = context.window.EstudioDatos.mergeGallery;
  const item = { id: 'ig-001', category: 'retrato', url: '/galeria-ig/001.jpg' };
  assert.equal(merge([], [item])[0].url, 'https://galeria.example/galeria-ig/001.jpg');
  for (const url of ['http://example.com/a.jpg', 'javascript:alert(1)', 'data:image/png,x']) {
    assert.equal(merge([], [{ ...item, url }]).length, 0);
  }
  context.window.location = { origin: 'https://estudio.example' };
  assert.equal(merge([], [item])[0].url, 'https://estudio.example/galeria-ig/001.jpg');
  await loading(async url => {
    assert.equal(url, './galeria-ig.json');
    return { ok: true, json: async () => catalog };
  }, 473);
  await loading(async () => { throw Error('sin red'); }, 152);
  await loading(async () => ({ ok: false }), 152);
  await loading(async () => ({ ok: true, json: async () => ({ invalid: true }) }), 152);
  console.log('Galería Instagram: 321 registros, URLs relativas seguras, 473 fotos con catálogo y 152 de respaldo: OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
