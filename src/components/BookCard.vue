<script setup>
import { computed } from 'vue'

const props = defineProps({
  book: { type: Object, required: true }
})

const firstChapter = computed(() => props.book.chapters?.[0])
const bookLink = computed(() => {
  const chapter = firstChapter.value
  if (!chapter) return `/books/${props.book.slug}`
  if (chapter.type === 'pdf') {
    return `/books/${props.book.slug}/pdf/${chapter.slug}`
  }
  return `/books/${props.book.slug}/${chapter.slug}`
})
const linkText = computed(() => {
  const chapter = firstChapter.value
  if (!chapter) return '翻开书籍'
  if (chapter.type === 'pdf') return '阅读 PDF'
  return '翻开书籍'
})
</script>

<template>
  <article class="book-card card">
    <div class="cover" aria-hidden="true">
      <img v-if="book.cover" :src="book.cover" :alt="book.title" />
      <svg v-else viewBox="0 0 232 336" xmlns="http://www.w3.org/2000/svg">
        <rect width="232" height="336" fill="var(--color-accent-light)" rx="8"/>
        <text x="116" y="170" text-anchor="middle" font-size="32" fill="var(--color-accent)">📖</text>
      </svg>
    </div>
    <div class="book-info">
      <span class="status">{{ book.status }}</span>
      <h3>{{ book.title }}</h3>
      <p class="author">{{ book.author }}</p>
      <p class="quote">{{ book.quote }}</p>
      <RouterLink class="btn" :to="bookLink">{{ linkText }}</RouterLink>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: var(--space-5);
  padding: var(--space-5);
  min-height: 200px;
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px var(--color-shadow-hover);
}

.cover {
  display: grid;
  place-items: center;
  min-height: 168px;
  height: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-accent-light);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover svg {
  width: 100%;
  height: 100%;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.status {
  color: var(--color-success);
  font-size: var(--text-xs);
  font-weight: 700;
}

h3 {
  margin: 0;
  font-size: var(--text-lg);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

.quote {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.btn {
  margin-top: auto;
  align-self: start;
}

@media (max-width: 520px) {
  .book-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .cover {
    min-height: 120px;
  }
}
</style>
