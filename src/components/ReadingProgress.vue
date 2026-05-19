<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const progress = ref(0)

function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="reading-progress" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100">
    <div class="reading-progress-bar" :style="{ width: `${progress * 100}%` }"></div>
  </div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  right: 0;
  height: 3px;
  z-index: 99;
  background: transparent;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  transition: width 50ms linear;
  border-radius: 0 2px 2px 0;
}
</style>
