# Carpets

The **Museum With No Frontiers — Carpets** gallery (legacy "Discover Carpet
Art"): the gallery collection with its dependent filters, a full-text database
search, partner profiles and their holdings, country timelines and the item
sheets themselves — built from the published dataset.

A website is a light, static Vue 3 front-end for one published dataset. It
combines three `@metanull` packages from GitHub Packages:

| Package | Role |
| --- | --- |
| `@metanull/carpets-data` | the dataset (JSON + `manifest.json`, **private**) |
| `@metanull/viewer-core` | application engine (routing, data access, i18n) |
| `@metanull/viewer-layout` | page structure (`PageShell` + sections), themed via `theme/tokens.css` |

Because the data package is private, every `npm install` needs authenticated
access to GitHub Packages. In CI there is nothing to configure: the package
grants this repository Read under *Manage Actions access*, so the workflow's
built-in `github.token` can install it — no secret, no PAT. Locally, each
developer authenticates for themselves, with
`npm login --registry=https://npm.pkg.github.com` or a personal `~/.npmrc`; the
Docker preview mounts that `~/.npmrc` read-only.

---

## What is where

| Path | Contents |
| --- | --- |
| `src/dataset.config.js` | the whole website declaration: dataset package, languages, page shell, the route map |
| `src/SiteShell.vue` | the gallery chrome — header (logo, search, language switcher), banner, navigation, footer — wrapped around `PageShell` |
| `src/views/` | one component per page of the gallery |
| `src/components/` | the pieces shared between pages (object grid, pagination, banners, partner map) |
| `src/composables/` | data access over the package: gallery data, collection search, timeline, glossary, UI strings |
| `src/i18n/` | the MWNF Galleries message catalogues, vendored from `scripts/site-i18n` in the inventory monorepo |
| `locales/` | interface texts of the shell itself, editable by translators (see below) |
| `theme/` | the visual identity: `tokens.css`, `overrides.css`, `assets/` |

### Two message sources, on purpose

`locales/` holds the small set of chrome strings the platform itself defines
(`chrome.*`, `layout.*`) and is the file a translator edits in the browser.
`src/i18n/` holds the legacy MWNF Galleries catalogues — hundreds of item-sheet
field labels and several long editorial pages, in four languages. They are
vendored rather than translated here, and they are deliberately **sparse**: a
key is present in Arabic, Spanish or French only where a translation genuinely
exists, so "not translated" and "English on purpose" stay distinguishable, with
English as the fallback exactly as in the legacy client.

## Development

The preview runs in Docker; nothing needs to be installed on the host.

```bash
docker compose up
```

Log in to GitHub Packages once on your own machine — `npm login
--registry=https://npm.pkg.github.com --scope=@metanull` — and the preview reads
that login. Nothing in this repository holds a token. Then open
<http://localhost:5173>.

`npm run build`, `npm run test` and `npm run lint` are the three checks CI runs
(build and test are blocking).

## Translator — editing the website's texts

You only need a GitHub account and a browser. The files under `locales/` hold
the interface texts, one file per language — `en.json` is English, `fr.json`
French, and so on. The museum content itself arrives already translated in the
dataset and is not edited here.

1. **Open the folder** `locales/` on this repository's GitHub page and click
   the language file you want to change.
2. **Click the pencil** (✏️, top right). Change only the text between the
   second pair of quotation marks on a line — the part before the colon is the
   identifier and must stay exactly as it is. Pieces in curly braces like
   `{page}` are filled in automatically: keep them, but you may move them
   within the sentence.
3. **To start a new language**, copy all of `en.json`, create a file named with
   the two-letter language code (e.g. `it.json`), paste and translate.
4. **Click "Commit changes…" then "Propose changes".**
5. **Wait for the automatic check.** A green tick means your change goes live
   by itself a few minutes later. If something is off, a comment appears
   explaining in plain language what to fix.

## Webdesigner — theming the website

The whole visual identity lives in `theme/`: `tokens.css` (colours, fonts,
spacing — the normal surface), `overrides.css` (escape hatch) and `assets/`.
Follow the same pencil-button flow as above for small changes, or run the
Docker preview for real design work. A change to a layout component itself is a
request for the `viewer-layout` package — open an issue there.

## Deployment

Every push to `main` builds and publishes the site to
<https://metanull.github.io/carpets/> through the reusable workflows in
[`metanull/viewer-workflows`](https://github.com/metanull/viewer-workflows).
The base path comes from `BASE_PATH` at build time and defaults to the
repository name.
