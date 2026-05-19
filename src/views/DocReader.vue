<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import ReadingProgress from '../components/ReadingProgress.vue'
import SideNav from '../components/SideNav.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { useHeadingObserver } from '../composables/useHeadingObserver'
import { renderMarkdown } from '../composables/useMarkdown'
import { applyMeta } from '../composables/useMeta'
import siteConfig from '../../content/site-config.json'

const route = useRoute()
const router = useRouter()
const { index, loadIndex, loadText } = useContentLoader()
const article = ref({ data: {}, html: '', toc: [] })
const loading = ref(true)
const { activeId, observeHeadings } = useHeadingObserver()
const type = computed(() => route.meta.type)
const collection = computed(() => index.value?.[type.value] || [])
const current = computed(() => collection.value.find((item) => item.slug === route.params.slug))
const docs = computed(() => current.value?.docs || current.value?.chapters || [])
const pageSlug = computed(() => route.params.page || docs.value[0]?.slug)
const page = computed(() => docs.value.find((item) => item.slug === pageSlug.value))
const base = computed(() => `/${type.value}/${route.params.slug}`)

async function loadDoc() {
  loading.value = true
  await loadIndex()
  if (!route.params.page && docs.value[0]) {
    loading.value = false
    router.replace(`${base.value}/${docs.value[0].slug}`)
    return
  }
  if (!page.value) { loading.value = false; return }
  try {
    const raw = await loadText(page.value.file)
    article.value = renderMarkdown(raw)
    activeId.value = article.value.toc[0]?.id || ''
    requestAnimationFrame(observeHeadings)
  } finally {
    loading.value = false
  }
}

const SITE_URL = siteConfig.site.url

function updateMeta() {
  const c = current.value
  const p = page.value
  if (!c) return
  const title = p?.title
    ? `${p.title} · ${c.title || c.name} · ${siteConfig.site.name}`
    : `${c.title || c.name} · ${siteConfig.site.name}`
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
    ...(cover ? { image: `${SITE_URL}${cover}` } : {}),
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
    <ReadingProgress />
    <header class="doc-heading">
      <p class="eyebrow">{{ type === 'books' ? 'BOOK NOTE' : 'PROJECT DOC' }}</p>
      <h1>{{ current?.title || current?.name }}</h1>
      <p class="muted">{{ current?.quote || current?.description }}</p>
    </header>
    <div v-if="loading && !article.html" class="doc-layout">
      <div></div>
      <SkeletonLoader type="article" />
    </div>
    <div v-else class="doc-layout">
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
