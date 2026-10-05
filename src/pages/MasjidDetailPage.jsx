import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { useMasjid } from '../features/prayerTimes/useMasjid'
import { useSavedMasjids } from '../features/prayerTimes/useSavedMasjids'
import { useNow } from '../features/prayerTimes/useNow'
import { PRAYERS } from '../features/prayerTimes/prayers'
import { JamaatBoard } from '../features/prayerTimes/JamaatBoard'
import { FreshnessLabel } from '../features/prayerTimes/FreshnessLabel'
import { PinButton } from '../features/prayerTimes/PinButton'
import { NoticeBoard, NOTICE_BOARD_ANCHOR } from '../features/masjidNotice/NoticeBoard'

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="space-y-3">
        {PRAYERS.slice(0, 5).map((prayer) => (
          <Skeleton key={prayer} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}

// Open to guests (AC24). Pinning asks guests to sign in; "Update times" is
// only shown to the masjid's volunteers (AC10).
export default function MasjidDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const now = useNow()
  const { masjid, loading: masjidLoading, error, refetch, isVolunteer } = useMasjid(id)
  const { savedIds, loading: pinsLoading, togglePin, pinError, canPin } = useSavedMasjids()

  const loading = masjidLoading || pinsLoading
  const location = useLocation()
  const showPage = !loading && !error && Boolean(masjid)

  // "Notice board →" links here with #notices (AC8). React Router doesn't
  // scroll to hashes, so do it once the section is on the page.
  useEffect(() => {
    if (showPage && location.hash === `#${NOTICE_BOARD_ANCHOR}`) {
      document.getElementById(NOTICE_BOARD_ANCHOR)?.scrollIntoView()
    }
  }, [showPage, location.hash])

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to="/" />

      {loading && <DetailSkeleton />}

      {!loading && error && (
        <div className="mt-8 text-center space-y-3" role="alert">
          <p className="text-red-600">
            {navigator.onLine ? t('prayerTimes.loadError') : t('prayerTimes.offline')}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!loading && !error && !masjid && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-500">{t('masjidDetail.notAvailable')}</p>
          <Link to="/" className="inline-block text-brand font-medium">
            {t('masjidDetail.backToList')}
          </Link>
        </div>
      )}

      {!loading && !error && masjid && (
        <>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-xl font-bold text-gray-900">{masjid.name}</h1>
              {masjid.address && <p className="text-sm text-gray-600">{masjid.address}</p>}
              <FreshnessLabel timesConfirmedAt={masjid.times_confirmed_at} now={now} />
            </div>
            <PinButton
              masjidName={masjid.name}
              pinned={savedIds.has(masjid.id)}
              canPin={canPin}
              onToggle={() => togglePin(masjid.id)}
            />
          </div>

          {pinError && (
            <p className="text-sm text-red-600" role="alert">
              {t('prayerTimes.pinError')}
            </p>
          )}

          {/* Missing prayers show "—" on the board (jamaat-board.md AC3). */}
          <JamaatBoard now={now} heading={masjid.name} prayerTimes={masjid.prayer_times} />
          {!masjid.prayer_times.length && (
            <p className="text-sm text-gray-500">{t('prayerTimes.noTimes')}</p>
          )}

          <NoticeBoard masjidId={masjid.id} />

          {/* Last on the page, within thumb reach (4.2; masjid-notices.md AC1). */}
          {isVolunteer && (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/masjid/${masjid.id}/update`}
                className="flex items-center justify-center text-center bg-brand text-white rounded px-3 py-3 font-semibold"
              >
                {t('masjidDetail.updateTimes')}
              </Link>
              <Link
                to={`/masjid/${masjid.id}/notice/new`}
                className="flex items-center justify-center text-center bg-brand text-white rounded px-3 py-3 font-semibold"
              >
                {t('masjidNotice.addNotice')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
