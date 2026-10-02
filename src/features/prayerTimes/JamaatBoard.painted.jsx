import { useTranslation } from 'react-i18next'
import { BISMILLAH, cellText, nextLabel, prayerLabelKey } from './boardRows'
import './JamaatBoard.painted.css'

// An eight-pointed star over the arch, as painted boards often have.
function Star() {
  return (
    <svg viewBox="-12 -12 24 24" className="w-7 h-7 mx-auto text-board-painted-gold" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="-7" y="-7" width="14" height="14" />
        <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" />
      </g>
      <circle r="2.2" fill="currentColor" />
    </svg>
  )
}

// "5:10 AM" with a small AM/PM, as painted boards letter it; saves the width
// two time columns need next to Tamil prayer names at 360px.
function Time({ value }) {
  const text = cellText(value)
  const match = text.match(/^(.*) (AM|PM)$/)
  if (!match) return text
  return (
    <>
      {match[1]}
      {/* A real space (not margin), so screen readers say "5:10 AM". */}
      <span className="text-[0.6em] tracking-wide"> {match[2]}</span>
    </>
  )
}

function Row({ row, next, slim }) {
  const { t } = useTranslation()
  const isNext = next.prayer === row.prayer
  const padY = slim ? 'py-0 leading-tight' : 'py-1.5'
  const cell = `text-right whitespace-nowrap tabular-nums font-board-painted ${padY} ${
    slim ? 'text-lg' : 'text-xl'
  } ${isNext ? 'text-board-painted-glow' : ''}`

  return (
    <tr aria-current={isNext ? 'true' : undefined} className={isNext ? 'bg-board-painted-gold/15' : ''}>
      <th scope="row" className={`text-left font-normal pl-2 ${padY}`}>
        <span className={`font-board-painted ${slim ? 'text-base' : 'text-lg'} ${isNext ? 'text-board-painted-glow' : ''}`}>
          {isNext && <span className="lamp mr-2 align-middle" aria-hidden="true" />}
          {t(prayerLabelKey(row.prayer))}
        </span>
        {isNext && <span className="block text-xs text-board-painted-gold">{nextLabel(t, next)}</span>}
      </th>
      <td className={`${cell} pl-2`}>
        <Time value={row.begins} />
      </td>
      <td className={`${cell} pl-2 pr-2`}>
        <Time value={row.jamaat} />
      </td>
    </tr>
  )
}

// Painted board (AC18): green, arched, gold-bordered. `slim` is the shorter
// version for the Prayer Times tab (AC31).
export function PaintedBoard({ headingId, heading, subheading, rows, jumuah, next, slim }) {
  const { t } = useTranslation()

  return (
    <div className={`board-painted ${slim ? 'board-painted--slim px-3 pt-3 pb-2 space-y-1' : 'px-4 pt-7 pb-4 space-y-2'} text-center`}>
      {!slim && <Star />}
      <p lang="ar" dir="rtl" className={`font-bismillah text-board-painted-gold ${slim ? 'text-base leading-snug' : 'text-2xl leading-relaxed'}`}>
        {BISMILLAH}
      </p>
      <h2 id={headingId} className={`font-board-painted leading-tight ${slim ? 'text-lg' : 'text-2xl'}`}>
        {heading}
      </h2>
      {subheading && <div className="text-xs">{subheading}</div>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-board-painted-gold">
            <td />
            <th scope="col" className="text-right font-normal pl-2 pb-1">{t('begins.column')}</th>
            <th scope="col" className="text-right font-normal pl-2 pr-2 pb-1">{t('board.jamaat')}</th>
          </tr>
        </thead>
        <tbody className="border-t border-board-painted-gold/50">
          {rows.map((row) => (
            <Row key={row.prayer} row={row} next={next} slim={slim} />
          ))}
        </tbody>
        {jumuah && (
          <tbody className="border-t-4 border-double border-board-painted-gold/70">
            <Row row={jumuah} next={next} slim={slim} />
          </tbody>
        )}
      </table>
    </div>
  )
}
