import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')

/** Walk directory recursively and return all matching file paths */
function walk(dir, extSet) {
  const results = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(full, extSet))
    } else if (extSet.has(path.extname(entry.name).toLowerCase())) {
      results.push(full)
    }
  }
  return results
}

async function optimize() {
  const start = Date.now()
  console.log('[optimize-images] scanning for PNG files...')

  const pngFiles = walk(publicDir, new Set(['.png']))
    .filter(f => !f.endsWith('favicon.png')) // keep favicon as PNG for compatibility

  if (pngFiles.length === 0) {
    console.log('[optimize-images] no PNG files found, skipping.')
    return
  }

  console.log(`[optimize-images] found ${pngFiles.length} PNG files, converting to WebP...`)

  let totalBefore = 0
  let totalAfter = 0
  let converted = 0

  for (const file of pngFiles) {
    const stat = fs.statSync(file)
    totalBefore += stat.size

    const webpFile = file.replace(/\.png$/i, '.webp')

    try {
      const buf = await sharp(file)
        .webp({ quality: 80, effort: 4 })
        .toBuffer()

      fs.writeFileSync(webpFile, buf)
      fs.unlinkSync(file) // remove original PNG

      totalAfter += buf.length
      converted++

      const saving = ((1 - buf.length / stat.size) * 100).toFixed(1)
      if (converted <= 5 || converted % 50 === 0) {
        console.log(`  [${converted}/${pngFiles.length}] ${path.relative(publicDir, file)} → .webp (${saving}% saved)`)
      }
    } catch (err) {
      console.warn(`  [optimize-images] FAILED: ${path.relative(publicDir, file)} - ${err.message}`)
    }
  }

  // Update .png → .webp references in markdown files and JSON
  console.log('[optimize-images] updating .png → .webp references...')
  const refFiles = [
    ...walk(publicDir, new Set(['.md', '.json'])),
    path.join(publicDir, 'content-index.json'),
  ].filter(f => fs.existsSync(f))

  let refUpdated = 0
  for (const file of refFiles) {
    let content = fs.readFileSync(file, 'utf8')
    // Replace .png → .webp ONLY for local /content/ paths (covers, images in markdown)
    // This avoids touching external URL images (geekbang, githubusercontent, etc.)
    const newContent = content.replace(/("\/content\/[^"]+)\.png(")/g, '$1.webp$2')
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8')
      refUpdated++
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)
  console.log(`[optimize-images] done in ${elapsed}s`)
  console.log(`[optimize-images] converted ${converted}/${pngFiles.length} PNGs to WebP`)
  console.log(`[optimize-images] before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → after: ${(totalAfter / 1024 / 1024).toFixed(1)} MB (saved ${savedMB} MB)`)
  console.log(`[optimize-images] updated ${refUpdated} reference files (markdown + JSON)`)
}

optimize().catch(err => {
  console.error('[optimize-images] error:', err)
  process.exit(1)
})
