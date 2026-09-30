import { useTranslation } from 'react-i18next'
import { PRAYERS } from './prayers'

// One time input per prayer, shared by the Add masjid form and the volunteer
// update screen. `values` maps prayer -> "HH:mm" ('' when not set);
// `onChange(prayer, value)` reports each edit. A blank prayer simply gets no
// row, so none of these inputs are required.
export function JamaatTimeFields({ values, onChange }) {
  const { t } = useTranslation()

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700 mb-1">{t('jamaatTimeFields.legend')}</legend>
      {PRAYERS.map((prayer) => (
        <div key={prayer} className="flex items-center justify-between gap-3">
          <label htmlFor={`jamaat_${prayer}`} className="text-base text-gray-800">
            {t(`prayer.${prayer}`)}
          </label>
          <input
            id={`jamaat_${prayer}`}
            type="time"
            value={values[prayer] || ''}
            onChange={(event) => onChange(prayer, event.target.value)}
            className="w-36 border rounded px-3 py-2"
          />
        </div>
      ))}
    </fieldset>
  )
}
