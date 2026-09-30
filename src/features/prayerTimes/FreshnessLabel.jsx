import { useTranslation } from 'react-i18next'
import { getFreshness } from './freshness'

// "Confirmed today / yesterday / N days ago", or "Not yet confirmed" (AC6).
// Past STALE_AFTER_DAYS it adds the out-of-date warning (AC7).
export function FreshnessLabel({ timesConfirmedAt, now }) {
  const { t } = useTranslation()
  const { daysAgo, isStale } = getFreshness(timesConfirmedAt, now)

  let text
  if (daysAgo === null) text = t('prayerTimes.freshness.notConfirmed')
  else if (daysAgo === 0) text = t('prayerTimes.freshness.today')
  else if (daysAgo === 1) text = t('prayerTimes.freshness.yesterday')
  else text = t('prayerTimes.freshness.daysAgo', { count: daysAgo })

  if (!isStale) return <p className="text-xs text-gray-500">{text}</p>

  return (
    <p className="text-xs text-amber-700">
      <span aria-hidden="true">⚠ </span>
      {text} · {t('prayerTimes.freshness.stale')}
    </p>
  )
}
