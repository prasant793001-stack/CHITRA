/* Runs tools/harvest-photos.mjs against a mock Pixabay/Unsplash (no network, no keys) and checks the catalog it writes. */
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { spawn } from 'node:child_process';
const run = (args, env) => new Promise(res => { const p = spawn('node', args, { env }); let o = '', e = ''; p.stdout.on('data', d => { o += d; }); p.stderr.on('data', d => { e += d; }); p.on('close', status => res({ status, stdout: o, stderr: e })); });
const IMG = fs.readFileSync(new URL('./fixtures/photos/f00.jpg', import.meta.url));
let pass = 0, fail = 0; const ok = (n, c, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (c ? '' : ' | ' + x)); };
const seenKeys = [];
const srv = http.createServer((req, res) => { const u = new URL(req.url, 'http://x'); seenKeys.push(u.searchParams.get('key') || u.searchParams.get('client_id'));
  if (u.pathname === '/img') { res.writeHead(200, { 'content-type': 'image/jpeg' }); return res.end(IMG); }
  res.setHeader('content-type', 'application/json');
  if (u.pathname === '/api/') { const q = u.searchParams.get('q'), o = u.searchParams.get('orientation'); return res.end(JSON.stringify({ hits: [1, 2, 3, 4].map(i => ({ id: `${q.length}${o[0]}${i}`, largeImageURL: `http://localhost:${srv.address().port}/img`, pageURL: 'https://pixabay.com/x', user: 'Ann', tags: 'a, b, c', imageWidth: 1280, imageHeight: 853 })) })); }
  if (u.pathname === '/search/photos') { const q = u.searchParams.get('query'); return res.end(JSON.stringify({ results: [1, 2].map(i => ({ id: `${q.length}${i}`, urls: { raw: 'https://images.unsplash.com/photo-' + q.length + i }, width: 4000, height: 3000, color: '#112233', user: { name: 'Bob' }, links: { html: 'https://unsplash.com/photos/x' }, tags: [{ title: 'tag' }] })) })); }
  res.writeHead(404); res.end('{}'); }).listen(0);
await new Promise(r => srv.once('listening', r)); const port = srv.address().port;
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'harvest-'));
const ENV = { ...process.env, PIXABAY_KEY: 'TESTKEY123', UNSPLASH_KEY: 'TESTKEY456', PIXABAY_API: `http://localhost:${port}/api/`, UNSPLASH_API: `http://localhost:${port}`, HARVEST_SLEEP_SCALE: '0' }, ARGS = ['tools/harvest-photos.mjs', '--out', out, '--per', '2', '--topics', '3', '--unsplash-max', '4'];
const r = await run(ARGS, ENV);
ok('script exits cleanly', r.status === 0, r.stderr + r.stdout);
const cat = JSON.parse(fs.readFileSync(path.join(out, 'data/photos.json'), 'utf8'));
const px = cat.photos.filter(p => p.s === 'px'), un = cat.photos.filter(p => p.s === 'un');
ok('pixabay photos downloaded + resized', px.length >= 6 && px.every(p => fs.existsSync(path.join(out, p.f)) && fs.existsSync(path.join(out, p.t))), px.length);
ok('thumbnails are small', px.every(p => fs.statSync(path.join(out, p.t)).size < fs.statSync(path.join(out, p.f)).size));
ok('catalog has orientation, credit, tags', px.every(p => /^[lp]$/.test(p.o) && p.by && p.l && p.k.length));
ok('unsplash photos are hot-linked (not downloaded)', un.length >= 2 && un.every(p => p.u.startsWith('https://images.unsplash.com') && !p.f && p.dl && p.l.includes('utm_source')));
ok('unsplash request budget respected', seenKeys.filter(k => k === 'TESTKEY456').length <= 4);
const leaked = fs.readdirSync(out, { recursive: true }).some(f => { const p = path.join(out, f); return fs.statSync(p).isFile() && /\.(json|mjs|js|txt)$/.test(f) && /TESTKEY/.test(fs.readFileSync(p, 'utf8')); });
ok('API keys are never written to disk', !leaked);
const r2 = await run(ARGS, ENV);
const cat2 = JSON.parse(fs.readFileSync(path.join(out, 'data/photos.json'), 'utf8')); ok('re-running never duplicates a photo (adds only new ones)', r2.status === 0 && new Set(cat2.photos.map(p => p.id)).size === cat2.photos.length && cat2.photos.length >= cat.photos.length, r2.stderr);
srv.close(); fs.rmSync(out, { recursive: true, force: true }); console.log(`\n${pass}/${pass + fail} passed`); process.exit(fail ? 1 : 0);
