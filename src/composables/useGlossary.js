import { glossaryById, translations } from './useGalleryData.js'

// The item sheet highlights glossary terms inside its own description text,
// which is why the package ships a spelling list per term per language rather
// than a single headword. The highlighting itself is viewer-core's: `md()`
// takes the `[{ id, spelling }]` list `glossaryFor` builds and marks every
// occurrence as `<span class="gloss-term" data-gid="…">` while it parses —
// whole words, longest spelling first, in any script — so nothing here
// touches rendered HTML.

/**
 * Glossary terms reachable from one item, with their spellings in `lang`.
 * Falls back to the English spellings when the term has no row in `lang`.
 */
export function termsForItem(item, lang) {
  const out = []
  for (const id of item?.glossary_ids ?? []) {
    const entry = glossaryById.value.get(id)
    if (!entry) continue
    const t = translations('glossary', lang)[id] ?? translations('glossary', 'en')[id] ?? {}
    const spellings = (t.spellings ?? []).map(s => String(s).trim()).filter(Boolean)
    out.push({
      id,
      word: entry.word,
      definition: t.definition ?? '',
      spellings: spellings.length ? spellings : [entry.word],
    })
  }
  return out
}

/** The spelling list viewer-core's renderers highlight: one entry per spelling of each term. */
export function glossaryFor(terms) {
  const out = []
  for (const term of terms) {
    for (const spelling of term.spellings) out.push({ id: term.id, spelling })
  }
  return out
}

/** Every glossary term in the package, for the standalone glossary tool. */
export function searchGlossary(input, lang) {
  const needle = (input ?? '').trim().toLowerCase()
  if (!needle) return []
  const rows = translations('glossary', lang)
  const fallback = translations('glossary', 'en')
  const out = []
  for (const [id, entry] of glossaryById.value) {
    const t = rows[id] ?? fallback[id] ?? {}
    const spellings = t.spellings?.length ? t.spellings : [entry.word]
    for (const spelling of spellings) {
      if (String(spelling).toLowerCase().startsWith(needle)) {
        out.push({ id, spelling: String(spelling).trim(), definition: t.definition ?? '' })
        break
      }
    }
  }
  return out.sort((a, b) => a.spelling.localeCompare(b.spelling))
}
