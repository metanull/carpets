<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { I18nText, useI18n } from '@metanull/viewer-core'
import { items } from '../composables/useGalleryData.js'
import {
  countryOptions, facetOptions, yearBuckets, facetLabels, FACET_CATEGORIES,
} from '../composables/useCollection.js'

// The collection entry form. Every dropdown is built from the *whole* member
// universe here — narrowing only starts once a selection exists, which is what
// takes you to /collection-results.
const router = useRouter()
const { t } = useI18n()

const all = computed(() => items.value)
const countries = computed(() => countryOptions(all.value))
const facets = computed(() => facetOptions(all.value))
const years = computed(() => yearBuckets(all.value, t))
const labels = computed(() => facetLabels(t))

const selection = ref({ country: '', type: '', dynasty: '', subject: '', material: '', artist: '', start: '', end: '' })

function goToResults(key, value) {
  router.push({ name: 'collection-results', query: { [key]: value } })
}

const visibleFacets = computed(() =>
  FACET_CATEGORIES.filter(c => (facets.value[c] ?? []).length > 0)
)
</script>

<template>
  <div id="collection-search-container">
    <div id="dropdowns">
      <div id="dropdown-label">{{ $t('gallery.facet.filterBy') }}</div>
      <div id="select-container">
        <select class="legacy-select" v-model="selection.country" @change="goToResults('country', selection.country)">
          <option value="" disabled>{{ $t('gallery.facet.selectCountry') }}</option>
          <option v-for="c in countries" :key="c[0]" :value="c[0]">{{ c[1] }}</option>
        </select>

        <select
          v-for="category in visibleFacets"
          :key="category"
          class="legacy-select"
          v-model="selection[category]"
          @change="goToResults(category, selection[category])"
        >
          <option value="" disabled>{{ labels[category] }}</option>
          <option v-for="tag in facets[category]" :key="tag[0]" :value="tag[0]">{{ tag[1] }}</option>
        </select>

        <div id="dates-container">
          <select class="legacy-select" v-model="selection.start" @change="goToResults('start', selection.start)">
            <option value="" disabled>{{ $t('gallery.facet.startDate') }}</option>
            <option v-for="d in years" :key="`s${d[0]}`" :value="d[0]">{{ d[1] }}</option>
          </select>
          <select class="legacy-select" v-model="selection.end" @change="goToResults('end', selection.end)">
            <option value="" disabled>{{ $t('gallery.facet.endDate') }}</option>
            <option v-for="d in years" :key="`e${d[0]}`" :value="d[0]">{{ d[1] }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Legacy hardcoded this copy in English and named the gallery in the
         middle of the first sentence. It is a shared entry now, and it names
         "this Gallery" instead: a text takes nothing inserted into it, and the
         three internal links are Markdown links to the same hash routes. -->
    <I18nText id="description" class="prose" dir="auto" keypath="gallery.collection.intro" />
  </div>
</template>

<style scoped>
#collection-search-container {
  display: flex;
  background: #fff;
  width: 100%;
}
#dropdowns { display: flex; flex-direction: column; width: 40%; padding: 50px; }
#dropdown-label { max-width: 300px; padding-bottom: 6px; font-size: 125%; font-weight: 700; }
#select-container { width: 100%; max-width: 300px; }
#dates-container { display: flex; gap: 10px; max-width: 300px; }
#description { width: 60%; padding: 50px 75px 50px 0; margin-top: 45px; }
.italic { font-style: italic; }
#description a { color: var(--link-blue); }

@media only screen and (max-width: 849px) {
  #collection-search-container { flex-direction: column; }
  #dropdowns, #description { width: 100%; padding: 30px; margin-top: 0; }
}
</style>
