/**
 * Convert text to a URL-friendly slug.
 * Supports Chinese characters and ASCII alphanumerics.
 */
export function slugify(text = '') {
  return text.toLowerCase().trim()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}
