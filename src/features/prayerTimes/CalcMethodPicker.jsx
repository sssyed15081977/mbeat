import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { CALC_METHODS } from './calcMethods'

// "Method: Karachi" under the Begins times; tapping it opens a sheet of the
// five methods (spec prayer-begins.md AC9–AC10). Picking one applies it and
// closes the sheet, with no save step.
export function CalcMethodPicker({ method, onChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function pick(next) {
    onChange(next)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex items-center gap-1 px-2 py-2 -my-1 rounded text-sm text-gray-700 hover:bg-gray-100"
      >
        {t('begins.method', { name: t(`calcMethod.${method}.name`) })}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t('begins.methodHeading')}>
        <ul>
          {CALC_METHODS.map((value) => {
            const selected = value === method
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => pick(value)}
                  aria-current={selected ? 'true' : undefined}
                  data-autofocus={selected || undefined}
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
      </BottomSheet>
    </>
  )
}
