<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { useContentLoader } from '../composables/useContentLoader'

const route = useRoute()
const router = useRouter()
const { index, loadIndex } = useContentLoader()
const pdfUrl = ref('')
const loading = ref(true)
const error = ref('')

const bookSlug = computed(() => route.params.slug)
const pageSlug = computed(() => route.params.page)
const collection = computed(() => index.value?.books || [])
const current = computed(() => collection.value.find((item) => item.slug === bookSlug.value))
const chapters = computed(() => current.value?.chapters || [])
const currentPage = computed(() => chapters.value.find((item) => item.slug === pageSlug.value))

onMounted(async () => {
  await loadIndex()
  if (!currentPage.value?.file) {
    // Redirect to first chapter if no page specified
    if (chapters.value[0]) {
      router.replace(`/books/${bookSlug.value}/${chapters.value[0].slug}`)
    } else {
      error.value = '没有找到可阅读的章节'
    }
    loading.value = false
    return
  }
  
  if (currentPage.value.type === 'pdf') {
    pdfUrl.value = currentPage.value.file
  } else {
    // Redirect to markdown reader
    router.replace(`/books/${bookSlug.value}/${pageSlug.value}`)
  }
  loading.value = false
})
</script>

<template>
  <section class="page-shell pdf-reader">
    <header class="pdf-heading">
      <p class="eyebrow">PDF READER</p>
      <h1>{{ current?.title }}</h1>
      <p class="muted">{{ currentPage?.title }}</p>
    </header>
    
    <div v-if="loading" class="pdf-loading">
      <SkeletonLoader type="card" />
    </div>
    <div v-else-if="error" class="pdf-error">{{ error }}</div>
    <div v-else class="pdf-container">
      <iframe :src="pdfUrl" class="pdf-frame" title="PDF 阅读器"></iframe>
    </div>
    
    <div class="pdf-nav">
      <RouterLink v-if="currentPage" class="back-link" :to="`/books/${bookSlug}`">← 返回 {{ current?.title }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.pdf-reader {
  padding-top: 80px;
}

.pdf-heading {
  margin-bottom: var(--space-6);
}

.pdf-heading h1 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.pdf-heading .muted {
  margin: 0;
}

.pdf-container {
  width: 100%;
  height: calc(100dvh - 240px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: white;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-loading,
.pdf-error {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
}

.pdf-error {
  color: var(--color-inline-code);
}

.pdf-nav {
  margin-top: var(--space-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .pdf-container {
    height: calc(100dvh - 280px);
  }
}
</style>
