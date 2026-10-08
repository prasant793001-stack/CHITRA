# Template spec (hand-made templates)

Hand-made templates are JSON files in `data/templates/`, listed in `data/templates/index.json` (`{"files":["starter.json", ...]}`). They are rendered by `tplspec.js`
and appear first in every template list. One *layout* + several *variants* (colour/font changes) = several templates.

```jsonc
{ "templates": [ {
  "id": "retro-sun-badge",            // kebab-case, unique across ALL files
  "name": "Retro Sun Badge",          // shown to users, <= 40 chars; variant name is appended ("· Grape")
  "cat": "tshirt",                    // mug tshirt social story pinterest poster flyer invite card cert menu youtube slides wallpaper merch sticker
  "product": "T-shirt front",         // exact product name (see list in the skill / app.js) – decides the page size
  "bg": "transparent",                // "$bg" | "#hex" | "transparent" (DTF/sticker art) | {"grad":["$a","$b"],"angle":180}
  "fonts": ["Bebas Neue","Poppins"],  // [display, body] — must exist in fonts.js
  "tags": ["retro","summer"],         // search words
  "theme": { "bg":"#fff","ink":"#111","a":"#f63","b":"#fc3","soft":"#ffe3c2" },   // colours referenced as "$ink", "$a" ...
  "variants": [ {"name":"Sunset"}, {"name":"Grape","theme":{"ink":"#2a0f55","a":"#8f2bff"}, "fonts":["Anton","Lato"]} ],
  "pro": false, "single": false,      // single:true = intentionally only one variant
  "layers": [ ... ]                   // painted in order, first = bottom
} ] }
```

Coordinates: `x,y,w,h` are fractions of the page width/height. Sizes (`size`, `sw`, `r`, `rx`, shadow `blur/x/y`) are fractions of the SHORT side of the page.
Colours: `"#hex"`, `"$theme"`, or `{"grad":["$a","$b"],"angle":0-360}` (0 = bottom→top, 90 = left→right, 180 = top→bottom).
Common optional fields on every layer: `opacity`, `rot` (degrees), `shadow:{x,y,blur,color}`, `blend` ("multiply", "screen", "overlay"…).

| `t` | fields |
|---|---|
| `rect` | `x y w h` or `full:true`, `fill`, `rx` (corner radius), `stroke`, `sw` |
| `ellipse` | `x y w h`, `fill`, `stroke`, `sw` |
| `line` | `x1 y1 x2 y2`, `stroke`, `sw`, `dash:[a,b]` |
| `poly` | `pts:[[x,y],...]` (page fractions), `fill`, `stroke`, `sw` |
| `star` | `x y` (centre), `r`, `n` points, `inner` (0-1), `fill`, `stroke`, `sw` |
| `text` | `text` (`\n` = line break), `x y w`, `size`, `font` ("d" display, "b" body, or a font name), `weight`, `italic`, `fill`, `align` left/center/right, `anchor:"c"` (x = centre), `lh` line-height, `ls` letter-spacing (em, e.g. 0.12), `upper`, `h` (max height: text shrinks to fit), `stroke`+`sw` |
| `graphic` | `name` (one of the built-in graphics: Blob, Waves, Half rings, Sunburst, Starburst badge, Scallop seal, Ribbon banner, Speech bubble, Arch frame, Double frame, Corner brackets, Laurel wreath, Flower, Leaf sprig, Rainbow cloud, Sparkles, Confetti, Halftone, Memphis set, Brush stroke, Curved arrow, Heart, Star, Lightning, Crown, Divider, Location pin, Price tag), `x y w` (width; height follows), `pal:[c1,c2,c3]` (gradients run c1→c2, c3 = accent) |
| `icon` | `name` (a Lucide icon in icons.js, e.g. "heart", "star", "phone", "mail", "map-pin", "instagram", "globe"), `x y`, `size`, `color`, `sw` |
| `slot` | `x y w h`, `label` — a dashed "your photo here" frame |
| `mock` | `x y w h`, `kind` (mug shirt hoodie tumbler bottle tote pillow case pad notebook poster coaster), `scene` (wood marble concrete linen sunlit kraft peach mint paper studio), `color`, `art` (0-9) — a realistic product picture |

Validate: `node tools/validate-templates.mjs [file.json]`. Look at it: `node tools/template-sheet.mjs out.png [file.json]` (needs the app served on :8123), then open the PNG.
