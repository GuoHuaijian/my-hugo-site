<script setup>
defineProps({
  tags: { type: Array, default: () => [] },
  active: { type: String, default: '全部' }
})

defineEmits(['update:active'])
</script>

<template>
  <div class="tag-filter" aria-label="标签过滤">
    <button
      v-for="tag in ['全部', ...tags]"
      :key="tag"
      type="button"
      :class="{ active: active === tag }"
      @click="$emit('update:active', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>

<style scoped>
.tag-filter {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: var(--space-8);
}

button {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

button:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

button.active {
  background: var(--color-accent);
  color: white;
}

button:active {
  transform: scale(0.97);
}
</style>
