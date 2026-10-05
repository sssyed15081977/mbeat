import { useCallback, useEffect, useState } from 'react'
import { fetchMasjidNotices } from './masjidNoticeApi'

// A masjid's live notices for its Notice board section.
export function useMasjidNotices(entityId) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchMasjidNotices(entityId)
      .then((data) => {
        if (!cancelled) setNotices(data)
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
  }, [entityId])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchMasjidNotices(entityId)
      .then(setNotices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [entityId])

  return { notices, loading, error, refetch }
}
