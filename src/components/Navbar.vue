<script setup>
import { Menu, Store, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import SearchModal from './SearchModal.vue'
import ThemeToggle from './ThemeToggle.vue'

// 导入 Logo 图片
import logoImage from '../assets/images/logo.webp'

// 导入站点配置
import siteConfig from '../../content/site-config.json'
const { site, nav } = siteConfig
const links = nav.items

const open = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <a class="skip-link" href="#main-content">跳到正文</a>
  <header class="navbar" :class="{ scrolled }">
    <nav class="nav-inner" aria-label="主导航">
      <RouterLink class="brand" to="/" @click="open = false">
        <img :src="logoImage"
            :alt="site.logoAlt"
            class="brand-logo"
        />
        <span>{{ site.logoText }}</span>
      </RouterLink>
      <button class="menu-btn" type="button" :aria-expanded="open" :aria-label="open ? '关闭导航菜单' : '打开导航菜单'" @click="open = !open">
        <X v-if="open" :size="22" aria-hidden="true" />
        <Menu v-else :size="22" aria-hidden="true" />
      </button>
      <div class="nav-right">
        <div class="nav-links" :class="{ open }">
          <RouterLink v-for="link in links" :key="link.path" :to="link.path" @click="open = false">
            {{ link.label }}
          </RouterLink>
          <div class="nav-links-actions">
            <SearchModal />
            <ThemeToggle />
          </div>
        </div>
        <div class="nav-desktop-actions">
          <SearchModal />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.skip-link {
  position: fixed;
  z-index: 1000;
  top: 8px;
  left: 8px;
  padding: 8px 12px;
  background: var(--color-accent);
  color: white;
  transform: translateY(-140%);
}

.skip-link:focus {
  transform: translateY(0);
}

.navbar {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  left: 0;
  height: var(--navbar-height);
  background: rgba(var(--color-bg-primary-rgb), 0.85);
  backdrop-filter: blur(12px);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.navbar.scrolled {
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 8px 24px var(--color-shadow);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100% - 40px, var(--max-width));
  height: 100%;
  margin: 0 auto;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: var(--color-text-primary);
  font-size: 1.15rem;
  font-weight: 700;
}

.brand-logo {
  width: 100px;
  height: 100%;
  object-fit: contain;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .brand-logo {
    width: 36px;
    height: 36px;
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-links a {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-accent);
}

.nav-links a::after {
  position: absolute;
  right: 12px;
  bottom: 6px;
  left: 12px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-accent);
  content: "";
  opacity: 0;
  transform: scaleX(0.5);
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.nav-links a.router-link-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline-grid;
    place-items: center;
  }

  .nav-desktop-actions {
    display: none;
  }

  .nav-right {
    gap: 0;
  }

  .nav-links {
    position: absolute;
    top: var(--navbar-height);
    right: 14px;
    left: 14px;
    display: grid;
    gap: 2px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: rgba(var(--color-bg-card-rgb), 0.96);
    box-shadow: 0 12px 32px var(--color-shadow-hover);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-8px);
    transition: opacity var(--transition-base), transform var(--transition-base);
  }

  .nav-links.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .nav-links-actions {
    display: flex;
    gap: 8px;
    padding: 10px 12px 4px;
    margin-top: 4px;
    border-top: 1px solid var(--color-border);
  }

  .nav-links-actions .search-trigger {
    flex: 1;
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .nav-links-actions {
    display: none;
  }
}
</style>
