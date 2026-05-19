<script setup>
import { computed } from 'vue'
import { useContentLoader } from '../composables/useContentLoader'

const props = defineProps({
  series: { type: String, default: '' },
  currentSlug: { type: String, default: '' }
})

const { index } = useContentLoader()

const seriesData = computed(() => {
  if (!props.series || !index.value?.seriesIndex) return null
  return index.value.seriesIndex[props.series] || null
})

const currentIndex = computed(() => {
  if (!seriesData.value) return -1
  return seriesData.value.findIndex((item) => item.slug === props.currentSlug)
})

const prevInSeries = computed(() => {
  if (currentIndex.value <= 0) return null
  return seriesData.value[currentIndex.value - 1]
})

const nextInSeries = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= seriesData.value.length - 1) return null
  return seriesData.value[currentIndex.value + 1]
})
</script>

<template>
  <div v-if="seriesData && seriesData.length > 1" class="series-nav card">
    <div class="series-header">
      <span class="series-badge">合集</span>
      <span class="series-name">{{ series }}</span>
      <span class="series-count">{{ currentIndex + 1 }} / {{ seriesData.length }}</span>
    </div>
    <div class="series-items">
      <RouterLink
        v-for="(item, i) in seriesData"
        :key="item.slug"
        :to="`/notes/${item.slug}`"
        :class="['series-item', { active: item.slug === currentSlug }]"
      >
        <span class="series-index">{{ i + 1 }}</span>
        <span class="series-title">{{ item.title }}</span>
      </RouterLink>
    </div>
    <div class="series-prevnext">
      <RouterLink
        v-if="prevInSeries"
        :to="`/notes/${prevInSeries.slug}`"
        class="series-pn-link"
      >
        ← 上一篇：{{ prevInSeries.title }}
      </RouterLink>
      <span v-else></span>
      <RouterLink
        v-if="nextInSeries"
        :to="`/notes/${nextInSeries.slug}`"
        class="series-pn-link"
      >
        下一篇：{{ nextInSeries.title }} →
      </RouterLink>
      <span v-else></span>
    </div>
  </div>
</template>

<style scoped>
.series-nav {
  padding: var(--space-5);
  margin-top: var(--space-8);
  animation: fade-in-up 300ms both;
}

.series-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.series-badge {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
}

.series-name {
  flex: 1;
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: var(--text-sm);
}

.series-count {
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.series-items {
  display: grid;
  gap: 4px;
  margin-bottom: var(--space-4);
}

.series-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.series-item:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
  text-decoration: none;
}

.series-item.active {
  background: var(--color-accent);
  color: white;
}

.series-index {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background: var(--color-bg-code);
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.series-item.active .series-index {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.series-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-prevnext {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.series-pn-link {
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.series-pn-link:hover {
  text-decoration: underline;
}

.series-pn-link:last-child {
  text-align: right;
}
</style>