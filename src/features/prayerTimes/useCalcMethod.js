import { useState } from 'react'
import { DEFAULT_CALC_METHOD, isCalcMethod } from './calcMethods'

// Saved on this device only, like `mbeat_language` (decided 2026-09-30:
// no profiles column until someone asks for it to follow them across phones).
export const CALC_METHOD_STORAGE_KEY = 'mbeat_prayer_calc_method'

// Storage can throw (private mode, blocked site data); the times must still
// show, so any failure means "use the default" / "don't remember".
function getStoredCalcMethod() {
  try {
    const stored = localStorage.getItem(CALC_METHOD_STORAGE_KEY)
    return isCalcMethod(stored) ? stored : DEFAULT_CALC_METHOD
  } catch {
    return DEFAULT_CALC_METHOD
  }
}

// The user's chosen calculation method for Begins times, and a setter that
// remembers it. Unknown values are ignored.
export function useCalcMethod() {
  const [method, setMethodState] = useState(getStoredCalcMethod)

  function setMethod(next) {
    if (!isCalcMethod(next)) return
    setMethodState(next)
    try {
      localStorage.setItem(CALC_METHOD_STORAGE_KEY, next)
    } catch {
      // Not remembered after a reload, but still applied for this visit.
    }
  }

  return [method, setMethod]
}
