<script setup>
import { ref, onMounted } from 'vue'
import siteConfig from '../../content/site-config.json'

const analytics = siteConfig.analytics || {}
const enable = analytics.enable
const API_BASE = analytics.baseApi || ''

const pv = ref('--')

onMounted(async () => {
  if (!enable) return
  const page = encodeURIComponent(window.location.pathname)
  try {
    const r = await fetch(`${API_BASE}/api/page-stats?page=${page}`)
    const data = await r.json()
    pv.value = data.pv ?? 0
  } catch {
    pv.value = 0
  }
})
</script>

<template>
  <span v-if="enable" class="page-pv">
    <svg class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
    <span class="pv-count">{{ pv }}</span> 次阅读
  </span>
</template>

<style scoped>
.page-pv {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.eye-icon {
  width: 1em;
  height: 1em;
}

.pv-count {
  font-weight: 600;
  color: var(--color-accent);
}
</style>
