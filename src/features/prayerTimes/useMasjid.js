import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchMasjidById, fetchIsMasjidVolunteer } from './prayerTimesApi'

// One masjid for the detail page. `masjid` is null when it doesn't exist or
// isn't published. `isVolunteer` only decides whether "Update times" shows
// (AC10); RLS is what actually stops a non-volunteer saving.
export function useMasjid(id) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [masjid, setMasjid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Tagged with the user and masjid it was checked for, so it resets to
  // false on sign-out or when opening another masjid.
  const [volunteer, setVolunteer] = useState({ key: null, value: false })

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

  const volunteerKey = userId ? `${userId}:${id}` : null

  useEffect(() => {
    if (!volunteerKey) return
    let cancelled = false

    fetchIsMasjidVolunteer(userId, id)
      // If the check fails, just don't show the button.
      .catch(() => false)
      .then((value) => {
        if (!cancelled) setVolunteer({ key: volunteerKey, value })
      })

    return () => {
      cancelled = true
    }
  }, [volunteerKey, userId, id])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchMasjidById(id)
      .then(setMasjid)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const volunteerChecked = volunteerKey !== null && volunteer.key === volunteerKey
  const isVolunteer = volunteerChecked && volunteer.value
  // Guests are never volunteers, so there's nothing to wait for.
  const volunteerLoading = volunteerKey !== null && !volunteerChecked

  return { masjid, loading, error, refetch, isVolunteer, volunteerLoading }
}
