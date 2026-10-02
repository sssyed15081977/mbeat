import { useTranslation } from 'react-i18next'
import { BISMILLAH, cellText, nextLabel, prayerLabelKey } from './boardRows'
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
function Plate({ row, next, slim, className = '' }) {
  const { t } = useTranslation()
  const isNext = next.prayer === row.prayer
  const time = `text-right whitespace-nowrap tabular-nums font-board-wooden font-bold ${slim ? 'text-sm' : 'text-base'}`

  return (
    <div
      role="row"
      aria-current={isNext ? 'true' : undefined}
      className={`brass wood-grid items-center ${slim ? 'px-5 py-0.5 leading-tight' : 'px-6 py-2'} ${isNext ? 'is-next' : ''} ${className}`}
    >
      <span role="rowheader" className="min-w-0">
        <span className={`block font-board-wooden font-bold ${slim ? 'text-sm' : 'text-base'}`}>
          {t(prayerLabelKey(row.prayer))}
        </span>
        {isNext && <span className="tag">{nextLabel(t, next)}</span>}
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
// plate per row; the highlighted row gets a green tag and outline.
export function WoodenBoard({ headingId, heading, subheading, rows, jumuah, next, slim }) {
  const { t } = useTranslation()

  return (
    <div className={`board-wooden ${slim ? 'board-wooden--slim px-4 pt-4 pb-4 space-y-1' : 'px-5 pt-7 pb-6 space-y-2.5'}`}>
      <p lang="ar" dir="rtl" className={`font-bismillah text-center engraved ${slim ? 'text-base leading-snug' : 'text-2xl leading-relaxed'}`}>
        {BISMILLAH}
      </p>
      <div className={`brass text-center ${slim ? 'px-6 py-1' : 'px-7 py-2'}`}>
        <h2 id={headingId} className={`font-board-wooden font-bold leading-tight ${slim ? 'text-base' : 'text-lg'}`}>
          {heading}
        </h2>
        {subheading && <div className="text-xs">{subheading}</div>}
      </div>

      <div role="table" aria-labelledby={headingId} className={slim ? 'space-y-0.5' : 'space-y-2'}>
        <div role="row" className={`wood-grid engraved text-xs uppercase tracking-widest font-board-wooden ${slim ? 'px-5' : 'px-6'}`}>
          {/* The grid cell stays in place; only its text is visually hidden. */}
          <span role="columnheader">
            <span className="sr-only">{t('board.prayer')}</span>
          </span>
          <span role="columnheader" className="text-right">{t('begins.column')}</span>
          <span role="columnheader" className="text-right">{t('board.jamaat')}</span>
        </div>
        {rows.map((row) => (
          <Plate key={row.prayer} row={row} next={next} slim={slim} />
        ))}
        {/* No wrapper here: rows must sit directly in the table for screen readers. */}
        {jumuah && <Plate row={jumuah} next={next} slim={slim} className={slim ? 'mt-1.5' : 'mt-3'} />}
      </div>
    </div>
  )
}
