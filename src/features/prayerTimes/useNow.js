import { useEffect, useState } from 'react'

const ONE_MINUTE = 60 * 1000

// The current time, refreshed on each minute boundary (Melapalayam's offset is
// a whole number of minutes, so UTC's boundary is its boundary too), so "next
// jamaat" and the digital board's clock move on by themselves while the screen
// stays open. Also refreshed when the app comes back to the foreground, since
// phones pause timers in the background.
export function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer
    function schedule() {
      timer = setTimeout(tick, ONE_MINUTE - (Date.now() % ONE_MINUTE))
    }
    function tick() {
      setNow(new Date())
      schedule()
    }
    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      clearTimeout(timer)
      tick()
    }

    schedule()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return now
}
