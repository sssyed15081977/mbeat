import { weekdayOf } from './amalDay'

const FRIDAY = 5
const NOT_FRIDAY = [0, 1, 2, 3, 4, 6]

// How a fard prayer was prayed, lowest first (spec §5). Jumu'ah has only
// three: anyone not obliged to attend (women, travellers, the ill) picks
// Excused and prays Dhuhr instead (AC8).
export const FARD_LEVELS = ['missed', 'qada', 'alone', 'jamaat_home', 'jamaat_masjid', 'excused']
export const JUMUAH_LEVELS = ['missed', 'jamaat_masjid', 'excused']

// Display order of the groups on the Amal tracker screen.
export const HABIT_GROUPS = ['fard', 'sunnah', 'other', 'adhkar']

const daily = { type: 'daily' }

function fard(id, schedule = daily, levels = FARD_LEVELS) {
  return { id, group: 'fard', valueType: 'levels', levels, schedule }
}

// `position` is 'before' or 'after' the anchor prayer.
function sunnah(id, anchor, position, rakahs) {
  return { id, group: 'sunnah', anchor, position, rakahs, valueType: 'done', schedule: daily }
}

function done(id, group) {
  return { id, group, valueType: 'done', schedule: daily }
}

// The built-in habits, in display order. Ids are stored in entries, so never
// rename one (AC18); labels come from i18n keys named after the id.
// The sunnah rows are the 12 rak'ahs promised a house in Jannah (Muslim 728;
// listed in Tirmidhi 415), confirmed by Syed 2026-10-23. On Fridays the Dhuhr
// sunnah rows stay and sit under Jumu'ah (AC9).
export const PRESET_HABITS = [
  fard('fajr'),
  fard('dhuhr', { type: 'weekdays', days: NOT_FRIDAY }),
  fard('jumuah', { type: 'weekdays', days: [FRIDAY] }, JUMUAH_LEVELS),
  fard('asr'),
  fard('maghrib'),
  fard('isha'),

  sunnah('fajr_sunnah_before', 'fajr', 'before', 2),
  sunnah('dhuhr_sunnah_before', 'dhuhr', 'before', 4),
  sunnah('dhuhr_sunnah_after', 'dhuhr', 'after', 2),
  sunnah('maghrib_sunnah_after', 'maghrib', 'after', 2),
  sunnah('isha_sunnah_after', 'isha', 'after', 2),

  done('duha', 'other'),
  done('tahajjud', 'other'),
  done('witr', 'other'),

  done('adhkar_morning', 'adhkar'),
  done('adhkar_evening', 'adhkar'),
]

// Hidden until the user turns them on in Manage habits, so a beginner's list
// stays short (AC15).
export const DEFAULT_HIDDEN_HABITS = ['duha', 'tahajjud']

// The prayer a sunnah row sits under on `dateKey`: on Fridays the Dhuhr
// sunnah sits under Jumu'ah (AC9).
export function anchorPrayer(habit, dateKey) {
  return habit.anchor === 'dhuhr' && weekdayOf(dateKey) === FRIDAY ? 'jumuah' : habit.anchor
}

// Whether `habit` has a row on the amal date `dateKey`. New schedule types
// (hijri_days for fasts, spec §6) only need a case here.
export function isDue(habit, dateKey) {
  const { schedule } = habit
  if (schedule.type === 'daily') return true
  if (schedule.type === 'weekdays') return schedule.days.includes(weekdayOf(dateKey))
  return false
}

// Whether a stored value fills that day's dot (AC13): done, or for a prayer,
// any level from qada up. Missed, Excused and not logged stay empty.
export function countsAsDone(habit, value) {
  if (habit.valueType === 'levels') return value != null && value !== 'missed' && value !== 'excused'
  return value === true
}
