import { useEffect, useState } from 'react'

const ONE_MINUTE = 60 * 1000

// The current time, refreshed every minute, so "next jamaat" moves on by
// itself while the screen stays open.
export function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), ONE_MINUTE)
    return () => clearInterval(timer)
  }, [])

  return now
}
