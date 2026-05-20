import { computed, ref } from 'vue'
import { publicPath } from '../utils/publicPath'

const INDEX_CACHE_KEY = 'cloud-edge-blog-index'
const INDEX_CACHE_VERSION_KEY = 'cloud-edge-blog-index-v'

let cachedVersion = null

/** Compute a lightweight content hash to invalidate the cache */
async function getIndexVersion() {
  try {
    const res = await fetch(publicPath('content-index.json'), { method: 'HEAD' })
    if (res.ok) {
      // Use Last-Modified or a fallback timestamp
      return res.headers.get('last-modified') || res.headers.get('etag') || ''
    }
  } catch { /* fall through */ }
  return ''
}

const index = ref(null)
const loading = ref(false)
const error = ref('')
let loadPromise = null

export function useContentLoader() {
  async function loadIndex() {
    if (index.value) return index.value
    if (loadPromise) return loadPromise

    // Try sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(INDEX_CACHE_KEY)
      const cachedVer = sessionStorage.getItem(INDEX_CACHE_VERSION_KEY)
      if (cached && cachedVer) {
        const remoteVer = await getIndexVersion()
        if (remoteVer && remoteVer === cachedVer) {
          index.value = JSON.parse(cached)
          return index.value
        }
        // Version mismatch — clear stale cache
        sessionStorage.removeItem(INDEX_CACHE_KEY)
        sessionStorage.removeItem(INDEX_CACHE_VERSION_KEY)
      }
    } catch { /* storage unavailable — proceed with fetch */ }

    loading.value = true
    error.value = ''
    loadPromise = (async () => {
      try {
        const response = await fetch(publicPath('content-index.json'))
        if (!response.ok) throw new Error('内容索引加载失败')
        const data = await response.json()
        index.value = data

        // Cache in sessionStorage for same-session reuse
        try {
          const ver = response.headers.get('last-modified') || response.headers.get('etag') || ''
          if (ver) {
            sessionStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(data))
            sessionStorage.setItem(INDEX_CACHE_VERSION_KEY, ver)
          }
        } catch { /* non-critical */ }

        return index.value
      } catch (err) {
        error.value = err.message || '内容索引加载失败'
        throw err
      } finally {
        loading.value = false
        loadPromise = null
      }
    })()
    return loadPromise
  }

  async function loadText(file) {
    const response = await fetch(publicPath(file))
    if (!response.ok) throw new Error('Markdown 文件加载失败')
    return response.text()
  }

  return {
    index: computed(() => index.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadIndex,
    loadText
  }
}
