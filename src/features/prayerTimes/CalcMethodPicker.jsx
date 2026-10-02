import { useTranslation } from 'react-i18next'
import { CALC_METHODS } from './calcMethods'

// The five calculation methods, each with its explanation (spec
// prayer-begins.md AC10), shown in the Display settings sheet. Picking one
// applies it at once, with no save step.
export function CalcMethodPicker({ method, onChange }) {
  const { t } = useTranslation()

  return (
    <ul>
      {CALC_METHODS.map((value) => {
        const selected = value === method
        return (
          <li key={value}>
            <button
              type="button"
              onClick={() => onChange(value)}
              aria-current={selected ? 'true' : undefined}
              className={`w-full flex items-start gap-3 text-left px-3 py-3 rounded-lg ${
                selected ? 'bg-brand/10' : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex-1 min-w-0">
                <span className={`block font-medium ${selected ? 'text-brand' : 'text-gray-900'}`}>
                  {t(`calcMethod.${value}.name`)}
                </span>
                <span className="block text-sm text-gray-600">{t(`calcMethod.${value}.description`)}</span>
              </span>
              {selected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mt-0.5 text-brand flex-none" aria-hidden="true">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
