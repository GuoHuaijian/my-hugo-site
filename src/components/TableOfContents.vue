<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  active: { type: String, default: '' }
})
</script>

<template>
  <aside v-if="items.length" class="toc" aria-label="文章目录">
    <p>目录</p>
    <a
      v-for="item in items"
      :key="item.id"
      :href="`#${item.id}`"
      :class="[`level-${item.level}`, { active: active === item.id }]"
    >
      {{ item.text }}
    </a>
  </aside>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 88px;
  align-self: start;
  padding-left: var(--space-5);
  border-left: 1px solid var(--color-border);
}

p {
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

a.level-3 {
  padding-left: 24px;
  font-size: var(--text-xs);
}

a.level-4 {
  padding-left: 34px;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

a.active,
a:hover {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .toc {
    display: none;
  }
}
</style>
