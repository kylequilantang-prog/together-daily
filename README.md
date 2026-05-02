# Together, Daily

> *Two people, one rhythm. The wedding is a milestone the system passes through — not the thing it serves.*

A private, offline-friendly habit dashboard for Kyle and Jyselle on the way to **September 22, 2027 in Andalusia, Spain**.

It's a single static site — vanilla HTML, CSS, and JavaScript with no build step, no backend, and no dependencies — that you open on your phone and check things off. Data lives in the browser. Nothing is shared, synced, or sent anywhere.

---

## Philosophy

This isn't a fitness app. It's a **system**, in the Scott Adams / James Clear sense:

- **Systems over goals.** You don't try to lose 30 lbs. You become someone who moves daily. The body shape is a side effect.
- **The 10-minute floor.** Every day, no matter what — a 10-minute walk. The thing you cannot fail at.
- **Never miss twice.** Missing once is life. Missing twice is the start of quitting.
- **Phase 1 = install.** First six weeks, just show up. Don't optimize. Don't push.
- **Identity over outcome.** "I'm someone who walks daily" — not "I want to lose 30 lbs."

The dashboard tracks **behaviors**, not outcomes. There is no weight tracking, no calorie tracking, no metrics. By design.

---

## Screenshots

> Add screenshots here once the site is deployed:
> - `docs/screenshot-today.png` — the daily check-in panel
> - `docs/screenshot-week.png` — the week strip with the streak
> - `docs/screenshot-system.png` — the seven principles + weekly plan
> - `docs/screenshot-mobile.png` — iPhone home-screen install

---

## How to use it

### Daily flow (~30 seconds)

1. Open the dashboard on your phone.
2. Read the **why block** at the top. Especially on hard days.
3. Tap your name's tab (Kyle or Jyselle).
4. Check things off as you do them. The **floor** check is the only one that matters for the streak.
5. On Mon and Thu, the strength session appears inline below the day's stack — check off each exercise as you go.

### Sunday review (~5 minutes)

At the bottom of your dashboard there's a **Sunday Review** section with three textareas:

1. *What worked this week?*
2. *What broke down? (no blame — just data)*
3. *One small tweak for next week.*

Write a sentence or two for each. Save happens automatically when you tap out of the field.

### The export ritual (weekly)

Open the **Data tab → Download backup**. Drop the file in iCloud or your Notion Memory Library. The dashboard will nudge you in the Data tab if more than 30 days have passed since your last export.

---

## How to deploy (GitHub Pages)

This is a static site. It's already configured to be served as-is.

1. Create a new repo on GitHub named `together-daily`.
2. From this directory:
   ```bash
   git remote add origin git@github.com:<your-username>/together-daily.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Under *Source*, select **Deploy from a branch**, choose `main` and `/ (root)`. Save.
4. Within ~1 minute, the site will be live at `https://<your-username>.github.io/together-daily/`.

That's it. There's no build, no CI, no Action — just files served directly. Any push to `main` deploys.

> Tip: a custom domain (e.g. `system.kylequilantang.com`) is a one-line CNAME away. See GitHub's [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## Add to home screen

### iOS (iPhone, iPad)

1. Open the deployed URL in **Safari** (not Chrome — Chrome on iOS doesn't install PWAs).
2. Tap the **Share** button.
3. Scroll down → **Add to Home Screen**.
4. The icon appears on your home screen. Opens full-screen, no browser chrome.

### Android

1. Open the deployed URL in Chrome.
2. Tap the menu (three dots) → **Install app** (or *Add to Home screen*).
3. Confirm.

The site sets `display: standalone` in `manifest.json`, so it opens as a real app: no URL bar, custom theme color, splash screen built from the icon.

---

## How the data works

### Storage scope

Everything is stored in your browser's **`localStorage`** under a single key: `kyle_jyselle_system_v1`. That means:

- **Per-device, per-browser.** Kyle's iPhone, Jyselle's iPhone, your laptop — each has its own independent record.
- **Nothing leaves the device.** No server, no sync, no analytics, no telemetry.
- **Clearing browser data wipes it.** This is why the export ritual exists.

### Export format

The export is a single human-readable JSON file with this shape (top-level keys; trimmed for clarity):

```jsonc
{
  "version": 1,
  "created": "2026-05-01T...",
  "kyle":    { "2026-05-01": { "walk_10am": true, "walk_3pm": true, ... }, ... },
  "jyselle": { "2026-05-01": { "walk_10am": true, ... }, ... },
  "review": {
    "kyle":    { "2026-04-27": { "worked": "...", "broke": "...", "tweak": "..." } },
    "jyselle": { "2026-04-27": { "worked": "...", "broke": "...", "tweak": "..." } }
  },
  "jyselleWhy": "...",
  "jyselleAnchors": ["...", "...", "..."],
  "welcomed": true,
  "lastExport": "2026-05-01T...",
  "exported_at": "2026-05-01T..."
}
```

- Day keys are `YYYY-MM-DD` (local-time).
- Review keys are the **Monday** of that week (week starts Monday).
- The `version` field exists so future schema changes can migrate cleanly.

### Migration path

- **Want this in Notion?** Open the JSON, paste rows into a Notion database. Each day → one row.
- **Want it in a coach-readable format?** Export, redact anything personal in the reviews, share the file.
- **Switching devices?** Export from old device → AirDrop / iCloud / email → on the new device, open the dashboard, **Data tab → Import backup**.

The schema is intentionally flat. It's a contract: the dashboard reads it, but you own it.

---

## How to customize

Almost everything user-facing lives in `js/data.js`. No build step needed — edit, refresh, done.

| What you want to change                  | Where                                         |
|------------------------------------------|-----------------------------------------------|
| Wedding date                             | `js/data.js` → `WEDDING_DATE`                 |
| Daily check-in items (Kyle or Jyselle)   | `js/data.js` → `ITEMS.kyle` / `ITEMS.jyselle` |
| Strength session exercises               | `js/data.js` → `STRENGTH_SESSIONS`            |
| Tone/copy per person (floor banner, miss warning, review placeholders, phase tag) | `js/data.js` → `COPY` |
| The seven principles (rendered atop each dashboard) | `js/data.js` → `PRINCIPLES_HTML`     |
| Both whys (Kyle's and Jyselle's default) | `index.html` → `.why-block` section + `js/storage.js` → `DEFAULT_JYSELLE_WHY` |
| The weekly plan / strength sessions / walk-jog method (system tab content) | `index.html` → `#panel-system` |
| Color tokens                             | `css/styles.css` → `:root { --bg, --accent, --warm, ... }` |
| App name / icons / theme color           | `manifest.json`, `icons/`                     |

Editing Jyselle's why is also possible **inside the app** without touching code: the *Edit Jyselle's why* button on the why-block opens a modal.

---

## Project structure

```
together-daily/
├── index.html              # markup, ARIA wiring, modal + welcome overlay
├── css/styles.css          # all styles, grouped by section
├── js/
│   ├── data.js             # ITEMS, STRENGTH_SESSIONS, COPY, PRINCIPLES_HTML
│   ├── storage.js          # STATE, load/save/export/import/reset
│   ├── render.js           # date helpers + renderPanel/renderJyselleWhy
│   └── app.js              # init, tabs, event delegation, modal, overlay
├── icons/
│   ├── icon.svg            # source vector icon
│   ├── icon-192.png        # PWA
│   ├── icon-512.png        # PWA + maskable
│   └── apple-touch-icon.png # iOS home screen (180×180)
├── manifest.json           # PWA manifest
├── LICENSE                 # MIT
├── .gitignore
└── README.md
```

Scripts are loaded as plain `<script>` tags in dependency order (`data → storage → render → app`). No modules, no bundler. The site works opened directly from the filesystem (`file://`).

---

## Credits

This system rests on two books:

- **Scott Adams**, *How to Fail at Almost Anything and Still Win Big* — the systems-over-goals frame.
- **James Clear**, *Atomic Habits* — habit stacking, two-minute starts, identity-based change, never miss twice.

Built by Kyle Quilantang for Kyle and Jyselle. Personal project. Not for sale, not for scale.

---

## License

MIT. See [`LICENSE`](./LICENSE).
