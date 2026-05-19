<script setup>
import { nextTick, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  html: { type: String, default: '' }
})

let currentTheme = ''
let themeObserver = null
let mermaidPromise = null

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
}

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  return mermaidPromise
}

async function renderDiagrams() {
  if (!props.html) return
  await nextTick()

  // Add lazy loading and referrer policy for external images
  document.querySelectorAll('.markdown-body img').forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
    img.setAttribute('referrerpolicy', 'no-referrer')
  })

  const elements = document.querySelectorAll('.mermaid')
  if (!elements.length) return

  // Dynamically import mermaid only when needed (cached after first load)
  const mod = await loadMermaid()
  const mermaidModule = mod.default || mod

  const theme = getTheme()

  // Save original mermaid source text
  elements.forEach((el) => {
    if (!el.hasAttribute('data-original')) {
      el.setAttribute('data-original', el.textContent)
    }
  })

  if (theme !== currentTheme) {
    mermaidModule.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose'
    })
    currentTheme = theme
  }

  try {
    await mermaidModule.run({ nodes: elements, suppressErrors: true })
  } catch (e) {
    console.warn('[Mermaid] render error:', e)
  }
}

watch(() => props.html, renderDiagrams, { immediate: true })

// Listen for theme changes to re-render mermaid diagrams
async function handleThemeChange() {
  const theme = getTheme()
  if (theme === currentTheme) return

  currentTheme = theme
  const elements = document.querySelectorAll('.mermaid[data-original]')
  if (!elements.length) return

  const mod = await loadMermaid()
  const mermaid = mod.default || mod
  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'loose'
  })
  elements.forEach((el) => {
    el.removeAttribute('data-processed')
    el.textContent = el.getAttribute('data-original')
  })
  try {
    await mermaid.run({ nodes: elements, suppressErrors: true })
  } catch (e) {
    console.warn('[Mermaid] re-render error on theme change:', e)
  }
}

onMounted(() => {
  themeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        handleThemeChange()
        break
      }
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})

function handleContentClick(e) {
  // Copy button
  const btn = e.target.closest('.code-copy-btn')
  if (btn) {
    const codeBlock = btn.closest('.code-block')
    if (!codeBlock) return
    const code = codeBlock.querySelector('code')
    if (!code) return
    const text = code.textContent
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '已复制!'
      btn.classList.add('copied')
      setTimeout(() => {
        btn.textContent = '复制'
        btn.classList.remove('copied')
      }, 2000)
    }).catch(() => {
      btn.textContent = '失败'
      setTimeout(() => { btn.textContent = '复制' }, 1500)
    })
    return
  }

  // Image lightbox
  const img = e.target.closest('.markdown-body img')
  if (img && img.src && !img.closest('.code-block') && !img.closest('.mermaid')) {
    // Skip small icons (avatars, favicons) and images inside code blocks
    if (img.width > 40 || !img.naturalWidth) {
      document.dispatchEvent(new CustomEvent('open-lightbox', {
        detail: { src: img.src, alt: img.alt || '' }
      }))
    }
  }
}
</script>

<template>
  <article class="markdown-body content-card" v-html="html" @click="handleContentClick"></article>
</template>

<style scoped>
.content-card {
  padding: clamp(22px, 4vw, 44px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(var(--color-bg-card-rgb), 0.86);
  box-shadow: 0 2px 12px var(--color-shadow);
}
</style>
