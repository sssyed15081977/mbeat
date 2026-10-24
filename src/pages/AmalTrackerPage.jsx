import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { useAmalDay } from '../features/amalTracker/useAmalDay'
import { isAmalStorePersistent } from '../features/amalTracker/amalStore'

const NAV_BUTTON =
  'flex items-center justify-center w-11 h-11 rounded-full text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-brand'

function ChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  )
}

// "YYYY-MM-DD" -> "Friday, 23 October" in the UI language. timeZone is UTC
// because the Date only carries the calendar date (like MasjidNoticeDetail).
function formatAmalDate(date, language) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

// The date line (AC2): "Today" / "Yesterday" / weekday, with the full date
// under it. The date shows even on "Today": after midnight and before Fajr,
// today is still yesterday's date (AC5).
function DayNav({ date, daysBack, canGoBack, canGoForward, goBack, goForward }) {
  const { t, i18n } = useTranslation()
  const fullDate = formatAmalDate(date, i18n.language)
  const title = daysBack === 0 ? t('amal.today') : daysBack === 1 ? t('amal.yesterday') : fullDate

  return (
    <div className="flex items-center justify-between gap-2">
      <button type="button" onClick={goBack} disabled={!canGoBack} aria-label={t('amal.previousDay')} className={NAV_BUTTON}>
        <ChevronIcon direction="left" />
      </button>
      <div className="text-center" aria-live="polite">
        <h2 className="text-lg font-semibold">{title}</h2>
        {daysBack < 2 && <p className="text-sm text-gray-500">{fullDate}</p>}
      </div>
      <button type="button" onClick={goForward} disabled={!canGoForward} aria-label={t('amal.nextDay')} className={NAV_BUTTON}>
        <ChevronIcon direction="right" />
      </button>
    </div>
  )
}

// The Amals tab (spec amal-tracker.md §4.1), open to guests: everything is
// stored on this phone, so there's nothing to sign in for.
export default function AmalTrackerPage() {
  const { t } = useTranslation()
  const day = useAmalDay()
  const [persistent, setPersistent] = useState(true)

  // Opening the store also asks the browser to keep our data (AC16).
  useEffect(() => {
    let cancelled = false
    isAmalStorePersistent().then((value) => {
      if (!cancelled) setPersistent(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-brand">{t('amal.heading')}</h1>
        <LanguageToggle />
      </div>

      <DayNav {...day} />

      {/* Reflection, not scorekeeping (principle 5, AC3). */}
      <figure className="text-center text-sm text-gray-500">
        <blockquote>{t('amal.consistentHadith')}</blockquote>
        <figcaption className="text-xs mt-1">{t('amal.consistentHadithSource')}</figcaption>
      </figure>

      {!persistent && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded px-3 py-2" role="alert">
          {t('amal.notSaving')}
        </p>
      )}

      {/* Habit groups go here (T4–T5). */}

      {/* AC4: privacy note, expanded in place rather than on its own page. */}
      <details className="text-sm text-gray-500">
        <summary className="flex items-center justify-center gap-1 min-h-11 cursor-pointer">
          <span aria-hidden="true">🔒</span>
          {t('amal.savedOnPhone')}
        </summary>
        <p className="mt-1">{t('amal.savedOnPhoneDetail')}</p>
      </details>
    </div>
  )
}
