import { getBeginsTimes, getNextBegins } from './beginsTimes'
import { getNextJamaat, formatJamaatTime } from './nextJamaat'

export const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

// What every board style draws (spec jamaat-board.md AC1–AC5), worked out once
// so the styles only differ in looks.
//
// `prayerTimes` is a masjid's masjid_prayer_times rows, or null when no masjid
// is chosen. Each row's `jamaat` is then:
//   undefined -> no masjid: the cell is blank
//   null      -> the masjid has no time for it (or it's Sunrise): "—"
//   "HH:MM"   -> the jamaat time
// `next` is the highlighted row: the next jamaat when there's a masjid with
// times, else the next Begins.
export function buildBoard({ now, method, prayerTimes }) {
  const jamaatByPrayer = prayerTimes
    ? new Map(prayerTimes.map((row) => [row.prayer, row.jamaat_time]))
    : null

  const nextJamaat = prayerTimes ? getNextJamaat(prayerTimes, now) : null
  let next
  if (nextJamaat) {
    next = { prayer: nextJamaat.prayer, isTomorrow: nextJamaat.isTomorrow, kind: 'jamaat' }
  } else {
    const nextBegins = getNextBegins(now, method)
    next = { prayer: nextBegins.prayer, isTomorrow: nextBegins.isTomorrow, kind: 'begins', time: nextBegins.time }
  }

  const rows = getBeginsTimes(now, method).map(({ prayer, time }) => ({
    prayer,
    // After Isha the highlight is tomorrow's Fajr, so show tomorrow's time.
    begins: next.kind === 'begins' && next.isTomorrow && next.prayer === prayer ? next.time : time,
    jamaat: jamaatByPrayer ? (jamaatByPrayer.get(prayer) ?? null) : undefined,
  }))

  // Jumu'ah has no Begins time of its own (it begins with Dhuhr), and without
  // a masjid the whole row would be empty, so it's left out then.
  const jumuah = jamaatByPrayer
    ? { prayer: 'jumuah', begins: undefined, jamaat: jamaatByPrayer.get('jumuah') ?? null }
    : null

  return { rows, jumuah, next }
}

// A cell's text: "5:10 AM", "—", or blank (see buildBoard).
export function cellText(time) {
  if (time === undefined) return ''
  if (time === null) return '—'
  return formatJamaatTime(time)
}

// Sunrise isn't a prayer, so its label lives outside `prayer.*`.
export function prayerLabelKey(prayer) {
  return prayer === 'sunrise' ? 'begins.sunrise' : `prayer.${prayer}`
}

// "Next jamaat" / "Next prayer", plus "(tomorrow)" when it is.
export function nextLabel(t, next) {
  const label = next.kind === 'jamaat' ? t('prayerTimes.nextJamaat') : t('board.nextPrayer')
  return next.isTomorrow ? `${label} (${t('prayerTimes.tomorrow')})` : label
}
