import { useEffect, useState } from 'react'
import { addDays } from './amalDay'
import { MAX_DAYS_BACK } from './useAmalDay'
import { getEntries, setEntryValue } from './amalStore'

// The oldest viewable day still shows 6 days of dots before it (AC13).
const LOADED_DAYS = MAX_DAYS_BACK + 7

function withValue(entries, date, habitId, value) {
  const entry = { ...(entries?.[date] ?? {}) }
  if (value == null) delete entry[habitId]
  else entry[habitId] = value
  return { ...entries, [date]: entry }
}

// Entries for the days the screen can show, loaded once per amal day.
// setValue updates the screen first and saves in the background (AC12); if
// the save fails, the old value comes back and saveError is set.
export function useAmalEntries(today) {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    const dates = Array.from({ length: LOADED_DAYS }, (_, i) => addDays(today, -i))
    getEntries(dates).then(
      (loaded) => {
        if (cancelled) return
        setEntries(loaded)
        setError(false)
      },
      () => {
        if (!cancelled) setError(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [today, attempt])

  function setValue(date, habitId, value) {
    const previous = entries?.[date]?.[habitId]
    setEntries((current) => withValue(current, date, habitId, value))
    setSaveError(false)
    setEntryValue(date, habitId, value).catch(() => {
      setEntries((current) => withValue(current, date, habitId, previous))
      setSaveError(true)
    })
  }

  return {
    entries: entries ?? {},
    loading: entries === null && !error,
    error,
    retry: () => setAttempt((n) => n + 1),
    saveError,
    setValue,
  }
}
