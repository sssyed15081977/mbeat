import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { shareLink } from '../../lib/share'
import { VOLUNTEER_ANCHOR } from './useVolunteerAnchor'
import { needsVolunteers } from './volunteerTarget'

// On Update times, for the masjid's volunteers (spec 4.4, AC18–AC21): ask
// the only volunteer to invite someone, and link to waiting requests. One or
// two short lines each, so the form below stays in reach. Shows nothing until
// loaded or if loading fails.
export function VolunteerInvite({ masjid, counts, pendingCount }) {
  const { t } = useTranslation()
  const pageUrl = `${window.location.origin}/masjid/${masjid.id}#${VOLUNTEER_ANCHOR}`
  const showInvite = counts !== null && needsVolunteers(counts.get(masjid.id) ?? 0)

  if (!showInvite && !pendingCount) return null

  function handleInvite() {
    shareLink({ title: masjid.name, text: t('volunteers.inviteText', { masjid: masjid.name }), url: pageUrl })
  }

  return (
    <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
      {showInvite && (
        <div className="flex items-center gap-3">
          <p className="flex-1 text-gray-700">{t('volunteers.onlyVolunteer')}</p>
          <button
            type="button"
            onClick={handleInvite}
            className="shrink-0 min-h-11 border bg-white rounded px-4 font-medium hover:bg-gray-50"
          >
            {t('volunteers.invite')}
          </button>
        </div>
      )}
      {pendingCount > 0 && (
        <Link to={`/masjid/${masjid.id}#${VOLUNTEER_ANCHOR}`} className="block py-2 font-medium text-brand">
          {t('volunteers.waiting', { count: pendingCount })} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}
