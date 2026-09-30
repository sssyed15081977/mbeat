import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNextJamaat, formatJamaatTime } from './nextJamaat'
import { FreshnessLabel } from './FreshnessLabel'
import { PinButton } from './PinButton'

// One masjid on the Prayer Times tab: name, next jamaat, freshness (AC2).
// The pin sits beside the link, not inside it, so tapping it doesn't open
// the masjid.
export function MasjidListItem({ masjid, now, pinned, canPin, onTogglePin }) {
  const { t } = useTranslation()
  const next = getNextJamaat(masjid.prayer_times, now)

  return (
    <li className="flex items-center gap-2">
      <Link
        to={`/masjid/${masjid.id}`}
        className="flex-1 min-w-0 py-3 space-y-0.5 rounded hover:bg-gray-50 active:bg-gray-100"
      >
        <p className="font-semibold text-gray-900 truncate">{masjid.name}</p>
        {next ? (
          <p className="text-sm text-gray-600">
            {t('prayerTimes.nextJamaat')}:{' '}
            <span className="font-semibold text-brand">
              {t(`prayer.${next.prayer}`)} · {formatJamaatTime(next.jamaatTime)}
            </span>
            {next.isTomorrow && <> ({t('prayerTimes.tomorrow')})</>}
          </p>
        ) : (
          <p className="text-sm text-gray-500">{t('prayerTimes.noTimes')}</p>
        )}
        <FreshnessLabel timesConfirmedAt={masjid.times_confirmed_at} now={now} />
      </Link>

      <PinButton
        masjidName={masjid.name}
        pinned={pinned}
        canPin={canPin}
        onToggle={onTogglePin}
      />
    </li>
  )
}
