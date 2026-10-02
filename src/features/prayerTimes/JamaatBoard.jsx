import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalcMethod } from './useCalcMethod'
import { useBoardStyle } from './useBoardStyle'
import { DisplaySettingsSheet } from './DisplaySettingsSheet'
import { buildBoard } from './boardRows'
import { PaintedBoard } from './JamaatBoard.painted'
import { DigitalBoard } from './JamaatBoard.digital'
import { WoodenBoard } from './JamaatBoard.wooden'

const BOARDS = { painted: PaintedBoard, digital: DigitalBoard, wooden: WoodenBoard }

// Where the gear sits on each board (clear of the borders and the wooden
// frame) and its colour there.
const GEAR = {
  painted: 'top-3 right-3 text-board-painted-gold',
  digital: 'top-2.5 right-2.5 text-board-digital-amber',
  wooden: 'top-3 right-3 text-board-wooden-engraved',
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// The two-column Begins + Jamaat board (spec jamaat-board.md), used on the
// Prayer Times tab (`prayerTimes` null until a masjid is chosen) and on a
// masjid's page (that masjid's times), at the same compact size on both.
// Begins times need no network, so the board always renders, offline too.
//
// `heading` goes in the board's <h2>; `subheading` (optional) sits under it,
// for the tab's "Choose masjid" control, freshness and "Masjid page" link.
// Both are drawn in the board's own colours, so use `currentColor`.
//
// Each style draws the "Calculated times…" note and the method name inside
// the board (`note`, `methodText`). The gear opens Display settings (board
// style, calculation method). It
// lives here, not in each style, so it stays put when the style changes
// while the sheet is open, and focus has somewhere to return to.
export function JamaatBoard({ now, heading, subheading = null, prayerTimes = null }) {
  const { t } = useTranslation()
  const headingId = useId()
  const [method, setMethod] = useCalcMethod()
  const [style, setStyle] = useBoardStyle()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { rows, jumuah, next } = buildBoard({ now, method, prayerTimes })
  const Board = BOARDS[style]

  return (
    <section aria-labelledby={headingId}>
      <div className="relative">
        <Board
          headingId={headingId}
          heading={heading}
          subheading={subheading}
          rows={rows}
          jumuah={jumuah}
          next={next}
          now={now}
          methodText={t('begins.method', { name: t(`calcMethod.${method}.name`) })}
          note={t('begins.note')}
        />
        {/* 44px tap target around a 20px icon (AC28). */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-haspopup="dialog"
          aria-label={t('board.displaySettings')}
          className={`absolute w-11 h-11 -m-2.5 grid place-items-center rounded-full opacity-90 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current ${GEAR[style]}`}
        >
          <GearIcon />
        </button>
      </div>

      <DisplaySettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        style={style}
        onStyleChange={setStyle}
        method={method}
        onMethodChange={setMethod}
      />
    </section>
  )
}
