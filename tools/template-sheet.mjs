#!/usr/bin/env node
/* Renders a contact sheet PNG of hand-made templates so a human (or an AI agent) can LOOK at them.
   Usage: node tools/template-sheet.mjs <out.png> [file.json ...]   (needs the app served on http://localhost:8123 and Playwright) */
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp/template-sheet.png', files = process.argv.slice(3), BASE = process.env.BASE || 'http://localhost:8123/';
import { execFileSync } from 'node:child_process';
/* real fonts offline: @fontsource packages from npm are cached in FONT_CACHE and served to the page, so the sheet looks like the real app */
const FC = process.env.FONT_CACHE || '/tmp/fontcache'; fs.mkdirSync(FC, { recursive: true });
const slug = n => n.toLowerCase().replace(/\s+/g, '-');
function fontFiles(name) { // -> [{weight, file}]
  const dir = path.join(FC, slug(name)); if (!fs.existsSync(path.join(dir, 'package'))) { try { fs.mkdirSync(dir, { recursive: true }); execFileSync('npm', ['pack', `@fontsource/${slug(name)}`, '--pack-destination', dir], { cwd: dir, stdio: 'ignore' }); const tgz = fs.readdirSync(dir).find(x => x.endsWith('.tgz')); if (tgz) execFileSync('tar', ['xzf', tgz], { cwd: dir }); } catch { } }
  const fd = path.join(dir, 'package', 'files'); if (!fs.existsSync(fd)) return []; const out = [];
  for (const w of [400, 600, 700, 800, 900]) { const f = fs.readdirSync(fd).find(x => x === `${slug(name)}-latin-${w}-normal.woff2`); if (f) out.push({ weight: w, file: path.join(fd, f) }); }
  if (!out.length) { const f = fs.readdirSync(fd).find(x => /latin-\d+-normal\.woff2$/.test(x)); if (f) out.push({ weight: +f.match(/latin-(\d+)/)[1], file: path.join(fd, f) }); } return out;
}
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } });
const served = {}; await p.route(/fonts\.(googleapis|gstatic)|jsdelivr|staticimgly/, r => r.abort()); await p.route('http://fonts.local/**', r => { const f = served[new URL(r.request().url()).pathname.slice(1)]; f ? r.fulfill({ body: fs.readFileSync(f), contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' } }) : r.abort(); }); await p.addInitScript(() => localStorage.setItem('chitra.tour', '1'));
p.on('pageerror', e => console.error('page error:', e.message));
await p.goto(BASE + '?nosplash'); await p.waitForTimeout(2500);
let ids; if (files.length) { ids = await p.evaluate(async fs0 => { const before = new Set(Object.keys(chitra.TEMPLATE_META)); for (const f of fs0) { const j = await (await fetch('data/templates/' + f.replace(/^.*\//, ''), { cache: 'no-store' })).json(); (j.templates || []).forEach(chitra.registerTemplateSpec); } return Object.keys(chitra.TEMPLATE_META).filter(id => id.startsWith('tp-')); }, files); }
else ids = await p.evaluate(() => Object.keys(chitra.TEMPLATE_META).filter(id => chitra.TEMPLATE_META[id].hand));
if (!ids.length) { console.error('no hand-made templates found'); process.exit(1); }
const need = await p.evaluate(ids0 => [...new Set(ids0.flatMap(id => chitra.TEMPLATE_META[id].f))], ids); let css = '';
for (const n of need) for (const { weight, file } of fontFiles(n)) { const key = `${slug(n)}-${weight}.woff2`; served[key] = file; css += `@font-face{font-family:"${n}";font-weight:${weight};src:url(http://fonts.local/${key}) format("woff2")}`; }
await p.addStyleTag({ content: css || '/* no fonts */' }); await p.evaluate(async n => { for (const w of [400, 600, 700, 800, 900]) await Promise.all(n.map(f => document.fonts.load(`${w} 40px "${f}"`).catch(() => 0))); }, need);
const urls = await p.evaluate(async ids0 => { const o = []; for (const id of ids0) { await chitra.ensureTpl(id, 'thumb'); const m = chitra.TEMPLATE_META[id]; let u = null; try { u = chitra.renderTemplateThumb(id, chitra.productByName(m.p), 420); } catch (e) { u = null; } o.push({ id, n: m.n, u }); } return o; }, ids);
const html = `<body style="margin:0;padding:10px;background:#e9e9ef;font:12px system-ui;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start">${urls.map(x => `<figure style="margin:0;width:300px">${x.u ? `<img src="${x.u}" style="width:300px;display:block;box-shadow:0 1px 6px #0003">` : '<div style="height:200px;background:#fbb">RENDER FAILED</div>'}<figcaption style="padding:3px 0;color:#333">${x.id}<br><b>${x.n}</b></figcaption></figure>`).join('')}</body>`;
await p.setContent(html); await p.waitForTimeout(600); await p.screenshot({ path: out, fullPage: true }); console.log('wrote', out, urls.length, 'templates'); await b.close();
