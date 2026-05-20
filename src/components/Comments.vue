<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import siteConfig from '../../content/site-config.json'

const route = useRoute()
const giscusConfig = siteConfig.giscus || {}
const enable = giscusConfig.enable

const giscusLoaded = ref(false)
const containerRef = ref(null)

function getGiscusTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'transparent_dark'
    : 'light'
}

function sendMessage(message) {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow?.postMessage({ giscus: message }, 'https://giscus.app')
  }
}

function loadGiscus() {
  if (typeof window === 'undefined') return

  // Remove existing script to reload for new route
  const existing = document.querySelector('script[src*="giscus"]')
  if (existing) existing.remove()

  giscusLoaded.value = false

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category)
  script.setAttribute('data-category-id', giscusConfig.categoryId)
  script.setAttribute('data-mapping', giscusConfig.mapping)
  script.setAttribute('data-strict', giscusConfig.strict)
  script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata)
  script.setAttribute('data-input-position', giscusConfig.inputPosition)
  script.setAttribute('data-theme', getGiscusTheme())
  script.setAttribute('data-lang', giscusConfig.lang)
  script.setAttribute('data-loading', 'lazy')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  script.onload = () => {
    giscusLoaded.value = true
    // Wait for iframe to render then set theme
    setTimeout(() => {
      sendMessage({ setConfig: { theme: getGiscusTheme() } })
    }, 500)
  }

  containerRef.value?.appendChild(script)
}

// Watch route changes to reload Giscus
watch(() => route.path, () => {
  nextTick(() => loadGiscus())
})

// Watch theme changes
onMounted(() => {
  if (!enable) return
  loadGiscus()

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        sendMessage({ setConfig: { theme: getGiscusTheme() } })
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})
</script>

<template>
    <section v-if="enable" class="comments" aria-label="评论区">
    <h2>评论</h2>
    <div ref="containerRef" class="giscus-container">
      <div v-if="!giscusLoaded" class="giscus-loading" aria-label="评论加载中">
        <div class="giscus-skeleton-line"></div>
        <div class="giscus-skeleton-line w-70"></div>
        <div class="giscus-skeleton-line w-50"></div>
      </div>
      <noscript>
        <p class="noscript-msg">请启用 JavaScript 以加载 Giscus 评论。</p>
      </noscript>
    </div>
  </section>
  <section v-else class="comments disabled" aria-label="评论区">
    <h2>评论</h2>
    <p>评论功能未启用。</p>
  </section>
</template>

<style scoped>
.comments {
  margin-top: var(--space-10);
}

.comments h2 {
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.giscus-container {
  min-height: 200px;
}

.giscus-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-6);
}

.giscus-skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg,
    var(--color-bg-secondary) 25%,
    rgba(var(--color-accent-rgb), 0.08) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: giscus-shimmer 1.6s ease-in-out infinite;
}

.giscus-skeleton-line.w-70 { width: 70%; }
.giscus-skeleton-line.w-50 { width: 50%; }

@keyframes giscus-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.comments.disabled {
  padding: var(--space-6);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(var(--color-bg-card-rgb), 0.55);
  color: var(--color-text-secondary);
}

.noscript-msg {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
</style>
