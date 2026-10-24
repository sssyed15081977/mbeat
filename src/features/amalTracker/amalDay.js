import { getBeginsTimes } from '../prayerTimes/beginsTimes'
import { kolkataClock, toMinutes } from '../prayerTimes/nextJamaat'

const ONE_DAY = 24 * 60 * 60 * 1000

// "YYYY-MM-DD" for a calendar date. Month is 0-based, like Date's.
function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// A date key -> a Date at UTC midnight, only used for date arithmetic.
function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

// The amal date at `now` (AC5): an amal day runs from Fajr to Fajr in
// Melapalayam, so between midnight and Fajr it's still the previous date and
// tahajjud at 3am counts for the night before. Fajr is the Begins time for the
// user's calculation method.
export function getAmalDate(now, method) {
  const { year, month, day, minutes } = kolkataClock(now)
  const [fajr] = getBeginsTimes(now, method)
  if (minutes >= toMinutes(fajr.time)) return toDateKey(year, month, day)

  const yesterday = kolkataClock(new Date(now.getTime() - ONE_DAY))
  return toDateKey(yesterday.year, yesterday.month, yesterday.day)
}

// The date key `days` after `dateKey` (negative goes back).
export function addDays(dateKey, days) {
  const shifted = new Date(fromDateKey(dateKey).getTime() + days * ONE_DAY)
  return toDateKey(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
}

// 0 = Sunday … 6 = Saturday, matching Date#getDay.
export function weekdayOf(dateKey) {
  return fromDateKey(dateKey).getUTCDay()
}
