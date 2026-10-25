import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { SheetOption } from '../../components/ui/SheetOption'
import { habitLabel, levelLabel } from './habitLabels'

// How a prayer was prayed (spec §4.2, AC6): one tap picks a level and closes;
// Clear goes back to "Not logged". Open while `habit` is set.
export function LevelPickerSheet({ habit, date, value, onPick, onClose }) {
  const { t } = useTranslation()

  function pick(level) {
    onPick(level)
    onClose()
  }

  return (
    <BottomSheet open={habit != null} onClose={onClose} title={habit ? habitLabel(t, habit, date) : ''}>
      {habit && (
        <>
          <ul>
            {habit.levels.map((level) => (
              <SheetOption
                key={level}
                label={levelLabel(t, habit, level)}
                selected={value === level}
                onPick={() => pick(level)}
              />
            ))}
          </ul>
          {value != null && (
            <button
              type="button"
              onClick={() => pick(null)}
              className="mt-2 w-full min-h-11 px-3 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50"
            >
              {t('amal.clear')}
            </button>
          )}
        </>
      )}
    </BottomSheet>
  )
}
