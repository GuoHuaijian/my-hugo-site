import fs from 'node:fs'
import path from 'node:path'
import { loadConfig, getPublicDir } from './shared/config.js'

const publicDir = getPublicDir()
const indexFile = path.join(publicDir, 'content-index.json')
const outFile = path.join(publicDir, 'feed.xml')

const config = loadConfig()
const SITE_URL = config.site?.url || 'https://slothcoder.cn'
const SITE_NAME = config.site?.name || '云边小卖部'
const SITE_DESC = config.site?.description || '贩卖代码、笔记与偶尔的胡思乱想'

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generate() {
  if (!fs.existsSync(indexFile)) {
    console.warn('[rss] content-index.json not found — skipping RSS generation')
    return
  }

  const content = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
  const { notes = [], site } = content

  const items = []

  for (const note of notes) {
    const url = `${SITE_URL}/notes/${note.slug}`
    items.push(`    <entry>
      <id>${escapeXml(url)}</id>
      <title>${escapeXml(note.title)}</title>
      <link href="${escapeXml(url)}" />
      <published>${note.date ? new Date(note.date).toISOString() : new Date().toISOString()}</published>
      <summary type="text">${escapeXml(note.summary || '')}</summary>
      <author>
        <name>${escapeXml(note.author || site?.defaultAuthor || '店主')}</name>
      </author>
    </entry>`)
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_NAME)}</title>
  <subtitle>${escapeXml(SITE_DESC)}</subtitle>
  <link href="${escapeXml(SITE_URL)}/feed.xml" rel="self" />
  <link href="${escapeXml(SITE_URL)}" />
  <updated>${notes[0]?.date ? new Date(notes[0].date).toISOString() : new Date().toISOString()}</updated>
  <id>${escapeXml(SITE_URL)}/</id>
  <author>
    <name>${escapeXml(site?.defaultAuthor || '店主')}</name>
  </author>
${items.join('\n')}
</feed>
`

  fs.writeFileSync(outFile, feed, 'utf8')
  console.log(`[rss] Generated Atom feed with ${items.length} entries → ${outFile}`)
}

generate()
