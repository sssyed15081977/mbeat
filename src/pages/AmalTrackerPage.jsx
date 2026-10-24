import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { Skeleton } from '../components/ui/Skeleton'
import { useAmalDay } from '../features/amalTracker/useAmalDay'
import { useAmalEntries } from '../features/amalTracker/useAmalEntries'
import { useHiddenHabits } from '../features/amalTracker/useHiddenHabits'
import { isAmalStorePersistent } from '../features/amalTracker/amalStore'
import { addDays } from '../features/amalTracker/amalDay'
import { HABIT_GROUPS, PRESET_HABITS, countsAsDone, isDue } from '../features/amalTracker/presetHabits'
import { HabitRow } from '../features/amalTracker/HabitRow'
import { LevelPickerSheet } from '../features/amalTracker/LevelPickerSheet'

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

function RowSkeleton() {
  return (
    <div className="py-3 px-2 space-y-2">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-2 w-16" />
    </div>
  )
}

// The 7 days ending on `date`, oldest first: true / false, or null when the
// habit wasn't due that day (AC13).
function weekDots(habit, date, entries) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(date, i - 6)
    return isDue(habit, day) ? countsAsDone(habit, entries[day]?.[habit.id]) : null
  })
}

// The Amals tab (spec amal-tracker.md §4.1), open to guests: everything is
// stored on this phone, so there's nothing to sign in for.
export default function AmalTrackerPage() {
  const { t } = useTranslation()
  const day = useAmalDay()
  const { entries, loading, error, retry, saveError, setValue } = useAmalEntries(day.today)
  const { hidden } = useHiddenHabits()
  const [persistent, setPersistent] = useState(true)
  const [pickerHabitId, setPickerHabitId] = useState(null)

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

  const entry = entries[day.date] ?? {}
  const pickerHabit = PRESET_HABITS.find((h) => h.id === pickerHabitId) ?? null
  const allHidden = hidden !== null && PRESET_HABITS.every((h) => hidden.has(h.id))
  const groups = HABIT_GROUPS.map((group) => ({
    group,
    habits: PRESET_HABITS.filter((h) => h.group === group && !hidden?.has(h.id) && isDue(h, day.date)),
  })).filter((g) => g.habits.length > 0)

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

      {saveError && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded px-3 py-2" role="alert">
          {t('amal.saveError')}
        </p>
      )}

      {(loading || hidden === null) && !error && (
        <div className="divide-y divide-gray-100">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      )}

      {error && (
        <div className="mt-8 text-center space-y-3" role="alert">
          <p className="text-gray-700">{t('amal.loadError')}</p>
          <button type="button" onClick={retry} className="border rounded px-4 py-2 font-medium hover:bg-gray-50">
            {t('common.retry')}
          </button>
        </div>
      )}

      {!loading && !error && allHidden && (
        <Link to="/amal/habits" className="block text-center text-brand font-medium py-6">
          {t('amal.allHidden')}
        </Link>
      )}

      {!loading &&
        !error &&
        hidden !== null &&
        groups.map(({ group, habits }) => (
          <section key={group}>
            <h2 className="px-2 text-sm font-semibold text-gray-500 uppercase">{t(`amal.group.${group}`)}</h2>
            {group === 'sunnah' && <p className="px-2 text-xs text-gray-500">{t('amal.sunnahCaption')}</p>}
            <ul className="mt-1">
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  date={day.date}
                  value={entry[habit.id]}
                  dots={weekDots(habit, day.date, entries)}
                  onToggle={() => setValue(day.date, habit.id, entry[habit.id] === true ? null : true)}
                  onOpenLevels={() => setPickerHabitId(habit.id)}
                />
              ))}
            </ul>
          </section>
        ))}

      <LevelPickerSheet
        habit={pickerHabit}
        date={day.date}
        value={pickerHabit ? entry[pickerHabit.id] : undefined}
        onPick={(level) => setValue(day.date, pickerHabit.id, level)}
        onClose={() => setPickerHabitId(null)}
      />

      {!allHidden && (
        <Link to="/amal/habits" className="flex items-center justify-center min-h-11 text-sm text-brand font-medium">
          {t('amal.manageHabits')}
        </Link>
      )}

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
