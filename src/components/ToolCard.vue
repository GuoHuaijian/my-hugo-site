<script setup>
import { computed } from 'vue'
import { ArrowUpRight, Terminal } from 'lucide-vue-next'
import * as icons from 'lucide-vue-next'

const props = defineProps({
  tool: { type: Object, required: true }
})

const isImageIcon = computed(() => {
  if (!props.tool.icon) return false
  return props.tool.icon.startsWith('http') || props.tool.icon.startsWith('/')
})

const LucideComponent = computed(() => {
  if (isImageIcon.value) return null
  if (props.tool.icon && icons[props.tool.icon]) {
    return icons[props.tool.icon]
  }
  return props.tool.file ? Terminal : ArrowUpRight
})

const isDoc = computed(() => !!props.tool.file)
</script>

<template>
  <RouterLink v-if="isDoc" class="tool-card card" :to="`/toolbox/${tool.name}`">
    <div class="card-header">
      <img v-if="isImageIcon" :src="tool.icon" :alt="tool.name" class="tool-icon-img" />
      <component v-else :is="LucideComponent" :size="22" aria-hidden="true" />
      <strong>{{ tool.name }}</strong>
    </div>
    <p>{{ tool.description }}</p>
    <span>查看 <Terminal :size="16" aria-hidden="true" /></span>
  </RouterLink>
  <a v-else class="tool-card card" :href="tool.url" target="_blank" rel="noreferrer">
    <div class="card-header">
      <img v-if="isImageIcon" :src="tool.icon" :alt="tool.name" class="tool-icon-img" />
      <component v-else :is="LucideComponent" :size="22" aria-hidden="true" />
      <strong>{{ tool.name }}</strong>
    </div>
    <p>{{ tool.description }}</p>
    <span>访问 <ArrowUpRight :size="16" aria-hidden="true" /></span>
  </a>
</template>

<style scoped>
.tool-card {
  display: grid;
  gap: var(--space-3);
  min-height: 156px;
  padding: var(--space-5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card-header svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.tool-icon-img {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: contain;
}

strong {
  font-size: var(--text-lg);
}

p {
  margin: 0;
  color: var(--color-text-secondary);
}

span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 700;
}
</style>
