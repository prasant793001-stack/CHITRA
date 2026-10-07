# Real photos for the templates (Pixabay + Unsplash)

## 0. The simple way: Live mode (nothing to download)
If photo search already works in your app, the photographic templates build themselves from it:
1. Press **Ctrl+Shift+K** (or tap the logo 7 times) → **Owner setup**.
2. Paste your **Pixabay** key and your **Unsplash access key** (the 43-character one that starts with `_` or a letter - it is *not* the secret key). Pexels is optional.
3. Type a **passphrase** (6+ characters) and press **Save & lock keys**. Tick *Remember on this device* if you don't want to type it every visit.
4. A pill at the bottom says "Building your photo library 12/53". About a minute later ~1,000 photographic templates appear at the top of **Templates** (Home and the editor).

How it stays safe:
* Keys are **encrypted** (AES-256-GCM, key derived from your passphrase with PBKDF2, 250,000 rounds) before they touch the browser's storage. Nothing readable is left in localStorage, and the keys are never in the code or on GitHub.
* This protects against someone browsing your browser data or a copied profile. It cannot protect against a script running inside the page, and anyone with your passphrase on your own device can read them - so for a **public** app with many customers use the proxy below, where the keys never reach any browser.
* Photos are downloaded once and cached on the device (IndexedDB), so they work offline and the photo sites aren't hit on every visit. The library refreshes weekly (or run *Rebuild photo library* from the Ctrl+K search).
* Unsplash's rule of 50 API calls an hour is respected: if it runs out, the pill finishes with what it has and you can rebuild later.

## 1. Make the keys fully secret for everyone: the free Cloudflare proxy (10 minutes, no coding)
1. Create a free account at **cloudflare.com** → **Workers & Pages** → **Create** → **Create Worker** → name it `chitra-photos` → **Deploy**.
2. Click **Edit code**, delete what's there, paste the whole contents of `worker/photos-proxy.js` from this repo → **Deploy**.
3. Worker page → **Settings** → **Variables and Secrets** → **Add**, type **Secret**, for each: `PIXABAY_KEY`, `UNSPLASH_KEY` (and `PEXELS_KEY` if you have one). Add a plain **Text** variable `ALLOWED_ORIGIN` = `https://prasant793001-stack.github.io` (no trailing slash). Deploy again.
4. Copy the worker address (looks like `https://chitra-photos.YOURNAME.workers.dev`).
5. Put it in `config.js` as `photoProxy: 'https://chitra-photos.YOURNAME.workers.dev'` (this URL is public and harmless - it holds no keys), commit and push. Or paste it into the *Photo proxy URL* box in Owner setup to try it on your device first.
6. Now delete the keys from your browser (Owner setup → *Remove keys from this browser*). Every visitor gets photos through the proxy; no browser ever sees a key.

## 2. Optional: bundle photos into the repo (offline-first)

The photographic templates (`realtpl.js`) read a catalog of free-licence photos from `data/photos.json`. Until that file exists the app simply shows the graphic templates only. Build the catalog once, commit it, and ~1,000 photographic designs appear.

### 2a. Run the harvester on your own computer (2 minutes)
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

### 2b. Or let the assistant do it (network settings, step by step)
The cloud sandbox blocks most websites by default. To let it download photos:
1. In the Claude Code web session, click the **environment name in the title bar** (the cloud/environment menu at the top) → **Edit**.
2. Find **Network access**. Choose **Custom** (not "None"). Keep the option that allows the default list of package managers ticked.
3. Under **Allowed domains** add each of these on its own line: `pixabay.com`, `cdn.pixabay.com`, `api.unsplash.com`, `images.unsplash.com`, `api.pexels.com`, `images.pexels.com`.
4. **Save**. Start a **new message** in the session saying the domains are allowed; changes can take effect only for new commands.
5. Add your keys as **environment secrets/variables** in the same settings screen (`PIXABAY_KEY`, `UNSPLASH_KEY`) instead of pasting them in chat, so they stay out of the conversation.
Official steps: https://code.claude.com/docs/en/cloud-environments#network-access

## Live photo search inside the app (Elements → Photos / Graphics)
This uses the same two keys, but they must never ship in public code:
* **Best:** deploy `worker/photos-proxy.js` (docs/BACKEND.md) with `PIXABAY_KEY`, `PEXELS_KEY`, `UNSPLASH_KEY` as secrets and set `photoProxy` in `config.js`. Keys stay on the server.
* **Quick, owner only:** press `Ctrl+Shift+K` (or tap the logo 7 times), paste the keys. They are stored only in that browser.

Because the keys were pasted into a chat to get this set up, regenerate them when you can (Unsplash: your app page → regenerate keys).

## Licences in plain words
* Pixabay Content License: free commercial use, no attribution required, but you may not sell/redistribute the files on their own. Designs that *contain* them are fine.
* Unsplash License: free commercial use; the API guidelines require hot-linking, crediting the photographer and pinging the download endpoint (the app does this through your proxy/owner key when a template is used).
* Both are free but not "model-released" for every person shown: avoid using recognisable people in ads implying endorsement.
