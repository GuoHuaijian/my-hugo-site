/**
 * useHeadingObserver — track active heading id via IntersectionObserver.
 * Provides reactive `activeId` ref for use with TableOfContents component.
 */
import { ref, onUnmounted } from 'vue'

export function useHeadingObserver(containerSelector = '.markdown-body') {
  const activeId = ref('')
  let observer = null

  function observeHeadings() {
    const container = containerSelector
      ? document.querySelector(containerSelector)
      : document

    if (!container) return

    const headings = [...container.querySelectorAll('h2, h3, h4')]

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeId.value = entry.target.id
      })
    }, { rootMargin: '-20% 0px -70% 0px' })

    headings.forEach((heading) => observer.observe(heading))
  }

  function disconnectObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onUnmounted(disconnectObserver)

  return { activeId, observeHeadings, disconnectObserver }
}
