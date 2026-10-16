import { useCallback, useEffect, useState } from 'react'
import { fetchVolunteerCounts } from './masjidVolunteersApi'

// Volunteer counts for every published masjid (AC1). `counts` is null until
// loaded; on error it stays null and the volunteer prompts just don't show
// (AC17, AC24).
export function useVolunteerCounts() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    let cancelled = false
    fetchVolunteerCounts()
      .then((data) => {
        if (!cancelled) {
          setCounts(data)
          setError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(load, [load])

  return { counts, error, refetch: load }
}
