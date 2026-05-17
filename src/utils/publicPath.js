export function publicPath(file) {
  if (!file) return ''
  if (/^(https?:)?\/\//.test(file)) return file
  const clean = file.replace(/^\//, '')
  const base = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL
  return `${base}${clean}`
}
