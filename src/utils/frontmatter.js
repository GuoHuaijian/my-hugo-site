/**
 * Parse YAML-like frontmatter from markdown content.
 * Supports: key-value pairs, arrays (`[a, b]`), booleans, numbers,
 * nested lists of objects (for docs/chapters frontmatter), and simple lists.
 */

export function parseFrontmatter(raw = '') {
  // Strip UTF-8 BOM if present
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
  if (!raw.startsWith('---')) return { data: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return { data: {}, body: raw }
  const data = {}
  let currentList = null
  let currentListItem = null

  for (let line of raw.slice(3, end).split(/\r?\n/)) {
    line = line.replace(/\r$/, '')
    // List item: "  - something"
    const listMatch = line.match(/^(\s*)-\s+(.+)$/)
    if (listMatch) {
      if (currentList) {
        const content = listMatch[2].trim()
        const kvMatch = content.match(/^([\w-]+):\s*(.*)$/)
        if (kvMatch) {
          currentListItem = {}
          currentListItem[kvMatch[1]] = cleanValue(kvMatch[2])
          data[currentList].push(currentListItem)
        } else {
          data[currentList].push(cleanValue(content))
          currentListItem = null
        }
      }
      continue
    }

    // Nested key-value in a list item: "    file: xxx"
    const nestedMatch = line.match(/^\s{4,}([\w-]+):\s*(.*)$/)
    if (nestedMatch && currentListItem) {
      currentListItem[nestedMatch[1]] = cleanValue(nestedMatch[2])
      continue
    }

    // Regular key-value pair
    const pair = line.match(/^([\w-]+):\s*(.*)$/)
    if (!pair) continue
    currentList = null
    currentListItem = null
    const [, key, value] = pair
    if (value === '') {
      data[key] = []
      currentList = key
    } else {
      data[key] = cleanValue(value)
    }
  }

  return { data, body: raw.slice(end + 4).trim() }
}

function cleanValue(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => cleanValue(item)).filter(Boolean)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed.replace(/^["']|["']$/g, '')
}
