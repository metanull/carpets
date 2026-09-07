import { languageLabels, loadEntities, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage } from '@metanull/viewer-core'
import SiteShell from './SiteShell.vue'
import { itemFromUidPath, partnerFromKey } from './composables/useGalleryData.js'

// The whole declaration of this website. Before it mounts, the website reads
// nothing from its package but the manifest: the languages it offers, their
// labels and its name come from `manifest.site`, and every record is loaded
// by the route that reads it.

const { manifest } = useDataPackage()

// The gallery's own UI languages (`thg_gallery_lang`, declared by the package
// as `site.languages`), kept where the item translations actually carry them.
// An item sheet may offer more — whatever languages the record itself carries
// — from its own switcher, without touching the site language.
const languages = offeredLanguages()

// Every page renders the chrome — the header title, the banner and its
// caption — off these four; a page adds what it reads on top. A route also
// says which section it belongs to, and the shell reads that for the banner
// title and the active menu entry (viewer-core's `useSection`).
const CHROME = ['gallery', 'items', 'partners', 'countries']
const meta = sectionMeta(CHROME)

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@metanull/carpets-data',

  // English is the base language of every catalogue in the platform, so the
  // name the site is known by is the English one.
  siteName: manifest.site?.names?.en ?? 'Carpets',

  // All pages are website-specific views (below) — no generic entity pages.
  features: {
    entities: [],
  },

  languages,

  shell: SiteShell,

  // Props for the shell: the switcher's labels come from the package, not
  // from a translator.
  navigation: {
    languages: languageLabels(languages),
  },

  // Gallery chrome images live on the legacy media server and were never
  // imported; the package ships the path, this is the host.
  media: {
    legacyHost: 'https://images.museumwnf.org',
  },

  // Every address this website links out to — the twelve portal and sibling
  // addresses every DXA config repeats, carpets adding none of its own.
  links: { ...mwnfLinks },

  // The canonical routes, one view per page: a section is `/<section>`, a
  // record `/<section>/:id` with the package id, and the language, the page
  // and every filter travel in the query. The 'home' name replaces
  // viewer-core's generic home route.
  extraViews: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue'), meta: meta('home') },
    { path: '/collection', name: 'collection', component: () => import('./views/CollectionSearch.vue'), meta: meta('collection', 'tags') },
    {
      path: '/collection-results',
      name: 'collection-results',
      component: () => import('./views/CollectionResults.vue'),
      meta: meta('collection', 'tags', 'timelines'),
    },
    {
      path: '/item/:id',
      name: 'item',
      component: () => import('./views/ItemSheet.vue'),
      props: (route) => ({ id: route.params.id }),
      meta: meta('database', 'languages', 'dynasties', 'glossary', 'timelines', 'timeline_events'),
    },
    { path: '/search', name: 'search-results', component: () => import('./views/SearchResults.vue'), meta: meta('database') },
    { path: '/how-to-search', name: 'search-how-to', component: () => import('./views/SearchHowTo.vue'), meta: meta('database') },
    { path: '/partners', name: 'partners', component: () => import('./views/Partners.vue'), meta: meta('partners') },
    { path: '/partner/:id', name: 'partner', component: () => import('./views/PartnerProfile.vue'), meta: meta('partners', 'languages') },
    { path: '/partner/:id/objects', name: 'partner-objects', component: () => import('./views/PartnerObjects.vue'), meta: meta('partners') },
    { path: '/timeline', name: 'timeline', component: () => import('./views/Timeline.vue'), meta: meta('timeline', 'timelines', 'timeline_events') },
    {
      path: '/timeline-results',
      name: 'timeline-results',
      component: () => import('./views/TimelineResults.vue'),
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    {
      path: '/timeline/gallery',
      name: 'timeline-gallery',
      component: () => import('./views/TimelineGallery.vue'),
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    { path: '/about', name: 'about', component: () => import('./views/About.vue'), meta: meta('about') },
    { path: '/credits', name: 'credits', component: () => import('./views/Credits.vue'), meta: meta('credits') },
  ],

  // The legacy URL shapes, redirect-only, so a legacy address pasted after
  // the `#` still lands on the right page: the item sheet's dbUid path
  // (`/database-item/mwnf3/objects/EPM/uk/Mus21/41/en`) resolves through
  // `backward_compatibility`, the partner's country and legacy id through the
  // partner record; the language segment is dropped, the page number moves
  // to the query.
  legacyRoutes: [
    {
      path: '/database-item/:uid(.*)/:language',
      async resolve({ uid }) {
        await loadEntities(['items'])
        const item = itemFromUidPath(uid)
        return item ? { name: 'item', params: { id: item.id } } : null
      },
    },
    {
      path: '/partner/:country/:id/:language',
      async resolve({ country, id }) {
        await loadEntities(['partners'])
        const partner = partnerFromKey(country, id)
        return partner ? { name: 'partner', params: { id: partner.id } } : null
      },
    },
    {
      path: '/partner-objects/:country/:id/:page',
      async resolve({ country, id, page }) {
        await loadEntities(['partners'])
        const partner = partnerFromKey(country, id)
        if (!partner) return null
        return { name: 'partner-objects', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
      },
    },
    {
      path: '/timeline-gallery/:country/:start/:end/:page',
      resolve({ country, start, end, page }) {
        const query = { country }
        if (start !== 'any') query.start = start
        if (end !== 'any') query.end = end
        if (Number(page) > 1) query.page = page
        return { name: 'timeline-gallery', query }
      },
    },
    { path: '/error', resolve: () => null },
  ],
}
