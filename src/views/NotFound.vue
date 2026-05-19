<script setup>
import { onMounted, ref } from 'vue'
import { Home, ArrowLeft, Search } from 'lucide-vue-next'
import siteConfig from '../../content/site-config.json'

const floatOffset = ref(0)

onMounted(() => {
  let direction = 1
  setInterval(() => {
    floatOffset.value += direction * 0.5
    if (Math.abs(floatOffset.value) > 12) direction *= -1
  }, 30)
})
</script>

<template>
  <section class="page-shell not-found">
    <div class="not-found-content">
      <div class="error-code-wrapper" aria-hidden="true">
        <span class="error-code" :style="{ transform: `translateY(${floatOffset}px)` }">4</span>
        <span class="error-code error-symbol" :style="{ transform: `translateY(${-floatOffset * 0.7}px)`, animationDelay: '0.3s' }">☁️</span>
        <span class="error-code" :style="{ transform: `translateY(${floatOffset * 0.5}px)`, animationDelay: '0.6s' }">4</span>
      </div>
      <h1>这个货架是空的</h1>
      <p class="muted">你找的页面可能被搬走了，或者从来没有存在过。</p>
      <div class="not-found-actions">
        <RouterLink class="btn" to="/">
          <ArrowLeft :size="18" aria-hidden="true" />
          回到首页
        </RouterLink>
        <RouterLink class="btn primary" to="/notes">
          <Home :size="18" aria-hidden="true" />
          去笔记看看
        </RouterLink>
        <RouterLink class="btn" to="/notes/archive">
          <Search :size="18" aria-hidden="true" />
          文章归档
        </RouterLink>
      </div>
      <p class="not-found-hint">
        或者，你可以去 <RouterLink to="/about">关于页面</RouterLink> 找店主聊聊
      </p>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - var(--navbar-height) - var(--footer-height));
}

.not-found-content {
  text-align: center;
  max-width: 480px;
  animation: content-in 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes content-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.error-code-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: var(--space-4);
  perspective: 600px;
}

.error-code {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: clamp(5rem, 15vw, 9rem);
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.3;
  transition: transform 0.1s ease-out;
  animation: float-in 800ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.error-code:nth-child(1) {
  animation-delay: 100ms;
}

.error-code:nth-child(2) {
  animation-delay: 300ms;
}

.error-code:nth-child(3) {
  animation-delay: 500ms;
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(40px) rotateX(20deg);
  }
  to {
    opacity: 0.3;
    transform: translateY(0) rotateX(0);
  }
}

.error-symbol {
  font-size: clamp(4rem, 12vw, 7rem);
  opacity: 0.6;
}

h1 {
  margin-bottom: var(--space-3);
  animation: slide-up 500ms 600ms both;
}

.muted {
  margin-bottom: var(--space-8);
  font-size: var(--text-lg);
  animation: slide-up 500ms 700ms both;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  animation: slide-up 500ms 800ms both;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.not-found-hint {
  margin-top: var(--space-8);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  animation: slide-up 500ms 900ms both;
}

.not-found-hint a {
  color: var(--color-accent);
}
</style>