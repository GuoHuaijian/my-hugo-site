<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '文档' },
  items: { type: Array, default: () => [] },
  base: { type: String, required: true },
  active: { type: String, default: '' }
})

function getItemLink(item) {
  if (item.type === 'pdf') {
    return `${props.base}/pdf/${item.slug}`
  }
  return `${props.base}/${item.slug}`
}
</script>

<template>
  <aside class="side-nav" aria-label="文档导航">
    <strong>{{ title }}</strong>
    <RouterLink
      v-for="item in items"
      :key="item.slug"
      :to="getItemLink(item)"
      :class="{ active: item.slug === active }"
    >
      <span class="pdf-badge" v-if="item.type === 'pdf'">PDF</span>
      {{ item.title }}
    </RouterLink>
  </aside>
</template>

<style scoped>
.side-nav {
  position: sticky;
  top: 88px;
  align-self: start;
}

strong {
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 700;
}

a {
  display: block;
  margin: 4px 0;
  padding: 6px 0 6px 10px;
  border-left: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.4;
}

a.active,
a:hover {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
}

.pdf-badge {
  display: inline-block;
  padding: 1px 4px;
  margin-right: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: 3px;
  vertical-align: middle;
}

@media (max-width: 900px) {
  .side-nav {
    position: static;
    border-left: none;
    padding-left: 0;
  }
}
</style>
