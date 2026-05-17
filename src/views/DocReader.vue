<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import SideNav from '../components/SideNav.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { renderMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const router = useRouter()
const { index, loadIndex, loadText } = useContentLoader()
const article = ref({ data: {}, html: '', toc: [] })
const activeId = ref('')
const type = computed(() => route.meta.type)
const collection = computed(() => index.value?.[type.value] || [])
const current = computed(() => collection.value.find((item) => item.slug === route.params.slug))
const docs = computed(() => current.value?.docs || current.value?.chapters || [])
const pageSlug = computed(() => route.params.page || docs.value[0]?.slug)
const page = computed(() => docs.value.find((item) => item.slug === pageSlug.value))
const base = computed(() => `/${type.value}/${route.params.slug}`)

async function loadDoc() {
  await loadIndex()
  if (!route.params.page && docs.value[0]) {
    router.replace(`${base.value}/${docs.value[0].slug}`)
    return
  }
  if (!page.value) return
  const raw = await loadText(page.value.file)
  article.value = renderMarkdown(raw)
  activeId.value = article.value.toc[0]?.id || ''
  requestAnimationFrame(observeHeadings)
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
watch(() => route.fullPath, loadDoc)
</script>

<template>
  <section class="page-shell">
    <header class="doc-heading">
      <p class="eyebrow">{{ type === 'books' ? 'BOOK NOTE' : 'PROJECT DOC' }}</p>
      <h1>{{ current?.title || current?.name }}</h1>
      <p class="muted">{{ current?.quote || current?.description }}</p>
    </header>
    <div class="doc-layout">
      <SideNav :title="type === 'books' ? '章节' : '文档'" :items="docs" :base="base" :active="pageSlug" />
      <MarkdownRenderer :html="article.html" />
      <TableOfContents :items="article.toc" :active="activeId" />
    </div>
    <Comments />
  </section>
</template>

<style scoped>
.doc-heading {
  margin-bottom: var(--space-8);
}

.doc-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 200px;
  gap: var(--space-3);
  align-items: start;
}

.doc-layout > :first-child {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
}

.doc-layout > :nth-child(3) {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
}

@media (max-width: 1100px) {
  .doc-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .doc-layout > :nth-child(3) {
    display: none;
  }
}

@media (max-width: 900px) {
  .doc-layout {
    grid-template-columns: 1fr;
  }

  .doc-layout > :first-child {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}
</style>
