<script setup>
import { ArrowUp } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-show="visible"
      class="back-to-top"
      type="button"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <ArrowUp :size="20" aria-hidden="true" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  z-index: 99;
  right: 24px;
  bottom: 32px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: rgba(var(--color-bg-card-rgb), 0.92);
  backdrop-filter: blur(8px);
  color: var(--color-text-secondary);
  box-shadow: 0 2px 12px var(--color-shadow);
  transition: all var(--transition-fast);
}

.back-to-top:hover {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(var(--color-accent-rgb), 0.25);
}

.back-to-top:active {
  transform: scale(0.95);
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: opacity 200ms, transform 200ms;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
