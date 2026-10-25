import { useState } from 'react'
import { useNow } from '../prayerTimes/useNow'
import { useCalcMethod } from '../prayerTimes/useCalcMethod'
import { addDays, getAmalDate } from './amalDay'

// How far back the date line can go (AC2). Never into the future.
export const MAX_DAYS_BACK = 6

// The amal date being logged, and ‹ › to move between today and the last
// MAX_DAYS_BACK days. "Today" follows the clock, so it moves on at Fajr by
// itself while the screen stays open (AC5).
export function useAmalDay() {
  const now = useNow()
  const [method] = useCalcMethod()
  const [daysBack, setDaysBack] = useState(0)
  const today = getAmalDate(now, method)

  return {
    today,
    date: addDays(today, -daysBack),
    daysBack,
    canGoBack: daysBack < MAX_DAYS_BACK,
    canGoForward: daysBack > 0,
    goBack: () => setDaysBack((d) => Math.min(d + 1, MAX_DAYS_BACK)),
    goForward: () => setDaysBack((d) => Math.max(d - 1, 0)),
  }
}
