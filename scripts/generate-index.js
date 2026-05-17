import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'content')
const publicDir = path.join(root, 'public')
const publicContentDir = path.join(publicDir, 'content')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

function parseValue(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed.replace(/^["']|["']$/g, '')
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw }
  const lines = raw.slice(3, end).split(/\r?\n/)
  const data = {}
  let currentList = null
  let currentListItem = null

  for (const line of lines) {
    // Check for list item: "  - something"
    const listMatch = line.match(/^(\s*)-\s+(.+)$/)
    if (listMatch) {
      if (currentList) {
        const content = listMatch[2].trim()
        // Check if it's a key-value pair like "title: xxx"
        const kvMatch = content.match(/^([\w-]+):\s*(.*)$/)
        if (kvMatch) {
          // Start a new list item object
          currentListItem = {}
          currentListItem[kvMatch[1]] = parseValue(kvMatch[2])
          data[currentList].push(currentListItem)
        } else {
          // Simple list item
          data[currentList].push(parseValue(content))
          currentListItem = null
        }
      }
      continue
    }

    // Check for nested key-value in a list item: "    file: xxx"
    const nestedMatch = line.match(/^\s{4,}([\w-]+):\s*(.*)$/)
    if (nestedMatch && currentListItem) {
      currentListItem[nestedMatch[1]] = parseValue(nestedMatch[2])
      continue
    }

    // Regular key-value pair
    const match = line.match(/^([\w-]+):\s*(.*)$/)
    if (!match) continue
    currentList = null
    currentListItem = null
    const [, key, value] = match
    if (value === '') {
      data[key] = []
      currentList = key
    } else {
      data[key] = parseValue(value)
    }
  }
  return { data, body: raw.slice(end + 4).trim() }
}

function readingTime(text) {
  const words = text.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(words / 300))
}

function readMarkdown(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const { data, body } = parseFrontmatter(raw)
  return { data, body }
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => path.join(dir, name))
}

function listMarkdownRecursive(dir) {
  if (!fs.existsSync(dir)) return []
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...listMarkdownRecursive(full))
    else if (entry.name.endsWith('.md')) results.push(full)
  }
  return results
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']

/**
 * Resolve cover image path.
 * Priority: 1. data.cover (frontmatter)  2. auto-detect same-name file in covers/
 */
function resolveCover(slug, dataCover) {
  if (dataCover) return dataCover
  const coversDir = path.join(contentDir, 'covers')
  if (!fs.existsSync(coversDir)) return ''
  for (const ext of IMAGE_EXTENSIONS) {
    const file = `${slug}${ext}`
    if (fs.existsSync(path.join(coversDir, file))) {
      return `/content/covers/${file}`
    }
  }
  return ''
}

function makeNotes() {
  return listMarkdown(path.join(contentDir, 'notes')).map((file) => {
    const { data, body } = readMarkdown(file)
    const slug = path.basename(file, '.md')
    return {
      slug,
      title: data.title || slug,
      author: data.author || defaultAuthor,
      date: data.date || '',
      tags: data.tags || [],
      cover: resolveCover(slug, data.cover),
      summary: data.summary || body.replace(/[#>*`-]/g, '').slice(0, 150),
      readingTime: data.readingTime || readingTime(body),
      file: `/content/notes/${slug}.md`
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function makeProjects() {
  const dir = path.join(contentDir, 'projects')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
    const folder = path.join(dir, entry.name)
    const { data, body } = readMarkdown(path.join(folder, 'index.md'))

    // Build doc map from all markdown files (recursive)
    const docMap = new Map()
    for (const file of listMarkdownRecursive(folder)) {
      if (path.basename(file) === 'index.md') continue
      const { data: docData } = readMarkdown(file)
      const rel = path.relative(folder, file).replace(/\\/g, '/') // e.g. "flow/data-flow.md"
      docMap.set(rel, {
        title: docData.title || rel.replace(/\.md$/, '').replace(/[/-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        slug: rel.replace(/\.md$/, ''), // e.g. "flow/data-flow"
        file: `/content/projects/${entry.name}/${rel.replace(/\\/g, '/')}`
      })
    }

    // Order docs by docs list from frontmatter, or fall back to alphabetical
    let docs
    if (Array.isArray(data.docs) && data.docs.length > 0) {
      docs = data.docs.map((d) => {
        const doc = docMap.get(d.file)
        return doc ? { ...doc, title: d.title || doc.title } : null
      }).filter(Boolean)
      // Add any docs not in the list
      const listedFiles = new Set(data.docs.map(d => d.file))
      for (const [name, doc] of docMap) {
        if (!listedFiles.has(name)) docs.push(doc)
      }
    } else {
      docs = [...docMap.values()].sort((a, b) => a.slug.localeCompare(b.slug))
    }

    // Resolve cover: frontmatter first, then auto-detect
    const cover = resolveCover(entry.name, data.cover)

    return {
      slug: entry.name,
      name: data.name || data.title || entry.name,
      description: data.description || body.replace(/[#>*`-]/g, '').slice(0, 130),
      tags: data.tags || [],
      cover,
      status: data.status || '维护中',
      stars: data.stars || 0,
      forks: data.forks || 0,
      liveUrl: data.liveUrl || '',
      githubUrl: data.githubUrl || '',
      docs
    }
  })
}

function makeBooks() {
  const dir = path.join(contentDir, 'books')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
    const folder = path.join(dir, entry.name)
    const { data } = readMarkdown(path.join(folder, 'index.md'))

    // Build chapter map from all markdown files
    const chapterMap = new Map()
    for (const file of listMarkdown(folder)) {
      if (path.basename(file) === 'index.md') continue
      const { data: chapterData } = readMarkdown(file)
      const basename = path.basename(file)
      chapterMap.set(basename, {
        title: chapterData.title || basename.replace(/\.md$/, '').replace(/-/g, ' '),
        slug: basename.replace(/\.md$/, ''),
        file: `/content/books/${entry.name}/${basename}`,
        type: 'md'
      })
    }

    // Scan PDF files
    if (fs.existsSync(folder)) {
      for (const file of fs.readdirSync(folder)) {
        if (file.toLowerCase().endsWith('.pdf')) {
          const title = file.replace(/\.pdf$/i, '').replace(/-/g, ' ')
          const slug = file.replace(/\.pdf$/i, '')
          chapterMap.set(file, {
            title,
            slug,
            file: `/content/books/${entry.name}/${file}`,
            type: 'pdf'
          })
        }
      }
    }

    // Order chapters by chapters list from frontmatter, or fall back to alphabetical
    let chapters
    if (Array.isArray(data.chapters) && data.chapters.length > 0) {
      chapters = data.chapters.map((ch) => {
        const chapter = chapterMap.get(ch.file)
        return chapter ? { ...chapter, title: ch.title || chapter.title } : null
      }).filter(Boolean)
      // Add any chapters not in the chapters list
      const listedFiles = new Set(data.chapters.map(ch => ch.file))
      for (const [name, chapter] of chapterMap) {
        if (!listedFiles.has(name)) chapters.push(chapter)
      }
    } else {
      chapters = [...chapterMap.values()].sort((a, b) => a.slug.localeCompare(b.slug))
    }

    // Resolve cover: frontmatter first, then auto-detect
    const cover = resolveCover(entry.name, data.cover)

    return {
      slug: entry.name,
      title: data.title || entry.name,
      author: data.author || '',
      cover,
      status: data.status || '在读',
      quote: data.quote || '',
      rating: data.rating || 0,
      chapters
    }
  })
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

ensureDir(publicDir)
copyDir(contentDir, publicContentDir)

const siteConfig = readJson(path.join(contentDir, 'site-config.json'), {})
const defaultAuthor = siteConfig.notes?.defaultAuthor || '店主'

const notes = makeNotes()
const projects = makeProjects()
const books = makeBooks()
const allTags = [...new Set(notes.flatMap((note) => note.tags))]
const toolbox = readJson(path.join(contentDir, 'toolbox.json'), { categories: [] })
const site = readJson(path.join(contentDir, 'site-config.json'), {})

fs.writeFileSync(path.join(publicDir, 'content-index.json'), JSON.stringify({ notes, projects, books, toolbox, allTags, site }, null, 2), 'utf8')

// Copy logo as favicon if missing
const logoPath = path.join(root, 'src', 'assets', 'images', 'logo.png')
const faviconPath = path.join(publicDir, 'favicon.png')
if (!fs.existsSync(faviconPath) && fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, faviconPath)
}

console.log(`Generated ${notes.length} notes, ${projects.length} projects, ${books.length} books.`)
