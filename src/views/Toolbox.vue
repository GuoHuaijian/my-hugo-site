<script setup>
import { computed, onMounted, ref } from 'vue'
import ToolCard from '../components/ToolCard.vue'
import { useContentLoader } from '../composables/useContentLoader'
import siteConfig from '../../content/site-config.json'

const active = ref(0)
const { index, loadIndex } = useContentLoader()
const categories = computed(() => index.value?.toolbox?.categories || [])
const tools = computed(() => categories.value[active.value]?.items || [])

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell">
    <header class="page-heading">
      <p class="eyebrow">TOOLBOX</p>
      <h1>{{ siteConfig.pages.toolbox.title }}</h1>
      <p class="muted">{{ siteConfig.pages.toolbox.description }}</p>
    </header>
    <div class="tabs" role="tablist" aria-label="工具分类">
      <button
        v-for="(category, i) in categories"
        :key="category.name"
        type="button"
        role="tab"
        :aria-selected="active === i"
        :class="{ active: active === i }"
        @click="active = i"
      >
        {{ category.name }}
      </button>
    </div>
    <Transition name="page" mode="out-in">
      <div :key="active" class="grid tools-grid">
        <ToolCard v-for="tool in tools" :key="tool.name" :tool="tool" />
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-5);
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tabs button {
  position: relative;
  min-height: 48px;
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
}

.tabs button.active {
  color: var(--color-accent);
}

.tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--color-accent);
  content: "";
}

.tools-grid {
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
}
</style>
