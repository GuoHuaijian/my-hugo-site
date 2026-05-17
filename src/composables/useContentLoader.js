import { computed, ref } from 'vue'
import { publicPath } from '../utils/publicPath'

const index = ref(null)
const loading = ref(false)
const error = ref('')
let loadPromise = null

export function useContentLoader() {
  async function loadIndex() {
    if (index.value) return index.value
    if (loadPromise) return loadPromise

    loading.value = true
    error.value = ''
    loadPromise = (async () => {
      try {
        const response = await fetch(publicPath('content-index.json'))
        if (!response.ok) throw new Error('内容索引加载失败')
        index.value = await response.json()
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
