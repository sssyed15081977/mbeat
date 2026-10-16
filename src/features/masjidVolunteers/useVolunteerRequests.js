import { useCallback, useEffect, useState } from 'react'
import { decideVolunteerRequest, fetchVolunteerRequests } from './masjidVolunteersApi'

// A masjid's pending Volunteer requests, for its volunteers only (AC11).
// `enabled` is false for everyone else, so nothing is fetched for them.
export function useVolunteerRequests(entityId, enabled) {
  const [state, setState] = useState({ key: null, requests: [], error: false })
  const [reloads, setReloads] = useState(0)
  const key = enabled ? `${entityId}:${reloads}` : null

  useEffect(() => {
    if (!key) return
    let cancelled = false

    fetchVolunteerRequests(entityId)
      .then((requests) => {
        if (!cancelled) setState({ key, requests, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ key, requests: [], error: true })
      })

    return () => {
      cancelled = true
    }
  }, [key, entityId])

  const refetch = useCallback(() => setReloads((n) => n + 1), [])

  // Throws on failure; the caller shows the error and keeps the row. On
  // success (or "Already handled") the row disappears.
  const decide = useCallback(async (requestId, approve) => {
    await decideVolunteerRequest(requestId, approve)
    setState((prev) => ({ ...prev, requests: prev.requests.filter((r) => r.id !== requestId) }))
  }, [])

  const loaded = key !== null && state.key === key
  return {
    requests: loaded ? state.requests : [],
    loading: key !== null && !loaded,
    error: loaded && state.error,
    refetch,
    decide,
  }
}
