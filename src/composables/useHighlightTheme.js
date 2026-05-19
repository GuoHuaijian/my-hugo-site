/**
 * useHighlightTheme — dynamically switch highlight.js themes for dark/light mode.
 */
import hljsLight from 'highlight.js/styles/github.css?inline'
import hljsDark from 'highlight.js/styles/github-dark.css?inline'

function getStyleElement() {
  let el = document.getElementById('hljs-theme')
  if (!el) {
    el = document.createElement('style')
    el.id = 'hljs-theme'
    document.head.appendChild(el)
  }
  return el
}

export function applyHljsTheme(dark) {
  getStyleElement().textContent = dark ? hljsDark : hljsLight
}

export function initHighlightTheme() {
  const stored = localStorage.getItem('theme')
  const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  applyHljsTheme(isDark)
  return isDark
}
