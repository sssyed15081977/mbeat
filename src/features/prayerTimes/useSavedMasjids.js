import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchSavedEntityIds, saveEntity, unsaveEntity } from './prayerTimesApi'

const NO_PINS = new Set()

// The user's pinned masjids ("My masjids"). Guests have none and can't pin.
export function useSavedMasjids() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  // Tagged with the user they were loaded for, so a guest or a newly
  // signed-in user never sees someone else's pins, and "loading" is simply
  // "not loaded for this user yet".
  const [pins, setPins] = useState({ userId: null, ids: NO_PINS })
  const [pinError, setPinError] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    fetchSavedEntityIds(userId)
      // If pins can't load, the list still shows, just without "My masjids".
      .catch(() => NO_PINS)
      .then((ids) => {
        if (!cancelled) setPins({ userId, ids })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const savedIds = userId && pins.userId === userId ? pins.ids : NO_PINS
  // authLoading: don't show the guest view while the session is being restored.
  const loading = authLoading || (Boolean(userId) && pins.userId !== userId)

  // Optimistic (AC8): the pin flips at once, and flips back if the write fails.
  const togglePin = useCallback(
    async (entityId) => {
      if (!userId) return
      const wasPinned = savedIds.has(entityId)

      const setPinned = (pinned) =>
        setPins((prev) => {
          const ids = new Set(prev.ids)
          if (pinned) ids.add(entityId)
          else ids.delete(entityId)
          return { ...prev, ids }
        })

      setPinError(false)
      setPinned(!wasPinned)

      try {
        if (wasPinned) await unsaveEntity(userId, entityId)
        else await saveEntity(userId, entityId)
      } catch {
        setPinned(wasPinned)
        setPinError(true)
      }
    },
    [userId, savedIds],
  )

  return { savedIds, loading, togglePin, pinError, canPin: Boolean(userId) }
}
