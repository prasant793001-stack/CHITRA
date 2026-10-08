#!/usr/bin/env node
/* Downloads REAL blank-product photos (licence-clean: Pexels / Pixabay licences allow commercial use) for the Photo mockup studio.
 *   PEXELS_KEY=xxx PIXABAY_KEY=yyy node tools/harvest-mockups.mjs [--per 4] [--out .]
 * Output: mockups/*.jpg (+ _t thumbnails) and data/mockups/index.json entries with a proposed print area (quad) per product.
 * Then run  node tools/mockup-sheet.mjs /tmp/m.png  and LOOK at it: adjust any quad by hand in index.json (fractions of the photo), or delete bad photos.
 * Keys come from the environment only and are never written to disk. Resizing uses sharp, else Pillow (tools/resize.py). */
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PEX = process.env.PEXELS_KEY, PIX = process.env.PIXABAY_KEY, OUT = arg('out', '.'), PER = +arg('per', 4); const here = path.dirname(new URL(import.meta.url).pathname);
if (!PEX && !PIX) { console.error('Set PEXELS_KEY and/or PIXABAY_KEY'); process.exit(1); }
const PRODUCTS = [ // kind, label, search, proposed quad (fractions), curve
  ['shirt', 'T-shirt', 'blank white t-shirt mockup', [[.34, .28], [.66, .28], [.66, .56], [.34, .56]], 0], ['hoodie', 'Hoodie', 'blank hoodie mockup', [[.35, .36], [.65, .36], [.65, .6], [.35, .6]], 0],
  ['mug', 'Mug', 'blank white mug mockup', [[.36, .33], [.6, .33], [.6, .68], [.36, .68]], 1.5], ['tote', 'Tote bag', 'blank tote bag mockup', [[.32, .4], [.68, .4], [.68, .72], [.32, .72]], 0],
  ['poster', 'Poster frame', 'blank poster frame wall mockup', [[.3, .2], [.7, .2], [.7, .7], [.3, .7]], 0], ['case', 'Phone case', 'blank phone case mockup', [[.4, .22], [.6, .22], [.6, .78], [.4, .78]], 0],
  ['pillow', 'Pillow', 'blank pillow cushion mockup', [[.3, .3], [.7, .3], [.7, .7], [.3, .7]], 0], ['cap', 'Cap', 'blank white cap mockup', [[.4, .3], [.6, .3], [.6, .46], [.4, .46]], .4],
  ['notebook', 'Notebook', 'blank notebook cover mockup', [[.3, .2], [.7, .2], [.7, .8], [.3, .8]], 0], ['bottle', 'Bottle', 'blank water bottle mockup', [[.4, .35], [.6, .35], [.6, .7], [.4, .7]], 1.3],
];
fs.mkdirSync(path.join(OUT, 'mockups'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'data/mockups'), { recursive: true });
const ip = path.join(OUT, 'data/mockups/index.json'), idx = fs.existsSync(ip) ? JSON.parse(fs.readFileSync(ip, 'utf8')) : { v: 1, mockups: [] }, have = new Set(idx.mockups.map(x => x.id));
const get = async (u, o) => { const r = await fetch(u, o); if (!r.ok) throw new Error(r.status + ' ' + u.split('?')[0]); return r; };
async function resize(buf, file, max, q) { try { const sharp = (await import('sharp')).default; await sharp(buf).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: q, mozjpeg: true }).toFile(file); return; } catch { }
  const tmp = file + '.src'; fs.writeFileSync(tmp, buf); const r = spawnSync('python3', [path.join(here, 'resize.py'), tmp, file, String(max), String(q)]); fs.rmSync(tmp, { force: true }); if (r.status !== 0) fs.writeFileSync(file, buf); }
let n = 0;
for (const [kind, label, q, quad, curve] of PRODUCTS) {
  const cands = [];
  try { if (PEX) (await (await get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=15&orientation=square`, { headers: { Authorization: PEX } })).json()).photos.forEach(p => cands.push({ id: 'pe' + p.id, url: p.src.large2x || p.src.large, by: p.photographer, link: p.url, site: 'Pexels' })); } catch (e) { console.warn('pexels', kind, e.message); }
  try { if (PIX) (await (await get(`https://pixabay.com/api/?key=${encodeURIComponent(PIX)}&q=${encodeURIComponent(q)}&image_type=photo&per_page=15&safesearch=true`)).json()).hits.forEach(h => cands.push({ id: 'px' + h.id, url: h.largeImageURL, by: h.user, link: h.pageURL, site: 'Pixabay' })); } catch (e) { console.warn('pixabay', kind, e.message); }
  let k = 0; for (const c of cands) { if (k >= PER) break; const id = `${kind}-${c.id}`; if (have.has(id)) continue;
    try { const buf = Buffer.from(await (await get(c.url)).arrayBuffer()); await resize(buf, path.join(OUT, `mockups/${id}.jpg`), 1600, 82); await resize(buf, path.join(OUT, `mockups/${id}_t.jpg`), 360, 70);
      idx.mockups.push({ id, name: `${label} ${k + 1}`, kind, file: `mockups/${id}.jpg`, thumb: `mockups/${id}_t.jpg`, quad, curve, opacity: .96, shade: .55, blur: .5, fit: 'contain', review: true, credit: { site: c.site, by: c.by, link: c.link } }); have.add(id); k++; n++; } catch (e) { console.warn('skip', id, e.message); } await new Promise(r => setTimeout(r, 300)); }
}
fs.writeFileSync(ip, JSON.stringify(idx, null, 1)); console.log(`added ${n} photos; total ${idx.mockups.length}. Next: node tools/mockup-sheet.mjs /tmp/m.png and fix the quads (entries marked "review": true).`);
