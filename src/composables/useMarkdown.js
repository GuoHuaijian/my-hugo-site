import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import { parseFrontmatter } from '../utils/frontmatter'
import { slugify } from '../utils/slugify'

// Register only the languages used in content/ — reduces bundle by ~100KB
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import groovy from 'highlight.js/lib/languages/groovy'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import lua from 'highlight.js/lib/languages/lua'
import markdown from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import plaintext from 'highlight.js/lib/languages/plaintext'
import properties from 'highlight.js/lib/languages/properties'
import python from 'highlight.js/lib/languages/python'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import latex from 'highlight.js/lib/languages/latex'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('c', c)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('go', go)
hljs.registerLanguage('groovy', groovy)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('properties', properties)
hljs.registerLanguage('python', python)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('tex', latex)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
// Alias 'text' blocks to plaintext highlighter
hljs.registerLanguage('text', plaintext)

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
      console.warn('[Markdown] highlight error:', e)
      highlighted = md.utils.escapeHtml(token.content)
    }
  } else {
    highlighted = md.utils.escapeHtml(token.content)
  }

  const langLabel = language || 'text'
  const codeClass = language ? ` class="hljs language-${language}"` : ' class="hljs"'

  return `<div class="code-block">
    <div class="code-header">
      <div class="code-dots">
        <span class="code-dot code-dot--red"></span>
        <span class="code-dot code-dot--yellow"></span>
        <span class="code-dot code-dot--green"></span>
      </div>
      <span class="code-lang">${langLabel}</span>
      <button class="code-copy-btn" type="button">复制</button>
    </div>
    <pre><code${codeClass}>${highlighted}</code></pre>
  </div>`
}

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const title = tokens[idx + 1]?.content || ''
  token.attrSet('id', slugify(title))
  return self.renderToken(tokens, idx, options)
}

/**
 * Convert admonition blocks (:::tip / :::warning / :::danger / :::info / :::center)
 * and other ::: blocks (:::right, :::quote, etc.) to HTML.
 *
 * - Known types get styled admonition boxes with emoji + title.
 * - :::center renders as centered wrapper, no emoji/title.
 * - Unknown types render as plain wrapper (hides ::: syntax, no emoji/title).
 */
const ADMONITION_TYPES = { tip: '💡', warning: '⚠️', danger: '🚨', info: 'ℹ️' }

function renderAdmonitions(body) {
  return body.replace(/^:::(\w+)\s*(.*)$\n?([\s\S]*?)^:::$/gm, (_, type, title, content) => {
    const innerHtml = md.render(content.trim())
    // center: just center the content, no emoji/title
    if (type === 'center') {
      return `<div class="text-center">${innerHtml}</div>`
    }
    // Known admonition types: styled box with emoji + title
    if (ADMONITION_TYPES[type]) {
      const emoji = ADMONITION_TYPES[type]
      const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1)
      return `<div class="admonition admonition-${type}">
        <p class="admonition-title">${emoji} ${displayTitle}</p>
        ${innerHtml}
      </div>`
    }
    // Unknown type (e.g. :::right, :::quote): plain wrapper, no emoji/title
    return `<div class="admonition-unknown">${innerHtml}</div>`
  })
}

export function renderMarkdown(raw) {
  const { data, body } = parseFrontmatter(raw)
  const processed = renderAdmonitions(body)
  return { data, body, html: md.render(processed), toc: collectToc(body) }
}

export function collectToc(markdown) {
  return markdown.split(/\r?\n/).map((line) => {
    const match = line.match(/^(#{2,4})\s+(.+)$/)
    if (!match) return null
    const text = match[2].trim()
    return {
      level: match[1].length,
      text,
      id: slugify(text)
    }
  }).filter(Boolean)
}
