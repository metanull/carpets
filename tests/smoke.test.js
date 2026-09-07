import { describe, expect, it, vi } from 'vitest'
import { createViewer, loadEntities, mergeMessages } from '@metanull/viewer-core'
import { checkOfferedLanguages } from '@metanull/viewer-core/testing'
import { catalogues as sharedTexts } from '@metanull/viewer-i18n/gallery'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this gallery's own file last. Mounting without them would prove
// nothing about the chrome — every text would render as its own name.
const messages = mergeMessages(sharedTexts, { en: ownTexts })

// Mounted on the address under test, as a visitor arrives from a link.
async function mountSite(hash = '#/') {
  window.location.hash = hash
  const app = createViewer({ ...config, messages })
  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
  const router = app.config.globalProperties.$router
  await router.isReady()
  return { app, host, router }
}

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    const { app, host } = await mountSite()

    expect(host.textContent).toContain(config.siteName)
    expect(host.querySelector('.mwnf-page')).not.toBeNull()

    // The website's own Home view (registered under the route name 'home')
    // must replace viewer-core's generic home view.
    expect(host.querySelector('.vc-home')).toBeNull()

    app.unmount()
  }, 20000)

  // The collection results and the item sheet run on the platform's composed
  // views (metanull/viewer-core#50): the tiles, the dependent options and the
  // pages come from the spec, the sheet's rows from the sheet spec, and what
  // only this gallery has — the panel in the aside, the related-content
  // container — fills the views' slots.
  it('renders the collection results on the composed results view', async () => {
    const { app, host } = await mountSite('#/collection-results')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-catalogue')).not.toBeNull()
    expect(host.querySelector('.mwnf-catalogue__aside .mwnf-filter')).not.toBeNull()
    expect(host.querySelector('.mwnf-summary__count')).not.toBeNull()
    // Nine a page, two paginations.
    expect(host.querySelectorAll('.mwnf-grid__tile').length).toBe(9)
    expect(host.querySelectorAll('.mwnf-pagination').length).toBe(2)
    app.unmount()
  }, 60000)

  it('renders the item sheet on the composed record view', async () => {
    const [items] = await loadEntities(['items'])
    const { app, host } = await mountSite(`#/item/${items[0].id}`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-record')).not.toBeNull()
    expect(host.querySelector('.languages')).not.toBeNull()
    expect(host.querySelector('.related-content-container')).not.toBeNull()
    expect(host.querySelector('.source-reference').textContent).toContain(items[0].project_key)
    app.unmount()
  }, 60000)

  // The timeline entrance/results and the gallery run on the platform's
  // composed views (metanull/viewer-layout#37): the country and period
  // controls, the events list and the "See gallery" cross-link come from the
  // spec in composables/useTimeline.js.
  it('renders the timeline results on the composed timeline view', async () => {
    const { app, host } = await mountSite('#/timeline-results?country=gr')
    await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-timeline__row').length).toBe(11), { timeout: 20000 })
    expect(host.querySelector('.mwnf-summary').textContent).toContain('11')
    // A Greece event's own description, not just a row count — its
    // translation loads asynchronously, behind the spec's own `tr`.
    await vi.waitFor(() => expect(host.textContent).toContain('Filiki Etaireia'), { timeout: 20000 })
    // The join to member items finds Greece's nine dated objects even with
    // no period chosen — wave 0's "all countries too" behaviour, kept.
    expect(host.querySelector('.mwnf-timeline__gallery').textContent).toContain('9')
    app.unmount()
  }, 60000)

  it('renders the timeline gallery on the composed results view', async () => {
    const { app, host } = await mountSite('#/timeline/gallery?country=gr')
    await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-grid__tile').length).toBe(9), { timeout: 20000 })
    expect(host.querySelector('.mwnf-summary').textContent).toContain('Greece')
    expect(host.textContent).toContain('Floor mat')
    app.unmount()
  }, 60000)

  // The partner pages run on the platform's composed views
  // (metanull/viewer-layout#38, #41): the grouping, the A-Z toggle, the
  // record's language, the map and the member-items grid come from the specs
  // in composables/partner.js. What only this gallery has — the "no objects"
  // line for a partner listed under decision MWNF-384 — fills the list's
  // `#row` slot.
  it('renders the partners list on the composed partner-list view', async () => {
    const { app, host } = await mountSite('#/partners')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-partner-list__row')).not.toBeNull(), { timeout: 20000 })
    expect(host.textContent).toContain('Austria')
    expect(host.textContent).toContain('Weltmuseum Wien')
    // The object count is this website's own copy over the shared entry, not
    // a generic count.
    expect(host.textContent).toContain('7 object(s) in this site')
    app.unmount()
  }, 60000)

  it('renders a partner profile on the composed record view', async () => {
    const { app, host } = await mountSite('#/partner/2300bb0e-fc9f-55c5-ae2e-20f619a46cce')
    // `.mwnf-record` renders as soon as the id resolves; the name and city
    // only once the translation load the view kicks off settles.
    await vi.waitFor(() => expect(host.textContent).toContain('Weltmuseum Wien'), { timeout: 20000 })
    expect(host.textContent).toContain('Vienna')
    // The map is the layout's `PartnerMap`, not the deleted local component.
    expect(host.querySelector('.mwnf-partner-map')).not.toBeNull()
    app.unmount()
  }, 60000)

  it("renders a partner's objects on the composed grid results view", async () => {
    const { app, host } = await mountSite('#/partner/2300bb0e-fc9f-55c5-ae2e-20f619a46cce/objects')
    await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-grid__tile').length).toBe(7), { timeout: 20000 })
    expect(host.textContent).toContain('Weltmuseum Wien')
    app.unmount()
  }, 60000)

  it('declares every canonical route by name, and every legacy shape as a redirect', () => {
    const names = config.extraViews.map((r) => r.name)
    for (const name of [
      'home', 'collection', 'collection-results', 'item', 'search-results', 'search-how-to',
      'partners', 'partner', 'partner-objects', 'timeline', 'timeline-results', 'timeline-gallery',
      'about', 'credits',
    ]) {
      expect(names).toContain(name)
    }
    expect(config.extraViews.every((r) => r.name)).toBe(true)
    const legacy = config.legacyRoutes.map((r) => r.path)
    for (const path of [
      '/database-item/:uid(.*)/:language',
      '/partner/:country/:id/:language',
      '/partner-objects/:country/:id/:page',
      '/timeline-gallery/:country/:start/:end/:page',
    ]) {
      expect(legacy).toContain(path)
    }
    // The catch-all and the not-found page are the router's, not this site's.
    expect(config.extraViews.some((r) => r.path.includes('pathMatch'))).toBe(false)
  })

  it('offers the languages the package declares for the site, where the items carry them', () => {
    expect(checkOfferedLanguages(config)).toEqual([])
  })

  it('reads nothing but the manifest before it mounts', () => {
    expect(config.media.legacyHost).toMatch(/^https:/)
    expect(Object.keys(config.links)).toEqual(
      expect.arrayContaining(['portal', 'galleries', 'myCollection', 'about', 'contact', 'legalNotice', 'credits', 'cookies']),
    )
  })

  // What this website contributes to a legacy address is the mapping: a dbUid
  // path to an item, a country and legacy id to a partner, the page number out
  // of the path. That the router turns such an entry into a redirect is
  // viewer-core's own test.
  it('maps a legacy address onto the canonical route', async () => {
    const [items, partners] = await loadEntities(['items', 'partners'])
    const [itemFor, partnerFor, objectsFor, galleryFor] = config.legacyRoutes

    const item = items.find((i) => i.backward_compatibility)
    expect(await itemFor.resolve({ uid: item.backward_compatibility.split(':').join('/') })).toEqual({
      name: 'item',
      params: { id: item.id },
    })
    expect(await itemFor.resolve({ uid: 'mwnf3/objects/NOPE/xx/Mus00/0' })).toBeNull()

    const partner = partners.find((p) => (p.backward_compatibility ?? '').split(':').length >= 4)
    const [, , legacyId, country] = partner.backward_compatibility.split(':')
    expect(await partnerFor.resolve({ country, id: legacyId })).toEqual({
      name: 'partner',
      params: { id: partner.id },
    })
    expect(await objectsFor.resolve({ country, id: legacyId, page: '3' })).toEqual({
      name: 'partner-objects',
      params: { id: partner.id },
      query: { page: '3' },
    })

    // The page number and the period leave the path for the query, and an
    // open bound stops being the literal 'any'.
    expect(galleryFor.resolve({ country: 'uk', start: 'any', end: '1500', page: '2' })).toEqual({
      name: 'timeline-gallery',
      query: { country: 'uk', end: '1500', page: '2' },
    })
  }, 20000)

  // The chrome is two layers now, and either one failing is silent: a missing
  // entry renders as its own name rather than as an error. This asserts the
  // rendered page, so a bundle that installs but never reaches the components
  // fails here too.
  it('renders the shared texts and its own over them', async () => {
    const { app, host } = await mountSite()

    const text = host.textContent
    // From viewer-i18n: the layout's skip link, and two of the gallery's own
    // shared entries — one in the menu, one in the standing notice.
    expect(text).toContain('Skip to content')
    expect(text).toContain('All MWNF Galleries')
    expect(text).toContain('Tip:')
    // Nothing rendered as a bare entry name, which is what a missing text
    // looks like — there is no exception to throw for one.
    expect(text).not.toMatch(/\b(carpets|gallery|core|layout)\.[a-z]/i)

    app.unmount()
  }, 20000)
})
