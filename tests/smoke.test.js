import { describe, expect, it } from 'vitest'
import { createViewer } from '@metanull/viewer-core'
import galleryData from '@metanull/carpets-data/gallery.json'
import config from '../src/dataset.config.js'

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    window.location.hash = '#/'
    const app = createViewer(config)
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

  it('offers the gallery’s own UI languages, English first', () => {
    // `gallery.languages` is thg_gallery_lang — the four languages the gallery
    // chrome was translated into. It is deliberately not the manifest's list,
    // which also counts languages that only a borrowed item sheet carries.
    expect([...config.languages].sort()).toEqual([...galleryData.languages].sort())
    // viewer-core boots vue-i18n at languages[0]; the gallery opens in English.
    expect(config.languages[0]).toBe('en')
  })

  it('names the site after the gallery itself', () => {
    expect(config.siteName).toBe(galleryData.names.en)
  })
})
