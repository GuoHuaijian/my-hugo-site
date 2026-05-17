import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const indexFile = path.join(publicDir, 'content-index.json')
const outFile = path.join(publicDir, 'sitemap.xml')

const SITE_URL = 'https://slothcoder.cn'

// Priority map: home > list pages > detail pages
const STATIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/notes', priority: '0.9', changefreq: 'weekly' },
  { url: '/projects', priority: '0.8', changefreq: 'weekly' },
  { url: '/books', priority: '0.8', changefreq: 'weekly' },
  { url: '/toolbox', priority: '0.7', changefreq: 'monthly' },
  { url: '/about', priority: '0.6', changefreq: 'monthly' },
]

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generate() {
  if (!fs.existsSync(indexFile)) {
    console.warn('[sitemap] content-index.json not found — skipping sitemap generation')
    return
  }

  const content = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
  const { notes = [], projects = [], books = [], toolbox } = content

  const urls = []

  // Static routes
  for (const route of STATIC_ROUTES) {
    urls.push({ loc: `${SITE_URL}${route.url}`, priority: route.priority, changefreq: route.changefreq })
  }

  // Notes
  for (const note of notes) {
    urls.push({
      loc: `${SITE_URL}/notes/${note.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: note.date || undefined,
    })
  }

  // Projects & their docs
  for (const project of projects) {
    urls.push({
      loc: `${SITE_URL}/projects/${project.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })
    for (const doc of (project.docs || [])) {
      urls.push({
        loc: `${SITE_URL}/projects/${project.slug}/${doc.slug}`,
        priority: '0.5',
        changefreq: 'monthly',
      })
    }
  }

  // Books & their chapters
  for (const book of books) {
    urls.push({
      loc: `${SITE_URL}/books/${book.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })
    for (const chapter of (book.chapters || [])) {
      const page = chapter.slug
      if (chapter.type === 'pdf') {
        urls.push({
          loc: `${SITE_URL}/books/${book.slug}/pdf/${page}`,
          priority: '0.4',
          changefreq: 'monthly',
        })
      } else {
        urls.push({
          loc: `${SITE_URL}/books/${book.slug}/${page}`,
          priority: '0.5',
          changefreq: 'monthly',
        })
      }
    }
  }

  // Toolbox docs
  if (toolbox?.categories) {
    for (const category of toolbox.categories) {
      for (const item of (category.items || [])) {
        if (item.doc) {
          urls.push({
            loc: `${SITE_URL}/toolbox/${item.doc.replace(/\.md$/, '')}`,
            priority: '0.5',
            changefreq: 'monthly',
          })
        }
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  fs.writeFileSync(outFile, xml, 'utf8')
  console.log(`[sitemap] Generated sitemap with ${urls.length} URLs → ${outFile}`)
}

generate()
