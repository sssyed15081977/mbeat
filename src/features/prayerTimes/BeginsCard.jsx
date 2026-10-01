import { useTranslation } from 'react-i18next'
import { getBeginsTimes, getNextBegins } from './beginsTimes'
import { formatJamaatTime } from './nextJamaat'
import { useCalcMethod } from './useCalcMethod'
import { CalcMethodPicker } from './CalcMethodPicker'

// Sunrise isn't a prayer, so its label lives outside `prayer.*`.
function labelKey(prayer) {
  return prayer === 'sunrise' ? 'begins.sunrise' : `prayer.${prayer}`
}

// "Today in Melapalayam": calculated Begins times for the town, above the
// masjid list (spec prayer-begins.md 4.1). Nothing is fetched, so there is no
// loading or error state and it works offline (AC8).
export function BeginsCard({ now }) {
  const { t } = useTranslation()
  const [method, setMethod] = useCalcMethod()

  const rows = getBeginsTimes(now, method)
  const next = getNextBegins(now, method)

  return (
    <section aria-labelledby="begins-heading" className="rounded-lg bg-gray-50 p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-2 px-2">
        <h2 id="begins-heading" className="font-semibold text-gray-900">
          {t('begins.heading')}
        </h2>
        <span className="text-xs font-semibold text-gray-500 uppercase">{t('begins.column')}</span>
      </div>

      <ul>
        {rows.map(({ prayer, time }) => {
          const isNext = next.prayer === prayer
          // After Isha the highlight is tomorrow's Fajr, so show its time (AC4).
          const shownTime = isNext ? next.time : time
          return (
            <li
              key={prayer}
              aria-current={isNext ? 'true' : undefined}
              className={`flex items-center justify-between gap-2 px-2 py-2 rounded ${
                isNext ? 'bg-brand/10 font-semibold text-brand' : 'text-gray-900'
              }`}
            >
              <span>
                {t(labelKey(prayer))}
                {isNext && (
                  <span className="ml-2 text-xs font-normal">
                    {t('begins.next')}
                    {next.isTomorrow && <> ({t('prayerTimes.tomorrow')})</>}
                  </span>
                )}
              </span>
              <span className="tabular-nums">{formatJamaatTime(shownTime)}</span>
            </li>
          )
        })}
      </ul>

      <p className="px-2 text-xs text-gray-500">{t('begins.note')}</p>
      <CalcMethodPicker method={method} onChange={setMethod} />
    </section>
  )
}
