import { useCallback, useEffect, useState } from 'react'
import { fetchMasjidById } from './prayerTimesApi'
import { useIsMasjidVolunteer } from './useIsMasjidVolunteer'

// One masjid for the detail page. `masjid` is null when it doesn't exist or
// isn't published. `isVolunteer` only decides whether "Update times" shows
// (AC10); RLS is what actually stops a non-volunteer saving.
export function useMasjid(id) {
  const [masjid, setMasjid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isVolunteer, volunteerLoading } = useIsMasjidVolunteer(id)

  useEffect(() => {
    let cancelled = false

    fetchMasjidById(id)
      .then((data) => {
        if (!cancelled) setMasjid(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchMasjidById(id)
      .then(setMasjid)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { masjid, loading, error, refetch, isVolunteer, volunteerLoading }
}
