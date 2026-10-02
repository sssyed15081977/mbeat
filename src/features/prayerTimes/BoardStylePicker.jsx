import { useTranslation } from 'react-i18next'
import { BOARD_STYLES } from './useBoardStyle'

// A tiny picture of each board, so the choice reads at a glance.
const SWATCH = {
  painted: 'board-swatch-painted',
  digital: 'board-swatch-digital',
  wooden: 'board-swatch-wooden',
}

// "Board style" beside the Method control (spec jamaat-board.md AC23, AC28):
// a radio group of three labelled swatches. Tapping one switches at once.
// The group's name is for screen readers only, so the row stays one line
// tall and the tab's masjid list stays on the first screen (AC31).
export function BoardStylePicker({ style, onChange }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('board.style')} className="flex gap-0.5">
      {BOARD_STYLES.map((value) => {
        const checked = value === style
        return (
          <label
            key={value}
            className={`w-14 min-h-11 flex flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-1 cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${
              checked ? 'border-brand bg-brand/10' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="board-style"
              value={value}
              checked={checked}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            <span className={`block w-full h-4 rounded-sm ${SWATCH[value]}`} aria-hidden="true" />
            <span className={`text-[0.6rem] leading-tight text-center ${checked ? 'text-brand font-semibold' : 'text-gray-700'}`}>
              {t(`board.styles.${value}`)}
            </span>
          </label>
        )
      })}
    </div>
  )
}
