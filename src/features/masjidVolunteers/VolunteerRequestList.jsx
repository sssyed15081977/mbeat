import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatRelativeTime } from '../../lib/relativeTime'
import { isAlreadyHandled } from './masjidVolunteersApi'
import { VOLUNTEER_ANCHOR, useScrollToVolunteerAnchor } from './useVolunteerAnchor'

const BUTTON = 'flex-1 flex items-center justify-center rounded px-3 py-3 font-medium disabled:opacity-50'

function RequestRow({ request, busy, onApprove, onDecline }) {
  const { t, i18n } = useTranslation()
  const name = request.full_name || t('volunteers.someone')

  return (
    <li className="py-3 space-y-2">
      <div>
        <p className="font-medium text-gray-900">
          {name}
          {' · '}
          <time dateTime={request.created_at} className="text-sm font-normal text-gray-500">
            {formatRelativeTime(request.created_at, i18n.language)}
          </time>
        </p>
        {request.note && (
          <p dir="auto" className="text-sm text-gray-700 whitespace-pre-line">
            {request.note}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          aria-haspopup="dialog"
          className={`${BUTTON} bg-brand text-white font-semibold`}
        >
          {t('volunteers.approve')}
        </button>
        <button type="button" onClick={onDecline} disabled={busy} className={`${BUTTON} border hover:bg-gray-50`}>
          {t('volunteers.decline')}
        </button>
      </div>
    </li>
  )
}

// "Volunteer requests" on the masjid page, for that masjid's volunteers only
// (AC11–AC14). Hidden when there are none.
export function VolunteerRequestList({ requests, loading, error, refetch, decide }) {
  const { t } = useTranslation()
  const [busyId, setBusyId] = useState(null)
  const [confirming, setConfirming] = useState(null)
  // 'alreadyHandled' or 'decideError'
  const [message, setMessage] = useState(null)

  const visible = !loading && (error || requests.length > 0)
  useScrollToVolunteerAnchor(visible)

  async function handleDecide(request, approve) {
    setConfirming(null)
    setBusyId(request.id)
    setMessage(null)
    try {
      await decide(request.id, approve)
    } catch (err) {
      if (isAlreadyHandled(err)) {
        // Another volunteer got there first (AC13).
        setMessage('alreadyHandled')
        refetch()
      } else {
        setMessage('decideError')
      }
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!visible) {
    // "Already handled" can empty the list; still say why the row went.
    return message === 'alreadyHandled' ? (
      <p className="text-sm text-gray-600" role="status">
        {t('volunteers.alreadyHandled')}
      </p>
    ) : null
  }

  const confirmName = confirming ? confirming.full_name || t('volunteers.someone') : ''

  return (
    <section id={VOLUNTEER_ANCHOR} className="space-y-1">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">{t('volunteers.requestsHeading')}</h2>

      {error ? (
        <div className="space-y-2 py-2" role="alert">
          <p className="text-sm text-red-600">
            {navigator.onLine ? t('volunteers.loadError') : t('prayerTimes.offline')}
          </p>
          <button type="button" onClick={refetch} className="border rounded px-4 py-2 font-medium hover:bg-gray-50">
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              busy={busyId === request.id}
              onApprove={() => setConfirming(request)}
              onDecline={() => handleDecide(request, false)}
            />
          ))}
        </ul>
      )}

      {message && (
        <p className={`text-sm ${message === 'decideError' ? 'text-red-600' : 'text-gray-600'}`} role="alert">
          {t(`volunteers.${message}`)}
        </p>
      )}

      {/* Hands over posting rights that can't be removed in the app, so it asks once (AC12). */}
      <BottomSheet open={Boolean(confirming)} onClose={() => setConfirming(null)} title={t('volunteers.approve')}>
        <div className="space-y-3 px-2">
          <p className="text-sm text-gray-700">{t('volunteers.approveConfirm', { name: confirmName })}</p>
          <button
            type="button"
            onClick={() => handleDecide(confirming, true)}
            className="w-full bg-brand text-white rounded px-3 py-3 font-semibold"
          >
            {t('volunteers.approve')}
          </button>
          <button
            type="button"
            data-autofocus
            onClick={() => setConfirming(null)}
            className="w-full border rounded px-3 py-3 font-medium hover:bg-gray-50"
          >
            {t('volunteers.cancel')}
          </button>
        </div>
      </BottomSheet>
    </section>
  )
}
