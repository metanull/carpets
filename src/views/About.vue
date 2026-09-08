<script setup>
import { TextPageView } from '@metanull/viewer-layout/views'

// `gallery.about.body` is a shared entry every gallery receives, holding the
// generic *MWNF Galleries* text; this gallery overloads it in its own
// locales/en.json with its own. Legacy rendered this and nothing else — the
// page title comes from the sub-banner, so the spec has no `heading`, and
// `back` is `true`: browser history when there is one, the view's own
// generic fallback otherwise, the same as the bare `<BackLink />` this page
// used to mount directly.
const aboutSpec = {
  body: 'gallery.about.body',
  back: true,
}
</script>

<template>
  <TextPageView :spec="aboutSpec" class="editorial" />
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
.editorial :deep(.mwnf-text-page__back) { padding: 12px 0 0 50px; }
.editorial :deep(.mwnf-prose) { padding: 10px 50px 20px; max-width: 900px; line-height: 1.55; }
</style>
