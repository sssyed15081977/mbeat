import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchMyPendingRequestIds } from './masjidVolunteersApi'

const NONE = new Set()

// The masjids the signed-in user has a pending Volunteer request for (AC7,
// AC16). Tagged with the user it was loaded for, like useSavedMasjids, so a
// guest or another account never sees someone else's requests.
export function useMyVolunteerRequests() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [requests, setRequests] = useState({ userId: null, ids: NONE })

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    fetchMyPendingRequestIds(userId)
      // If this can't load, the offer shows; sending again is refused by the
      // database (AC8) and the error says so.
      .catch(() => NONE)
      .then((ids) => {
        if (!cancelled) setRequests({ userId, ids })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // After a request is sent, show "Request sent" straight away (AC7).
  const markRequested = useCallback((entityId) => {
    setRequests((prev) => ({ ...prev, ids: new Set(prev.ids).add(entityId) }))
  }, [])

  const pendingIds = userId && requests.userId === userId ? requests.ids : NONE
  const loading = authLoading || (Boolean(userId) && requests.userId !== userId)

  return { pendingIds, loading, markRequested, signedIn: Boolean(userId) }
}
