<script setup>
import { Moon, Sun } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const dark = ref(false)

function initTheme() {
  const stored = localStorage.getItem('theme')
  if (stored) {
    dark.value = stored === 'dark'
  } else {
    dark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

function toggle() {
  dark.value = !dark.value
  applyTheme()
  window.__setHljsTheme?.(dark.value)
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
  localStorage.setItem('theme', dark.value ? 'dark' : 'light')
}

onMounted(initTheme)
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="dark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="toggle"
  >
    <Sun v-if="dark" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-card-rgb), 0.6);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}
</style>
