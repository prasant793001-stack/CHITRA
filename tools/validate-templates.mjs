#!/usr/bin/env node
/* Validates hand-made template specs (data/templates/*.json). Usage: node tools/validate-templates.mjs [file.json ...]   (no args = every file in data/templates/index.json)
   Errors fail the run; warnings are design-quality hints (contrast, overflow, tiny text, off-page layers). */
import { fileURLToPath } from 'node:url'; import fs from 'node:fs'; import path from 'node:path';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const fonts = new Set([...rd('fonts.js').matchAll(/\['([^']+)', '(?:Sans|Serif|Display|Script|Handwriting|Mono|Arabic|Hindi)'/g)].map(m => m[1]));
const cats = new Set([...rd('templates.js').split('const CAT_LABEL = ')[1].split('};')[0].matchAll(/(\w+): '/g)].map(m => m[1]));
const app = rd('app.js'), prods = {};
for (const m of app.matchAll(/\bP\('[^']*', '[^']*', '[^']*', '([^']+)', (\d+), (\d+)/g)) prods[m[1]] = [+m[2], +m[3]];
for (const m of app.matchAll(/\binP\('[^']*', '[^']*', '[^']*', '([^']+)', ([\d.]+), ([\d.]+)(?:, (\d+))?/g)) { const d = +(m[4] || 300); prods[m[1]] = [Math.round(+m[2] * d), Math.round(+m[3] * d)]; }
for (const m of app.matchAll(/\bmmP\('[^']*', '[^']*', '[^']*', '([^']+)', ([\d.]+), ([\d.]+)(?:, (\d+))?/g)) { const d = +(m[4] || 300); prods[m[1]] = [Math.round(+m[2] / 25.4 * d), Math.round(+m[3] / 25.4 * d)]; }
const TYPES = new Set(['rect', 'ellipse', 'line', 'poly', 'star', 'text', 'graphic', 'icon', 'slot', 'mock']);
const hex = c => { c = String(c || ''); if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + [...c.slice(1)].map(x => x + x).join(''); return /^#[0-9a-f]{6}$/i.test(c) ? c : null; };
const lum = c => { const n = parseInt(c.slice(1), 16), f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const files = process.argv.length > 2 ? process.argv.slice(2) : JSON.parse(rd('data/templates/index.json')).files.map(f => 'data/templates/' + f);
let errs = 0, warns = 0, count = 0; const E = (id, m) => { errs++; console.error(`ERROR  ${id}: ${m}`); }, Wn = (id, m) => { warns++; console.warn(`warn   ${id}: ${m}`); };
const seen = new Set();
for (const f of files) {
  let j; try { j = JSON.parse(rd(f)); } catch (e) { E(f, 'invalid JSON: ' + e.message); continue; }
  for (const t of j.templates || []) {
    const id = t.id || '(no id)'; count++;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) E(id, 'id must be kebab-case'); if (seen.has(id)) E(id, 'duplicate id'); seen.add(id);
    if (!t.name || t.name.length > 40) E(id, 'name required (<= 40 chars)'); if (!cats.has(t.cat)) E(id, `unknown cat "${t.cat}" (use one of: ${[...cats].join(', ')})`);
    const dim = prods[t.product]; if (!dim) { E(id, `unknown product "${t.product}"`); continue; } const [PW, PH] = dim, k = Math.min(PW, PH);
    const fs0 = t.fonts || []; if (fs0.length !== 2 || fs0.some(x => !fonts.has(x))) E(id, `fonts must be [display, body] from the font library; got ${JSON.stringify(fs0)}`);
    const vars = t.variants && t.variants.length ? t.variants : [{}]; if (vars.length < 3 && !t.single) Wn(id, 'give each layout 3-6 colour variants (or set "single": true)');
    vars.forEach((v, vi) => {
      const th = { bg: '#ffffff', ink: '#111111', a: '#6d4aff', b: '#ffb703', soft: '#efeaff', alt: '#f6f3ff', ...(t.theme || {}), ...(v.theme || {}) }, res = x => (typeof x === 'string' && x[0] === '$' ? th[x.slice(1)] : x), tag = `${id}#${vi + 1}`;
      for (const [kk, vv] of Object.entries(th)) if (!hex(vv)) E(tag, `theme.${kk} must be a #hex colour (got ${vv})`);
      if (v.fonts && v.fonts.some(x => !fonts.has(x))) E(tag, 'variant fonts not in the font library');
      const bg = hex(res(typeof t.bg === 'string' && t.bg !== 'transparent' ? t.bg : '$bg')) || th.bg;
      const boxes = []; // solid fills painted so far, to know what colour text sits on
      (t.layers || []).forEach((L, li) => {
        const lt = `${tag} layer ${li + 1} (${L.t})`; if (!TYPES.has(L.t)) { E(lt, 'unknown layer type'); return; }
        for (const kk of ['x', 'y', 'w', 'h', 'x1', 'y1', 'x2', 'y2']) if (L[kk] != null && (typeof L[kk] !== 'number' || L[kk] < -0.5 || L[kk] > 1.6)) E(lt, `${kk} must be a fraction of the page (got ${L[kk]})`);
        if (L.t === 'rect' || L.t === 'ellipse') { const fl = typeof L.fill === 'string' ? hex(res(L.fill)) : null; if (fl && (L.opacity ?? 1) >= 0.9) boxes.push({ x: L.full ? 0 : L.x ?? 0, y: L.full ? 0 : L.y ?? 0, w: L.full ? 1 : L.w ?? 0, h: L.full ? 1 : L.h ?? 0, c: fl }); }
        if (L.t === 'text') {
          const size = (L.size ?? 0.06), txt = String(L.text ?? ''); if (!txt) E(lt, 'empty text'); if (size < 0.012) E(lt, `text too small (${size})`); else if (size < 0.022) Wn(lt, 'text may be too small to read when printed');
          const fam = res(L.font) === 'b' ? 1 : 0; void fam; const w = (L.w ?? 0.8), colr = hex(res(L.fill ?? '$ink')); if (!(L.w > 0)) Wn(lt, 'give text a width "w"');
          const pxSize = size * k, lines = String(L.upper ? txt.toUpperCase() : txt).split('\n').reduce((s, ln) => s + Math.max(1, Math.ceil((ln.length * pxSize * (L.upper ? 0.66 : 0.54)) / (w * PW))), 0), bottom = ((L.y ?? 0) * PH + lines * pxSize * (L.lh ?? 1.12));
          if (!L.h && bottom > PH * 1.0) Wn(lt, `text probably runs off the bottom of the page (≈${lines} lines)`); if (L.h && lines * pxSize * (L.lh ?? 1.12) > L.h * PH * 1.6) Wn(lt, 'text looks too long for its box h (it will shrink to fit)');
          if (colr) { const cx = ((L.anchor === 'c' ? L.x : (L.x ?? 0) + (L.w ?? 0.3) / 2)), cy = (L.y ?? 0) + size * 0.6; let under = bg; for (const b of boxes) if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) under = b.c; const r = ratio(colr, under), need = size < 0.04 ? 4.5 : 3; if (r < need) Wn(lt, `low contrast ${r.toFixed(1)}:1 on ${under} (want ≥ ${need})`); }
        }
        if (L.t === 'graphic' && !L.name) E(lt, 'graphic needs "name"'); if (L.t === 'icon' && !L.name) E(lt, 'icon needs "name"');
      });
      if ((t.layers || []).length < 4) Wn(tag, 'very few layers — add depth (shapes, graphics, accents) so it looks designed');
      if (!(t.layers || []).some(L => L.t === 'text')) Wn(tag, 'no text layer');
    });
  }
}
console.log(`\n${count} layout(s) checked, ${errs} error(s), ${warns} warning(s)`); process.exit(errs ? 1 : 0);
