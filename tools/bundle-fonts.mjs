#!/usr/bin/env node
/* Bundles every font Chitra uses into fonts/ so text renders correctly with no internet (desktop app, offline PWA, blocked Google Fonts).
 *   node tools/bundle-fonts.mjs            (needs npm registry access; fonts are SIL OFL / Apache, from the @fontsource packages)
 * Collects family names from fonts.js (the font library), index.html (the interface fonts) and data/templates (fonts templates use),
 * downloads @fontsource/<family>, keeps the latin, latin-ext, arabic and devanagari subsets in weights 400 and 700 (plus the interface weights),
 * and writes fonts/<pkg>/*.woff2, fonts/<pkg>.css and fonts/index.json ({ "Family Name": "pkg" }) that fonts.js reads. */
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process'; import { fileURLToPath } from 'node:url'; import os from 'node:os';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), out = path.join(root, 'fonts'), rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const SUBSETS = new Set(['latin', 'latin-ext', 'arabic', 'devanagari']);
const SYSTEM = new Set(['All', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 'Courier New', 'Impact', 'Tahoma', 'Trebuchet MS', 'sans-serif', 'serif', 'monospace', 'system-ui', 'cursive']);

const families = new Map(); // name -> Set of weights
const want = (name, weights = [400, 700]) => { name = name.trim(); if (!name || SYSTEM.has(name)) return; const s = families.get(name) || new Set(); weights.forEach(w => s.add(+w)); families.set(name, s); };
for (const m of rd('fonts.js').matchAll(/\['([^']+)', '(?:Sans|Serif|Display|Script|Handwriting|Mono|Arabic|Hindi)'/g)) want(m[1]);
for (const n of ((rd('index.html').match(/<!-- ui-fonts: ([^>]+) -->/) || ['', ''])[1]).split(',')) want(n, [400, 500, 600, 700, 800]); // interface fonts: every weight the UI uses
const scan = dir => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) scan(p); else if (/\.(json|js)$/.test(f)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/fontFamily["']?\s*:\s*["']([^"',]+)/g)) want(m[1]); } };
scan(path.join(root, 'data/templates')); for (const f of ['templates.js', 'realtpl.js', 'mocktpl.js', 'tplspec.js', 'layouts.js', 'app.js']) if (fs.existsSync(path.join(root, f))) for (const m of rd(f).matchAll(/fontFamily\s*:\s*['"]([^'",]+)/g)) want(m[1]);

const pkgOf = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'chitra-fonts-')); fs.mkdirSync(out, { recursive: true });
const index = {}, missing = [], licences = []; let bytes = 0;
for (const [name, weights] of [...families].sort()) {
  const pkg = pkgOf(name), dir = path.join(tmp, pkg);
  try {
    fs.mkdirSync(dir, { recursive: true });
    const tgz = execFileSync('npm', ['pack', `@fontsource/${pkg}`, '--silent', '--pack-destination', dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n').pop();
    execFileSync('tar', ['-xzf', path.join(dir, tgz), '-C', dir]);
    const p = path.join(dir, 'package'), avail = fs.readdirSync(p).filter(f => /^\d{3}\.css$/.test(f)).map(f => +f.slice(0, 3));
    const use = [...weights].map(w => avail.includes(w) ? w : avail.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a, avail[0])).filter((w, i, a) => a.indexOf(w) === i);
    let css = ''; fs.mkdirSync(path.join(out, pkg), { recursive: true });
    for (const w of use) {
      for (const block of fs.readFileSync(path.join(p, `${w}.css`), 'utf8').split('}').map(b => b.trim()).filter(b => b.includes('@font-face'))) {
        const file = (block.match(/url\(\.\/files\/([^)]+\.woff2)\)/) || [])[1]; if (!file || !file.endsWith(`-${w}-normal.woff2`) || !file.startsWith(`${pkg}-`)) continue; // files/<pkg>-<subset>-<weight>-normal.woff2
        const subset = file.slice(pkg.length + 1, -`-${w}-normal.woff2`.length); if (!SUBSETS.has(subset)) continue;
        fs.copyFileSync(path.join(p, 'files', file), path.join(out, pkg, file)); bytes += fs.statSync(path.join(out, pkg, file)).size;
        const range = (block.match(/unicode-range:\s*([^;]+);/) || [])[1];
        css += `@font-face{font-family:'${name}';font-style:normal;font-display:swap;font-weight:${w};src:url(${pkg}/${file}) format('woff2');${range ? `unicode-range:${range};` : ''}}\n`;
      }
    }
    if (!css) throw new Error('no usable subset');
    fs.writeFileSync(path.join(out, `${pkg}.css`), css); index[name] = pkg; { const pj = JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf8')); licences.push(`| ${name} | ${pj.license || 'see package'} | @fontsource/${pkg} ${pj.version} |`); }
  } catch (e) { missing.push(`${name} (${e.message.split('\n')[0].slice(0, 60)})`); }
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
fs.writeFileSync(path.join(out, 'LICENSES.md'), `# Bundled fonts\n\nEach family keeps its own licence (SIL Open Font License 1.1 or Apache 2.0), which allows bundling and redistribution with software. Files come from the @fontsource npm packages; full licence texts are in those packages.\n\n| Family | Licence | Source |\n| --- | --- | --- |\n${licences.sort().join('\n')}\n`);
// the interface fonts index.html needs at start-up, in one stylesheet
const ui = [...(rd('index.html').match(/<!-- ui-fonts: ([^>]+) -->/) || ['', ''])[1].split(',')].map(x => x.trim()).filter(x => index[x]);
fs.writeFileSync(path.join(out, 'ui.css'), ui.map(n => fs.readFileSync(path.join(out, `${index[n]}.css`), 'utf8')).join('')); fs.rmSync(tmp, { recursive: true, force: true });
console.log(`bundled ${Object.keys(index).length} families, ${(bytes / 1e6).toFixed(1)} MB` + (missing.length ? `\nnot on npm (left to Google Fonts): ${missing.join(', ')}` : ''));
