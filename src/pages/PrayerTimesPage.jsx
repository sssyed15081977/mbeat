import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { Skeleton } from '../components/ui/Skeleton'
import { useMasjids } from '../features/prayerTimes/useMasjids'
import { useSavedMasjids } from '../features/prayerTimes/useSavedMasjids'
import { useSelectedMasjid } from '../features/prayerTimes/useSelectedMasjid'
import { useNow } from '../features/prayerTimes/useNow'
import { MasjidListItem } from '../features/prayerTimes/MasjidListItem'
import { JamaatBoard } from '../features/prayerTimes/JamaatBoard'
import { ChooseMasjidSheet } from '../features/prayerTimes/ChooseMasjidSheet'
import { FreshnessLabel } from '../features/prayerTimes/FreshnessLabel'

// Controls drawn on the board use its colours (currentColor) and a visible
// focus ring in the same colour. Padding keeps the tap target 44px tall
// without making the board taller (AC28, AC31).
const ON_BOARD_CONTROL =
  'inline-flex items-center gap-1 rounded px-2 py-2 -my-2 underline-offset-2 focus-visible:outline-2 focus-visible:outline-current'

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

// The tab board's heading (spec jamaat-board.md AC10, AC12): "Melapalayam" +
// "Choose masjid", or the chosen masjid's name (tap to change), its
// freshness and a link to its page.
function boardHeading({ t, masjid, now, onChoose }) {
  if (!masjid) {
    return {
      heading: t('board.melapalayam'),
      subheading: (
        <button type="button" onClick={onChoose} aria-haspopup="dialog" className={`${ON_BOARD_CONTROL} underline`}>
          {t('board.chooseMasjid')}
          <Chevron />
        </button>
      ),
    }
  }

  return {
    heading: (
      <button
        type="button"
        onClick={onChoose}
        aria-haspopup="dialog"
        aria-label={`${masjid.name}, ${t('board.chooseMasjid')}`}
        className={`${ON_BOARD_CONTROL} max-w-full`}
      >
        <span className="truncate">{masjid.name}</span>
        <Chevron />
      </button>
    ),
    subheading: (
      <div className="flex flex-wrap items-center justify-center gap-x-2">
        <FreshnessLabel timesConfirmedAt={masjid.times_confirmed_at} now={now} onBoard />
        <Link to={`/masjid/${masjid.id}`} className={`${ON_BOARD_CONTROL} underline`}>
          {t('board.masjidPage')}
        </Link>
      </div>
    ),
  }
}

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

  const { masjid: selected, select } = useSelectedMasjid(masjids, !masjidsLoading && !error)
  const [sheetOpen, setSheetOpen] = useState(false)

  const loading = masjidsLoading || pinsLoading
  const myMasjids = masjids.filter((m) => savedIds.has(m.id))
  const otherMasjids = masjids.filter((m) => !savedIds.has(m.id))
  const { heading, subheading } = boardHeading({ t, masjid: selected, now, onChoose: () => setSheetOpen(true) })

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
          Jamaat column stays blank until a masjid is chosen and the list has
          loaded; the list below handles its own errors (jamaat-board.md AC15). */}
      <JamaatBoard
        now={now}
        heading={heading}
        subheading={subheading}
        prayerTimes={selected?.prayer_times ?? null}
      />
      <ChooseMasjidSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        myMasjids={myMasjids}
        otherMasjids={otherMasjids}
        selectedId={selected?.id ?? null}
        onSelect={select}
      />

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
