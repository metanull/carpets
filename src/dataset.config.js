import { gallery, siteLanguages } from './composables/useGalleryData.js'
import SiteShell from './SiteShell.vue'

// The website's UI languages are the gallery's own (`thg_gallery_lang`, shipped
// as `gallery.languages`), not the manifest's list of every language some
// record happens to carry: an item sheet may offer de/el/tr that the gallery
// chrome never did, and it offers them from the sheet's own switcher.
//
// The list used to be forced to start with English, because the gallery opened
// at `languages[0]`. viewer-core negotiates the opening language now — an
// explicit `?lang=`, then the visitor's remembered choice, then their browser,
// then English — so the package's own order stands, and it is the order of the
// switcher in the header.
const languages = siteLanguages

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@metanull/carpets-data',

  siteName: gallery.names?.en ?? 'Carpets',

  // All pages are website-specific views (below) — no generic entity pages.
  features: {
    entities: [],
  },

  languages,

  // The shell supplies its header, banner, navigation and footer through
  // PageShell's slots, so there is no `navigation` prop bag to pass.
  shell: SiteShell,

  // The legacy route map, one view per page. Paths mirror the legacy client's
  // routes one for one, including the item sheet's dbUid path
  // (`/database-item/mwnf3/objects/EPM/uk/Mus21/41/en`), so a legacy URL can be
  // pasted after the `#` and land on the same page.
  //
  // The one deliberate difference is the partner route: legacy carried a
  // project id it resolved server-side (`/partner/ISL/dz/Mus01/en`) and the
  // inventory model has no per-partner project, so the segment is dropped
  // rather than invented.
  //
  // The 'home' name replaces viewer-core's generic home route.
  extraViews: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue') },
    { path: '/collection', name: 'collection', component: () => import('./views/CollectionSearch.vue') },
    {
      path: '/collection-results',
      name: 'collection-results',
      component: () => import('./views/CollectionResults.vue'),
    },
    {
      path: '/database-item/:uid(.*)/:language',
      name: 'database-item',
      component: () => import('./views/ItemSheet.vue'),
    },
    { path: '/search', name: 'search-results', component: () => import('./views/SearchResults.vue') },
    { path: '/how-to-search', name: 'search-how-to', component: () => import('./views/SearchHowTo.vue') },
    { path: '/partners', name: 'partners', component: () => import('./views/Partners.vue') },
    {
      path: '/partner/:country/:id/:language',
      name: 'partner',
      component: () => import('./views/PartnerProfile.vue'),
    },
    {
      path: '/partner-objects/:country/:id/:page',
      name: 'partner-objects',
      component: () => import('./views/PartnerObjects.vue'),
    },
    { path: '/timeline', name: 'timeline', component: () => import('./views/Timeline.vue') },
    {
      path: '/timeline-results',
      name: 'timeline-results',
      component: () => import('./views/TimelineResults.vue'),
    },
    {
      path: '/timeline-gallery/:country/:start/:end/:page',
      name: 'timeline-gallery',
      component: () => import('./views/TimelineGallery.vue'),
    },
    { path: '/about', name: 'about', component: () => import('./views/About.vue') },
    { path: '/credits', name: 'credits', component: () => import('./views/Credits.vue') },
    { path: '/error', name: 'error', component: () => import('./views/ErrorPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/error' },
  ],
}
