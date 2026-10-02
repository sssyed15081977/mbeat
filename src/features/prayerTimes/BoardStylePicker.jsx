import { useTranslation } from 'react-i18next'
import { BOARD_STYLES } from './useBoardStyle'

// A tiny picture of each board, so the choice reads at a glance.
const SWATCH = {
  painted: 'board-swatch-painted',
  digital: 'board-swatch-digital',
  wooden: 'board-swatch-wooden',
}

// Board style (spec jamaat-board.md AC23, AC28), shown in the Display
// settings sheet: a radio group of three labelled swatches, named by the
// heading `labelledBy` points at. Tapping one switches the board at once.
export function BoardStylePicker({ style, onChange, labelledBy }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-3 gap-2 px-3">
      {BOARD_STYLES.map((value) => {
        const checked = value === style
        return (
          <label
            key={value}
            className={`min-h-11 flex flex-col items-center gap-1 rounded-lg border p-1.5 cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${
              checked ? 'border-brand bg-brand/10' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="board-style"
              value={value}
              checked={checked}
              onChange={() => onChange(value)}
              data-autofocus={checked || undefined}
              className="sr-only"
            />
            <span className={`block w-full h-8 rounded ${SWATCH[value]}`} aria-hidden="true" />
            <span className={`text-xs text-center ${checked ? 'text-brand font-semibold' : 'text-gray-700'}`}>
              {t(`board.styles.${value}`)}
            </span>
          </label>
        )
      })}
    </div>
  )
}
