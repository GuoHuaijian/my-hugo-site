<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  total: { type: Number, required: true },
  totalItems: { type: Number, default: 0 },
  pageSize: { type: Number, default: 0 }
})

defineEmits(['update:page'])

function visiblePages() {
  const pages = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(props.total, props.page + 2)
  for (let i = start; i <= end; i += 1) pages.push(i)
  return pages
}
</script>

<template>
  <nav v-if="total > 1" class="pagination" aria-label="分页">
    <p v-if="totalItems && pageSize" class="pagination-info">
      第 {{ page }} / {{ total }} 页 · 共 {{ totalItems }} 篇
    </p>
    <div class="pagination-controls">
      <button type="button" :disabled="page <= 1" @click="$emit('update:page', page - 1)">上一页</button>
      <button
        v-for="item in visiblePages()"
        :key="item"
        type="button"
        :aria-current="item === page ? 'page' : undefined"
        :class="{ active: item === page }"
        @click="$emit('update:page', item)"
      >
        {{ item }}
      </button>
      <button type="button" :disabled="page >= total" @click="$emit('update:page', page + 1)">下一页</button>
    </div>
  </nav>
</template>

<style scoped>
.pagination {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin-top: var(--space-10);
}

.pagination-info {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
}

button:hover:not(:disabled),
button.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
