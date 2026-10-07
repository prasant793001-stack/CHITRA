# Launch checklist

**Done in code:** offline/PWA, accessibility basics, keyboard shortcuts, autosave + version history, print-ready exports (DTF, sublimation, PDF with bleed & crop marks), 2,000+ templates, accounts/sync/billing server (needs deploying), customer approval links, CI tests.

**You still need to do (not possible from code):**
1. Deploy the worker + Stripe (docs/BACKEND.md). Test a real payment in Stripe test mode.
2. Buy a domain (a short .com/.app) and point it at GitHub Pages; update `ALLOWED_ORIGIN` / `APP_URL`.
3. Have the legal pages in `legal/` reviewed by a lawyer (they are plain-language templates, not legal advice) and fill in your company details.
4. Rotate any API key that was ever pasted in a chat/public place; move all keys to the worker.
5. Commission or license ~150 hand-designed premium templates with real photography/illustration; keep the generator for the long tail.
6. Run a closed beta with 10-20 real customers on real phones; fix what they trip on.
7. Add analytics you are comfortable with (e.g. Plausible/Cloudflare Web Analytics) and an error tracker (e.g. Sentry).
8. Test on real devices: low-end Android, iPhone Safari, iPad, Windows/Mac Chrome & Safari. This sandbox only had Chromium.

## Bundled owner apps
- `studio/qr.html` is UDesign QR (tzprasantofficial-ai/U-DESIGN-QR-) with a small "Add to my design" bridge added at the end of the file; its libraries are vendored in `studio/vendor/` (qrcode-generator, JsBarcode, JSZip – all MIT). To update, copy the new index.html over it and re-add the block marked "Chitra Studio integration".
- The background remover uses the same engine and settings as Cutout Studio (aakritimarketing/-BG-Remover-): @imgly/background-removal 1.7.0, model `isnet_quint8`, processed at ~1280 px.
