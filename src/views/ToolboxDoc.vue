<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { renderMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const { index, loadIndex, loadText } = useContentLoader()
const article = ref({ data: {}, html: '', toc: [] })
const activeId = ref('')
const loading = ref(true)
const error = ref('')
const docItem = ref(null)

const docName = computed(() => route.params.doc)

function findDocItem() {
  const name = docName.value
  const toolbox = index.value?.toolbox
  if (!toolbox?.categories) return null
  for (const cat of toolbox.categories) {
    const item = cat.items?.find(i => i.name === name)
    if (item) return item
  }
  return null
}

async function loadDoc() {
  loading.value = true
  error.value = ''
  docItem.value = null
  article.value = { data: {}, html: '', toc: [] }
  activeId.value = ''
  
  try {
    await loadIndex()
  } catch (e) {
    error.value = '内容索引加载失败'
    loading.value = false
    return
  }
  
  docItem.value = findDocItem()
  
  if (!docItem.value?.file) {
    error.value = `找不到文档：${docName.value}`
    loading.value = false
    return
  }
  
  try {
    const raw = await loadText(docItem.value.file)
    article.value = renderMarkdown(raw)
    activeId.value = article.value.toc[0]?.id || ''
    requestAnimationFrame(observeHeadings)
  } catch (e) {
    error.value = `文档加载失败：${docItem.value.file}`
    console.error(e)
  } finally {
    loading.value = false
  }
}

function observeHeadings() {
  const headings = [...document.querySelectorAll('.markdown-body h2, .markdown-body h3')]
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activeId.value = entry.target.id
    })
  }, { rootMargin: '-20% 0px -70% 0px' })
  headings.forEach((heading) => observer.observe(heading))
}

onMounted(loadDoc)
watch(() => route.params.doc, loadDoc)
</script>

<template>
  <section class="page-shell">
    <header class="doc-heading">
      <p class="eyebrow">TOOLBOX DOC</p>
      <h1>{{ docItem?.name || docName }}</h1>
      <p class="muted">{{ docItem?.description }}</p>
    </header>
    
    <div v-if="loading" class="doc-loading">加载中...</div>
    <div v-else-if="error" class="doc-error">{{ error }}</div>
    <div v-else class="doc-layout">
      <MarkdownRenderer :html="article.html" />
      <TableOfContents :items="article.toc" :active="activeId" />
    </div>
    
    <RouterLink class="back-link" to="/toolbox">← 返回百宝箱</RouterLink>
  </section>
</template>

<style scoped>
.doc-heading {
  margin-bottom: var(--space-8);
}

.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: var(--space-3);
  align-items: start;
}

.doc-layout > :nth-child(2) {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
}

.doc-loading,
.doc-error {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
}

.doc-error {
  color: var(--color-inline-code);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
  color: var(--color-accent);
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .doc-layout {
    grid-template-columns: 1fr;
  }

  .doc-layout > :nth-child(2) {
    display: none;
  }
}
</style>
