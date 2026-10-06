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
