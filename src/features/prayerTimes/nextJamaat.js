// Jamaat times are Melapalayam wall-clock times, so "now" must be Melapalayam
// time too, whatever the phone's time zone. India has no daylight saving, so
// Asia/Kolkata is always UTC+5:30 and a fixed offset is enough.
export const KOLKATA_OFFSET_MINUTES = 5 * 60 + 30
const FRIDAY = 5
const MINUTES_PER_DAY = 24 * 60

function kolkataClock(now) {
  const shifted = new Date(now.getTime() + KOLKATA_OFFSET_MINUTES * 60 * 1000)
  return {
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  }
}

// "05:15:00" (Postgres `time`) -> minutes since midnight.
function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// The prayers held on a given weekday, earliest first. On Fridays Jumu'ah
// takes Dhuhr's place; a masjid with no Jumu'ah row keeps its Dhuhr.
function prayersForDay(times, weekday) {
  const hasJumuah = times.some((t) => t.prayer === 'jumuah')
  return times
    .filter((t) => {
      if (t.prayer === 'jumuah') return weekday === FRIDAY
      if (t.prayer === 'dhuhr') return weekday !== FRIDAY || !hasJumuah
      return true
    })
    .sort((a, b) => toMinutes(a.jamaat_time) - toMinutes(b.jamaat_time))
}

// `times` is a masjid's masjid_prayer_times rows ({ prayer, jamaat_time }).
// Returns { prayer, jamaatTime, isTomorrow }, or null if the masjid has no
// times. A jamaat starting this very minute still counts as next.
export function getNextJamaat(times, now = new Date()) {
  if (!times?.length) return null

  const { weekday, minutes } = kolkataClock(now)

  const today = prayersForDay(times, weekday)
  const nextToday = today.find((t) => toMinutes(t.jamaat_time) >= minutes)
  if (nextToday) {
    return { prayer: nextToday.prayer, jamaatTime: nextToday.jamaat_time, isTomorrow: false }
  }

  // Past today's last jamaat: the first one tomorrow (usually Fajr).
  const tomorrow = prayersForDay(times, (weekday + 1) % 7)
  if (!tomorrow.length) return null
  return { prayer: tomorrow[0].prayer, jamaatTime: tomorrow[0].jamaat_time, isTomorrow: true }
}

// "05:15:00" -> "5:15 AM", in both languages (decided 2026-09-28: AM/PM is
// what people read on notice boards; Tamil's முற்பகல்/பிற்பகல் was not wanted).
// en-US, not en-IN: en-IN writes "am"/"pm" in lowercase. timeZone is UTC
// because the Date below is only a carrier for the wall-clock value.
export function formatJamaatTime(time) {
  const minutes = toMinutes(time) % MINUTES_PER_DAY
  const carrier = new Date(Date.UTC(1970, 0, 1, Math.floor(minutes / 60), minutes % 60))
  return carrier.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}
