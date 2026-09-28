import { KOLKATA_OFFSET_MINUTES } from './nextJamaat'

// Times older than this many days show the "may be out of date" warning (AC7).
export const STALE_AFTER_DAYS = 7

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Days since the Unix epoch on the Melapalayam calendar, so "today" and
// "yesterday" flip at local midnight, not UTC midnight.
function kolkataDayNumber(date) {
  return Math.floor((date.getTime() + KOLKATA_OFFSET_MINUTES * 60 * 1000) / MS_PER_DAY)
}

// From masjid.times_confirmed_at. Returns data, not text — the screen picks
// the wording: daysAgo null -> "Not yet confirmed"; 0 -> "today";
// 1 -> "yesterday"; otherwise "N days ago", with isStale adding the warning.
export function getFreshness(timesConfirmedAt, now = new Date()) {
  if (!timesConfirmedAt) return { daysAgo: null, isStale: false }

  const daysAgo = Math.max(
    0,
    kolkataDayNumber(now) - kolkataDayNumber(new Date(timesConfirmedAt)),
  )
  return { daysAgo, isStale: daysAgo > STALE_AFTER_DAYS }
}
