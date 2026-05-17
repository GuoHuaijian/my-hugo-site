export function getReadingTime(text = '') {
  return Math.max(1, Math.ceil(text.replace(/\s+/g, '').length / 300))
}
