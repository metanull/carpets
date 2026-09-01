<script setup>
import { I18nText } from '@metanull/viewer-core'
import BackLink from '../components/BackLink.vue'

// `gallery.about.body` is a shared entry every gallery receives, holding the
// generic *MWNF Galleries* text; this gallery overloads it in its own
// locales/en.json with its own. Legacy rendered this and nothing else — the
// page title comes from the sub-banner.
//
// `dir="auto"` replaces the old `dirFor()`, which asked the catalogue whether
// the active language really had this text and pinned the block left-to-right
// when it was falling back to English. The runtime does not answer that
// question any more, and it never needed to be asked: the browser reads the
// direction off the text it was actually given, and keeps being right when a
// translation arrives.
</script>

<template>
  <div class="editorial">
    <BackLink />
    <I18nText class="prose" dir="auto" keypath="gallery.about.body" />
  </div>
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; padding-bottom: 40px; }
.prose { padding: 10px 50px 20px; max-width: 900px; line-height: 1.55; }
</style>
