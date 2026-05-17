<script setup>
import { computed } from 'vue'
import HeroParticles from '../components/HeroParticles.vue'
import defaultHeroBg from '../assets/images/background.webp'
import { publicPath } from '../utils/publicPath'
import siteConfig from '../../content/site-config.json'
const { site, home } = siteConfig

const heroStyle = computed(() => {
  const url = site.heroBg ? publicPath(site.heroBg) : defaultHeroBg
  return { backgroundImage: `linear-gradient(rgba(var(--color-bg-primary-rgb), 0.75), rgba(var(--color-bg-primary-rgb), 0.75)), url(${url})` }
})
</script>

<template>
  <section class="hero" :style="heroStyle">
    <HeroParticles />
    <div class="hero-content">
      <h1 :aria-label="site.heroTitle">
        <span v-for="(char, i) in site.heroTitle" :key="`${char}-${i}`" :style="{ animationDelay: `${300 + i * 80}ms` }">
          {{ char }}
        </span>
      </h1>
      <p class="subtitle">{{ site.description }}</p>
      <blockquote class="motto">
        <p>{{ site.heroQuote.text }}</p>
        <cite>—— {{ site.heroQuote.cite }}</cite>
      </blockquote>
      <div class="hero-actions" aria-label="首页快捷入口">
        <template v-for="(btn, i) in home.buttons" :key="i">
          <a v-if="btn.type === 'link'"
            class="btn"
            :class="{ primary: btn.primary }"
            :href="btn.url"
            target="_blank"
            rel="noreferrer">{{ btn.label }}</a>
          <RouterLink v-else
            class="btn"
            :class="{ primary: btn.primary }"
            :to="btn.to">{{ btn.label }}</RouterLink>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  place-items: center;
  flex: 1;
  overflow: hidden;

  background:
      linear-gradient(rgba(var(--color-bg-primary-rgb), 0.75), rgba(var(--color-bg-primary-rgb), 0.75)),
      url('../assets/images/background.webp');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}

.hero::after {
  position: absolute;
  inset: auto 0 0;
  height: 10%;
  background: linear-gradient(180deg, transparent, var(--color-bg-primary));
  content: "";
}

.hero-content {
  position: relative;
  z-index: 1;
  width: min(100% - 32px, 860px);
  text-align: center;
}

h1 {
  margin-bottom: var(--space-4);
}

h1 span {
  display: inline-block;
  opacity: 0;
  animation: word-in 500ms forwards;
}

.subtitle {
  margin-bottom: var(--space-8);
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
  opacity: 0;
  animation: subtitle-in 500ms 1600ms forwards;
}

.motto {
  max-width: 720px;
  margin: 0 auto var(--space-8);
  padding: 0;
  border: 0;
  color: var(--color-text-quote);
  opacity: 0;
  animation: subtitle-in 500ms 1900ms forwards;
}

.motto p {
  margin-bottom: var(--space-2);
  font-size: clamp(1rem, 2.4vw, 1.25rem);
  line-height: 1.9;
}

.motto cite {
  color: var(--color-text-tertiary);
  font-style: normal;
  font-size: var(--text-sm);
}

.hero-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  opacity: 0;
  animation: subtitle-in 500ms 2200ms forwards;
}

@media (max-height: 760px) {
  h1 {
    margin-bottom: var(--space-3);
  }

  .subtitle,
  .motto {
    margin-bottom: var(--space-5);
  }

  .motto p {
    line-height: 1.7;
  }
}

@keyframes word-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtitle-in {
  to {
    opacity: 1;
  }
}
</style>
