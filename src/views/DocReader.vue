<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import SideNav from '../components/SideNav.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { renderMarkdown } from '../composables/useMarkdown'
import { applyMeta } from '../composables/useMeta'

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

const SITE_URL = 'https://guohuaijian.github.io/my-hugo-site'

function updateMeta() {
  const c = current.value
  const p = page.value
  if (!c) return
  const title = p?.title
    ? `${p.title} · ${c.title || c.name} · 云边小卖部`
    : `${c.title || c.name} · 云边小卖部`
  const description = c.description || c.quote || ''
  const cover = c.cover || ''
  const image = cover ? `${SITE_URL}${cover}` : `${SITE_URL}/favicon.png`
  const url = `${SITE_URL}${route.fullPath}`
  const type = route.meta.type === 'books' ? 'Book' : 'TechArticle'
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    description: description.slice(0, 200),
    url,
    image: cover ? `${SITE_URL}${cover}` : undefined,
  }
  applyMeta({ title, description, url, image, type: 'article', jsonld })
}

onMounted(loadDoc)
watch(() => route.fullPath, loadDoc)

// Meta updates once content resolves
watch([current, page], ([c, p]) => {
  if (c && p !== undefined) updateMeta()
})
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
