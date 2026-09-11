<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Clock, Folder, List, X } from 'lucide-vue-next'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import ReadingProgress from '../components/ReadingProgress.vue'
import SeriesNav from '../components/SeriesNav.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { useContentLoader } from '../composables/useContentLoader'
import { useHeadingObserver } from '../composables/useHeadingObserver'
import { renderMarkdown } from '../composables/useMarkdown'
import { applyMeta } from '../composables/useMeta'
import { getVisitorId } from '../utils/visitor'
import siteConfig from '../../content/site-config.json'
const { site } = siteConfig

const analytics = siteConfig.analytics || {}
const API_BASE = analytics.baseApi || ''

function recordPageView() {
  if (!analytics.enable || !API_BASE) return
  const page = encodeURIComponent(window.location.pathname)
  fetch(`${API_BASE}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, visitorId: getVisitorId() })
  }).catch((err) => console.warn('[analytics] page view failed:', err))
}

const route = useRoute()
const { index, loadIndex, loadText } = useContentLoader()
const article = ref({ data: {}, html: '', toc: [] })
const loading = ref(true)
const notFound = ref(false)
const tocOpen = ref(false)
const { activeId, observeHeadings } = useHeadingObserver()
const note = computed(() => index.value?.notes?.find((item) => item.slug === route.params.slug))
const notes = computed(() => index.value?.notes || [])
const currentIndex = computed(() => notes.value.findIndex((item) => item.slug === route.params.slug))
const prev = computed(() => notes.value[currentIndex.value - 1])
const next = computed(() => notes.value[currentIndex.value + 1])
const isDraft = computed(() => note.value?.draft === true)

async function loadArticle() {
  loading.value = true
  notFound.value = false
  tocOpen.value = false
  await loadIndex()
  if (!note.value) { loading.value = false; notFound.value = true; return }
  try {
    const raw = await loadText(note.value.file)
    article.value = renderMarkdown(raw)
    activeId.value = article.value.toc[0]?.id || ''
    requestAnimationFrame(observeHeadings)
  } finally {
    loading.value = false
  }
}

const SITE_URL = site.url

function updateMeta() {
  const n = note.value
  if (!n) return
  const title = `${n.title} · ${site.name}`
  const description = n.summary || ''
  const image = n.cover ? `${SITE_URL}${n.cover}` : `${SITE_URL}/favicon.png`
  const url = `${SITE_URL}/notes/${n.slug}`
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: n.title,
    description: n.summary || '',
    author: { '@type': 'Person', name: n.author || '店主' },
    ...(n.date ? { datePublished: n.date } : {}),
    ...(n.cover ? { image: `${SITE_URL}${n.cover}` } : {}),
    url,
  }
  applyMeta({ title, description, url, image, type: 'article', jsonld })
}

function onDrawerClick(e) {
  if (e.target.closest('a')) tocOpen.value = false
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
    <ReadingProgress />
    <div class="reader-composite">
      <nav class="breadcrumb" aria-label="面包屑">
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <RouterLink to="/notes">笔记</RouterLink>
        <span>/</span>
        <span>{{ note?.title }}</span>
      </nav>
      <!-- Draft indicator -->
      <div v-if="isDraft" class="draft-banner">
        <span class="draft-badge">草稿</span>
        <span>此笔记为草稿，尚未正式发布。</span>
      </div>

      <div v-if="loading && !article.html" class="reader-layout">
        <SkeletonLoader type="article" />
      </div>
      <div v-else-if="notFound" class="reader-missing">
        <p>没有找到这篇笔记，可能已被删除或链接有误。</p>
        <RouterLink to="/notes">返回笔记列表</RouterLink>
      </div>
      <div v-else class="reader-layout">
        <div class="article-column">
          <header v-if="note" class="article-meta">
            <span v-if="note.category" class="meta-item">
              <Folder :size="14" aria-hidden="true" />{{ note.category }}
            </span>
            <span v-if="note.date" class="meta-item">
              <Calendar :size="14" aria-hidden="true" />{{ note.date }}
            </span>
            <span v-if="note.readingTime" class="meta-item">
              <Clock :size="14" aria-hidden="true" />约 {{ note.readingTime }} 分钟
            </span>
          </header>
          <div v-if="note?.tags?.length" class="article-tags">
            <span v-for="tag in note.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
          </div>
          <MarkdownRenderer :html="article.html" />
        </div>
        <TableOfContents :items="article.toc" :active="activeId" />
      </div>

      <!-- Series navigation -->
      <SeriesNav v-if="note?.series" :series="note.series" :current-slug="route.params.slug" />

      <nav class="article-nav" aria-label="上一篇下一篇">
        <RouterLink v-if="prev" class="card" :to="`/notes/${prev.slug}`">上一篇：{{ prev.title }}</RouterLink>
        <span v-else></span>
        <RouterLink v-if="next" class="card" :to="`/notes/${next.slug}`">下一篇：{{ next.title }}</RouterLink>
      </nav>
      <Comments />
    </div>

    <!-- 移动端浮动目录按钮 + 抽屉 -->
    <button
      v-if="article.toc.length"
      class="toc-fab"
      type="button"
      aria-label="打开目录"
      @click="tocOpen = true"
    >
      <List :size="20" aria-hidden="true" />
    </button>
    <Teleport to="body">
      <Transition name="toc-drawer">
        <div v-if="tocOpen" class="toc-overlay" @click.self="tocOpen = false">
          <div class="toc-drawer" role="dialog" aria-modal="true" aria-label="文章目录" @click="onDrawerClick">
            <div class="toc-drawer-header">
              <span>目录</span>
              <button type="button" aria-label="关闭目录" @click="tocOpen = false">
                <X :size="18" aria-hidden="true" />
              </button>
            </div>
            <TableOfContents variant="drawer" :items="article.toc" :active="activeId" />
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* 阅读复合容器:正文测量宽度 + 目录栏,整体居中,面包屑与正文左缘对齐 */
.reader-composite {
  width: min(100%, calc(var(--reading-measure) + var(--space-10) + var(--reader-toc-width)));
  margin-inline: auto;
}

.reader-layout {
  display: grid;
  grid-template-columns: minmax(0, var(--reading-measure)) var(--reader-toc-width);
  gap: var(--space-10);
}

.reader-layout > * {
  min-width: 0;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-item svg {
  opacity: 0.7;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.tag-chip {
  padding: 2px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.reader-missing {
  padding: var(--space-10) 0;
  text-align: center;
  color: var(--color-text-secondary);
}

.reader-missing a {
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--color-accent);
}

/* ── 移动端目录 ── */
.toc-fab {
  display: none;
  position: fixed;
  right: 20px;
  bottom: 96px;
  z-index: 60;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  box-shadow: 0 2px 12px var(--color-shadow);
  cursor: pointer;
}

.toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.45);
}

.toc-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(78vw, 320px);
  padding: var(--space-5);
  background: var(--color-bg-primary);
  overflow-y: auto;
}

.toc-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  font-weight: 700;
}

.toc-drawer-header button {
  display: inline-flex;
  padding: 4px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.toc-drawer-enter-active,
.toc-drawer-leave-active {
  transition: opacity var(--transition-fast);
}

.toc-drawer-enter-from,
.toc-drawer-leave-to {
  opacity: 0;
}

.toc-drawer-enter-active .toc-drawer,
.toc-drawer-leave-active .toc-drawer {
  transition: transform var(--transition-fast);
}

.toc-drawer-enter-from .toc-drawer,
.toc-drawer-leave-to .toc-drawer {
  transform: translateX(100%);
}

.draft-banner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-3) var(--space-4);
  border: 1px dashed var(--color-inline-code);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.04);
  color: var(--color-inline-code);
  font-size: var(--text-sm);
}

.draft-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-inline-code);
  color: white;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
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
    grid-template-columns: minmax(0, var(--reading-measure));
    justify-content: center;
  }

  .toc-fab {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .article-nav {
    grid-template-columns: 1fr;
  }
}
</style>
