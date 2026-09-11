import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initHighlightTheme } from './composables/useHighlightTheme'
// 自托管字体:霞鹜文楷屏幕版(按 unicode-range 分包,按需加载)+ JetBrains Mono
import 'lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles/variables.css'
import './styles/global.css'
import './styles/markdown.css'
import './styles/transitions.css'

// Initialize theme before mounting
const isDark = initHighlightTheme()
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')

createApp(App).use(router).mount('#app')
