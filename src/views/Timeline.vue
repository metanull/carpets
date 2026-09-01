<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { I18nText, useI18n } from '@metanull/viewer-core'
import { timelineCountries, eventYearBuckets } from '../composables/useTimeline.js'

// Timeline entry form. The chronology is the global, project-independent
// country timeline — `mwnf3.hcr` merged with Sharing History exhibition 2, the
// way legacy's `/v2/events` serves it — which every gallery package ships in
// full. That is why this page works even though the gallery's own
// `has_country_timeline` flag is false, exactly as on the live site.
const router = useRouter()
const { t } = useI18n()
const yearBuckets = computed(() => eventYearBuckets(t))

const country = ref('')
const start = ref('')
const end = ref('')

function goToResults() {
  router.push({
    name: 'timeline-results',
    query: { c: country.value || 'all', start: start.value, end: end.value },
  })
}
</script>

<template>
  <div id="timeline-page">
    <div id="timeline-form">
      <select class="legacy-select" v-model="country">
        <option value="" disabled>{{ $t('gallery.timeline.selectCountry') }}</option>
        <option v-for="c in timelineCountries" :key="c[0]" :value="c[0]">{{ c[1] }}</option>
      </select>

      <div id="timeline-dates-container">
        <select class="legacy-select" v-model="start">
          <option value="" disabled>{{ $t('gallery.facet.startDate') }}</option>
          <option v-for="d in yearBuckets" :key="`s${d[0]}`" :value="d[0]">{{ d[1] }}</option>
        </select>
        <select class="legacy-select" v-model="end">
          <option value="" disabled>{{ $t('gallery.facet.endDate') }}</option>
          <option v-for="d in yearBuckets" :key="`e${d[0]}`" :value="d[0]">{{ d[1] }}</option>
        </select>
      </div>

      <div id="timeline-go">
        <button class="legacy-button" @click="goToResults()">{{ $t('gallery.action.go') }}</button>
      </div>
    </div>

    <!-- Legacy hardcoded this copy in English; it is a shared entry now, with
         the three project links and the contact address written as Markdown
         links inside it. -->
    <I18nText id="timeline-description" class="prose" dir="auto" keypath="gallery.timeline.intro" />
  </div>
</template>

<style scoped>
#timeline-page { display: flex; background: #fff; width: 100%; min-height: 400px; }
#timeline-form { display: flex; flex-direction: column; width: 40%; padding: 50px; max-width: 350px; }
#timeline-dates-container { display: flex; gap: 10px; }
#timeline-go { margin-top: 16px; }
#timeline-description { width: 60%; padding: 50px 75px 50px 0; line-height: 1.55; }
#timeline-description a { color: var(--link-blue); }

@media only screen and (max-width: 849px) {
  #timeline-page { flex-direction: column; }
  #timeline-form, #timeline-description { width: 100%; max-width: none; padding: 30px; }
}
</style>
