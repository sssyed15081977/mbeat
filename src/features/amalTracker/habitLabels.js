import { anchorPrayer } from './presetHabits'

// A habit's row label. Prayers reuse the `prayer.*` names; a sunnah row reads
// "Fajr: before" rather than joining the prayer name into a Tamil phrase,
// which would need a different suffix for each prayer. Without a date (Manage
// habits) the Dhuhr sunnah stays under Dhuhr.
export function habitLabel(t, habit, date = null) {
  if (habit.group === 'fard') return t(`prayer.${habit.id}`)
  if (habit.group === 'sunnah') {
    const prayer = t(`prayer.${date ? anchorPrayer(habit, date) : habit.anchor}`)
    return t(habit.position === 'before' ? 'amal.sunnahBefore' : 'amal.sunnahAfter', { prayer })
  }
  return t(`amal.habit.${habit.id}`)
}

// A fard level's label. Jumu'ah's top level reads "Prayed at masjid" (AC8).
export function levelLabel(t, habit, level) {
  if (habit.id === 'jumuah' && level === 'jamaat_masjid') return t('amal.level.jumuahPrayed')
  return t(`amal.level.${level}`)
}
