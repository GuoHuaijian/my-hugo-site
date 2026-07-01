<script setup>
import { computed, onMounted, ref } from 'vue'
import { FileText, Tag, Hash } from 'lucide-vue-next'
import { useContentLoader } from '../composables/useContentLoader'

const { index, loadIndex } = useContentLoader()
const notes = computed(() => index.value?.notes || [])

const activeTag = ref('')

const tagGroups = computed(() => {
  const groups = {}
  for (const note of notes.value) {
    if (note.draft) continue
    for (const tag of (note.tags || [])) {
      if (!groups[tag]) groups[tag] = []
      groups[tag].push(note)
    }
  }
  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([tag, items]) => ({
      tag,
      count: items.length,
      items: items.sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
})

const maxCount = computed(() => Math.max(...tagGroups.value.map(g => g.count), 1))

const filteredNotes = computed(() => {
  if (!activeTag.value) return []
  const group = tagGroups.value.find(g => g.tag === activeTag.value)
  return group ? group.items : []
})

const totalNotes = computed(() => notes.value.filter((n) => !n.draft).length)
const totalTags = computed(() => tagGroups.value.length)

function getTagSize(count) {
  const min = 0.8125
  const max = 1.3
  const ratio = count / maxCount.value
  return `${min + ratio * (max - min)}rem`
}

function toggleTag(tag) {
  activeTag.value = activeTag.value === tag ? '' : tag
}

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell tags-page">
    <header class="page-heading">
      <p class="eyebrow">TAGS</p>
      <h1>笔记标签</h1>
      <p class="muted">{{ totalTags }} 个标签，{{ totalNotes }} 篇笔记</p>
    </header>

    <div v-if="tagGroups.length === 0" class="empty card">
      <Tag :size="32" class="empty-icon" />
      <h2>还没有标签</h2>
      <p>给笔记添加 tags 后，这里会展示标签云。</p>
    </div>

    <template v-else>
      <!-- Tag Cloud -->
      <div class="tag-cloud">
        <button
          v-for="group in tagGroups"
          :key="group.tag"
          class="cloud-tag"
          :class="{ active: activeTag === group.tag }"
          :style="{ fontSize: getTagSize(group.count) }"
          @click="toggleTag(group.tag)"
        >
          <Hash :size="13" aria-hidden="true" />
          {{ group.tag }}
          <span class="cloud-tag-count">{{ group.count }}</span>
        </button>
      </div>

      <!-- Filtered Results -->
      <transition name="fade" mode="out-in">
        <div v-if="activeTag" :key="activeTag" class="filtered-section">
          <div class="filtered-header">
            <div class="filtered-title-group">
              <Tag :size="18" class="filtered-tag-icon" />
              <h2>{{ activeTag }}</h2>
              <span class="filtered-count">{{ filteredNotes.length }} 篇</span>
            </div>
            <button class="clear-btn" @click="activeTag = ''">
              清除筛选
            </button>
          </div>
          <div class="filtered-list">
            <RouterLink
              v-for="(item, i) in filteredNotes"
              :key="item.slug"
              :to="`/notes/${item.slug}`"
              class="filtered-item"
              :style="{ animationDelay: `${i * 50}ms` }"
            >
              <span class="filtered-date">{{ item.date?.slice(0, 10) || '' }}</span>
              <FileText :size="14" class="filtered-icon" aria-hidden="true" />
              <span class="filtered-title">{{ item.title }}</span>
              <span v-if="item.readingTime" class="filtered-meta">约 {{ item.readingTime }} 分钟</span>
            </RouterLink>
          </div>
        </div>

        <div v-else class="empty-hint">
          <Hash :size="20" class="hint-icon" />
          <p>选择标签查看对应笔记</p>
        </div>
      </transition>
    </template>
  </section>
</template>

<style scoped>
.tags-page {
  max-width: 800px;
}

/* Empty State */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-8);
  text-align: center;
}

.empty-icon {
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.empty h2 {
  margin: 0;
}

.empty p {
  margin: 0;
  color: var(--color-text-secondary);
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 12px;
  padding: var(--space-6) var(--space-4);
  margin-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
}

.cloud-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.5;
  transition: all var(--transition-fast);
}

.cloud-tag svg {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.cloud-tag:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(var(--color-accent-rgb), 0.04);
}

.cloud-tag:hover svg {
  opacity: 0.8;
}

.cloud-tag.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.cloud-tag.active svg {
  opacity: 1;
  color: white;
}

.cloud-tag-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: rgba(var(--color-accent-rgb), 0.1);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
}

.cloud-tag.active .cloud-tag-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Filtered Section */
.filtered-section {
  padding-top: var(--space-2);
}

.filtered-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.filtered-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filtered-tag-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.filtered-title-group h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.filtered-count {
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.clear-btn {
  flex-shrink: 0;
  padding: 5px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.filtered-list {
  display: grid;
  gap: 4px;
}

.filtered-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  animation: fade-in-up 300ms both;
}

.filtered-item:hover {
  background: var(--color-accent-light);
  text-decoration: none;
}

.filtered-item:hover .filtered-title {
  color: var(--color-accent);
}

.filtered-date {
  flex-shrink: 0;
  width: 82px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-align: right;
}

.filtered-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.filtered-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.filtered-meta {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  opacity: 0.7;
}

/* Empty Hint */
.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) 0;
  text-align: center;
}

.hint-icon {
  color: var(--color-text-tertiary);
  opacity: 0.4;
}

.empty-hint p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .filtered-item {
    flex-wrap: wrap;
    gap: 4px 10px;
    padding: 10px 12px;
  }

  .filtered-date {
    width: auto;
  }

  .filtered-meta {
    display: none;
  }

  .tag-cloud {
    gap: 8px 10px;
    padding: var(--space-4) var(--space-2);
  }
}
</style>
