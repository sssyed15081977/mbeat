import { useTranslation } from 'react-i18next'
import { BISMILLAH, cellText, nextLabel, prayerLabelKey, shortNextLabel } from './boardRows'
import './JamaatBoard.wooden.css'

// "5:10 AM" with a small AM/PM, as on the painted board.
function Time({ value }) {
  const text = cellText(value)
  const match = text.match(/^(.*) (AM|PM)$/)
  if (!match) return text
  return (
    <>
      {match[1]}
      {/* A real space (not margin), so screen readers say "5:10 AM". */}
      <span className="text-[0.6em]"> {match[2]}</span>
    </>
  )
}

// One brass plate per row. A real <table> can't round or outline its rows,
// so this is a grid with table roles; screen readers still hear "Fajr,
// begins 4:52 AM, jamaat 5:10 AM" (AC27).
function Plate({ row, next, className = '' }) {
  const { t } = useTranslation()
  const isNext = next.prayer === row.prayer
  const time = 'text-right whitespace-nowrap tabular-nums font-board-wooden font-bold text-sm'

  return (
    <div
      role="row"
      aria-current={isNext ? 'true' : undefined}
      className={`brass wood-grid items-center px-5 py-0.5 leading-tight ${isNext ? 'is-next' : ''} ${className}`}
    >
      <span role="rowheader" className="min-w-0">
        <span className="font-board-wooden font-bold text-sm">{t(prayerLabelKey(row.prayer))}</span>
        {isNext && (
          <>
            <span className="tag ml-1" aria-hidden="true">{shortNextLabel(t, next)}</span>
            <span className="sr-only">, {nextLabel(t, next)}</span>
          </>
        )}
      </span>
      <span role="cell" className={time}>
        <Time value={row.begins} />
      </span>
      <span role="cell" className={time}>
        <Time value={row.jamaat} />
      </span>
    </div>
  )
}

// Wooden plaque (AC21): wood-grain frame, a brass name plate and one brass
// plate per row; the highlighted row gets a green tag and outline. One
// compact size on both screens (AC31).
export function WoodenBoard({ headingId, heading, subheading, rows, jumuah, next }) {
  const { t } = useTranslation()

  return (
    <div className="board-wooden px-4 pt-4 pb-4 space-y-1">
      <p lang="ar" dir="rtl" className="font-bismillah text-center engraved text-base leading-snug">
        {BISMILLAH}
      </p>
      <div className="brass text-center px-6 py-1">
        <h2 id={headingId} className="font-board-wooden font-bold leading-tight text-base">
          {heading}
        </h2>
        {subheading && <div className="text-xs">{subheading}</div>}
      </div>

      <div role="table" aria-labelledby={headingId} className="space-y-0.5">
        <div role="row" className="wood-grid engraved text-xs uppercase tracking-widest font-board-wooden px-5">
          {/* The grid cell stays in place; only its text is visually hidden. */}
          <span role="columnheader">
            <span className="sr-only">{t('board.prayer')}</span>
          </span>
          <span role="columnheader" className="text-right">{t('begins.column')}</span>
          <span role="columnheader" className="text-right">{t('board.jamaat')}</span>
        </div>
        {rows.map((row) => (
          <Plate key={row.prayer} row={row} next={next} />
        ))}
        {/* No wrapper here: rows must sit directly in the table for screen readers. */}
        {jumuah && <Plate row={jumuah} next={next} className="mt-1.5" />}
      </div>
    </div>
  )
}
