import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const configPath = path.join(root, 'content', 'site-config.json')

/**
 * Load site configuration from content/site-config.json.
 * Caches the result after first read.
 */
let cachedConfig = null

export function loadConfig() {
  if (cachedConfig) return cachedConfig
  cachedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  return cachedConfig
}

export function getRoot() {
  return root
}

export function getPublicDir() {
  return path.join(root, 'public')
}

export function getContentDir() {
  return path.join(root, 'content')
}
