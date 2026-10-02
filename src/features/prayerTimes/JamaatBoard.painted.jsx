import { useTranslation } from 'react-i18next'
import { BISMILLAH, cellText, nextLabel, prayerLabelKey, shortNextLabel } from './boardRows'
import './JamaatBoard.painted.css'

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

function Row({ row, next }) {
  const { t } = useTranslation()
  const isNext = next.prayer === row.prayer
  const cell = `text-right whitespace-nowrap tabular-nums font-board-painted text-lg py-0 leading-tight ${
    isNext ? 'text-board-painted-glow' : ''
  }`

  return (
    <tr aria-current={isNext ? 'true' : undefined} className={isNext ? 'bg-board-painted-gold/15' : ''}>
      <th scope="row" className="text-left font-normal pl-2 py-0 leading-tight">
        <span className={`font-board-painted text-base ${isNext ? 'text-board-painted-glow' : ''}`}>
          {isNext && <span className="lamp mr-2 align-middle" aria-hidden="true" />}
          {t(prayerLabelKey(row.prayer))}
        </span>
        {isNext && (
          <>
            <span className="ml-1.5 text-xs text-board-painted-gold" aria-hidden="true">{shortNextLabel(t, next)}</span>
            <span className="sr-only">, {nextLabel(t, next)}</span>
          </>
        )}
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

// Painted board (AC18): green, gold-bordered, flat-topped like the others. One compact size on
// both screens, so the tab's list and the masjid page's content below the
// board stay near the top (AC31).
export function PaintedBoard({ headingId, heading, subheading, rows, jumuah, next, methodText, note }) {
  const { t } = useTranslation()

  return (
    <div className="board-painted px-3 pt-3 pb-2 space-y-1 text-center">
      <p lang="ar" dir="rtl" className="font-bismillah text-board-painted-gold text-base leading-snug">
        {BISMILLAH}
      </p>
      <h2 id={headingId} className="font-board-painted leading-tight text-lg">
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
            <Row key={row.prayer} row={row} next={next} />
          ))}
        </tbody>
        {jumuah && (
          <tbody className="border-t-4 border-double border-board-painted-gold/70">
            <Row row={jumuah} next={next} />
          </tbody>
        )}
      </table>
      <div className="text-[0.7rem] leading-snug text-board-painted-gold">
        <p>{note}</p>
        <p>{methodText}</p>
      </div>
    </div>
  )
}
