import { useTranslation } from 'react-i18next'
import { habitLabel, levelLabel } from './habitLabels'

// The last 7 days, oldest first (AC13): filled = done, empty = not done,
// no dot = the habit wasn't due that day (Jumu'ah, Dhuhr on Fridays). No
// number on screen; screen readers get the count.
function WeekDots({ dots }) {
  const { t } = useTranslation()
  const count = dots.filter(Boolean).length
  return (
    <span className="flex gap-1 mt-1.5">
      <span className="sr-only">{t('amal.lastSevenDays', { count })}</span>
      {dots.map((dot, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${dot === null ? '' : dot ? 'bg-brand' : 'bg-gray-200'}`}
        />
      ))}
    </span>
  )
}

function DoneMark({ done }) {
  return (
    <span
      aria-hidden="true"
      className={`flex-none flex items-center justify-center w-7 h-7 rounded-full ${
        done ? 'bg-brand text-white' : 'border-2 border-gray-300'
      }`}
    >
      {done && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </span>
  )
}

// Missed and Excused stay calm and differ from each other; nothing is red
// (principle 4, AC7). Not logged is the quietest.
function levelClass(level) {
  if (level == null) return 'text-gray-400'
  if (level === 'missed') return 'text-gray-700'
  if (level === 'excused') return 'text-gray-500 italic'
  return 'text-brand font-medium'
}

// One habit on the Amal tracker. A done habit toggles on tap (AC12); a
// prayer opens the level picker (AC6).
export function HabitRow({ habit, date, value, dots, onToggle, onOpenLevels }) {
  const { t } = useTranslation()
  const isLevels = habit.valueType === 'levels'

  return (
    <li>
      <button
        type="button"
        onClick={isLevels ? onOpenLevels : onToggle}
        aria-pressed={isLevels ? undefined : value === true}
        aria-haspopup={isLevels ? 'dialog' : undefined}
        className="w-full min-h-14 flex items-center gap-3 px-2 py-2 text-left rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-gray-900">{habitLabel(t, habit, date)}</span>
          {habit.rakahs && (
            <span className="block text-xs text-gray-500">{t('amal.rakahs', { count: habit.rakahs })}</span>
          )}
          <WeekDots dots={dots} />
        </span>
        {isLevels ? (
          <span className={`flex-none max-w-[50%] text-sm text-right ${levelClass(value)}`}>
            {value == null ? t('amal.notLogged') : levelLabel(t, habit, value)}
          </span>
        ) : (
          <DoneMark done={value === true} />
        )}
      </button>
    </li>
  )
}
