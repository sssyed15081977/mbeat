import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalcMethod } from './useCalcMethod'
import { useBoardStyle } from './useBoardStyle'
import { CalcMethodPicker } from './CalcMethodPicker'
import { BoardStylePicker } from './BoardStylePicker'
import { buildBoard } from './boardRows'
import { PaintedBoard } from './JamaatBoard.painted'
import { DigitalBoard } from './JamaatBoard.digital'
import { WoodenBoard } from './JamaatBoard.wooden'

const BOARDS = { painted: PaintedBoard, digital: DigitalBoard, wooden: WoodenBoard }

// The two-column Begins + Jamaat board (spec jamaat-board.md), used on the
// Prayer Times tab (`prayerTimes` null until a masjid is chosen) and on a
// masjid's page (that masjid's times), at the same compact size on both.
// Begins times need no network, so the board always renders, offline too.
//
// `heading` goes in the board's <h2>; `subheading` (optional) sits under it,
// for the tab's "Choose masjid" control, freshness and "Masjid page" link.
// Both are drawn in the board's own colours, so use `currentColor`.
export function JamaatBoard({ now, heading, subheading = null, prayerTimes = null }) {
  const { t } = useTranslation()
  const headingId = useId()
  const [method, setMethod] = useCalcMethod()
  const [style, setStyle] = useBoardStyle()
  const { rows, jumuah, next } = buildBoard({ now, method, prayerTimes })
  const Board = BOARDS[style]

  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <Board
        headingId={headingId}
        heading={heading}
        subheading={subheading}
        rows={rows}
        jumuah={jumuah}
        next={next}
        now={now}
      />
      <div className="px-1 space-y-1">
        <p className="px-2 text-xs text-gray-500">{t('begins.note')}</p>
        {/* One row where it fits, so the tab's list stays on the first screen (AC31). */}
        <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-1">
          <CalcMethodPicker method={method} onChange={setMethod} />
          <BoardStylePicker style={style} onChange={setStyle} />
        </div>
      </div>
    </section>
  )
}
