<script setup>
// The Carpets page chrome, built on `PageShell` from @metanull/viewer-layout.
//
// PageShell contributes the page skeleton (skip link, the seven ordered
// sections, the `#mwnf-content` landmark); everything inside the header,
// banner, navigation and footer sections is this website's own, supplied
// through PageShell's slots. The gallery's chrome carries a search field, a
// language switcher and a standing notice that no combination of PageShell
// props can express, which is why the slots are used rather than the props.
//
// Note the shell owns *both* banners: the tall home banner and the narrow
// per-section sub-banner are one PageShell section, chosen by route, so the
// views themselves never render page chrome.
import { computed, ref, watch } from 'vue'
import { useI18n } from '@metanull/viewer-core'
import { PageShell } from '@metanull/viewer-layout'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { gallery, siteLanguages, languageByCode } from './composables/useGalleryData.js'
import HomeBanner from './components/HomeBanner.vue'
import SubBanner from './components/SubBanner.vue'

// `language` and `update:language` are the shell contract of viewer-core: the
// value it passes down is the language the application is in, and the event it
// listens for sets it. There used to be a second language here — `uiLang`, kept
// in step with this one by hand, because the chrome came from a vendored
// catalogue rather than from `locales/`. Both now come from the same place, so
// there is one language and nothing to keep in step.
//
// `languages` is declared only so it stops here: viewer-core passes the
// resolved language list to every shell, and forwarding it to PageShell would
// grow a second language switcher inside the navigation bar next to the one
// this site puts in its header.
defineProps({
  language: { type: String, default: 'en' },
  languages: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:language'])
defineOptions({ inheritAttrs: false })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const PORTAL = 'https://www.museumwnf.org'
const GALLERIES = 'https://galleries.museumwnf.org'

const galleryName = computed(() => gallery.names?.[locale.value] ?? gallery.names?.en ?? '')
const isHome = computed(() => route.name === 'home')
const currentYear = new Date().getFullYear()

const searchInput = ref('')
function submitSearch() {
  router.push({ name: 'search-results', query: { q: searchInput.value || 'all-objects' } })
  searchInput.value = ''
}

// Legacy's menu: five site sections plus the portal's My Collection. `route` is
// the path segment and never a text; each label is written out so the check
// that every entry a page asks for exists can read it.
const navItems = computed(() => [
  { route: 'about', label: t('gallery.nav.about') },
  { route: 'collection', label: t('gallery.nav.collection') },
  { route: 'partners', label: t('gallery.nav.partners') },
  { route: 'timeline', label: t('gallery.nav.timeline') },
  { route: 'credits', label: t('gallery.nav.credits') },
])

const menuOpen = ref(false)

function languageName(code) {
  return languageByCode.value.get(code)?.names?.[code] ?? code.toUpperCase()
}

function selectLanguage(code) {
  emit('update:language', code)
}

// Scroll handling. `createViewerRouter` builds the router itself and takes no
// `scrollBehavior`, so the browser keeps the previous page's scroll offset
// when a route changes — following a result into an item sheet would land
// halfway down it. Reproducing the behaviour here is the same rule the
// gallery has always had: honour an anchor, otherwise go back to the top,
// and stay put when only the parameters of the current page changed.
watch(
  () => route.fullPath,
  (to, from) => {
    if (from && route.name && router.resolve(from).name === route.name) return
    if (route.hash) {
      document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <PageShell v-bind="$attrs">
    <template #header>
      <div id="header-inner">
        <div id="logo-container">
          <a :href="`${PORTAL}/`" target="_blank" rel="noopener">
            <span class="logo-mark">MWNF</span>
          </a>
        </div>

        <div id="title-container" v-if="!isHome">
          <RouterLink to="/">
            <span id="galleries-alt-header">{{ $t('gallery.nav.galleries') }}</span>
            <span id="title">{{ galleryName }}</span>
          </RouterLink>
        </div>

        <div id="portals-search-container">
          <div id="portal-links">
            <RouterLink to="/">{{ $t('core.nav.home') }}</RouterLink>
            <span> | </span>
            <a :href="`${GALLERIES}/list/1`" target="_blank" rel="noopener">{{ $t('gallery.nav.allGalleries') }}</a>
          </div>
          <div id="search-container">
            <form @submit.prevent="submitSearch">
              <input id="search-input" type="search" v-model="searchInput" :placeholder="$t('gallery.search.placeholder')" />
              <button id="search-submit" type="submit" :aria-label="$t('gallery.search.submit')">⌕</button>
            </form>
          </div>
          <!-- The gallery's four UI languages (thg_gallery_lang). Legacy pinned
               its chrome to English and switched only on record pages; here the
               switcher drives both, and Arabic flips the page to RTL. -->
          <div id="language-switch" v-if="siteLanguages.length > 1">
            <button
              v-for="code in siteLanguages"
              :key="code"
              :class="{ 'lang-active': code === language }"
              @click="selectLanguage(code)"
            >{{ languageName(code) }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Legacy stacks the views in this order: banner (home only), navigation,
         sub-banner (everywhere else). One PageShell section serves both. -->
    <template #banner>
      <HomeBanner v-if="isHome" />
      <SubBanner v-else />
    </template>

    <template #navigation>
      <div id="navigation-inner">
        <button id="hamburger" @click="menuOpen = !menuOpen" :aria-label="$t('gallery.nav.menu')">☰</button>
        <ul :class="{ open: menuOpen }">
          <li v-for="item in navItems" :key="item.route" :class="`menu-${item.route}`">
            <RouterLink :to="`/${item.route}`" @click="menuOpen = false">{{ item.label }}</RouterLink>
          </li>
          <li class="menu-my-collection">
            <a :href="`${PORTAL}/mycollection/index.php`" target="_blank" rel="noopener">{{ $t('gallery.nav.myCollection') }}</a>
          </li>
        </ul>
        <!-- The standing notice legacy shipped under the menu. It used to name
             the gallery in the middle of the sentence; the sentence now stands
             on its own, because a text takes nothing inserted into it and a
             translator must be able to move every word of it freely. -->
        <div id="database-announcement">
          <span>{{ $t('gallery.notice.tip') }}</span>
          {{ $t('gallery.notice.databaseReplaced') }}
        </div>
      </div>
    </template>

    <slot />

    <template #footer>
      <div id="footer-links">
        <a :href="`${PORTAL}/about`" target="_blank" rel="noopener">{{ $t('gallery.footer.aboutMwnf') }}</a> |
        <a :href="`${PORTAL}/about/contact`" target="_blank" rel="noopener">{{ $t('gallery.footer.contact') }}</a> |
        <a :href="`${PORTAL}/about/legal-notice`" target="_blank" rel="noopener">{{ $t('gallery.footer.legalNotice') }}</a> |
        <a :href="`${PORTAL}/about/credits`" target="_blank" rel="noopener">{{ $t('gallery.footer.credits') }}</a> |
        <a :href="`${PORTAL}/about/cookies`" target="_blank" rel="noopener">{{ $t('gallery.footer.cookies') }}</a> |
        <span>{{ $t('gallery.footer.copyright') }} 2004–{{ currentYear }}</span>
      </div>
    </template>
  </PageShell>
</template>

<style scoped>
/* ── Header ─────────────────────────────────────────────────────────────── */
#header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 80px;
}
#logo-container { padding: 0 14px; z-index: 8; }
#logo-container a { text-decoration: none; }
.logo-mark {
  display: inline-block;
  border: 2px solid var(--light-text);
  padding: 4px 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-size: 18px;
}
/* Legacy centred the title with position:absolute + max-width:45% and then
   walked the font size down through five breakpoints. Laying it out as the
   flex row's middle cell gets the same centred result and cannot overlap the
   logo or the portal links at any width. */
#title-container {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 6px 8px;
  z-index: 10;
}
#title-container a {
  display: flex;
  flex-direction: column;
  color: var(--light-text);
  text-decoration: none;
}
#galleries-alt-header { font-size: 14px; }
#title {
  font-size: clamp(18px, 2.4vw, 30px);
  line-height: 1.05;
  margin-top: 4px;
  overflow-wrap: break-word;
  /* Was `.toUpperCase()` on the gallery's name; see the note on the menu. */
  text-transform: uppercase;
}

#portals-search-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px 12px;
  font-size: 14px;
  z-index: 10;
}
#portal-links a { color: var(--light-text); text-decoration: none; padding: 0 8px; }
#portal-links a:hover { text-decoration: underline; }
#search-container { padding-top: 8px; }
#search-input {
  border: 2px solid var(--light-text);
  border-radius: 4px;
  padding: 4px 6px;
  margin-right: 5px;
  font-family: inherit;
}
#search-submit {
  border: 2px solid var(--theme-medium);
  background: var(--theme-medium);
  border-radius: 4px;
  color: var(--light-text);
  padding: 4px 10px;
  cursor: pointer;
  font-size: 15px;
}
#language-switch { display: flex; gap: 4px; padding-top: 6px; }
#language-switch button {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: var(--light-text);
  font-family: inherit;
  font-size: 12px;
  padding: 2px 7px;
  cursor: pointer;
  border-radius: 3px;
}
#language-switch button.lang-active { background: var(--theme-medium); border-color: var(--theme-medium); }

/* ── Navigation ─────────────────────────────────────────────────────────── */
#navigation-inner { width: 100%; }
#navigation-inner ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
  margin: 0;
  padding: 0;
}
#navigation-inner li {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
  line-height: 28px;
}
#navigation-inner li:nth-child(odd) { background: var(--theme-medium-dark); }
#navigation-inner li:nth-child(even) { background: var(--theme-light); }
#navigation-inner a {
  width: 100%;
  text-align: center;
  color: var(--light-text);
  text-decoration: none;
  padding: 2px 4px;
  /* Legacy upper-cased the menu in JavaScript. Doing it in CSS instead keeps
     each entry stored in its natural case, which is the only form a translator
     can work with — and the only form that means anything in Arabic. */
  text-transform: uppercase;
}
#navigation-inner a.router-link-active { background: rgba(0, 0, 0, 0.18); }
#database-announcement {
  width: 100%;
  font-size: 90%;
  background: var(--theme-dark);
  color: var(--light-text);
  text-align: center;
  padding: 5px 15px;
}
#database-announcement span { font-weight: 700; }
#hamburger { display: none; }

/* ── Footer ─────────────────────────────────────────────────────────────── */
#footer-links { width: 100%; text-align: center; }
#footer-links a { color: var(--light-text); text-decoration: none; }
#footer-links a:hover { text-decoration: underline; }

@media only screen and (max-width: 974px) {
  #navigation-inner ul { grid-template-columns: repeat(3, 1fr); }
}

@media only screen and (max-width: 599px) {
  #header-inner { min-height: 65px; flex-wrap: wrap; }
  #title-container { flex-basis: 100%; order: 3; }
  #navigation-inner ul { display: none; }
  #navigation-inner ul.open { display: flex; flex-direction: column; }
  #hamburger {
    display: block;
    background: var(--theme-dark);
    color: var(--light-text);
    border: none;
    width: 100%;
    padding: 6px;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
