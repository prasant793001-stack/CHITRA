/* Copies the web app (repo root) into desktop/app so the installer ships it. Run before building: node prepare.js
 * Leaves out what the app never loads: tests, tools, docs, the desktop folder itself, dev config and node_modules. */
const fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..'), dest = path.join(__dirname, 'app');
const SKIP = new Set(['desktop', 'tests', 'tools', 'docs', 'node_modules', 'worker', '.git', '.github', 'package.json', 'package-lock.json', 'eslint.config.js', 'wrangler.toml', 'README.md', 'sw.js']);
fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest);
let files = 0, bytes = 0;
const copy = (from, to) => { for (const e of fs.readdirSync(from, { withFileTypes: true })) { if (e.name.startsWith('.')) continue; const a = path.join(from, e.name), b = path.join(to, e.name); if (e.isDirectory()) { fs.mkdirSync(b); copy(a, b); } else { fs.copyFileSync(a, b); files++; bytes += fs.statSync(a).size; } } };
for (const e of fs.readdirSync(root, { withFileTypes: true })) { if (SKIP.has(e.name) || e.name.startsWith('.')) continue; const a = path.join(root, e.name), b = path.join(dest, e.name); if (e.isDirectory()) { fs.mkdirSync(b); copy(a, b); } else { fs.copyFileSync(a, b); files++; bytes += fs.statSync(a).size; } }
if (!fs.existsSync(path.join(dest, 'index.html'))) { console.error('index.html missing — run from the repo checkout'); process.exit(1); }
console.log(`app copied: ${files} files, ${(bytes / 1e6).toFixed(1)} MB`);
