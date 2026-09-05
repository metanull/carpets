import { computed } from 'vue'
import {
  byId, entityRef, mediaUrl, renderBlock, renderInline, renderPlain, useDataPackage,
} from '@metanull/viewer-core'

// The gallery's records, read the one way every website reads them: through
// viewer-core, lazily. Each entity is a shared ref that stays `null` until a
// route declaring it in `meta.entities` brings its chunk in, so importing this
// module loads nothing, and a page pays only for what it reads. Nothing here
// keeps a copy of a record or a translation.

const dataPackage = useDataPackage()
export const manifest = dataPackage.manifest

// ── Records ────────────────────────────────────────────────────────────────
// Language-independent; every human-readable string lives under translations/.

export const gallery = entityRef('gallery')
export const items = entityRef('items')
export const tags = entityRef('tags')
export const partners = entityRef('partners')
export const countries = entityRef('countries')
export const languages = entityRef('languages')
export const dynasties = entityRef('dynasties')
export const glossary = entityRef('glossary')
export const timelines = entityRef('timelines')
export const timelineEvents = entityRef('timeline_events')

// English is the base language of every catalogue in the platform: every
// list, label and fallback reads it.
export const defaultLang = 'en'

// ── Lookup maps ────────────────────────────────────────────────────────────

export const itemById = byId('items')
export const partnerById = byId('partners')
export const countryById = byId('countries')
export const tagById = byId('tags')
export const dynastyById = byId('dynasties')
export const glossaryById = byId('glossary')
export const timelineById = byId('timelines')
export const languageByCode = byId('languages', 'code')

// ── Routes ─────────────────────────────────────────────────────────────────
//
// The canonical routes carry the package id; the language never travels in
// the path. The legacy shapes (the dbUid path of an item sheet, the country
// and legacy id of a partner) are redirect-only entries in dataset.config.js,
// resolved through the two lookups at the end of this section.

export function itemRoute(item) {
  return { name: 'item', params: { id: item.id } }
}

export function partnerRoute(partner) {
  return { name: 'partner', params: { id: partner.id } }
}

export function partnerObjectsRoute(partner, page = 1) {
  return { name: 'partner-objects', params: { id: partner.id }, query: page > 1 ? { page } : {} }
}

// Legacy dbUid ⇄ item. The legacy item URL carried the dbUid path, which is
// exactly `backward_compatibility` with ':' swapped for '/' — the identity rule
// in dxa-legacy-analysis.md §4.2. Matching is case-insensitive because Sharing
// History stores its keys lowercase.
export const itemByUid = computed(() => {
  const m = new Map()
  for (const item of items.value ?? []) {
    if (item.backward_compatibility) m.set(item.backward_compatibility.toLowerCase(), item)
  }
  return m
})

export function itemFromUidPath(path) {
  return itemByUid.value.get(String(path).split('/').join(':').toLowerCase()) ?? null
}

// Partner identity in a legacy URL: `mwnf3:museums:Mus21:ua` → { legacyId: 'Mus21', country: 'ua' }.
export function partnerKey(partner) {
  const parts = (partner?.backward_compatibility ?? '').split(':')
  return { legacyId: parts[2] ?? partner?.id, countryCode: parts[3] ?? '' }
}

export function partnerFromKey(countryCode, legacyId) {
  return (partners.value ?? []).find(p => {
    const k = partnerKey(p)
    return k.legacyId === legacyId && k.countryCode === countryCode
  }) ?? null
}

// ── Translations ───────────────────────────────────────────────────────────
//
// One file per entity per language; a file is simply absent when that entity
// has no translation in that language, so every load path must tolerate a miss.
// English is loaded once (it drives every list and label); another language
// is loaded on demand by the sheet that reads it.

export const availableLanguages = dataPackage.availableLanguages
export const loadTranslations = dataPackage.loadTranslations
export const translations = dataPackage.translations

/** One record's translation, falling back to English then to nothing. */
export function tr(entity, id, lang) {
  return dataPackage.tr(entity, id, lang, defaultLang)
}

const EN_ENTITIES = [
  'items', 'partners', 'countries', 'glossary', 'dynasties', 'timeline_events',
]

let englishReady = null
export function loadEnglish() {
  if (!englishReady) {
    englishReady = Promise.all(EN_ENTITIES.map(e => loadTranslations(e, defaultLang)))
  }
  return englishReady
}
loadEnglish()

// ── English labels (lists, dropdowns, alt text) ────────────────────────────

export function itemLabel(item) {
  if (!item) return ''
  return mdStrip(tr('items', item.id, defaultLang).name ?? item.internal_name ?? '')
}

export function countryLabel(countryId) {
  if (!countryId) return ''
  return tr('countries', countryId, defaultLang).name
    ?? countryById.value.get(countryId)?.internal_name
    ?? countryId
}

export function partnerLabel(partnerId) {
  if (!partnerId) return ''
  return mdStrip(tr('partners', partnerId, defaultLang).name ?? '')
}

export function dynastyLabel(dynastyId) {
  return mdStrip(tr('dynasties', dynastyId, defaultLang).name ?? '')
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

// ── Markdown ───────────────────────────────────────────────────────────────
//
// The three renderers of viewer-core, and nothing else: a data package holds
// Markdown, every website renders it through the same pipeline, and a field
// that renders wrongly is fixed in the importer, where the data is made.
// `md` renders a record's text with its line breaks, and takes the glossary
// the sheet passes to highlight the terms it carries.

export function md(text, { glossary } = {}) {
  if (!text) return ''
  return renderBlock(text, { breaks: true, glossary })
}

export function mdInline(text, { glossary } = {}) {
  if (!text) return ''
  return renderInline(text, { glossary })
}

export function mdStrip(text) {
  if (!text) return ''
  return renderPlain(text)
}

export function useGalleryData() {
  return {
    manifest, gallery, items, tags, partners, countries, languages,
    dynasties, glossary, timelines, timelineEvents,
    defaultLang,
    itemById, partnerById, countryById, tagById, dynastyById, glossaryById,
    timelineById, languageByCode, itemByUid,
    itemRoute, itemFromUidPath,
    partnerKey, partnerRoute, partnerObjectsRoute, partnerFromKey,
    chromeImage,
    loadTranslations, translations, tr, availableLanguages, loadEnglish,
    itemLabel, countryLabel, partnerLabel, dynastyLabel,
    siblingGalleries, siblingUrl, pickSiblings,
    md, mdInline, mdStrip,
  }
}
