# Real photos for the templates (Pixabay + Unsplash)

The photographic templates (`realtpl.js`) read a catalog of free-licence photos from `data/photos.json`. Until that file exists the app simply shows the graphic templates only. Build the catalog once, commit it, and ~1,000 photographic designs appear.

## Easiest: run the harvester on your own computer (2 minutes)
You need Node 20+ (and optionally Python + Pillow, or `npm i sharp`, for smaller image files).

```bash
git pull
# macOS / Linux
PIXABAY_KEY=your_pixabay_key UNSPLASH_KEY=your_unsplash_access_key node tools/harvest-photos.mjs
# Windows PowerShell
$env:PIXABAY_KEY="your_pixabay_key"; $env:UNSPLASH_KEY="your_unsplash_access_key"; node tools/harvest-photos.mjs

git add photos data && git commit -m "Add photo catalog" && git push
```
* Keys are read from the environment only and are **never written to any file**. Do not paste them into `config.js` or commit them.
* Pixabay photos are downloaded and resized (1100 px + 420 px thumbnail) into `photos/` - Pixabay's terms don't allow hot-linking.
* Unsplash photos are **not** downloaded: the catalog stores their id, credit and URL and the app hot-links them (Unsplash's terms require this, plus credit - the app adds both to the "Thank-you credits" file). Demo Unsplash apps are limited to 50 requests/hour, so run the command again an hour later to add more (it never duplicates).
* More photos per topic: `--per 5`. Fewer topics for a quick test: `--topics 10`.
* Roughly 330 Pixabay photos ≈ 40-50 MB in `photos/`. That's fine for GitHub Pages.

## Or let the assistant do it
The cloud sandbox must be allowed to reach `pixabay.com`, `cdn.pixabay.com`, `api.unsplash.com` and `images.unsplash.com` (environment settings → Network access → Custom → add these domains). Then ask for the harvest to be run.

## Live photo search inside the app (Elements → Photos / Graphics)
This uses the same two keys, but they must never ship in public code:
* **Best:** deploy `worker/photos-proxy.js` (docs/BACKEND.md) with `PIXABAY_KEY`, `PEXELS_KEY`, `UNSPLASH_KEY` as secrets and set `photoProxy` in `config.js`. Keys stay on the server.
* **Quick, owner only:** press `Ctrl+Shift+K` (or tap the logo 7 times), paste the keys. They are stored only in that browser.

Because the keys were pasted into a chat to get this set up, regenerate them when you can (Unsplash: your app page → regenerate keys).

## Licences in plain words
* Pixabay Content License: free commercial use, no attribution required, but you may not sell/redistribute the files on their own. Designs that *contain* them are fine.
* Unsplash License: free commercial use; the API guidelines require hot-linking, crediting the photographer and pinging the download endpoint (the app does this through your proxy/owner key when a template is used).
* Both are free but not "model-released" for every person shown: avoid using recognisable people in ads implying endorsement.
