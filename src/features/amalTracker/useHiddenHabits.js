import { useEffect, useState } from 'react'
import { DEFAULT_HIDDEN_HABITS } from './presetHabits'
import { getHiddenHabits, setHiddenHabits } from './amalStore'

// The habits hidden in Manage habits, as a Set (null while loading), and a
// toggle that remembers the change (AC14). Until the user changes anything,
// DEFAULT_HIDDEN_HABITS applies (AC15).
export function useHiddenHabits() {
  const [hidden, setHidden] = useState(null)

  useEffect(() => {
    let cancelled = false
    getHiddenHabits().then(
      (ids) => {
        if (!cancelled) setHidden(new Set(ids ?? DEFAULT_HIDDEN_HABITS))
      },
      () => {
        if (!cancelled) setHidden(new Set(DEFAULT_HIDDEN_HABITS))
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  function toggle(habitId) {
    const next = new Set(hidden)
    if (next.has(habitId)) next.delete(habitId)
    else next.add(habitId)
    setHidden(next)
    setHiddenHabits([...next]).catch(() => {
      // Not remembered after a reload, but applied for this visit.
    })
  }

  return { hidden, toggle }
}
