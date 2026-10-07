const cx = async (p, id) => p.evaluate(id => { const o = chitra.canvas.getObjects().find(x => x.__t === id); return o && o.getCenterPoint(); }, id);
const pt = (p, x, y) => p.evaluate(([x, y]) => { const c = chitra.canvas, r = c.upperCanvasEl.getBoundingClientRect(), z = c.getZoom(); return [r.left + x * z, r.top + y * z]; }, [x, y]);
module.exports = [
  { name: 'templates library size', run: async (p, ok) => { const n = await p.evaluate(() => Object.keys(chitra.TEMPLATE_META).length); ok('template library has 1000+ designs', n >= 1000, n); } },
  { name: 'home', run: async (p, ok) => { ok('home visible', await p.isVisible('#home')); ok('category tiles', await p.locator('#hmCatTiles .cat-tile').count() >= 12); } },
  { name: 'create doc + draw every template family', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' })); await p.waitForTimeout(600);
    const bad = await p.evaluate(async () => { const out = []; const seen = new Set(); for (const [id, m] of Object.entries(chitra.TEMPLATE_META)) { const k = id.replace(/-\d+$/, ''); if (seen.has(k + (+id.split('-').pop() % 7))) continue; seen.add(k + (+id.split('-').pop() % 7)); await chitra.ensureTplFonts(m.f); const u = chitra.renderTemplateThumb(id, chitra.productByName(m.p), 120); if (!u || u.length < 500) out.push(id); } return out; });
    ok('sampled templates render', bad.length === 0, bad.join(',')); } },
  { name: 'text single vs double click', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => { chitra.canvas.clear(); const t = chitra.addText('heading'); t.__t = 'h'; chitra.canvas.discardActiveObject(); chitra.canvas.requestRenderAll(); });
    const c = await cx(p, 'h'); const [x, y] = await pt(p, c.x, c.y);
    await p.mouse.click(x, y); await p.waitForTimeout(250); let s = await p.evaluate(() => ({ sel: !!chitra.active(), ed: !!chitra.active()?.isEditing })); ok('single click selects only', s.sel && !s.ed);
    await p.mouse.dblclick(x, y); await p.waitForTimeout(300); ok('double click edits', await p.evaluate(() => !!chitra.active()?.isEditing)); } },
  { name: 'drag select from outside the page', only: 'desktop', run: async (p, ok) => {
    const r = await p.evaluate(() => { const c = chitra.canvas; c.clear(); [0, 1].forEach(i => c.add(new fabric.Rect({ left: 600 + i * 1000, top: 800, width: 500, height: 500, fill: '#6d4aff' }))); c.discardActiveObject(); c.requestRenderAll(); const b = c.upperCanvasEl.getBoundingClientRect(), z = c.getZoom(); return { l: b.left, t: b.top, z }; });
    await p.mouse.move(r.l - 100, r.t + 40); await p.mouse.down(); await p.mouse.move(r.l + 2000 * r.z, r.t + 1500 * r.z, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(200);
    ok('marquee selects 2 objects', await p.evaluate(() => chitra.canvas.getActiveObjects().length) === 2); } },
  { name: 'background remover (offline engine)', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.canvas.clear());
    const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 600; c.height = 500; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 600, 500); g.addColorStop(0, '#bcd7e8'); g.addColorStop(1, '#7fa6c4'); x.fillStyle = g; x.fillRect(0, 0, 600, 500); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(300, 290, 140, 160, 0, 0, 7); x.fill(); x.fillStyle = '#d0312d'; x.fillRect(200, 260, 200, 40); return c.toDataURL(); });
    await p.evaluate(u => new Promise(r => fabric.Image.fromURL(u, i => { i.scaleToWidth(1000); chitra.place(i); r(); })), url); await p.waitForTimeout(300);
    await p.evaluate(() => chitra.removeBg()); await p.waitForFunction(() => !document.querySelector('.busy'), null, { timeout: 20000 }).catch(() => { }); await p.waitForTimeout(2500);
    const a = await p.evaluate(() => { const o = chitra.active(), e = o.getElement(), c = document.createElement('canvas'); c.width = e.width; c.height = e.height; const x = c.getContext('2d'); x.drawImage(e, 0, 0); const g = (px, py) => x.getImageData(px * e.width / 600 | 0, py * e.height / 500 | 0, 1, 1).data[3]; return { bg: g(15, 15), body: g(300, 380), stripe: g(300, 280) }; });
    ok('background removed, subject (incl. white) kept', a.bg < 10 && a.body > 245 && a.stripe > 245, JSON.stringify(a)); } },
  { name: 'export png', only: 'desktop', run: async (p, ok) => { await p.evaluate(() => { chitra.canvas.clear(); chitra.addText('heading'); });
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.evaluate(() => chitra.exportFile('png'))]); ok('png download', /\.png$/.test(d.suggestedFilename()), d.suggestedFilename()); } },
  { name: 'print layout slots', only: 'desktop', run: async (p, ok) => { await p.evaluate(() => { const d = chitra.LAYOUTS.find(l => l.id === 'mug-a4-3'); return chitra.useBuiltin(d, true); }); await p.waitForTimeout(800); ok('3 mug slots on A4', await p.evaluate(() => chitra.slots().length) === 3); } },
  { name: 'mobile home + editor', only: 'mobile', run: async (p, ok) => { ok('no horizontal overflow on home', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' })); await p.waitForTimeout(800);
    ok('no horizontal overflow in editor', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); } },
  { name: 'polish: a11y, save chip, shortcuts, tour', only: 'desktop', run: async (p, ok) => {
    ok('icon buttons have accessible names', await p.evaluate(() => [...document.querySelectorAll('#app button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length) === 0);
    ok('dialogs have role', await p.evaluate(() => [...document.querySelectorAll('.modal')].every(m => m.getAttribute('role') === 'dialog')));
    await p.evaluate(() => { localStorage.removeItem('chitra.tour'); chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' }); }); await p.waitForTimeout(2200);
    ok('first-run tour appears', await p.isVisible('.tour')); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok('tour closes with Escape', !(await p.isVisible('.tour')));
    await p.evaluate(() => { chitra.canvas.clear(); chitra.addText('heading'); chitra.addText('body'); }); await p.waitForTimeout(2600);
    ok('save chip shows Saved', await p.evaluate(() => document.querySelector('#saveChip').dataset.s) === 'ok');
    await p.mouse.click(5, 400); await p.keyboard.press('Control+a'); ok('Ctrl+A selects all', await p.evaluate(() => chitra.canvas.getActiveObjects().length) === 2);
    await p.keyboard.press('Control+c'); await p.keyboard.press('Control+v'); await p.waitForTimeout(300); ok('Ctrl+C/V pastes', await p.evaluate(() => chitra.canvas.getObjects().length) === 4);
    await p.keyboard.press('Shift+?'); await p.waitForTimeout(200); ok('help sheet opens on ?', await p.isVisible('#helpModal')); await p.keyboard.press('Escape'); } },
  { name: 'template opens rendered (not blank)', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-3' })); await p.waitForTimeout(1500);
    const px = await p.evaluate(() => { const c = chitra.canvas.lowerCanvasEl, x = c.getContext('2d'); const d = x.getImageData(c.width / 2 | 0, c.height * 0.2 | 0, 60, 60).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i]; return n; });
    ok('canvas pixels drawn after opening a template', px > 1000, px); } },
  { name: 'studio tools', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-3', name: 'Resize me' })); await p.waitForTimeout(1200);
    await p.evaluate(() => chitra.resizeTo([chitra.productByName('Story / Reel / TikTok'), chitra.productByName('A4')])); await p.waitForTimeout(800);
    const metas = await p.evaluate(async () => (await chitra.store.list()).map(m => m.name + '|' + m.w + 'x' + m.h));
    ok('Magic Resize created 2 copies', metas.some(m => /Resize me · Story.*1080x1920/.test(m)) && metas.some(m => /Resize me · A4/.test(m)), metas.slice(0, 4).join(' ; '));
    ok('resized copy has content', await p.evaluate(() => chitra.canvas.getObjects().length) > 0);
    const d = await p.evaluate(() => chitra.describe('birthday mug for dad')); ok('describe finds a mug template', /^mug|^tee|^ig/.test(d.id) && d.title.toLowerCase().includes('dad'), JSON.stringify(d));
    await p.evaluate(() => chitra.magic('eid mug')); await p.waitForTimeout(1500);
    ok('magic opens a mug design', await p.evaluate(() => document.querySelector('#productName').textContent) === '11 oz mug wrap');
    await p.evaluate(() => chitra.canvas.add(new fabric.Rect({ width: 50, height: 50, left: 10, top: 10 }))); await p.evaluate(() => chitra.saveNow()); await p.evaluate(() => chitra.openHistory()); await p.click('#verNow'); await p.waitForTimeout(600);
    ok('version saved', await p.locator('#verList .ver').count() >= 1);
    await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true));
    await p.evaluate(() => { document.querySelector('#pdfMarks').checked = true; });
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.evaluate(() => chitra.exportFile('pdf'))]);
    ok('PDF with crop marks downloads', /\.pdf$/.test(dl.suggestedFilename())); } },
  { name: 'photo templates accept photos', only: 'desktop', run: async (p, ok) => {
    const id = await p.evaluate(() => Object.keys(chitra.TEMPLATE_META).find(k => /^ig-/.test(k) && (chitra.TEMPLATE_META[k].t || '').includes('photocircle')));
    await p.evaluate(id => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: id }), id); await p.waitForTimeout(1200);
    const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const x = c.getContext('2d'); x.fillStyle = '#f00'; x.fillRect(0, 0, 400, 300); return c.toDataURL(); });
    await p.evaluate(u => new Promise(r => fabric.Image.fromURL(u, i => { chitra.place(i); r(); })), url); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const o = chitra.canvas.getObjects(), im = o.find(x => x.type === 'image'), sl = o.find(x => x.slot); return { inSlot: !!im.inSlot, above: o.indexOf(im) === o.indexOf(sl) + 1, textAbove: o.slice(o.indexOf(im) + 1).some(x => /textbox/.test(x.type)) }; });
    ok('photo lands in the frame, above it, below the text', r.inSlot && r.above && r.textAbove, JSON.stringify(r)); } },
  { name: 'animated video export', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-1' })); await p.waitForTimeout(1200);
    await p.evaluate(() => { document.querySelector('#anSpeed') || chitra.openAnimate(); document.querySelector('#anSpeed').value = 3; document.querySelectorAll('.modal').forEach(m => m.hidden = true); });
    const [d, r] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.evaluate(() => chitra.recordAnimation())]);
    ok('video downloads (.webm/.mp4) and is not empty', /\.(webm|mp4)$/.test(d.suggestedFilename()) && r.size > 5000, d.suggestedFilename() + ' ' + r.size);
    ok('design restored after recording', await p.evaluate(() => chitra.canvas.getObjects().every(o => o.opacity > 0))); } },
  { name: 'real-photo templates (fixture catalog)', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    await q.goto('http://localhost:8123/?nosplash&catalog=tests/fixtures/photos.json'); await q.waitForTimeout(2500);
    const n = await q.evaluate(() => Object.values(chitra.TEMPLATE_META).filter(m => m.real).length); ok('36-photo fixture catalog scales templates to ~2x photos (unique, not repeated)', n >= 60 && n <= 36 * 2.6, n);
    const first = await q.evaluate(() => chitra.listTemplates({}).slice(0, 12).map(id => !!chitra.TEMPLATE_META[id].real)); ok('photographic designs are listed first', first.slice(0, 8).every(Boolean), first.join());
    const cats = await q.evaluate(() => new Set(chitra.listTemplates({}).slice(0, 12).map(id => chitra.TEMPLATE_META[id].cat)).size); ok('"All" mixes categories', cats >= 6, cats);
    await q.evaluate(async () => { await chitra.ensureTpl('rig-3', 'full'); await chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'rig-3' }); }); await q.waitForTimeout(1200);
    const r = await q.evaluate(() => { const im = chitra.canvas.getObjects().find(o => o.type === 'image'); return { img: !!im, credit: im?.credit?.by, text: chitra.canvas.getObjects().some(o => /textbox/.test(o.type)) }; }); ok('real template opens with a photo + live text', r.img && r.text && r.credit === 'Test Photographer', JSON.stringify(r));
    ok('credits file lists the photographer', (await q.evaluate(() => chitra.collectCredits().map(c => c.by))).includes('Test Photographer'));
    const px = await q.evaluate(() => { const c = chitra.canvas.lowerCanvasEl, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 400) seen.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); return seen.size; }); ok('canvas shows a real image (many colours)', px > 12, px);
    await q.evaluate(() => chitra.showHome()); await q.waitForTimeout(500); await q.click('#hmCatTiles [data-ct=mug]'); await q.waitForTimeout(6000);
    const kinds = await q.evaluate(() => [...document.querySelectorAll('#hmTplGrid img[data-tpl].ready')].slice(0, 6).map(i => i.src.slice(0, 22))); ok('mug templates are shown on a realistic mug', kinds.length > 0 && kinds.every(k => k.startsWith('data:image/jpeg')), kinds.join(' | '));
    ok('no page errors in real-template flow', errs.length === 0, errs.join('|')); await q.close(); } },
  { name: 'live photo library + key vault', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const base = 'http://localhost:8123/tests/fixtures/photos/';
    await ctx.route('https://pixabay.com/api/**', r => { const q = new URL(r.request().url()).searchParams.get('q') || '', off = q.length % 12; const hits = Array.from({ length: 16 }, (_, i) => { const n = String((off + i * 2) % 36).padStart(2, '0'); return { id: `${q.length}${i}${n}`, webformatURL: `${base}f${n}_t.jpg`, largeImageURL: `${base}f${n}.jpg`, imageWidth: +n % 3 ? 1280 : 853, imageHeight: +n % 3 ? 853 : 1280, user: 'Mock Photographer', pageURL: 'https://pixabay.com/x', tags: q + ', photo' }; }); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ hits, totalHits: 100 }) }); });
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    await q.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('chitra.keys', JSON.stringify({ pixabay: 'PLAINKEY-123' })); } });
    await q.goto('http://localhost:8123/?nosplash&livetopics=14&livedelay=0'); ok('plaintext keys are detected', await q.evaluate(() => chitra.vault.state()) === 'plain');
    await q.waitForFunction(() => Object.values(chitra.TEMPLATE_META).some(m => m.real), null, { timeout: 40000 }).catch(() => { });
    const n = await q.evaluate(() => Object.values(chitra.TEMPLATE_META).filter(m => m.real).length); ok('library built from live search -> photographic templates', n >= 20, n);
    await q.evaluate(async () => { const id = chitra.listTemplates({})[0]; await chitra.ensureTpl(id, 'full'); await chitra.newDocument({ product: chitra.productByName('Instagram post'), template: id }); }); await q.waitForTimeout(1000);
    const r1 = await q.evaluate(() => { const im = chitra.canvas.getObjects().find(o => o.type === 'image'); return { img: !!im, by: im?.credit?.by, site: im?.credit?.site }; }); ok('live template carries a photo with credit', r1.img && r1.by === 'Mock Photographer' && r1.site === 'Pixabay', JSON.stringify(r1));
    const cached = await q.evaluate(async () => (await chitra.kv.get('ibindex'))?.length || 0); ok('photos are cached on the device after first use', cached > 0, cached);
    await q.evaluate(() => chitra.vault.save({ pixabay: 'PLAINKEY-123', unsplash: 'UNS-KEY-9' }, 'secret1', false));
    ok('keys no longer stored in plain text', await q.evaluate(() => localStorage.getItem('chitra.keys') === null && !localStorage.getItem('chitra.vault').includes('PLAINKEY') && !localStorage.getItem('chitra.vault').includes('UNS-KEY')));
    const dump = await q.evaluate(() => JSON.stringify({ ...localStorage })); ok('no key anywhere in localStorage', !/PLAINKEY|UNS-KEY/.test(dump));
    await q.goto('http://localhost:8123/?nosplash&nolive=1'); await q.waitForTimeout(800);
    ok('after reload the vault is locked and no key is usable', await q.evaluate(() => chitra.vault.state() === 'locked' && !chitra.stock.config().pixabay));
    ok('wrong passphrase refused', (await q.evaluate(() => chitra.vault.unlock('nope123'))) === false);
    ok('right passphrase unlocks', await q.evaluate(async () => (await chitra.vault.unlock('secret1')) && chitra.stock.config().pixabay === 'PLAINKEY-123' && chitra.stock.config().unsplash === 'UNS-KEY-9'));
    await q.evaluate(() => chitra.vault.save({ pixabay: 'PLAINKEY-123' }, 'secret1', true)); await q.goto('http://localhost:8123/?nosplash&nolive=1'); await q.waitForTimeout(600);
    ok('"remember on this device" unlocks silently', await q.evaluate(async () => (await chitra.vault.tryRemembered()) && chitra.stock.config().pixabay === 'PLAINKEY-123'));
    ok('no page errors in live/vault flow', errs.length === 0, errs.join('|')); await q.close(); } },
];
