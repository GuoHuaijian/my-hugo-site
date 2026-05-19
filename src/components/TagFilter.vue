<script setup>
const props = defineProps({
  tags: { type: Array, default: () => [] },
  active: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:active'])

function toggleTag(tag) {
  if (tag === '全部') {
    emit('update:active', [])
    return
  }
  const current = [...props.active]
  const idx = current.indexOf(tag)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(tag)
  }
  emit('update:active', current)
}
</script>

<template>
  <div class="tag-filter" role="group" aria-label="标签过滤">
    <button
      type="button"
      :class="{ active: active.length === 0 }"
      @click="toggleTag('全部')"
    >
      全部
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      type="button"
      :class="{ active: active.includes(tag) }"
      @click="toggleTag(tag)"
    >
      {{ tag }}<span v-if="active.includes(tag)" class="tag-remove" aria-hidden="true"> ×</span>
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

.tag-remove {
  font-weight: 700;
}
</style>
