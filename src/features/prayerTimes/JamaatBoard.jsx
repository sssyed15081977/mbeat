import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalcMethod } from './useCalcMethod'
import { CalcMethodPicker } from './CalcMethodPicker'
import { buildBoard } from './boardRows'
import { PaintedBoard } from './JamaatBoard.painted'

// The two-column Begins + Jamaat board (spec jamaat-board.md), used on the
// Prayer Times tab (slim, `prayerTimes` null until a masjid is chosen) and on
// a masjid's page (full size, that masjid's times). Begins times need no
// network, so the board always renders, offline too.
export function JamaatBoard({ now, heading, prayerTimes = null, size = 'full' }) {
  const { t } = useTranslation()
  const headingId = useId()
  const [method, setMethod] = useCalcMethod()
  const { rows, jumuah, next } = buildBoard({ now, method, prayerTimes })

  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <PaintedBoard
        headingId={headingId}
        heading={heading}
        rows={rows}
        jumuah={jumuah}
        next={next}
        slim={size === 'slim'}
      />
      <div className="px-1 space-y-1">
        <p className="px-2 text-xs text-gray-500">{t('begins.note')}</p>
        <CalcMethodPicker method={method} onChange={setMethod} />
      </div>
    </section>
  )
}
