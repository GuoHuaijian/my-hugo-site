<script setup>
import { Home, ArrowLeft } from 'lucide-vue-next'
import siteConfig from '../../content/site-config.json'
</script>

<template>
  <section class="page-shell not-found">
    <div class="not-found-content">
      <span class="error-code">404</span>
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
      </div>
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
}

.error-code {
  display: block;
  font-family: var(--font-mono);
  font-size: clamp(5rem, 12vw, 8rem);
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.3;
  margin-bottom: var(--space-4);
}

h1 {
  margin-bottom: var(--space-3);
}

.muted {
  margin-bottom: var(--space-8);
  font-size: var(--text-lg);
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
