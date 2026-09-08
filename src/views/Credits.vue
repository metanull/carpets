<script setup>
import { TextPageView } from '@metanull/viewer-layout/views'

// The credits name this gallery's own curators, photographers and translators,
// so there is nothing generic to inherit and the entry is this website's own —
// unlike the About page, which overloads a shared one. `back: true` is the
// same fallback (browser history, else the view's own default) the bare
// `<BackLink />` this page used to mount directly already gave it.
const creditsSpec = {
  body: 'carpets.credits.body',
  back: true,
}
</script>

<template>
  <TextPageView :spec="creditsSpec" class="editorial" />
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
.editorial :deep(.mwnf-text-page__back) { padding: 12px 0 0 50px; }
.editorial :deep(.mwnf-prose) { padding: 10px 50px 20px; max-width: 900px; line-height: 1.55; }
</style>
