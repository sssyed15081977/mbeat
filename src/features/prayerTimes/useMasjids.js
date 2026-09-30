import { useCallback, useEffect, useState } from 'react'
import { fetchMasjids } from './prayerTimesApi'

export function useMasjids() {
  const [masjids, setMasjids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchMasjids()
      .then((data) => {
        if (!cancelled) setMasjids(data)
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
  }, [])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchMasjids()
      .then(setMasjids)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { masjids, loading, error, refetch }
}
