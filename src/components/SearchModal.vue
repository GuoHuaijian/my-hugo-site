<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { useContentLoader } from '../composables/useContentLoader'

const router = useRouter()
const { index, loadIndex } = useContentLoader()

const open = ref(false)
const query = ref('')
const inputRef = ref(null)
const highlightIndex = ref(-1)
const resultsRef = ref(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q || !index.value) return []

  const items = []

  // Search notes
  for (const note of index.value.notes || []) {
    if (matchItem(note, q)) {
      items.push({ type: '笔记', title: note.title, summary: note.summary || '', slug: `/notes/${note.slug}`, tags: note.tags })
    }
  }

  // Search projects
  for (const project of index.value.projects || []) {
    if (matchItem(project, q)) {
      items.push({ type: '项目', title: project.name || project.title, summary: project.description || '', slug: `/projects/${project.slug}`, tags: project.tags })
    }
  }

  // Search books
  for (const book of index.value.books || []) {
    if (matchItem(book, q)) {
      items.push({ type: '读书', title: book.title, summary: book.quote || '', slug: `/books/${book.slug}`, tags: [] })
    }
  }

  // Search toolbox
  for (const category of index.value.toolbox?.categories || []) {
    for (const tool of category.items || []) {
      if (matchTool(tool, q)) {
        items.push({ type: '工具', title: tool.name, summary: tool.desc || '', slug: '/toolbox', tags: [] })
      }
    }
  }

  return items.slice(0, 20)
})

// Reset highlight when results change
watch(results, () => {
  highlightIndex.value = results.value.length > 0 ? 0 : -1
})

function matchItem(item, q) {
  const fields = [item.title, item.name, item.summary, item.description, item.quote, ...(item.tags || [])]
  return fields.some((f) => f && f.toLowerCase().includes(q))
}

function matchTool(tool, q) {
  return [tool.name, tool.desc, tool.url].some((f) => f && f.toLowerCase().includes(q))
}

function openModal() {
  open.value = true
  query.value = ''
  highlightIndex.value = -1
  setTimeout(() => inputRef.value?.focus(), 50)
}

function closeModal() {
  open.value = false
  query.value = ''
  highlightIndex.value = -1
}

function navigateTo(slug) {
  closeModal()
  router.push(slug)
}

function scrollIntoView() {
  if (!resultsRef.value) return
  const active = resultsRef.value.querySelector('.search-result-item.active')
  if (active) active.scrollIntoView({ block: 'nearest' })
}

function onKeyDown(e) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    closeModal()
    return
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value ? closeModal() : openModal()
    return
  }

  if (!open.value) return

  // Keyboard navigation within results
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.value.length === 0) return
    highlightIndex.value = (highlightIndex.value + 1) % results.value.length
    scrollIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length === 0) return
    highlightIndex.value = (highlightIndex.value - 1 + results.value.length) % results.value.length
    scrollIntoView()
  } else if (e.key === 'Enter') {
    if (highlightIndex.value >= 0 && highlightIndex.value < results.value.length) {
      e.preventDefault()
      navigateTo(results.value[highlightIndex.value].slug)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  loadIndex()
})

onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

defineExpose({ openModal })
</script>

<template>
  <button class="search-trigger" type="button" aria-label="搜索内容" @click="openModal">
    <Search :size="18" aria-hidden="true" />
    <span class="search-hint">搜索</span>
    <kbd class="search-shortcut">⌘K</kbd>
  </button>

  <Teleport to="body">
    <Transition name="search-overlay">
      <div v-if="open" class="search-overlay" @click.self="closeModal">
        <div class="search-modal" role="dialog" aria-modal="true" aria-label="全局搜索">
          <div class="search-input-wrap">
            <Search :size="18" class="search-icon" aria-hidden="true" />
            <input
              ref="inputRef"
              v-model="query"
              class="search-input"
              type="text"
              placeholder="搜索笔记、项目、读书、工具…"
              autocomplete="off"
            />
            <button class="search-close-btn" type="button" aria-label="关闭搜索" @click="closeModal">
              <X :size="16" />
            </button>
          </div>

          <div ref="resultsRef" class="search-results">
            <div v-if="query && results.length === 0" class="search-empty">
              <p>没有找到匹配「{{ query }}」的内容</p>
            </div>

            <div v-else-if="!query" class="search-empty">
              <p>输入关键词开始搜索</p>
            </div>

            <button
              v-for="(item, i) in results"
              :key="i"
              class="search-result-item"
              :class="{ active: i === highlightIndex }"
              type="button"
              @click="navigateTo(item.slug)"
              @mouseenter="highlightIndex = i"
            >
              <span class="result-type">{{ item.type }}</span>
              <div class="result-body">
                <span class="result-title" v-html="highlight(query, item.title)"></span>
                <span v-if="item.summary" class="result-summary">{{ item.summary.slice(0, 80) }}</span>
              </div>
            </button>
          </div>

          <div class="search-footer">
            <span><kbd>↑↓</kbd> 导航</span>
            <span><kbd>↵</kbd> 打开</span>
            <span><kbd>ESC</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
function highlight(q, text) {
  if (!q || !text) return text || ''
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + q.length)
  const after = text.slice(idx + q.length)
  return `${before}<mark>${match}</mark>${after}`
}
</script>

<style scoped>
.search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-card-rgb), 0.6);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-trigger:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.search-hint {
  display: none;
}

.search-shortcut {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-overlay-light);
  color: var(--color-text-tertiary);
}

@media (min-width: 768px) {
  .search-hint {
    display: inline;
  }
}

/* Overlay */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
}

.search-modal {
  width: min(92vw, 620px);
  max-height: 72vh;
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 24px 64px var(--color-shadow-hover);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Input */
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-close-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-close-btn:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

/* Results */
.search-results {
  overflow-y: auto;
  max-height: 52vh;
  padding: 8px;
}

.search-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.search-result-item:hover,
.search-result-item.active {
  background: var(--color-accent-light);
}

.result-type {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-code);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  margin-top: 2px;
}

.result-body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.result-title {
  color: var(--color-text-primary);
  font-size: 0.95rem;
  font-weight: 500;
}

.result-title :deep(mark) {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-radius: 2px;
  padding: 0 2px;
}

.result-summary {
  color: var(--color-text-tertiary);
  font-size: 0.8125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer */
.search-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.search-footer kbd {
  font-family: var(--font-mono);
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-overlay-light);
  font-size: 11px;
}

/* Transitions */
.search-overlay-enter-active,
.search-overlay-leave-active {
  transition: opacity 200ms;
}

.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;
}

.search-overlay-enter-active .search-modal,
.search-overlay-leave-active .search-modal {
  transition: transform 200ms, opacity 200ms;
}

.search-overlay-enter-from .search-modal,
.search-overlay-leave-to .search-modal {
  transform: translateY(-12px) scale(0.98);
  opacity: 0;
}
</style>
