import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { parseFrontmatter } from '../utils/frontmatter'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const language = token.info.trim().split(/\s+/)[0]?.toLowerCase()

  if (language === 'mermaid') {
    return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>`
  }

  // Syntax highlighting with highlight.js
  let highlighted
  if (language && hljs.getLanguage(language)) {
    try {
      highlighted = hljs.highlight(token.content, { language }).value
    } catch (e) {
      highlighted = md.utils.escapeHtml(token.content)
    }
  } else {
    highlighted = md.utils.escapeHtml(token.content)
  }

  const langLabel = language || 'text'
  const codeClass = language ? ` class="hljs language-${language}"` : ' class="hljs"'

  return `<div class="code-block">
    <div class="code-header">
      <span class="code-lang">${langLabel}</span>
      <button class="code-copy-btn" type="button">复制</button>
    </div>
    <pre><code${codeClass}>${highlighted}</code></pre>
  </div>`
}

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const title = tokens[idx + 1]?.content || ''
  const slug = title.toLowerCase().trim().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
  token.attrSet('id', slug)
  return self.renderToken(tokens, idx, options)
}

export function renderMarkdown(raw) {
  const { data, body } = parseFrontmatter(raw)
  return { data, body, html: md.render(body), toc: collectToc(body) }
}

export function collectToc(markdown) {
  return markdown.split(/\r?\n/).map((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) return null
    const text = match[2].trim()
    return {
      level: match[1].length,
      text,
      id: text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
    }
  }).filter(Boolean)
}
