<script setup>
import { computed, onMounted } from 'vue'
import ProjectCard from '../components/ProjectCard.vue'
import { useContentLoader } from '../composables/useContentLoader'
import siteConfig from '../../content/site-config.json'

const { index, loadIndex } = useContentLoader()
const projects = computed(() => index.value?.projects || [])

onMounted(loadIndex)
</script>

<template>
  <section class="page-shell">
    <header class="page-heading">
      <p class="eyebrow">PROJECTS</p>
      <h1>{{ siteConfig.pages.projects.title }}</h1>
      <p class="muted">{{ siteConfig.pages.projects.description }}</p>
    </header>
    <div class="grid projects-grid">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </div>
  </section>
</template>

<style scoped>
.projects-grid {
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  align-items: stretch;
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
