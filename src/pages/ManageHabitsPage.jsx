import { useTranslation } from 'react-i18next'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { useHiddenHabits } from '../features/amalTracker/useHiddenHabits'
import { HABIT_GROUPS, PRESET_HABITS } from '../features/amalTracker/presetHabits'
import { habitLabel } from '../features/amalTracker/habitLabels'

function HabitSwitch({ label, shown, onToggle }) {
  return (
    <li>
      <button
        type="button"
        role="switch"
        aria-checked={shown}
        onClick={onToggle}
        className="w-full min-h-12 flex items-center justify-between gap-3 px-2 py-2 text-left rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="text-gray-900">{label}</span>
        <span
          aria-hidden="true"
          className={`relative flex-none w-11 h-6 rounded-full transition-colors motion-reduce:transition-none ${shown ? 'bg-brand' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${shown ? 'translate-x-5' : ''}`}
          />
        </span>
      </button>
    </li>
  )
}

// Manage habits (spec amal-tracker.md §4.3, AC14): show or hide each preset.
// Hiding keeps the habit's past entries.
export default function ManageHabitsPage() {
  const { t } = useTranslation()
  const { hidden, toggle } = useHiddenHabits()

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <BackButton to="/amal" />
        <h1 className="text-xl font-bold text-brand">{t('amal.manageHabits')}</h1>
      </div>
      <p className="text-sm text-gray-500">{t('amal.manageHabitsHint')}</p>

      {hidden === null ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : (
        HABIT_GROUPS.map((group) => (
          <section key={group}>
            <h2 className="px-2 text-sm font-semibold text-gray-500 uppercase">{t(`amal.group.${group}`)}</h2>
            <ul className="mt-1">
              {PRESET_HABITS.filter((h) => h.group === group).map((habit) => (
                <HabitSwitch
                  key={habit.id}
                  label={habitLabel(t, habit)}
                  shown={!hidden.has(habit.id)}
                  onToggle={() => toggle(habit.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
