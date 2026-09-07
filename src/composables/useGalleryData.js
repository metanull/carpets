import { mediaUrl, useCatalogueData, useDataPackage } from '@metanull/viewer-core'
import { itemFromUidPath as legacyItemFromUidPath, partnerFromKey as legacyPartnerFromKey } from '@metanull/viewer-core/legacy'
import { computed } from 'vue'

// The gallery's records, read the one way every website reads them: through
// viewer-core, lazily. `useCatalogueData` is the wrapper half every site's
// data composable used to write for itself — `tr`, `md`/`mdInline`/`mdStrip`,
// `loadEnglish`, `labelOf`, the visible form of an entity and its index, the
// package re-exports — called once, here. Carpets declares no `visible`
// rule: it has no per-build language filter and no hidden-partner rule, so
// `entity`/`index` read every record the package ships. What stays here is
// what is genuinely this site's own: routes, the legacy key mappings, chrome
// images, sibling lists.

const dataPackage = useDataPackage()
export const manifest = dataPackage.manifest

const catalogue = useCatalogueData({
  // Every entity a page reads English labels or fallbacks for; `gallery`,
  // `tags`, `timelines` and `languages` carry no translations of their own.
  eager: ['items', 'partners', 'countries', 'glossary', 'dynasties', 'timeline_events'],
})

export const {
  tr, md, mdInline, mdStrip, loadEnglish, labelOf,
  availableLanguages, loadTranslations, translations,
} = catalogue

// English is the base language of every catalogue in the platform: every
// list, label and fallback reads it.
export const defaultLang = 'en'

// ── Records ────────────────────────────────────────────────────────────────
// Language-independent; every human-readable string lives under translations/.

export const gallery = catalogue.entity('gallery')
export const items = catalogue.entity('items')
export const tags = catalogue.entity('tags')
export const partners = catalogue.entity('partners')
export const countries = catalogue.entity('countries')
export const languages = catalogue.entity('languages')
export const dynasties = catalogue.entity('dynasties')
export const glossary = catalogue.entity('glossary')
export const timelines = catalogue.entity('timelines')
export const timelineEvents = catalogue.entity('timeline_events')

// ── Lookup maps ────────────────────────────────────────────────────────────

export const itemById = catalogue.index('items')
export const partnerById = catalogue.index('partners')
export const countryById = catalogue.index('countries')
export const tagById = catalogue.index('tags')
export const dynastyById = catalogue.index('dynasties')
export const timelineById = catalogue.index('timelines')
export const languageByCode = catalogue.index('languages', 'code')

// ── Routes ─────────────────────────────────────────────────────────────────
//
// The canonical routes carry the package id; the language never travels in
// the path. The legacy shapes (the dbUid path of an item sheet, the country
// and legacy id of a partner) are redirect-only entries in dataset.config.js,
// resolved through the two wrappers below.

export function itemRoute(item) {
  return { name: 'item', params: { id: item.id } }
}

export function partnerRoute(partner) {
  return { name: 'partner', params: { id: partner.id } }
}

export function partnerObjectsRoute(partner, page = 1) {
  return { name: 'partner-objects', params: { id: partner.id }, query: page > 1 ? { page } : {} }
}

// Legacy dbUid ⇄ item, and a partner's country/legacy id ⇄ partner:
// `@metanull/viewer-core/legacy` decodes `backward_compatibility` the way
// every DXA site does, pure, over plain lists; these two wrappers bind it to
// carpets' own `items`/`partners`/`countries` refs, so dataset.config.js's
// legacy routes keep calling them with the arguments they already carry.
export function itemFromUidPath(path) {
  return legacyItemFromUidPath(items.value ?? [], path)
}

export function partnerFromKey(countryCode, legacyId) {
  return legacyPartnerFromKey(partners.value ?? [], countries.value ?? [], countryCode, legacyId)
}

// ── Chrome images ──────────────────────────────────────────────────────────
//
// `image_path`, `banner_image_path` and `homepage_image_path` were never
// imported into inventory storage: the package ships the legacy path and the
// address is built from the host `dataset.config.js` declares under `media`.

export function chromeImage(path, size = 'hi_res') {
  return mediaUrl(path, size)
}

// ── Sibling galleries ──────────────────────────────────────────────────────
//
// Decision Q3: these are reference objects, not resolved links. The exporter
// records identity plus whatever the import carried; where a `legacy_host` came
// across we can link to it, and where it did not the entry still renders — it
// just does not become an anchor. Legacy showed four random siblings from the
// active roster; the package ships the whole roster and the viewer picks.

export const siblingGalleries = computed(() =>
  (gallery.value?.sibling_galleries ?? []).filter(g => !g.hidden)
)

export function siblingUrl(sibling) {
  return sibling?.legacy_host || null
}

/** Legacy's `/thg/galleries/featured`: four at random, reshuffled per visit. */
export function pickSiblings(count = 4) {
  const pool = [...siblingGalleries.value]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}
