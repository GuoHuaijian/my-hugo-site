<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, List } from 'lucide-vue-next'
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
const notFound = ref(false)
const chapterOpen = ref(false)
const { activeId, observeHeadings } = useHeadingObserver()
const type = computed(() => route.meta.type)
const collection = computed(() => index.value?.[type.value] || [])
const current = computed(() => collection.value.find((item) => item.slug === route.params.slug))
const docs = computed(() => current.value?.docs || current.value?.chapters || [])
const pageSlug = computed(() => route.params.page || docs.value[0]?.slug)
const page = computed(() => docs.value.find((item) => item.slug === pageSlug.value))
const base = computed(() => `/${type.value}/${route.params.slug}`)
const docIndex = computed(() => docs.value.findIndex((item) => item.slug === pageSlug.value))
const prevDoc = computed(() => (docIndex.value > 0 ? docs.value[docIndex.value - 1] : null))
const nextDoc = computed(() =>
  docIndex.value >= 0 && docIndex.value < docs.value.length - 1 ? docs.value[docIndex.value + 1] : null
)

function docLink(item) {
  return item.type === 'pdf' ? `${base.value}/pdf/${item.slug}` : `${base.value}/${item.slug}`
}

async function loadDoc() {
  loading.value = true
  notFound.value = false
  await loadIndex()
  if (!current.value) { loading.value = false; notFound.value = true; return }
  if (!route.params.page && docs.value[0]) {
    loading.value = false
    router.replace(`${base.value}/${docs.value[0].slug}`)
    return
  }
  // 容错:/docs/architecture.md 规范化为无后缀地址
  if (!page.value && route.params.page?.endsWith('.md')) {
    const canonical = route.params.page.replace(/\.md$/, '')
    if (docs.value.some((item) => item.slug === canonical)) {
      loading.value = false
      router.replace(`${base.value}/${canonical}`)
      return
    }
  }
  if (!page.value) { loading.value = false; notFound.value = true; return }
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

// 切换章节后收起移动端章节面板
watch(pageSlug, () => {
  chapterOpen.value = false
})

// Meta updates once content resolves
watch([current, page], ([c, p]) => {
  if (c && p !== undefined) updateMeta()
})
</script>

<template>
  <section class="page-shell">
    <ReadingProgress />
    <div class="doc-composite">
      <div v-if="notFound && !loading" class="doc-missing">
        <p>没有找到这篇文档，可能已被移动或链接有误。</p>
        <RouterLink :to="type === 'books' ? '/books' : '/projects'">
          {{ type === 'books' ? '返回书架' : '返回项目列表' }}
        </RouterLink>
      </div>
      <template v-else>
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
          <div class="doc-side" :class="{ open: chapterOpen }">
            <button
              v-if="docs.length"
              class="chapter-toggle"
              type="button"
              :aria-expanded="chapterOpen"
              @click="chapterOpen = !chapterOpen"
            >
              <List :size="16" aria-hidden="true" />
              <span>{{ type === 'books' ? '章节' : '文档' }} · {{ docs.length }} 篇</span>
              <span class="chapter-current">{{ page?.title }}</span>
            </button>
            <SideNav :title="type === 'books' ? '章节' : '文档'" :items="docs" :base="base" :active="pageSlug" />
          </div>
          <div class="article-column">
            <p v-if="docs.length > 1 && docIndex >= 0" class="doc-progress">
              第 {{ docIndex + 1 }} / {{ docs.length }} 篇
            </p>
            <MarkdownRenderer :html="article.html" />
          </div>
          <TableOfContents :items="article.toc" :active="activeId" />
        </div>
        <nav v-if="docs.length > 1" class="doc-nav" aria-label="上一篇下一篇">
          <RouterLink v-if="prevDoc" class="card doc-nav-link" :to="docLink(prevDoc)">
            <ChevronLeft :size="16" aria-hidden="true" />
            <span>{{ prevDoc.title }}</span>
          </RouterLink>
          <span v-else></span>
          <RouterLink v-if="nextDoc" class="card doc-nav-link doc-nav-link--next" :to="docLink(nextDoc)">
            <span>{{ nextDoc.title }}</span>
            <ChevronRight :size="16" aria-hidden="true" />
          </RouterLink>
          <span v-else></span>
        </nav>
        <Comments />
      </template>
    </div>
  </section>
</template>

<style scoped>
.doc-heading {
  margin-bottom: var(--space-8);
}

.doc-layout {
  display: grid;
  grid-template-columns: var(--reader-sidenav-width) minmax(0, var(--reading-measure)) 220px;
  column-gap: var(--space-5);
  justify-content: space-between;
  align-items: start;
}

.doc-layout > * {
  min-width: 0;
}

.doc-layout > :first-child {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
}

/* 列表滚动交给 .doc-side 容器,内部导航不再自行吸顶 */
.doc-side :deep(.side-nav) {
  position: static;
}

.doc-layout > :nth-child(3) {
  position: sticky;
  top: 88px;
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
}

.doc-progress {
  margin-bottom: var(--space-4);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.chapter-toggle {
  display: none;
  width: 100%;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.chapter-current {
  margin-left: auto;
  max-width: 55%;
  overflow: hidden;
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
  margin-top: var(--space-8);
}

.doc-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5);
  color: var(--color-accent);
}

.doc-nav-link span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-nav-link--next {
  justify-content: flex-end;
}

.doc-missing {
  padding: var(--space-10) 0;
  text-align: center;
  color: var(--color-text-secondary);
}

.doc-missing a {
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--color-accent);
}

@media (max-width: 1100px) {
  .doc-layout {
    grid-template-columns: var(--reader-sidenav-width) minmax(0, var(--reading-measure));
    justify-content: start;
    column-gap: var(--space-8);
  }

  .doc-layout > :nth-child(3) {
    display: none;
  }
}

@media (max-width: 900px) {
  .doc-layout {
    grid-template-columns: minmax(0, var(--reading-measure));
  }

  .doc-layout > :first-child {
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .chapter-toggle {
    display: inline-flex;
  }

  /* 移动端章节列表默认收起,点击展开 */
  .doc-side :deep(.side-nav) {
    display: none;
  }

  .doc-side.open :deep(.side-nav) {
    display: block;
  }

  .doc-nav {
    grid-template-columns: 1fr;
  }
}
</style>
