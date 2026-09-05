<script setup>
// The Carpets page chrome: `PageShell` from @metanull/viewer-layout, filled
// from props. The only things this component adds are the values that depend
// on the route or the language — which banner shows, what the section is
// called, what the switcher offers — and the MWNF mark in the header.
import { computed } from 'vue'
import { useI18n, useSiteConfig } from '@metanull/viewer-core'
import { PageShell } from '@metanull/viewer-layout'
import { useRoute, useRouter } from 'vue-router'
import {
  gallery, chromeImage, itemById, itemLabel, partnerLabel, countryLabel, tr, defaultLang, manifest,
} from './composables/useGalleryData.js'

// `language`, `languages` and `update:language` are the shell contract of
// viewer-core: the language the application is in, the languages it offers
// (labelled, from dataset.config.js) and the event that sets it.
const props = defineProps({
  language: { type: String, default: 'en' },
  languages: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:language'])

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { links } = useSiteConfig()

const galleryName = computed(() =>
  manifest.site?.names?.[locale.value] ?? manifest.site?.names?.en ?? gallery.value?.names?.en ?? ''
)
const isHome = computed(() => route.name === 'home')
const currentYear = new Date().getFullYear()

function submitSearch(term) {
  router.push({ name: 'search-results', query: { q: term || 'all-objects' } })
}

// Legacy's menu: five site sections plus the portal's My Collection. `route`
// is the path segment and never a text; each label is written out so the
// check that every entry a page asks for exists can read it.
const navLinks = computed(() => [
  { route: 'about', label: t('gallery.nav.about') },
  { route: 'collection', label: t('gallery.nav.collection') },
  { route: 'partners', label: t('gallery.nav.partners') },
  { route: 'timeline', label: t('gallery.nav.timeline') },
  { route: 'credits', label: t('gallery.nav.credits') },
].map(item => ({
  label: item.label,
  href: `#/${item.route}`,
  active: route.path === `/${item.route}` || route.path.startsWith(`/${item.route}/`) || route.path.startsWith(`/${item.route}-`),
})).concat([{ label: t('gallery.nav.myCollection'), href: links.myCollection, external: true }]))

const headerLinks = computed(() => [
  { label: t('core.nav.home'), href: '#/' },
  { label: t('gallery.nav.allGalleries'), href: `${links.galleries}/list/1`, external: true },
])

const footerLinks = computed(() => [
  { label: t('gallery.footer.aboutMwnf'), href: links.about, external: true },
  { label: t('gallery.footer.contact'), href: links.contact, external: true },
  { label: t('gallery.footer.legalNotice'), href: links.legalNotice, external: true },
  { label: t('gallery.footer.credits'), href: links.credits, external: true },
  { label: t('gallery.footer.cookies'), href: links.cookies, external: true },
])

// The banner: the gallery's own image, captioned with the banner item's sheet.
// gallery.json carries `banner_image_path` and `banner_item_id`; the image
// lives on the legacy media server, so the address is built from the host
// dataset.config.js declares.
const bannerImage = computed(() => chromeImage(gallery.value?.banner_image_path, 'hi_res'))
const bannerCaption = computed(() => {
  const item = itemById.value.get(gallery.value?.banner_item_id)
  if (!item) return ''
  const sheet = tr('items', item.id, defaultLang)
  return {
    name: itemLabel(item),
    partner: partnerLabel(item.partner_id),
    location: sheet.location ?? '',
    country: countryLabel(item.country_id),
  }
})

// The section title over the narrow banner, derived from the route: data
// the site owns, rendered by the layout.
const sectionTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/collection')) return t('gallery.section.collection')
  if (path.startsWith('/item') || path.startsWith('/search')) return t('gallery.section.database')
  if (path.startsWith('/how-to-search')) return t('gallery.section.database')
  if (path.startsWith('/partner')) return t('gallery.section.partners')
  if (path.startsWith('/timeline')) return t('gallery.section.timeline')
  if (path.startsWith('/about')) return t('gallery.section.about')
  if (path.startsWith('/credits')) return t('gallery.section.credits')
  return t('gallery.section.error')
})
</script>

<template>
  <PageShell
    :languages="props.languages"
    :language="props.language"
    language-placement="header"
    language-style="buttons"
    :header-home="links.portal"
    :header-eyebrow="isHome ? '' : t('gallery.nav.galleries')"
    :header-title="isHome ? '' : galleryName"
    header-title-href="#/"
    :header-links="headerLinks"
    :search="{ placeholder: t('gallery.search.placeholder'), submitLabel: t('gallery.search.submit') }"
    :banner-variant="isHome ? 'strip' : 'section'"
    :banner-image="bannerImage"
    :banner-caption="bannerCaption"
    :banner-caption-label="t('gallery.banner.detailFrom')"
    :banner-eyebrow="isHome ? t('gallery.banner.discoverGalleries') : ''"
    :banner-title="isHome ? galleryName : sectionTitle"
    :banner-enter="isHome ? { label: '»', href: '#/collection', ariaLabel: t('gallery.action.goToCollection') } : null"
    :nav-links="navLinks"
    :notice="{ title: t('gallery.notice.tip'), text: t('gallery.notice.databaseReplaced') }"
    :footer-links="footerLinks"
    :footer-text="`${t('gallery.footer.copyright')} 2004–${currentYear}`"
    @search="submitSearch"
    @update:language="emit('update:language', $event)"
  >
    <template #header-brand><span class="logo-mark">MWNF</span></template>
    <slot />
  </PageShell>
</template>

<style scoped>
.logo-mark {
  display: inline-block;
  border: 2px solid currentColor;
  padding: 4px 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-size: 18px;
}
</style>
