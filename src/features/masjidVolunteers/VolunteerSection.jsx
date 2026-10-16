import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { OfferToVolunteerSheet } from './OfferToVolunteerSheet'
import { useMyVolunteerRequests } from './useMyVolunteerRequests'
import { VOLUNTEER_ANCHOR, useScrollToVolunteerAnchor } from './useVolunteerAnchor'
import { needsVolunteers } from './volunteerTarget'

const BUTTON = 'flex w-full items-center justify-center bg-brand text-white rounded px-3 py-3 font-semibold'

// The masjid page's volunteer section for non-volunteers (spec 4.1,
// AC3–AC10). `counts` is null until loaded, and nothing shows until then or
// if it fails (AC24).
export function VolunteerSection({ masjid, counts, isVolunteer, volunteerLoading }) {
  const { t } = useTranslation()
  const location = useLocation()
  const { pendingIds, loading, markRequested, signedIn } = useMyVolunteerRequests()
  const [sheetOpen, setSheetOpen] = useState(false)

  const ready = counts !== null && !loading && !volunteerLoading && !isVolunteer
  const count = counts?.get(masjid.id) ?? 0
  const pending = pendingIds.has(masjid.id)
  // A pending request shows "Request sent" even once the masjid has enough
  // volunteers (4.1).
  const visible = ready && (pending || needsVolunteers(count))

  useScrollToVolunteerAnchor(visible)

  if (!visible) return null

  return (
    <section id={VOLUNTEER_ANCHOR} className="space-y-3 rounded-lg bg-gray-50 p-3">
      {pending ? (
        <p className="text-sm text-gray-700" role="status">
          {t('volunteers.requestSent')}
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            {t('volunteers.count', { count })} {t('volunteers.whatTheyDo')}
          </p>
          {signedIn ? (
            <button type="button" onClick={() => setSheetOpen(true)} aria-haspopup="dialog" className={BUTTON}>
              {t('volunteers.offer')}
            </button>
          ) : (
            // Guests sign in and come back here, like pinning (AC5).
            <Link to="/login" state={{ from: `${location.pathname}#${VOLUNTEER_ANCHOR}` }} className={BUTTON}>
              {t('volunteers.offer')}
            </Link>
          )}
        </>
      )}

      <OfferToVolunteerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        masjid={masjid}
        onSent={() => markRequested(masjid.id)}
      />
    </section>
  )
}
