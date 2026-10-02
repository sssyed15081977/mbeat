import { useTranslation } from 'react-i18next'
import { BISMILLAH, cellText, countdownText, nextLabel, prayerLabelKey } from './boardRows'
import { kolkataClock, toMinutes } from './nextJamaat'
import './JamaatBoard.digital.css'

// Seven-segment digits (AC19): each digit is an inline SVG built from this
// map, with unlit segments drawn dim behind the lit ones. No font needed.
const SEGMENTS_ON = {
  0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg',
  5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg',
  '-': 'g', ' ': '',
}

function hSeg(y) {
  return `2,${y} 2.8,${y - 0.8} 7.2,${y - 0.8} 8,${y} 7.2,${y + 0.8} 2.8,${y + 0.8}`
}
function vSeg(x, y1, y2) {
  return `${x},${y1 + 1} ${x + 0.8},${y1 + 1.8} ${x + 0.8},${y2 - 1.8} ${x},${y2 - 1} ${x - 0.8},${y2 - 1.8} ${x - 0.8},${y1 + 1.8}`
}
const SHAPES = {
  a: hSeg(1), b: vSeg(9, 1, 9), c: vSeg(9, 9, 17), d: hSeg(17),
  e: vSeg(1, 9, 17), f: vSeg(1, 1, 9), g: hSeg(9),
}

function Digit({ char }) {
  const on = SEGMENTS_ON[char] ?? ''
  const segs = Object.keys(SHAPES)
  return (
    <svg className="dg" viewBox="-0.2 0 10.4 18">
      {segs.filter((s) => !on.includes(s)).map((s) => (
        <polygon key={s} points={SHAPES[s]} className="seg" />
      ))}
      <g className="lit">
        {segs.filter((s) => on.includes(s)).map((s) => (
          <polygon key={s} points={SHAPES[s]} className="seg seg-on" />
        ))}
      </g>
    </svg>
  )
}

function Colon({ lit = true, blink = false }) {
  return (
    <svg className={`colon ${lit ? 'colon-on' : ''} ${blink ? 'blink' : ''}`} viewBox="0 0 4 18">
      <circle cx="2" cy="6" r="1.1" />
      <circle cx="2" cy="12" r="1.1" />
    </svg>
  )
}

function AmPm({ pm }) {
  return (
    <span className="ampm">
      <span className={pm === false ? 'on' : ''}>AM</span>
      <span className={pm === true ? 'on' : ''}>PM</span>
    </span>
  )
}

// Minutes since midnight -> four digit characters, hour blank-padded (" 5", "10").
function digitsFor(minutes) {
  const h = Math.floor(minutes / 60)
  const h12 = ((h + 11) % 12) + 1
  return { chars: `${String(h12).padStart(2, ' ')}${String(minutes % 60).padStart(2, '0')}`, pm: h >= 12 }
}

// A board time on the LED panel. Blank (no masjid) is all-dim; "—" (no time)
// is dashes. Hidden from screen readers; the plain text beside it is read.
function LedTime({ value, blink = false }) {
  let chars = '    '
  let pm = null
  if (value === null) chars = '----'
  else if (typeof value === 'number') ({ chars, pm } = digitsFor(value))
  else if (value !== undefined) ({ chars, pm } = digitsFor(toMinutes(value)))

  return (
    <span className="led-time" aria-hidden="true">
      <span className="digits">
        <Digit char={chars[0]} />
        <Digit char={chars[1]} />
        <Colon lit={value !== undefined} blink={blink} />
        <Digit char={chars[2]} />
        <Digit char={chars[3]} />
      </span>
      <AmPm pm={pm} />
    </span>
  )
}

function Row({ row, next, slim }) {
  const { t } = useTranslation()
  const isNext = next.prayer === row.prayer
  const padY = slim ? 'py-px' : 'py-2'

  return (
    <tr aria-current={isNext ? 'true' : undefined} className={isNext ? 'is-next' : ''}>
      <th scope="row" className={`text-left font-normal ${padY}`}>
        <span className="flex items-center gap-1.5">
          <span className="indicator" aria-hidden="true" />
          <span className="min-w-0">
            <span className={`block font-semibold ${slim ? 'text-sm' : 'text-base'} ${isNext ? 'text-board-digital-amber' : ''}`}>
              {t(prayerLabelKey(row.prayer))}
            </span>
            {isNext && <span className="block text-[0.65rem] leading-tight text-board-digital-amber">{nextLabel(t, next)}</span>}
          </span>
        </span>
      </th>
      <td className={`pl-1.5 ${padY}`}>
        <LedTime value={row.begins} />
        <span className="sr-only">{cellText(row.begins)}</span>
      </td>
      <td className={`pl-1.5 ${padY}`}>
        <LedTime value={row.jamaat} />
        <span className="sr-only">{cellText(row.jamaat)}</span>
      </td>
    </tr>
  )
}

// Digital LED board (AC19–AC20): live clock and date on top, seven-segment
// times, and a countdown to the highlighted row at the bottom.
export function DigitalBoard({ headingId, heading, subheading, rows, jumuah, next, now, slim }) {
  const { t, i18n } = useTranslation()
  const clock = kolkataClock(now)
  const date = now.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <div className={`board-digital ${slim ? 'board-digital--slim px-3 py-2.5 space-y-1.5' : 'p-4 space-y-3'}`}>
      <p lang="ar" dir="rtl" className={`font-bismillah text-center text-board-digital-amber ${slim ? 'text-sm' : 'text-lg'}`}>
        {BISMILLAH}
      </p>
      <div className="name-bar text-center rounded-sm px-2 py-1">
        <h2 id={headingId} className={`font-bold leading-tight ${slim ? 'text-sm' : 'text-base'}`}>
          {heading}
        </h2>
        {subheading && <div className="text-xs">{subheading}</div>}
      </div>

      {/* Slim (tab, AC31): the date sits beside the clock instead of under it. */}
      <div className="flex items-end justify-center gap-3">
        <div className="clock" role="timer" aria-label={formatClock(clock.minutes)}>
          <LedTime value={clock.minutes} blink />
        </div>
        {slim && <p className="text-xs tracking-wider text-board-digital-amber pb-0.5">{date}</p>}
      </div>
      {!slim && <p className="text-center text-xs tracking-wider text-board-digital-amber -mt-1">{date}</p>}

      <table className={`w-full border-collapse ${slim ? 'leading-tight' : ''}`}>
        <thead>
          <tr className="text-[0.65rem] uppercase tracking-widest text-board-digital-muted">
            <td />
            <th scope="col" className="text-left font-normal pl-1.5 pb-1">{t('begins.column')}</th>
            <th scope="col" className="text-left font-normal pl-1.5 pb-1">{t('board.jamaat')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row key={row.prayer} row={row} next={next} slim={slim} />
          ))}
        </tbody>
        {jumuah && (
          <tbody className="jumuah">
            <Row row={jumuah} next={next} slim={slim} />
          </tbody>
        )}
      </table>

      <p className="text-xs text-board-digital-amber">{countdownText(t, next)}</p>
    </div>
  )
}

function formatClock(minutes) {
  const { chars, pm } = digitsFor(minutes)
  return `${chars.slice(0, 2).trim()}:${chars.slice(2)} ${pm ? 'PM' : 'AM'}`
}
