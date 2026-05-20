<script setup>
import { computed, onMounted } from 'vue'
import { CalendarDays, FileText } from 'lucide-vue-next'
import { useContentLoader } from '../composables/useContentLoader'
import siteConfig from '../../content/site-config.json'

const { index, loadIndex } = useContentLoader()
const notes = computed(() => index.value?.notes || [])

const uniqueYears = computed(() => {
  const years = new Set()
  for (const note of notes.value) {
    if (note.draft) continue
    if (note.date) years.add(note.date.slice(0, 4))
  }
  return [...years].sort((a, b) => b - a)
})

const archive = computed(() => {
  const groups = {}
  for (const note of notes.value) {
    if (note.draft) continue
    const year = note.date ? note.date.slice(0, 4) : '未知'
    const month = note.date ? note.date.slice(5, 7) : '00'
    const key = `${year}-${month}`
    if (!groups[key]) {
      groups[key] = { year, month, label: `${year} 年 ${month} 月`, items: [] }
    }
    groups[key].items.push(note)
  }
  // Sort groups by date descending
  const sorted = Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
  // Sort items within each group by date descending
  for (const group of sorted) {
    group.items.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  return sorted
})

const totalNotes = computed(() => notes.value.filter((n) => !n.draft).length)

function scrollToYear(year) {
  const el = document.getElementById(`archive-year-${year}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell archive-page">
    <header class="page-heading">
      <p class="eyebrow">ARCHIVE</p>
      <h1>笔记归档</h1>
      <p class="muted">共 {{ totalNotes }} 篇笔记，按时间排列。</p>
      <nav v-if="uniqueYears.length > 1" class="archive-year-nav" aria-label="按年份跳转">
        <span class="archive-year-nav-label">跳至：</span>
        <a v-for="year in uniqueYears" :key="year" :href="`#archive-year-${year}`" @click.prevent="scrollToYear(year)">
          {{ year }}
        </a>
      </nav>
    </header>

    <div v-if="archive.length === 0" class="empty card">
      <h2>还没有笔记</h2>
      <p>等店主进货后，这里会按时间排列所有笔记。</p>
    </div>

    <div v-else class="archive-timeline">
      <div v-for="group in archive" :key="group.label" class="archive-group">
        <div :id="`archive-year-${group.year}`" class="archive-group-header">
          <CalendarDays :size="18" aria-hidden="true" />
          <h2>{{ group.label }}</h2>
          <span class="archive-count">{{ group.items.length }} 篇</span>
        </div>
        <div class="archive-items">
          <RouterLink
            v-for="item in group.items"
            :key="item.slug"
            :to="`/notes/${item.slug}`"
            class="archive-item"
          >
            <span class="archive-date">{{ item.date?.slice(5) || '' }}</span>
            <FileText :size="14" class="archive-item-icon" aria-hidden="true" />
            <span class="archive-title">{{ item.title }}</span>
            <span class="archive-tags">
              <span v-for="tag in item.tags?.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.archive-page {
  max-width: 800px;
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

.archive-timeline {
  display: grid;
  gap: var(--space-10);
}

.archive-group {
  animation: fade-in-up 300ms both;
}

.archive-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-accent-light);
}

.archive-group-header svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.archive-group-header h2 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
}

.archive-count {
  margin-left: auto;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.archive-items {
  display: grid;
  gap: 6px;
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
}

.archive-item:hover {
  background: var(--color-accent-light);
  text-decoration: none;
}

.archive-item:hover .archive-title {
  color: var(--color-accent);
}

.archive-date {
  flex-shrink: 0;
  width: 36px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-align: right;
}

.archive-item-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}

.archive-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.archive-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.archive-tags .tag {
  font-size: 11px;
  padding: 1px 6px;
}

.archive-year-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-card-rgb), 0.55);
  font-size: var(--text-sm);
  overflow-x: auto;
  scrollbar-width: none;
}

.archive-year-nav::-webkit-scrollbar {
  display: none;
}

.archive-year-nav-label {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.archive-year-nav a {
  flex-shrink: 0;
  padding: 3px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.archive-year-nav a:hover {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  text-decoration: none;
}

@media (max-width: 640px) {
  .archive-item {
    flex-wrap: wrap;
    gap: 6px 10px;
  }

  .archive-date {
    width: auto;
  }

  .archive-tags {
    display: none;
  }
}
</style>
