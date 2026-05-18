/**
 * useMeta — dynamic meta tags, Open Graph, Twitter Card, and JSON-LD for SEO
 */
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import siteConfig from '../../content/site-config.json'

const SITE_URL = siteConfig.site.url || 'https://slothcoder.cn'
const SITE_NAME = siteConfig.site.name || '云边小卖部'
const DEFAULT_DESC = siteConfig.site.description || '贩卖代码、笔记与偶尔的胡思乱想。'
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`

/**
 * Update or remove an element by selector.
 * If value is null/empty, the element is removed.
 */
function setMeta(selector, attrs, value) {
  let el = document.querySelector(selector)
  if (!value) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement(el.tagName || 'meta')
    el.tagName = 'meta'
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
}

/**
 * Set or update a `<link rel="canonical">`.
 */
function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!url) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

/**
 * Set or update JSON-LD script block.
 */
function setJsonLd(data) {
  const id = 'seo-jsonld'
  let el = document.getElementById(id)
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.setAttribute('type', 'application/ld+json')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Apply all SEO tags at once.
 */
export function applyMeta(opts = {}) {
  const {
    title = SITE_NAME,
    description = DEFAULT_DESC,
    url = SITE_URL,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    jsonld = null,
  } = opts

  document.title = title

  setMeta('meta[name="description"]', { name: 'description', content: '' }, description)

  // Open Graph
  setMeta('meta[property="og:title"]', { property: 'og:title', content: '' }, title)
  setMeta('meta[property="og:description"]', { property: 'og:description', content: '' }, description)
  setMeta('meta[property="og:url"]', { property: 'og:url', content: '' }, url)
  setMeta('meta[property="og:image"]', { property: 'og:image', content: '' }, image)
  setMeta('meta[property="og:type"]', { property: 'og:type', content: '' }, type)
  setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: '' }, SITE_NAME)

  // Twitter Card
  setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: '' }, 'summary_large_image')
  setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: '' }, title)
  setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: '' }, description)
  setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: '' }, image)

  // Canonical
  setCanonical(url)

  // JSON-LD
  setJsonLd(jsonld)
}

/**
 * Vue composable — reactively updates meta tags when route changes.
 */
export function useMeta() {
  const route = useRoute()

  watch(() => route.fullPath, () => {
    // Reset to defaults on route change; detail views will override
    applyMeta({
      title: route.meta?.title
        ? `${route.meta.title} · ${SITE_NAME}`
        : SITE_NAME,
      description: route.meta?.description || DEFAULT_DESC,
      url: `${SITE_URL}${route.fullPath}`,
    })
  }, { immediate: true })
}
