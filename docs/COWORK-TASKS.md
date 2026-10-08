# Tasks for Cowork (things the coding sandbox could not do)

**How to use this file.** Give it to Claude Cowork (or any teammate) that has **internet access, a real browser, and the owner's ComfyUI PC**. Each task is self-contained. When a task is finished, commit the result to the branch `claude/canva-like-image-editor-o9tdrh` of the repository `prasant793001-stack/CHITRA` (or send the files back), then tell the coding assistant "Cowork finished task N" and it will integrate and test.

**Why these tasks exist.** The coding sandbox has no access to Pixabay / Pexels / Unsplash / Iconify / Google / Stripe / jsDelivr model downloads, cannot reach the owner's PC (ComfyUI), and cannot see real phones. Everything below needs one of those.

**Hard rules (apply to every task)**
- **Never commit API keys, passwords or tokens.** Pass keys as environment variables for the command only. The repo is public.
- **No food, drink or edible imagery** anywhere (owner's rule; Z-Image makes bad dotted food images). Applies to generated photos, templates and graphics.
- Only licence-clean material: Pexels / Pixabay / Unsplash licences (commercial use OK), CC0, MIT, or images generated on the owner's own ComfyUI. Keep each photo's credit in the catalog entry (`credit` / `by` / `l`).
- Run `node tools/check.js`, `npx eslint .` and `node tests/run.js` (app served with `npx http-server -p 8123 -c-1 .`) before pushing; all must pass.

---

## Task 1 — Real product photos for the Photo mockup studio  (highest value)
**Goal.** 30–60 real "blank product" photos (white T-shirt, black/white hoodie, white mug, tote bag, poster frame on a wall, phone case, pillow, cap, notebook, water bottle) so customers can drop their design onto a real photo (Canva-style). The engine already exists (`photomock.js`); it needs photos + the print-area corners for each.

**Option A — stock photos (preferred).**
1. Get free API keys: Pexels (pexels.com/api) and Pixabay (pixabay.com/api/docs).
2. `PEXELS_KEY=… PIXABAY_KEY=… node tools/harvest-mockups.mjs --per 6` → downloads into `mockups/` and writes `data/mockups/index.json` (entries are marked `"review": true` with a *proposed* print area).
3. `node tools/mockup-sheet.mjs /tmp/m.png` and **look** at the sheet. For every photo: delete it if the product is not plain/blank, has text/logos, is cropped badly, is very low quality, or shows food/drink. Fix the `quad` (four corners `[x,y]` as fractions of the photo, order: top-left, top-right, bottom-right, bottom-left) so the sample design sits exactly on the printable area, following perspective and folds. For mugs set `curve` ≈ 1.2–1.8 (wrap), for flat items 0. Remove `"review": true` when happy. Re-run the sheet until all look believable.
4. Keep at least 3 photos per product kind.

**Option B — the owner's ComfyUI (Z-Image).** In the app: open the owner setup (press `Ctrl+Shift+K`, or tap the logo 7 times), enter `http://127.0.0.1:8188` as the ComfyUI address (start ComfyUI with `--enable-cors-header "*"`). Open *Elements → Mockups → Photo mockup*, choose a product chip, press **Make a blank product photo with AI** (try several seeds), drag the 4 purple corners onto the print area, adjust *Wrap / Ink / Fabric & light*, press **Save mockup**. When all are saved press **Export pack** → unzip the downloaded `chitra-mockup-pack.zip` into the repo root. Prompts to use (one per product, no text/logo, plain background): see `PRODUCTS` in `photomock.js` (last column).

**Deliverables.** `mockups/*.jpg` + thumbnails, `data/mockups/index.json`; a contact sheet PNG showing a sample design on every photo.
**Acceptance.** In the app → *Photo mockup* → "Ready-made photo mockups" lists them; clicking one loads it; a test design looks printed on the product (no floating rectangle, shadows/folds visible through the print, edges clean); total size of `mockups/` < 40 MB.

## Task 2 — Real photo catalog for the photographic templates
**Goal.** Fill `data/photos.json` + `photos/` so photographic templates work for every visitor (not only the owner's browser). The topic list and the "must match" regexes are in `data/photo-topics.json` (a photo is kept only if its own tags prove it matches).
**Steps.** `PIXABAY_KEY=… UNSPLASH_KEY=… node tools/harvest-photos.mjs --per 3 --unsplash-max 45` (Unsplash allows 50 requests/hour; re-run later for more). Then open the app and visually verify: for 40 random photographic templates the picture must match the words (pizza→pizza is NOT needed because food templates are skipped, but e.g. "Yoga" must show yoga). Delete mismatches from the catalog.
**Acceptance.** 400+ photos, each with credit; no food/drink photos used by any template; app tests pass.

## Task 3 — Verify the online features in a real browser (desktop Chrome + a phone)
Report each as PASS/FAIL with a screenshot and the browser console error if any.
1. **Background remover on real photos.** Use 10 varied photos (person with hair, pet with fur, product on white, product on busy background, logo/flag on white, glass). Press *Remove BG*. Expected: photos → clean AI cut with soft edges; flat graphics (flag, logo) → only the outer background is removed and inner white stays (toast offers "Keep white parts"). Compare against the standalone Cutout Studio site; list photos where ours is worse.
2. **Premium graphics** (Elements → Graphics → Premium, Elements → Stickers): search 15 words (including "India flag"); items must load as crisp coloured SVG and be placeable.
3. **AI Art**: 3 variations appear in the left panel, nothing goes on the canvas until clicked; with ComfyUI configured the local model is used (and for food words the cloud model is used instead).
4. **QR & barcode studio** (header "QR", Elements → QR & barcodes, Home tile): generate URL, WiFi, WhatsApp QR with a logo; *Add to my design* places it on the page.
5. **Photo mockup studio** with a real uploaded product photo: perspective, mug wrap, save/re-open, add to design, PNG download.
6. **Template thumbnails on a mid-range phone on mobile data**: time from opening the app to the first 8 template thumbnails being visible (target < 4 s), and whether scrolling stays smooth.

## Task 4 — Accounts and billing go-live (needs the owner's accounts)
Follow `docs/BACKEND.md` section *Subscription, trial and Google sign-in*: deploy `worker/api.js` on Cloudflare (free), create the KV namespace, set variables, create Stripe prices ($6.99/month, $69/year) and the webhook, create the Google OAuth web client, then set `apiUrl`, `googleClientId` and `gating: true` in `config.js`.
**Test in Stripe test mode:** new email → 7-day trial starts with no card; trial end → falls back to Free; checkout monthly and yearly; cancel from the Customer Portal → plan drops to Free; Google sign-in works on the live site. Report anything that fails.

## Task 5 — Design review against the real Canva
Open Canva and Chitra side by side (desktop + phone). For the 12 most common jobs (Instagram post, T-shirt design, mug wrap, flyer, invitation, presentation, business card, remove background, resize, export PNG/PDF, share for approval, mockup) list: steps and time in each tool, and what Chitra lacks. Rank the gaps by how often a print-shop owner would hit them. Attach screenshots.

## Task 6 — Windows app (optional, needs a Windows PC)
Wrap the site in Tauri (preferred, small) or Electron; make it work offline (fonts and the background-removal model are currently fetched from CDNs — bundle them: `@fontsource/*` packages for the fonts listed in `fonts.js`, and the `@imgly/background-removal` model files). Provide an installer and note the signing certificate needed to avoid SmartScreen warnings.

---

### Report-back template
```
Task N — PASS / PARTIAL / FAIL
What I did:
Files added/changed (paths):
Problems found (with screenshots / console errors):
Open questions for the owner:
```
