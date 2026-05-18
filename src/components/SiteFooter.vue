<script setup>
import { computed } from 'vue'
import siteConfig from '../../content/site-config.json'
import VisitStats from './VisitStats.vue'
const { footer } = siteConfig

const year = new Date().getFullYear()
const copyrightText = computed(() => footer.copyright.replace(/\d{4}(?!.*\d{4})/, String(year)))
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© {{ copyrightText }}</p>
      <p class="quote">{{ footer.signature }}</p>
    </div>
    <div class="container footer-stats">
      <VisitStats />
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  flex: 0 0 auto;
  border-top: 1px solid var(--color-border);
  background: rgba(var(--color-bg-secondary-rgb), 0.72);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.footer-inner p {
  margin: 0;
}

.footer-stats {
  padding: 4px 0 10px;
  text-align: center;
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
  }
}
</style>
