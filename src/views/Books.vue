<script setup>
import { computed, onMounted } from 'vue'
import BookCard from '../components/BookCard.vue'
import { useContentLoader } from '../composables/useContentLoader'
import siteConfig from '../../content/site-config.json'

const { index, loadIndex } = useContentLoader()
const books = computed(() => index.value?.books || [])

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell">
    <header class="page-heading">
      <p class="eyebrow">BOOKS</p>
      <h1>{{ siteConfig.pages.books.title }}</h1>
      <p class="muted">{{ siteConfig.pages.books.description }}</p>
    </header>
    <div class="grid book-grid">
      <BookCard v-for="book in books" :key="book.slug" :book="book" />
    </div>
  </section>
</template>

<style scoped>
.book-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
</style>
