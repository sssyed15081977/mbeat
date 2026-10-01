import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { Skeleton } from '../components/ui/Skeleton'
import { useMasjids } from '../features/prayerTimes/useMasjids'
import { useSavedMasjids } from '../features/prayerTimes/useSavedMasjids'
import { useNow } from '../features/prayerTimes/useNow'
import { MasjidListItem } from '../features/prayerTimes/MasjidListItem'
import { JamaatBoard } from '../features/prayerTimes/JamaatBoard'

function MasjidRowSkeleton() {
  return (
    <div className="py-3 space-y-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

// Guests are sent to sign in by /masjid/new's ProtectedRoute and come back
// to the form afterwards (AC26).
function AddMasjidButton() {
  const { t } = useTranslation()
  return (
    <Link
      to="/masjid/new"
      className="block w-full text-center border rounded px-4 py-3 font-medium hover:bg-gray-50"
    >
      {t('prayerTimes.addMasjid')}
    </Link>
  )
}

// The app's landing page (AC23), open to guests (AC24).
export default function PrayerTimesPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const now = useNow()
  const { masjids, loading: masjidsLoading, error, refetch } = useMasjids()
  const { savedIds, loading: pinsLoading, togglePin, pinError, canPin } = useSavedMasjids()

  const loading = masjidsLoading || pinsLoading
  const myMasjids = masjids.filter((m) => savedIds.has(m.id))
  const otherMasjids = masjids.filter((m) => !savedIds.has(m.id))

  function renderItem(masjid) {
    return (
      <MasjidListItem
        key={masjid.id}
        masjid={masjid}
        now={now}
        pinned={savedIds.has(masjid.id)}
        canPin={canPin}
        onTogglePin={() => togglePin(masjid.id)}
      />
    )
  }

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-brand">{t('prayerTimes.heading')}</h1>
        <LanguageToggle />
      </div>

      {/* Outside the loading/error branches: Begins needs no network. The
          Jamaat column stays blank until a masjid is chosen (jamaat-board.md T4). */}
      <JamaatBoard now={now} heading={t('board.melapalayam')} size="slim" />

      {loading && (
        <div className="divide-y divide-gray-100">
          <MasjidRowSkeleton />
          <MasjidRowSkeleton />
          <MasjidRowSkeleton />
        </div>
      )}

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

      {!loading && !error && masjids.length === 0 && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-500">{t('prayerTimes.empty')}</p>
          <AddMasjidButton />
        </div>
      )}

      {!loading && !error && masjids.length > 0 && (
        <>
          {pinError && (
            <p className="text-sm text-red-600" role="alert">
              {t('prayerTimes.pinError')}
            </p>
          )}

          {canPin && myMasjids.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase">
                {t('prayerTimes.myMasjids')}
              </h2>
              <ul className="divide-y divide-gray-100">{myMasjids.map(renderItem)}</ul>
            </section>
          )}

          {/* Empty "My masjids": a one-line hint above the list (4.1). */}
          {canPin && myMasjids.length === 0 && (
            <p className="text-sm text-gray-500">{t('prayerTimes.pinHint')}</p>
          )}
          {!canPin && (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="block text-sm text-brand font-medium"
            >
              {t('prayerTimes.signInToPin')}
            </Link>
          )}

          {otherMasjids.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase">
                {t('prayerTimes.allMasjids')}
              </h2>
              <ul className="divide-y divide-gray-100">{otherMasjids.map(renderItem)}</ul>
            </section>
          )}

          <AddMasjidButton />
        </>
      )}
    </div>
  )
}
