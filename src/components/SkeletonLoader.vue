<script setup>
defineProps({
  lines: { type: Number, default: 3 },
  type: { type: String, default: 'text' } // 'text' | 'card' | 'article'
})
</script>

<template>
  <div v-if="type === 'text'" class="skeleton-text" :aria-label="'加载中'" role="status">
    <div v-for="i in lines" :key="i" class="skeleton-line" :style="{ width: `${70 + Math.random() * 30}%` }"></div>
  </div>
  <div v-else-if="type === 'card'" class="skeleton-card" :aria-label="'加载中'" role="status">
    <div class="skeleton-image"></div>
    <div class="skeleton-body">
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-line w-80"></div>
      <div class="skeleton-line w-40"></div>
    </div>
  </div>
  <div v-else class="skeleton-article" :aria-label="'加载中'" role="status">
    <div class="skeleton-line w-70"></div>
    <div class="skeleton-line w-90"></div>
    <div class="skeleton-line w-85"></div>
    <div class="skeleton-line w-50"></div>
    <div class="skeleton-line w-75"></div>
    <div class="skeleton-line w-60"></div>
  </div>
</template>

<style scoped>
.skeleton-line {
  height: 14px;
  margin-bottom: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg,
    var(--color-bg-secondary) 25%,
    rgba(var(--color-accent-rgb), 0.08) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.skeleton-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-card);
}

.skeleton-image {
  height: 180px;
  background: linear-gradient(90deg,
    var(--color-bg-secondary) 25%,
    rgba(var(--color-accent-rgb), 0.08) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.skeleton-body {
  padding: var(--space-6);
}

.skeleton-article {
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(var(--color-bg-card-rgb), 0.86);
}

.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-75 { width: 75%; }
.w-80 { width: 80%; }
.w-85 { width: 85%; }
.w-90 { width: 90%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
