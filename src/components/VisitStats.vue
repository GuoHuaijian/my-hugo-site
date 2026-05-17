<script setup>
import { ref, onMounted } from 'vue'
import siteConfig from '../../content/site-config.json'

const analytics = siteConfig.analytics || {}
const enable = analytics.enable
const API_BASE = analytics.baseApi || ''

const pv = ref('--')
const uv = ref('--')

function getVisitorId() {
  let id = localStorage.getItem('visitor_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('visitor_id', id)
  }
  return id
}

async function recordVisit() {
  try {
    await fetch(`${API_BASE}/api/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        visitorId: getVisitorId()
      })
    })
  } catch (e) {
    // silently fail
  }
}

async function getSiteStats() {
  try {
    const r = await fetch(`${API_BASE}/api/site-stats`)
    return await r.json()
  } catch {
    return null
  }
}

function format(n) {
  return Number(n).toLocaleString('zh-CN')
}

onMounted(async () => {
  if (!enable) return
  await recordVisit()
  const stats = await getSiteStats()
  if (stats) {
    pv.value = format(stats.pv)
    uv.value = format(stats.uv)
  }
})
</script>

<template>
  <div v-if="enable" class="visit-stats">
    <span>访问 {{ pv }} / 访客 {{ uv }}</span>
  </div>
</template>

<style scoped>
.visit-stats {
  text-align: center;
  padding: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  opacity: 0.6;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
