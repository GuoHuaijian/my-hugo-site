import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initHighlightTheme } from './composables/useHighlightTheme'
import './styles/variables.css'
import './styles/global.css'
import './styles/markdown.css'
import './styles/transitions.css'

// Initialize theme before mounting
const isDark = initHighlightTheme()
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')

createApp(App).use(router).mount('#app')
