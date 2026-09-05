<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from '@metanull/viewer-core'
import { items, md } from '../composables/useGalleryData.js'
import {
  findEvents, eraLabel, timelineCountries, eventYearBuckets, countryIdForCode,
} from '../composables/useTimeline.js'
import { paginate } from '../composables/useCollection.js'
import PageLinks from '../components/PageLinks.vue'
import BackLink from '../components/BackLink.vue'

// Timeline results, with the "See Gallery" cross-link legacy showed whenever
// the chosen country/period actually contains member items — the timeline
// gallery page joins events to items by country and year range client-side.
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const yearBuckets = computed(() => eventYearBuckets(t))
const era = (year) => eraLabel(year, t)

const EVENTS_PER_PAGE = 25

const country = ref(String(route.query.c ?? 'all'))
const start = ref(route.query.start ?? '')
const end = ref(route.query.end ?? '')

watch(() => route.fullPath, () => {
  country.value = String(route.query.c ?? 'all')
  start.value = route.query.start ?? ''
  end.value = route.query.end ?? ''
})

const events = computed(() => findEvents({
  countryCode: String(route.query.c ?? 'all'),
  start: route.query.start,
  end: route.query.end,
}))
const page = computed(() => paginate(events.value, route.query.page ?? 1, EVENTS_PER_PAGE))

const countryName = computed(() =>
  timelineCountries.value.find(c => c[0] === String(route.query.c ?? 'all'))?.[1]
    ?? t('gallery.timeline.allCountries')
)

function goToResults() {
  router.push({
    name: 'timeline-results',
    query: { c: country.value || 'all', start: start.value, end: end.value },
  })
}

function navigate(p) {
  router.push({ name: 'timeline-results', query: { ...route.query, page: p } })
}

// Member items in the same country and period — the condition legacy used to
// decide whether to offer the gallery view.
const galleryItems = computed(() => {
  const countryId = countryIdForCode(String(route.query.c ?? 'all'))
  if (!countryId) return []
  const from = route.query.start ? Number(route.query.start) : null
  const to = route.query.end ? Number(route.query.end) : null
  return items.value.filter(i => {
    if (i.country_id !== countryId) return false
    const itemStart = i.start_date
    const itemEnd = i.end_date ?? i.start_date
    if (!Number.isFinite(itemStart)) return false
    if (from != null && itemEnd < from) return false
    if (to != null && itemStart > to) return false
    return true
  })
})
</script>

<template>
  <div id="timeline-results-wrapper">
    <div id="timeline-results-search-container">
      <p id="current-search">
        {{ $t('gallery.section.timeline') }} |
        {{ route.query.start ? era(Number(route.query.start)) : $t('gallery.timeline.earliest') }}
        {{ $t('gallery.timeline.to') }}
        {{ route.query.end ? era(Number(route.query.end)) : $t('gallery.timeline.latest') }} |
        <span>{{ countryName }} | {{ page.total }} {{ $t('gallery.results.heading') }}</span>
      </p>

      <div id="search-fields">
        <label>{{ $t('gallery.facet.startDate') }}
          <select class="legacy-select" v-model="start">
            <option value="">{{ $t('gallery.facet.any') }}</option>
            <option v-for="d in yearBuckets" :key="`s${d[0]}`" :value="d[0]">{{ d[1] }}</option>
          </select>
        </label>
        <label>{{ $t('gallery.facet.endDate') }}
          <select class="legacy-select" v-model="end">
            <option value="">{{ $t('gallery.facet.any') }}</option>
            <option v-for="d in yearBuckets" :key="`e${d[0]}`" :value="d[0]">{{ d[1] }}</option>
          </select>
        </label>
        <label>{{ $t('gallery.facet.country') }}
          <select class="legacy-select" v-model="country">
            <option v-for="c in timelineCountries" :key="c[0]" :value="c[0]">{{ c[1] }}</option>
          </select>
        </label>
        <button class="legacy-button" @click="goToResults()">{{ $t('gallery.action.go') }}</button>
      </div>

      <div id="related-container" v-if="galleryItems.length">
        <p class="related-header related-header--caps">{{ $t('gallery.related.title') }}</p>
        <p>
          ➤
          <RouterLink :to="{
            name: 'timeline-gallery',
            query: {
              country: String(route.query.c ?? 'all'),
              start: route.query.start || undefined,
              end: route.query.end || undefined,
            },
          }">{{ $t('gallery.action.seeGallery') }} ({{ galleryItems.length }})</RouterLink>
        </p>
      </div>
    </div>

    <BackLink />
    <PageLinks :page-info="page" @navigate="navigate" />

    <div id="timeline-results-container">
      <div id="labels-container" v-if="page.rows.length">
        <div id="date-label">{{ $t('gallery.results.date') }}</div>
        <div id="country-label">{{ $t('gallery.results.countryDescription') }}</div>
      </div>
      <div v-if="page.rows.length">
        <div class="event-container" v-for="event in page.rows" :key="event.id">
          <div class="year">{{ era(event.year_from) }}</div>
          <div class="event">
            <div class="country">{{ event.countryName }}</div>
            <div class="description" v-html="md(event.text.description)"></div>
          </div>
        </div>
      </div>
      <div id="timeline-no-results" v-else>
        {{ $t('gallery.timeline.noResults') }}
      </div>
    </div>

    <PageLinks :page-info="page" @navigate="navigate" />
  </div>
</template>

<style scoped>
#timeline-results-wrapper { background: #fff; width: 100%; min-height: 400px; padding-bottom: 30px; }
#timeline-results-search-container { background: var(--background-color); padding: 16px 20px; }
#current-search { font-size: 16px; margin-bottom: 10px; }
#current-search span { font-weight: 700; }
#search-fields { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
#search-fields label { display: flex; flex-direction: column; font-size: 13px; }
#search-fields .legacy-select { margin-top: 2px; min-width: 180px; }
#related-container { margin-top: 14px; }
.related-header { font-weight: 700; color: var(--theme-dark); }
/* Upper-cased here rather than in the text, which is stored in its natural
   case so a translator can read it. */
.related-header--caps { text-transform: uppercase; }
#related-container a { color: var(--link-blue); }

#timeline-results-container { padding: 0 20px; }
#labels-container { display: flex; gap: 12px; font-weight: 700; color: var(--theme-dark); border-bottom: 2px solid var(--theme-medium); padding-bottom: 4px; }
#date-label { flex: 0 0 120px; }
.event-container { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--background-color); }
.year { flex: 0 0 120px; font-weight: 700; }
.event { flex: 1; min-width: 0; }
.country { font-weight: 700; color: var(--theme-medium-dark); }
.description { line-height: 1.5; }
#timeline-no-results { padding: 30px 0; }

@media only screen and (max-width: 599px) {
  .event-container, #labels-container { flex-direction: column; gap: 2px; }
  .year, #date-label { flex: none; }
}
</style>
