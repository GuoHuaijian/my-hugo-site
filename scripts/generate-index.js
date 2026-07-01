import fs from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from '../src/utils/frontmatter.js'
import { getReadingTime } from '../src/utils/readingTime.js'
import { getRoot, getContentDir, getPublicDir } from './shared/config.js'

const root = getRoot()
const contentDir = getContentDir()
const publicDir = getPublicDir()
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
  const includeDrafts = process.argv.includes('--include-drafts')
  return listMarkdown(path.join(contentDir, 'notes')).map((file) => {
    const { data, body } = readMarkdown(file)
    const slug = path.basename(file, '.md')
    return {
      slug,
      title: data.title || slug,
      author: data.author || defaultAuthor,
      date: data.date || '',
      category: data.category || '',
      tags: data.tags || [],
      cover: resolveCover(slug, data.cover),
      summary: data.summary || body.replace(/[#>*`-]/g, '').slice(0, 150),
      readingTime: data.readingTime || getReadingTime(body),
      draft: data.draft === true,
      series: data.series || '',
      seriesOrder: data.seriesOrder || 0,
      file: `/content/notes/${slug}.md`
    }
  }).filter((note) => includeDrafts || !note.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Fetch GitHub repository stats at build time to avoid runtime API rate limits.
 * Falls back to frontmatter values if GitHub is unreachable.
 */
async function fetchGithubStats(githubUrl) {
  const match = githubUrl?.match(/github\.com\/([^/\s]+)\/([^/#?\s]+)/)
  if (!match) return { stars: 0, forks: 0 }
  const repo = `${match[1]}/${match[2].replace(/\.git$/, '')}`
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { 'User-Agent': 'cloud-edge-blog/1.0' }
    })
    if (!res.ok) return { stars: 0, forks: 0 }
    const data = await res.json()
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0
    }
  } catch {
    return { stars: 0, forks: 0 }
  }
}

async function makeProjects() {
  const dir = path.join(contentDir, 'projects')
  if (!fs.existsSync(dir)) return []
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
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
      for (const [filePath, doc] of docMap) {
        if (!listedFiles.has(filePath)) docs.push(doc)
      }
    } else {
      docs = [...docMap.values()].sort((a, b) => a.slug.localeCompare(b.slug))
    }

    // Resolve cover: frontmatter first, then auto-detect
    const cover = resolveCover(entry.name, data.cover)

    // Fetch build-time GitHub stats for projects with a GitHub URL
    const ghStats = data.githubUrl ? await fetchGithubStats(data.githubUrl) : { stars: 0, forks: 0 }

    results.push({
      slug: entry.name,
      name: data.name || data.title || entry.name,
      description: data.description || body.replace(/[#>*`-]/g, '').slice(0, 130),
      tags: data.tags || [],
      cover,
      status: data.status || '维护中',
      stars: ghStats.stars || data.stars || 0,
      forks: ghStats.forks || data.forks || 0,
      liveUrl: data.liveUrl || '',
      githubUrl: data.githubUrl || '',
      docs
    })
  }
  return results
}

function makeBooks() {
  const dir = path.join(contentDir, 'books')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
    const folder = path.join(dir, entry.name)
    const { data } = readMarkdown(path.join(folder, 'index.md'))

    // Build chapter map from all markdown files (recursive, include subdirectories)
    const chapterMap = new Map()
    for (const file of listMarkdownRecursive(folder)) {
      if (path.basename(file) === 'index.md') continue
      const { data: chapterData } = readMarkdown(file)
      const rel = path.relative(folder, file).replace(/\\/g, '/') // e.g. "introduction/about-me.md"
      const basename = path.basename(file) // e.g. "about-me.md"
      chapterMap.set(rel, {
        title: chapterData.title || basename.replace(/\.md$/, '').replace(/-/g, ' '),
        slug: rel.replace(/\.md$/, ''), // e.g. "introduction/about-me"
        file: `/content/books/${entry.name}/${rel.replace(/\\/g, '/')}`,
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

function makeSeriesIndex(notes) {
  const seriesMap = {}
  for (const note of notes) {
    if (!note.series) continue
    if (!seriesMap[note.series]) seriesMap[note.series] = []
    seriesMap[note.series].push({ slug: note.slug, title: note.title, date: note.date, seriesOrder: note.seriesOrder })
  }
  // Sort each series by seriesOrder, then by date
  for (const key of Object.keys(seriesMap)) {
    seriesMap[key].sort((a, b) => (a.seriesOrder || 999) - (b.seriesOrder || 999) || new Date(a.date) - new Date(b.date))
  }
  return seriesMap
}

const notes = makeNotes()
const projects = await makeProjects()
const books = makeBooks()
const allTags = [...new Set(notes.flatMap((note) => note.tags))]
const seriesIndex = makeSeriesIndex(notes)
const toolbox = readJson(path.join(contentDir, 'toolbox.json'), { categories: [] })
const site = readJson(path.join(contentDir, 'site-config.json'), {})

fs.writeFileSync(path.join(publicDir, 'content-index.json'), JSON.stringify({ notes, projects, books, toolbox, allTags, seriesIndex, site }, null, 2), 'utf8')

// Generate series index for quick lookup
if (Object.keys(seriesIndex).length > 0) {
  fs.writeFileSync(path.join(publicDir, 'series-index.json'), JSON.stringify(seriesIndex, null, 2), 'utf8')
  console.log(`[series] Indexed ${Object.keys(seriesIndex).length} series.`)
}

// Generate compressed favicons from logo
async function generateFavicons() {
  try {
    const { default: sharp } = await import('sharp')
    const logoWebp = path.join(root, 'src', 'assets', 'images', 'logo.webp')
    if (fs.existsSync(logoWebp)) {
      const favPng = path.join(publicDir, 'favicon.png')
      const favWebp = path.join(publicDir, 'favicon.webp')
      await sharp(logoWebp).resize(64, 64).png({ palette: true, colors: 64, compressionLevel: 9 }).toFile(favPng)
      await sharp(logoWebp).resize(64, 64).webp({ quality: 80 }).toFile(favWebp)
      console.log('[favicon] generated favicon.png + favicon.webp')
    }
  } catch (err) {
    console.warn('[favicon] skipped (sharp not available or logo missing):', err.message)
  }
}

await generateFavicons()

console.log(`Generated ${notes.length} notes, ${projects.length} projects, ${books.length} books.`)
