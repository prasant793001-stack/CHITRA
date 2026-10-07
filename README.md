# Chitra Studio

A fun, punchy design editor for **DTF transfers** and **sublimation** (mugs, tumblers, coasters…). Runs in the browser (Fabric.js, no build step).

Run: `python3 -m http.server 8000` and open http://localhost:8000 (needs internet once for the Google Fonts).

## Print features
- Product presets at 300 DPI: T-shirt front/back/kids/left chest, 22 in DTF gang sheets, 11/15 oz mug wraps, tumbler, coaster, mouse pad (verify against your own blank/printer templates).
- Transparent background (default) with checkerboard preview — export as transparent PNG for DTF.
- Print guides: 1/8 in safe margin, shirt centre line, mug front-centre + handle zones.
- **Mirror** export for sublimation; exported files are stamped with 300 DPI.
- Image DPI check ("print ready" / "may print soft"), **Remove white** background slider.
- Gang sheets: **Pack onto sheet** auto-arranges designs, **Make copies** duplicates a design N times.
- Changing the product size scales your artwork to fit.

## New in the Studio redesign
Dark glass UI with animated gradients · welcome product picker · **Mockup preview** (shirt/mug, any colour, save as image) · **Magic cut-out** (remove photo background) · **Arch/curved text** · gradient fills · palettes, *Shuffle colours*, *Surprise me*, *Sparkle burst*, sticker outline · floating toolbar on selection · drag-to-reorder **Layers** · **Fill sheet** + sheet-usage meter · preview transparent designs on any shirt colour · **Ctrl/⌘+K command palette** · confetti.

## Home, projects & print layouts (new)
- **Splash (3-2-1)** then a **Canva-style Home**: search, quick-create shortcuts, *Jump back in* (all your saved designs with thumbnails — rename / duplicate / delete), **Print layouts**, **Templates** (23, by category) and **Trending** (reads `community.json`; point `communityFeed` in `config.js` at your server for real community content).
- **Print layouts**: A4/A3 sheets with *virtual print areas* sized exactly for the product (11 oz & 15 oz mugs, tumbler, coaster, T-shirt, pocket/left-chest, phone case, mouse pad, stickers). Drop a photo in and it auto-fits (cover/contain); *Copy to all areas*; guides are hidden on export. Add your own areas (any size) and **save any page as a reusable layout**.
- **Plans / subscriptions**: `config.js` holds plans, prices and a `checkoutUrl`. Real billing needs a backend (accounts + Stripe/Razorpay + licence check) — the UI is ready, `gating` is off by default.
- Theme: orange · purple · yellow.

## Phone editing (Canva-style)
- **Pinch / twist with two fingers on a selected item** scales and rotates *that item* (with magnetic 45° snapping); with nothing selected, pinch zooms the page and one finger on empty space pans it.
- Pick a tool from the bottom bar → the panel **closes as soon as you add something**, and a compact **context bar** (Font, Colour, Outline, Effects, Position, Copy, Delete — or photo tools for images) takes its place. Tap a tool to open just that control in a small sheet; tap the canvas to close it.
- Autosaves to your browser (IndexedDB) and restores on return; ⋯ menu has New / Layers / Mockup / Save / Open.
- Performance: heavy blur/animation effects are switched off on phones, undo history stores images once, exports are capped to what phones can render (16 MP).

## Phone & install
Works on phones/tablets: bottom tool bar, tool and property sheets that slide up, pinch-to-zoom. It is a **PWA** — host it on any HTTPS site (GitHub Pages, Netlify…), then "Add to Home Screen" (Android/iOS) or "Install" (desktop Chrome/Edge) and it opens like an app, with offline support for the editor itself.

## Canva-style documents
- **60+ sizes**: A0–A6, Letter/Legal/Tabloid, posters & photo sizes, business card, flyer, invitation, certificate, menu, social posts/stories/covers, YouTube, presentations, plus DTF/sublimation products. Search or browse by category.
- **Custom size** in inches / mm / cm / px at 72–300 DPI, **portrait ⇄ landscape** swap, artwork rescales when you change size.
- **Multi-page designs** with a page strip (add / duplicate / delete) and **PDF export at true paper size** (all pages).
- 8 new templates (poster, flyer, business card, invitation, certificate, menu, quote, sale) that adapt to any size; 10 mm safe-area guide on paper.

## Pro photo tools
- **Photos tab** – search free stock photos: Openverse (no key) or Pixabay / Pexels / Unsplash (free API key, pasted once and stored only in your browser).
- **AI Art tab** – text-to-image via the free Pollinations service, optional auto background removal.
- **Remove background** (in-browser AI model, quick fallback), **Magic fix**, **Enhance 2×** (upscale + sharpen), **Refine edges** brush, **die-cut sticker outline**, crop ratios, shape frames, 9 adjust sliders (incl. vibrance, temperature, hue, sharpness), 12 filters.
- **Photoreal mockups** – lit & wrinkled tee, cylinder-wrapped mug, scene backdrops (even stock photos), or drop the design onto your own blank-product photo.
- Smart snapping guides, group / ungroup, eyedropper, brand colours, gradient backdrops, 6 more shapes.

Online features need internet. Always check each photo's licence before selling products with it.

## Creative features
Punchy text styles, fun fonts, stickers, shapes, colour swatches, quick-start templates, filters, layers, undo/redo, save/open projects, PNG/JPG export.

## Look, Elements & fonts (v3)
- Bright white / yellow / orange / green theme with Lucide (ISC) line icons everywhere - no emoji icons.
- **Elements** works like Canva: Shapes, Graphics (stock cut-outs), Photos, Mockups, Effects, Icons (1,500+ searchable), Stickers, Backdrops.
- **One click** selects/moves/resizes; **double-click / double-tap** edits (text, colours, photo options).
- **Fonts** open a full showcase: default styles, ready-made font combinations, and every font previewed in its own typeface.

## Photo search & API keys
Photo sources are merged into one list (no site picker); the source is stored on each placed image and written to a `*-credits.txt` "thank you" file when you export.
**Keys can never be made truly uncrackable in a browser app** - anything the browser sends can be read in DevTools. Safest setup:
1. Deploy `worker/photos-proxy.js` as a free Cloudflare Worker, add `PIXABAY_KEY` / `PEXELS_KEY` (and `ALLOWED_ORIGIN`) as secrets.
2. Put the worker URL in `config.js` as `photoProxy`. The keys then never reach the browser.
Never commit raw keys to this public repo (`tools/seal-key.js` only scrambles them - a deterrent, not security). Owner-only key screen: `Ctrl+Shift+K` or tap the logo 7 times (keys stay in your own browser only).

## Template library (v4)
`templates.js` generates ~2,000 designs (mugs, tees, social posts, stories, posters, flyers, invitations, cards, certificates, menus, YouTube, slides, Pinterest, wallpapers, merch, stickers) from hand-built layouts x palettes x font pairs x copy. Nothing is stored - each one is a tiny recipe that draws itself, and thumbnails render lazily. Add copy to the lists at the top of `templates.js`, or a new layout in `LAY`, to grow the library.

## Quality, tests and backend (v5)
- `npm test` runs: browser regression suite (desktop + phone), worker unit tests (accounts, cloud saves, Stripe webhook, approval links) and a real-browser-to-worker end-to-end test. `npm run check` / `npm run lint` catch syntax and undefined-variable bugs. CI runs everything on every push.
- New: Magic Resize, version history, Brand kit, "describe it" template finder, send-to-print (WhatsApp/email/share), PDF crop marks + 3 mm bleed, customer approval links, photo-frame templates, first-run tour, keyboard shortcuts (press `?`), accessibility pass, offline banner.
- Backend setup: `docs/BACKEND.md`. Launch checklist: `docs/LAUNCH.md`.

## Real photos (v6)
~1,000 photographic templates + realistic product previews (mug / tee / tumbler / tote / mouse pad / phone case) in the template grid. Photos come from a catalog you build once with `tools/harvest-photos.mjs` - see **docs/PHOTOS.md**. Easiest: *Live mode* - enter your keys once in Owner setup (Ctrl+Shift+K); they are stored encrypted and the app builds the photo library itself.
