import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import hljsLight from 'highlight.js/styles/github.css?inline'
import hljsDark from 'highlight.js/styles/github-dark.css?inline'
import './styles/variables.css'
import './styles/global.css'
import './styles/markdown.css'
import './styles/transitions.css'

// 动态切换 highlight.js 主题
function applyHljsTheme(dark) {
  let el = document.getElementById('hljs-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'hljs-theme'
    document.head.appendChild(el)
  }
  el.textContent = dark ? hljsDark : hljsLight
}

// 初始化主题
const stored = localStorage.getItem('theme')
const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
applyHljsTheme(isDark)

createApp(App).use(router).mount('#app')

// 暴露切换方法供 ThemeToggle 调用
window.__setHljsTheme = applyHljsTheme
