<script setup>
import { onMounted } from 'vue'
import BackToTop from './components/BackToTop.vue'
import Navbar from './components/Navbar.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useMeta } from './composables/useMeta'

// Activates per-route meta tag updates (title, description, OG, canonical, JSON-LD)
useMeta()
</script>

<template>
  <Navbar />
  <main id="main-content" class="app-main">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
  <BackToTop />
</template>
