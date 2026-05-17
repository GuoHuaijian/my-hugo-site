<script setup>
import { CalendarDays, Clock3, UserRound } from 'lucide-vue-next'
import { publicPath } from '../utils/publicPath'

defineProps({
  note: { type: Object, required: true },
  index: { type: Number, default: 0 }
})
</script>

<template>
  <RouterLink class="note-card card" :to="`/notes/${note.slug}`" :style="{ animationDelay: `${index * 80}ms` }">
    <div class="cover" :class="{ 'has-image': note.cover }">
      <img v-if="note.cover" :src="publicPath(note.cover)" :alt="`${note.title} 封面`" loading="lazy" />
      <div v-else class="cover-fallback" aria-hidden="true">
        <span>{{ note.tags?.[0] || 'Note' }}</span>
      </div>
    </div>
    <div class="body">
      <h3>{{ note.title }}</h3>
      <p class="summary">{{ note.summary }}</p>
      <div class="tags">
        <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="divider" aria-hidden="true"></div>
      <div class="meta">
        <div class="meta-left">
          <span><UserRound :size="15" aria-hidden="true" />{{ note.author }}</span>
          <span><CalendarDays :size="15" aria-hidden="true" />{{ note.date }}</span>
        </div>
        <div class="meta-right">
          <span><Clock3 :size="15" aria-hidden="true" />约 {{ note.readingTime }} 分钟</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.note-card {
  display: grid;
  grid-template-rows: 172px minmax(0, 1fr);
  min-height: 430px;
  overflow: hidden;
  animation: fade-in-up 300ms both;
}

.cover {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-accent-light) 100%);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.note-card:hover .cover img {
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

.body {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-6);
}

h3 {
  margin: 0;
  color: var(--color-accent);
}

.summary {
  display: -webkit-box;
  min-height: 4.8em;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-secondary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px 14px;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.meta-left {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.meta-right {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.divider {
  height: 1px;
  margin: 0 var(--space-1);
  background: var(--color-border);
}

@media (max-width: 520px) {
  .note-card {
    grid-template-rows: 150px minmax(0, 1fr);
    min-height: 0;
  }
}
</style>