<script setup>
import { computed, onMounted, ref } from 'vue'
import { Laptop, BookOpen, Coffee, LayoutGrid } from 'lucide-vue-next'
import NoteCard from '../components/NoteCard.vue'
import Pagination from '../components/Pagination.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { usePagination } from '../composables/usePagination'

import siteConfig from '../../content/site-config.json'
const pageSize = siteConfig.notes.perPage
const { index, loadIndex } = useContentLoader()
const notes = computed(() => index.value?.notes || [])

const activeCategory = ref('')

const categoryList = [
  { label: '技术专栏', icon: Laptop, category: '技术专栏', color: 'var(--color-accent)' },
  { label: '成长随笔', icon: BookOpen, category: '成长随笔', color: '#10b981' },
  { label: '人间烟火', icon: Coffee, category: '人间烟火', color: '#f59e0b' },
]

const categoryCounts = computed(() => {
  const counts = {}
  for (const note of notes.value) {
    if (note.draft) continue
    const cat = note.category || ''
    counts[cat] = (counts[cat] || 0) + 1
  }
  return counts
})

const categories = computed(() => categoryList.map(c => ({
  ...c,
  count: categoryCounts.value[c.category] || 0
})))

const allCount = computed(() => notes.value.filter(n => !n.draft).length)

const filtered = computed(() => {
  if (!activeCategory.value) return notes.value
  return notes.value.filter((note) => note.category === activeCategory.value)
})

const { page, totalPages, pagedItems } = usePagination(filtered, pageSize)

function toggleCategory(cat) {
  activeCategory.value = activeCategory.value === cat ? '' : cat
  page.value = 1
}

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
        <RouterLink class="archive-link" to="/notes/tags">标签</RouterLink>
        <RouterLink class="archive-link" to="/notes/archive">归档</RouterLink>
        <p class="count">共 {{ filtered.length }} 篇</p>
      </div>
    </header>
    <div class="category-nav">
      <button
        class="category-card"
        :class="{ active: !activeCategory }"
        @click="activeCategory = ''; page = 1"
      >
        <span class="category-icon-wrap">
          <LayoutGrid :size="16" aria-hidden="true" />
        </span>
        <span class="category-label">全部</span>
        <span class="category-count">{{ allCount }}</span>
      </button>
      <button
        v-for="cat in categories"
        :key="cat.category"
        class="category-card"
        :class="{ active: activeCategory === cat.category }"
        @click="toggleCategory(cat.category)"
      >
        <span class="category-icon-wrap" :style="{ '--cat-color': cat.color }">
          <component :is="cat.icon" :size="16" aria-hidden="true" />
        </span>
        <span class="category-label">{{ cat.label }}</span>
        <span class="category-count">{{ cat.count }}</span>
      </button>
    </div>
    <div v-if="pagedItems.length" class="grid notes-grid">
      <NoteCard v-for="(note, i) in pagedItems" :key="note.slug" :note="note" :index="i" />
    </div>
    <div v-else class="empty card">
      <h2>这个货架暂时是空的</h2>
      <p>该分类下还没有笔记，换一个看看？</p>
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

.category-nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.category-card {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-tertiary);
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 2;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-card:hover {
  color: var(--color-text-primary);
}

.category-card.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.category-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.category-label {
  font-weight: inherit;
  font-size: inherit;
}

.category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.category-card.active .category-count {
  background: rgba(var(--color-accent-rgb), 0.1);
  color: var(--color-accent);
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

  .category-nav {
    gap: var(--space-4);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .category-nav::-webkit-scrollbar {
    display: none;
  }

  .category-card {
    flex-shrink: 0;
    font-size: var(--text-sm);
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
