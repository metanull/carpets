<script setup>
import { RouterLink } from 'vue-router'
import { Pagination } from '@metanull/viewer-layout/content'
import { CatalogueResultsView } from '@metanull/viewer-layout/views'
import { timelineGallery } from '../composables/useTimeline.js'
import BackLink from '../components/BackLink.vue'

// The member items whose dates overlap the timeline search's country and
// period, on the platform's composed results view: the join, the date rule,
// the tiles and the pages are the view's, from the spec in
// composables/useTimeline.js. What is this gallery's fills the slots: the
// back link and the "back to events" link above the tiles, and a second
// pagination beside it.
</script>

<template>
  <CatalogueResultsView :spec="timelineGallery" class="timeline-gallery">
    <template #before>
      <BackLink />
    </template>

    <template #actions="{ filters, pageInfo, goToPage }">
      <p class="back-to-events">
        <RouterLink :to="{ name: 'timeline-results', query: { country: filters.country, begin: filters.begin, end: filters.end } }">
          ➤ {{ $t('timeline.nav.backToEvents') }}
        </RouterLink>
      </p>
      <Pagination class="pages" :page-info="pageInfo" jump @navigate="goToPage" />
    </template>
  </CatalogueResultsView>
</template>

<style scoped>
.timeline-gallery { background: #fff; width: 100%; min-height: 400px; padding-bottom: 30px; }
.timeline-gallery :deep(.mwnf-summary) { padding: 0 20px 12px; font-size: 15px; }
.timeline-gallery :deep(.mwnf-catalogue__body) { padding: 0 20px 20px; }
.back-to-events a { color: var(--link-blue); font-size: 13px; }
.back-to-events { margin-bottom: 8px; }
</style>
