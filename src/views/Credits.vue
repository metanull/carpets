<script setup>
import { I18nText } from '@metanull/viewer-core'
import BackLink from '../components/BackLink.vue'

// The credits name this gallery's own curators, photographers and translators,
// so there is nothing generic to inherit and the entry is this website's own —
// unlike the About page, which overloads a shared one.
</script>

<template>
  <div class="editorial">
    <BackLink />
    <I18nText class="prose" dir="auto" keypath="carpets.credits.body" />
  </div>
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
.prose { padding: 10px 50px 20px; max-width: 900px; line-height: 1.55; }
</style>
