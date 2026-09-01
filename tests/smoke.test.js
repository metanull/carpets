import { describe, expect, it } from 'vitest'
import { createViewer, mergeMessages } from '@metanull/viewer-core'
import { catalogues as sharedTexts } from '@metanull/viewer-i18n/gallery'
import galleryData from '@metanull/carpets-data/gallery.json'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this gallery's own file last. Mounting without them would prove
// nothing about the chrome — every text would render as its own name.
const messages = mergeMessages(sharedTexts, { en: ownTexts })

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    window.location.hash = '#/'
    const app = createViewer({ ...config, messages })
    const host = document.createElement('div')
    document.body.appendChild(host)
    app.mount(host)
    await app.config.globalProperties.$router.isReady()

    expect(host.textContent).toContain(config.siteName)
    expect(host.querySelector('.mwnf-page')).not.toBeNull()

    // The website's own Home view (registered under the route name 'home')
    // must replace viewer-core's generic home view.
    expect(host.querySelector('.vc-home')).toBeNull()

    app.unmount()
  })

  it('declares every legacy route', () => {
    const paths = config.extraViews.map((r) => r.path)
    for (const path of [
      '/',
      '/collection',
      '/collection-results',
      '/database-item/:uid(.*)/:language',
      '/search',
      '/how-to-search',
      '/partners',
      '/partner/:country/:id/:language',
      '/partner-objects/:country/:id/:page',
      '/timeline',
      '/timeline-results',
      '/timeline-gallery/:country/:start/:end/:page',
      '/about',
      '/credits',
      '/error',
    ]) {
      expect(paths).toContain(path)
    }
    // Anything else lands on the error page rather than a blank view.
    expect(paths).toContain('/:pathMatch(.*)*')
  })

  it('offers the gallery’s own UI languages', () => {
    // `gallery.languages` is thg_gallery_lang — the four languages the gallery
    // chrome was translated into. It is deliberately not the manifest's list,
    // which also counts languages that only a borrowed item sheet carries.
    expect([...config.languages].sort()).toEqual([...galleryData.languages].sort())
    // The order is the switcher's, not the opening language's: viewer-core
    // negotiates that, so nothing may depend on English being first again.
    expect(config.languages).toEqual(galleryData.languages)
  })

  it('names the site after the gallery itself', () => {
    expect(config.siteName).toBe(galleryData.names.en)
  })

  // The chrome is two layers now, and either one failing is silent: a missing
  // entry renders as its own name rather than as an error. This asserts the
  // rendered page, so a bundle that installs but never reaches the components
  // fails here too.
  it('renders the shared texts and its own over them', async () => {
    window.location.hash = '#/'
    const app = createViewer({ ...config, messages })
    const host = document.createElement('div')
    document.body.appendChild(host)
    app.mount(host)
    await app.config.globalProperties.$router.isReady()

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
  })
})
