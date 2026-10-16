import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchIsMasjidVolunteer } from './prayerTimesApi'

// Whether the signed-in user volunteers for this masjid. Only decides what's
// shown (e.g. "Update times", AC10); RLS is what actually stops a
// non-volunteer saving. `id` may be null (no masjid), which means false.
export function useIsMasjidVolunteer(id) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  // Tagged with the user and masjid it was checked for, so it resets to
  // false on sign-out or when opening another masjid.
  const [volunteer, setVolunteer] = useState({ key: null, value: false })

  const volunteerKey = userId && id ? `${userId}:${id}` : null

  useEffect(() => {
    if (!volunteerKey) return
    let cancelled = false

    fetchIsMasjidVolunteer(userId, id)
      // If the check fails, treat them as not a volunteer.
      .catch(() => false)
      .then((value) => {
        if (!cancelled) setVolunteer({ key: volunteerKey, value })
      })

    return () => {
      cancelled = true
    }
  }, [volunteerKey, userId, id])

  const volunteerChecked = volunteerKey !== null && volunteer.key === volunteerKey
  const isVolunteer = volunteerChecked && volunteer.value
  // Guests are never volunteers, so there's nothing to wait for once the
  // session is restored.
  const volunteerLoading = authLoading || (volunteerKey !== null && !volunteerChecked)

  return { isVolunteer, volunteerLoading }
}
