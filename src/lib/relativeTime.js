// "5 minutes ago", "yesterday", "2 days ago" — worded by the browser
// (Intl.RelativeTimeFormat), so Tamil comes for free with no i18n keys.
const UNITS = [
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function formatRelativeTime(value, language, now = new Date()) {
  const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000)
  const format = new Intl.RelativeTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', { numeric: 'auto' })

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit)
  }
  return format.format(0, 'minute')
}
