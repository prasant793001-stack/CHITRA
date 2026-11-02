# Chitra local bridge (owner only)

Lets **your** Chitra (the browser holding your owner keys) search and import pictures from **Creator Downloader / Pinterest** without leaving the app.
Customers never see it: the address lives only in your encrypted owner settings, and the server only listens on `127.0.0.1` of your PC.

## Start (Windows)
1. Install Node.js 18+ (nodejs.org).
2. Copy `bridge.config.sample.json` to `bridge.config.json` and set `folder` to the folder Creator Downloader saves into.
3. Double-click `start-bridge.bat` (or run `node server.mjs`). Keep the window open.
4. In Chitra: `Ctrl+Shift+K` (owner setup) → **downloader bridge address** → `http://127.0.0.1:8787` → Save.
5. Elements → Photos → search anything: your downloaded Pinterest pictures matching the words appear first, then the online libraries.
If the bridge is not running Chitra shows a "Please start …" box and waits up to 3 minutes for you to start it.

## Fresh Pinterest downloads on demand
`provider: "command"` runs your downloader's command line for each new search word (`{q}` = word, `{out}` = folder). The Cowork task in `docs/COWORK-TASKS.md` (Task 7) finds the real command / API of Creator Downloader.
