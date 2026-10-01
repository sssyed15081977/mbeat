import { PrayerTimes } from 'adhan'
import { MELAPALAYAM, calcParams } from './calcMethods'
import { kolkataClock, toMinutes } from './nextJamaat'

const ONE_DAY = 24 * 60 * 60 * 1000
// Display order. Sunrise isn't a prayer; it's shown because it ends Fajr.
const BEGINS_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

// An instant -> Melapalayam wall-clock "HH:MM", the shape formatJamaatTime reads.
function kolkataTime(instant) {
  const { minutes } = kolkataClock(instant)
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// The Begins times for Melapalayam's calendar day at `now`, earliest first:
// [{ prayer, time: "HH:MM" }]. Dhuhr stays Dhuhr on Fridays: the board has its
// own Jumu'ah row (spec jamaat-board.md AC4, replacing prayer-begins.md AC4a).
export function getBeginsTimes(now, method) {
  const { year, month, day } = kolkataClock(now)
  // adhan-js reads the day from the Date's *local* fields, so build it from
  // Melapalayam's date; the phone's own time zone then doesn't matter.
  const times = new PrayerTimes(MELAPALAYAM, new Date(year, month, day), calcParams(method))

  return BEGINS_ORDER.map((prayer) => ({ prayer, time: kolkataTime(times[prayer]) }))
}

// The next prayer to begin: { prayer, time, isTomorrow }. Sunrise never
// counts. A prayer beginning this very minute still counts as next,
// matching getNextJamaat.
export function getNextBegins(now, method) {
  const { minutes } = kolkataClock(now)
  const next = getBeginsTimes(now, method).find(
    (t) => t.prayer !== 'sunrise' && toMinutes(t.time) >= minutes,
  )
  if (next) return { ...next, isTomorrow: false }

  // After Isha has begun: tomorrow's Fajr.
  const [fajr] = getBeginsTimes(new Date(now.getTime() + ONE_DAY), method)
  return { ...fajr, isTomorrow: true }
}
