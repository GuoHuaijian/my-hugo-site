<script setup>
import Mailbox from '../components/Mailbox.vue'
import siteConfig from '../../content/site-config.json'
</script>

<template>
  <section class="page-shell">
    <header class="page-heading guestbook-heading">
      <p class="eyebrow">GUESTBOOK</p>
      <h1>{{ siteConfig.pages.guestbook.title }}</h1>
      <p class="muted">{{ siteConfig.pages.guestbook.description }}</p>
    </header>
    <Mailbox />
  </section>
</template>

<style scoped>
.guestbook-heading {
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
}
</style>
