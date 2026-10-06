#!/usr/bin/env node
/* Scrambles an API key so it is not readable in config.js. This is only a deterrent - anything a browser can use, a determined person can extract.
   For real protection use worker/photos-proxy.js. Usage: node tools/seal-key.js <key>   -> paste the output into CHITRA_CONFIG.sealedKeys.pixabay (etc.) */
const SEAL = 'chitra-studio', k = process.argv[2];
if (!k) { console.error('usage: node tools/seal-key.js <key>'); process.exit(1); }
console.log(Buffer.from(k.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ SEAL.charCodeAt(i % SEAL.length))).join(''), 'binary').toString('base64'));
