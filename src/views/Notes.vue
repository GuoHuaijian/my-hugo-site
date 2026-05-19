<script setup>
import { computed, onMounted, ref } from 'vue'
import NoteCard from '../components/NoteCard.vue'
import Pagination from '../components/Pagination.vue'
import TagFilter from '../components/TagFilter.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { usePagination } from '../composables/usePagination'

import siteConfig from '../../content/site-config.json'
const pageSize = siteConfig.notes.perPage
const activeTags = ref([])
const { index, loadIndex } = useContentLoader()
const notes = computed(() => index.value?.notes || [])
const tags = computed(() => index.value?.allTags || [])
const filtered = computed(() => activeTags.value.length === 0 ? notes.value : notes.value.filter((note) =>
  activeTags.value.some((tag) => note.tags.includes(tag))
))
const { page, totalPages, pagedItems } = usePagination(filtered, pageSize)

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell">
    <header class="page-heading notes-heading">
      <div>
        <p class="eyebrow">NOTES</p>
        <h1>{{ siteConfig.pages.notes.title }}</h1>
        <p class="muted">{{ siteConfig.pages.notes.description }}</p>
      </div>
      <div class="notes-heading-right">
        <RouterLink class="archive-link" to="/notes/archive">归档</RouterLink>
        <p class="count">共 {{ filtered.length }} 篇</p>
      </div>
    </header>
    <TagFilter v-model:active="activeTags" :tags="tags" />
    <div v-if="pagedItems.length" class="grid notes-grid">
      <NoteCard v-for="(note, i) in pagedItems" :key="note.slug" :note="note" :index="i" />
    </div>
    <div v-else class="empty card">
      <h2>这个货架暂时是空的</h2>
      <p>换个标签看看，或者添加新的 Markdown 笔记。</p>
    </div>
    <Pagination v-model:page="page" :total="totalPages" :total-items="filtered.length" :page-size="pageSize" />
  </section>
</template>

<style scoped>
.notes-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-5);
}

.notes-heading-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
}

.archive-link {
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 4px 12px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.archive-link:hover {
  background: var(--color-accent);
  color: white;
  text-decoration: none;
}

.count {
  flex: 0 0 auto;
  margin: 0;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.notes-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 360px));
  align-items: stretch;
  justify-content: start;
}

.empty {
  padding: var(--space-8);
  text-align: center;
}

.empty h2 {
  margin-bottom: var(--space-2);
}

.empty p {
  margin: 0;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .notes-heading {
    display: block;
  }

  .notes-heading-right {
    margin-top: var(--space-3);
    justify-content: flex-start;
  }

  .count {
    margin-top: var(--space-3);
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
