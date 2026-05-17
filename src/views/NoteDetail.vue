<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { renderMarkdown } from '../composables/useMarkdown'
import { applyMeta } from '../composables/useMeta'
import siteConfig from '../../content/site-config.json'

const analytics = siteConfig.analytics || {}
const API_BASE = analytics.baseApi || ''

function recordPageView() {
  if (!analytics.enable || !API_BASE) return
  const page = encodeURIComponent(window.location.pathname)
  fetch(`${API_BASE}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, visitorId: getVisitorId() })
  }).catch(() => {})
}

function getVisitorId() {
  let id = localStorage.getItem('visitor_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('visitor_id', id)
  }
  return id
}

const route = useRoute()
const { index, loadIndex, loadText } = useContentLoader()
const article = ref({ data: {}, html: '', toc: [] })
const activeId = ref('')
const note = computed(() => index.value?.notes?.find((item) => item.slug === route.params.slug))
const notes = computed(() => index.value?.notes || [])
const currentIndex = computed(() => notes.value.findIndex((item) => item.slug === route.params.slug))
const prev = computed(() => notes.value[currentIndex.value - 1])
const next = computed(() => notes.value[currentIndex.value + 1])

async function loadArticle() {
  await loadIndex()
  if (!note.value) return
  const raw = await loadText(note.value.file)
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

const SITE_URL = 'https://slothcoder.cn'

function updateMeta() {
  const n = note.value
  if (!n) return
  const title = `${n.title} · 云边小卖部`
  const description = n.summary || ''
  const image = n.cover ? `${SITE_URL}${n.cover}` : `${SITE_URL}/favicon.png`
  const url = `${SITE_URL}/notes/${n.slug}`
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: n.title,
    description: n.summary || '',
    author: { '@type': 'Person', name: n.author || '店主' },
    datePublished: n.date || undefined,
    image: n.cover ? `${SITE_URL}${n.cover}` : undefined,
    url,
  }
  applyMeta({ title, description, url, image, type: 'article', jsonld })
}

onMounted(() => {
  loadArticle()
  recordPageView()
})
watch(() => route.params.slug, () => {
  loadArticle()
  recordPageView()
})
watch(note, (n) => {
  if (n) updateMeta()
})
</script>

<template>
  <section class="page-shell">
    <nav class="breadcrumb" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink>
      <span>/</span>
      <RouterLink to="/notes">笔记</RouterLink>
      <span>/</span>
      <span>{{ note?.title }}</span>
    </nav>
    <div class="reader-layout">
      <MarkdownRenderer :html="article.html" />
      <TableOfContents :items="article.toc" :active="activeId" />
    </div>
    <nav class="article-nav" aria-label="上一篇下一篇">
      <RouterLink v-if="prev" class="card" :to="`/notes/${prev.slug}`">上一篇：{{ prev.title }}</RouterLink>
      <span v-else></span>
      <RouterLink v-if="next" class="card" :to="`/notes/${next.slug}`">下一篇：{{ next.title }}</RouterLink>
    </nav>
    <Comments />
  </section>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-6);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.breadcrumb a {
  color: var(--color-accent);
}

.reader-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: var(--space-8);
}

.article-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
  margin-top: var(--space-8);
}

.article-nav a {
  padding: var(--space-5);
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .reader-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .article-nav {
    grid-template-columns: 1fr;
  }
}
</style>
