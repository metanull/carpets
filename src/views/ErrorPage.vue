<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="editorial">
    <h1 class="page-heading">{{ $t('gallery.error.notFoundTitle') }}</h1>
    <!-- Was "Try the Collection, the Partners, or go back Home." — a sentence
         built out of three links. The three ways out are the three links; the
         sentence around them was never translatable as one piece. -->
    <div class="prose">
      <p>{{ $t('gallery.error.notFoundBody') }}</p>
      <p class="error-links">
        <RouterLink to="/collection">{{ $t('gallery.section.collection') }}</RouterLink>
        <span class="error-divider">|</span>
        <RouterLink to="/partners">{{ $t('gallery.nav.partners') }}</RouterLink>
        <span class="error-divider">|</span>
        <RouterLink to="/">{{ $t('core.nav.home') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.editorial { background: #fff; width: 100%; min-height: 400px; }
.prose { padding: 10px 40px 40px; }
.prose a { color: var(--link-blue); }
.error-links { display: flex; flex-wrap: wrap; gap: 8px; }
.error-divider { opacity: 0.5; }
</style>
