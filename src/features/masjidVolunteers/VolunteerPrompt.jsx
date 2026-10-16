import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIsMasjidVolunteer } from '../prayerTimes/useIsMasjidVolunteer'
import { useMyVolunteerRequests } from './useMyVolunteerRequests'
import { VOLUNTEER_ANCHOR } from './useVolunteerAnchor'
import { dismissPrompt, isPromptDismissed } from './volunteerPromptDismissals'
import { needsVolunteers } from './volunteerTarget'

// One muted line below the Jamaat board on the Prayer Times tab, for the
// selected masjid (spec 4.3, AC15–AC17). It sits below the board, so it never
// pushes it down, and shows nothing until everything it needs has loaded.
export function VolunteerPrompt({ masjid, counts }) {
  const { t } = useTranslation()
  const { isVolunteer, volunteerLoading } = useIsMasjidVolunteer(masjid?.id ?? null)
  const { pendingIds, loading: requestsLoading } = useMyVolunteerRequests()
  // Dismissed during this visit; storage covers later visits.
  const [dismissedIds, setDismissedIds] = useState(() => new Set())

  if (!masjid || counts === null || volunteerLoading || requestsLoading) return null
  if (isVolunteer || pendingIds.has(masjid.id)) return null
  if (!needsVolunteers(counts.get(masjid.id) ?? 0)) return null
  if (dismissedIds.has(masjid.id) || isPromptDismissed(masjid.id)) return null

  function handleDismiss() {
    dismissPrompt(masjid.id)
    setDismissedIds((prev) => new Set(prev).add(masjid.id))
  }

  return (
    <div className="flex items-center gap-1 -my-2 text-sm text-gray-500">
      <Link
        to={`/masjid/${masjid.id}#${VOLUNTEER_ANCHOR}`}
        className="flex-1 min-w-0 py-3 underline-offset-2 hover:underline"
      >
        {t('volunteers.prompt', { masjid: masjid.name })} <span aria-hidden="true">→</span>
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('volunteers.dismissPrompt')}
        className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
