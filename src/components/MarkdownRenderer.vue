<script setup>
import { nextTick, watch } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  html: { type: String, default: '' }
})

let initialized = false
let currentTheme = ''

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
}

async function renderDiagrams() {
  if (!props.html) return
  await nextTick()

  // Add lazy loading and bypass referrer for external images
  document.querySelectorAll('.markdown-body img').forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
    img.setAttribute('referrerpolicy', 'no-referrer')
  })

  const elements = document.querySelectorAll('.mermaid')
  if (!elements.length) return

  const theme = getTheme()

  // 保存原始 mermaid 文本（只在首次渲染时）
  elements.forEach((el) => {
    if (!el.hasAttribute('data-original')) {
      el.setAttribute('data-original', el.textContent)
    }
  })

  if (!initialized || theme !== currentTheme) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose'
    })
    initialized = true
    currentTheme = theme
  }

  try {
    await mermaid.run({ nodes: elements, suppressErrors: true })
  } catch (e) {
    console.warn('[Mermaid] render error:', e)
  }
}

watch(() => props.html, renderDiagrams, { immediate: true })

// 监听主题切换
function onThemeChange() {
  const theme = getTheme()
  if (theme === currentTheme) return

  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'loose'
  })
  currentTheme = theme

  // 恢复原始文本并重新渲染
  const elements = document.querySelectorAll('.mermaid[data-original]')
  elements.forEach((el) => {
    el.removeAttribute('data-processed')
    el.textContent = el.getAttribute('data-original')
  })

  if (elements.length > 0) {
    mermaid.run({ nodes: elements, suppressErrors: true })
  }
}

const observer = new MutationObserver(onThemeChange)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

function handleCopyClick(e) {
  const btn = e.target.closest('.code-copy-btn')
  if (!btn) return

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
}
</script>

<template>
  <article class="markdown-body content-card" v-html="html" @click="handleCopyClick"></article>
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
