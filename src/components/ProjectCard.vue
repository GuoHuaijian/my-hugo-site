<script setup>
import { computed, onMounted, ref } from 'vue'
import { ExternalLink, Github, GitFork, Star } from 'lucide-vue-next'
import { publicPath } from '../utils/publicPath'

const props = defineProps({
  project: { type: Object, required: true }
})

const githubStats = ref({
  stars: props.project.stars || 0,
  forks: props.project.forks || 0
})

const repoPath = computed(() => {
  const match = props.project.githubUrl?.match(/github\.com\/([^/\s]+)\/([^/#?\s]+)/)
  if (!match) return ''
  return `${match[1]}/${match[2].replace(/\.git$/, '')}`
})

const isGithubProject = computed(() => Boolean(repoPath.value))

function formatNumber(value) {
  if (!value) return '0'
  return new Intl.NumberFormat('en', { notation: value >= 1000 ? 'compact' : 'standard' }).format(value)
}

async function loadGithubStats() {
  if (!repoPath.value) return
  try {
    const response = await fetch(`https://api.github.com/repos/${repoPath.value}`)
    if (!response.ok) return
    const data = await response.json()
    githubStats.value = {
      stars: data.stargazers_count ?? githubStats.value.stars,
      forks: data.forks_count ?? githubStats.value.forks
    }
  } catch {
    // Keep static frontmatter values when GitHub is unavailable or rate-limited.
  }
}

onMounted(loadGithubStats)
</script>

<template>
  <article class="project-card card">
    <div class="cover">
      <img v-if="project.cover" :src="publicPath(project.cover)" :alt="`${project.name} 封面`" loading="lazy" />
      <div v-else class="cover-fallback" aria-hidden="true">
        <Github v-if="isGithubProject" :size="42" />
        <span v-else>{{ project.tags?.[0] || 'Project' }}</span>
      </div>
    </div>
    <div class="content">
      <div>
        <div class="topline">
          <span class="status">{{ project.status }}</span>
          <div v-if="isGithubProject" class="github-stats" aria-label="GitHub 项目数据">
            <span><Star :size="15" aria-hidden="true" />{{ formatNumber(githubStats.stars) }}</span>
            <span><GitFork :size="15" aria-hidden="true" />{{ formatNumber(githubStats.forks) }}</span>
          </div>
        </div>
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
      </div>
      <div class="tags">
        <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="actions">
        <RouterLink class="btn primary" :to="`/projects/${project.slug}/${project.docs[0]?.slug || ''}`">查看文档</RouterLink>
        <a v-if="project.githubUrl" class="icon-link" :href="project.githubUrl" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Github :size="20" aria-hidden="true" />
        </a>
        <a v-if="project.liveUrl" class="icon-link" :href="project.liveUrl" target="_blank" rel="noreferrer" aria-label="在线预览">
          <ExternalLink :size="20" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  display: grid;
  grid-template-rows: 180px minmax(0, 1fr);
  min-height: 430px;
  overflow: hidden;
}

.cover {
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-accent-light) 100%);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.project-card:hover .cover img {
  transform: scale(1.035);
}

.cover-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.cover-fallback span {
  padding: 8px 14px;
  border: 1px solid rgba(var(--color-accent-rgb), 0.24);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-card-rgb), 0.58);
}

.content {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-6);
}

.topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.status {
  display: inline-flex;
  color: var(--color-success);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.github-stats {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 10px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.github-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

h3 {
  margin-bottom: var(--space-2);
  color: var(--color-accent);
}

p {
  margin: 0;
  color: var(--color-text-secondary);
}

.tags,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-link {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.icon-link:hover {
  color: var(--color-accent);
}

@media (max-width: 520px) {
  .project-card {
    grid-template-rows: 156px minmax(0, 1fr);
    min-height: 0;
  }

  .topline {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
