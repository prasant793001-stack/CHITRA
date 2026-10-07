#!/usr/bin/env node
/* Builds the real-photo catalog used by the photographic templates.
 *
 *   PIXABAY_KEY=xxxx UNSPLASH_KEY=yyyy node tools/harvest-photos.mjs [--per 3] [--unsplash-max 45] [--out .]
 *
 *  - Pixabay photos are DOWNLOADED, resized (1100px + 420px thumbnail) and saved in photos/ (Pixabay's terms don't allow hot-linking).
 *  - Unsplash photos are NOT downloaded: only their ids/urls/credits go into the catalog and the app hot-links them (Unsplash's terms require that).
 *  - Keys are read from the environment only. They are never written to any file. Do not commit them.
 *  - Resizing uses `sharp` if installed, else Python Pillow (tools/resize.py), else keeps the original file.
 *  Output: photos/*.jpg  and  data/photos.json
 */
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PIX = process.env.PIXABAY_KEY, UNS = process.env.UNSPLASH_KEY, OUT = arg('out', '.'), PER = +arg('per', 3), UMAX = +arg('unsplash-max', 45);
const PIX_API = process.env.PIXABAY_API || 'https://pixabay.com/api/', UNS_API = process.env.UNSPLASH_API || 'https://api.unsplash.com';
if (!PIX && !UNS) { console.error('Set PIXABAY_KEY and/or UNSPLASH_KEY in the environment.'); process.exit(1); }
// topics + the "must" regex come from data/photo-topics.json (shared with the in-app live library) so a photo is only kept when its own tags prove it matches the topic
const TJ = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '../data/photo-topics.json'), 'utf8')).topics.slice(0, +arg('topics', 999));
const TOPICS = Object.fromEntries(TJ.map(t => [t.k, t.q])), MUST = Object.fromEntries(TJ.map(t => [t.k, new RegExp('\\b(' + t.must + ')', 'i')]));
const SL = +(process.env.HARVEST_SLEEP_SCALE ?? 1), sleep = ms => new Promise(r => setTimeout(r, ms * SL));
const get = async (url, opt) => { for (let i = 0; i < 3; i++) { try { const r = await fetch(url, opt); if (r.status === 429) { await sleep(8000 * (i + 1)); continue; } if (!r.ok) throw new Error(r.status + ' ' + url.split('?')[0]); return r; } catch (e) { if (i === 2) throw e; await sleep(1500); } } };
fs.mkdirSync(path.join(OUT, 'photos'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });
const catPath = path.join(OUT, 'data/photos.json'); const cat = fs.existsSync(catPath) ? JSON.parse(fs.readFileSync(catPath, 'utf8')) : { v: 1, photos: [] };
const have = new Set(cat.photos.map(p => p.id));
const here = path.dirname(new URL(import.meta.url).pathname);

async function resize(buf, file, max, q) {
  try { const sharp = (await import('sharp')).default; await sharp(buf).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: q, mozjpeg: true }).toFile(file); return; } catch { }
  const tmp = file + '.src'; fs.writeFileSync(tmp, buf); const r = spawnSync('python3', [path.join(here, 'resize.py'), tmp, file, String(max), String(q)]); fs.rmSync(tmp, { force: true });
  if (r.status !== 0) fs.writeFileSync(file, buf); // last resort: keep the original
}
const dims = f => { try { const r = spawnSync('python3', ['-c', 'import sys;from PIL import Image;i=Image.open(sys.argv[1]);print(i.size[0],i.size[1])', f]); const [w, h] = r.stdout.toString().trim().split(' ').map(Number); return w && h ? [w, h] : null; } catch { return null; } };

async function pixabay() {
  if (!PIX) return console.log('(no PIXABAY_KEY - skipping Pixabay)');
  let n = 0;
  for (const [topic, q] of Object.entries(TOPICS)) for (const [ori, key] of [['horizontal', 'l'], ['vertical', 'p']]) {
    const url = `${PIX_API}?key=${encodeURIComponent(PIX)}&q=${encodeURIComponent(q)}&image_type=photo&orientation=${ori}&min_width=${ori === 'horizontal' ? 1600 : 1000}&min_height=${ori === 'vertical' ? 1400 : 900}&safesearch=true&order=popular&per_page=40`;
    let j; try { j = await (await get(url)).json(); } catch (e) { console.warn('skip', topic, ori, e.message); continue; }
    const picks = (j.hits || []).filter(h => !have.has('px' + h.id) && h.largeImageURL && MUST[topic].test(String(h.tags || ''))).slice(0, PER);
    for (const h of picks) {
      try {
        const buf = Buffer.from(await (await get(h.largeImageURL)).arrayBuffer()), id = 'px' + h.id, f = `photos/${id}.jpg`, t = `photos/${id}_t.jpg`;
        await resize(buf, path.join(OUT, f), 1100, 72); await resize(buf, path.join(OUT, t), 420, 68); const d = dims(path.join(OUT, f)) || [h.imageWidth, h.imageHeight];
        cat.photos.push({ id, s: 'px', f, t, w: d[0], h: d[1], o: key, c: '#8a8fa3', by: h.user, l: h.pageURL, k: [topic, ...String(h.tags || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 4)] }); have.add(id); n++;
      } catch (e) { console.warn('skip image', h.id, e.message); }
      await sleep(250);
    }
    await sleep(700);
  }
  console.log('Pixabay photos added:', n);
}
async function unsplash() {
  if (!UNS) return console.log('(no UNSPLASH_KEY - skipping Unsplash)');
  let calls = 0, n = 0; // demo apps are limited to 50 requests/hour: stay under it, run again later for more
  for (const [topic, q] of Object.entries(TOPICS)) for (const [ori, key] of [['landscape', 'l'], ['portrait', 'p']]) {
    if (calls >= UMAX) { console.log('Unsplash request budget reached - run again in an hour for more.'); break; } calls++;
    let j; try { j = await (await get(`${UNS_API}/search/photos?query=${encodeURIComponent(q)}&orientation=${ori}&per_page=8&order_by=relevant&content_filter=high&client_id=${encodeURIComponent(UNS)}`)).json(); } catch (e) { console.warn('skip', topic, ori, e.message); continue; }
    for (const p of (j.results || []).slice(0, 5)) {
      const id = 'un' + p.id; if (have.has(id) || !p.urls?.raw) continue;
      if (!MUST[topic].test(`${p.alt_description || ''} ${p.description || ''} ${(p.tags || []).map(t => t.title).join(' ')}`)) continue;
      cat.photos.push({ id, s: 'un', u: p.urls.raw, dl: p.id, w: p.width, h: p.height, o: key, c: p.color || '#8a8fa3', by: p.user?.name || 'Unsplash', l: `${p.links?.html || 'https://unsplash.com'}?utm_source=chitra_studio&utm_medium=referral`, k: [topic, ...((p.tags || []).map(t => t.title)).slice(0, 3)] }); have.add(id); n++;
    }
    await sleep(400);
  }
  console.log('Unsplash photos added:', n);
}
await pixabay(); await unsplash();
cat.updated = new Date().toISOString().slice(0, 10); fs.writeFileSync(catPath, JSON.stringify(cat));
const bytes = fs.readdirSync(path.join(OUT, 'photos')).reduce((s, f) => s + fs.statSync(path.join(OUT, 'photos', f)).size, 0);
console.log(`Catalog: ${cat.photos.length} photos (${(bytes / 1e6).toFixed(1)} MB in photos/). Now: git add photos data && git commit`);
