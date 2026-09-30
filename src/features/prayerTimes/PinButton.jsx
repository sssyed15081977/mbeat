import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function PinIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <path d="M12 17v5" />
      <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z" />
    </svg>
  )
}

const buttonClass = 'shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 active:bg-gray-200'

// Pins a masjid to "My masjids". Guests get a link to sign in instead, which
// brings them back to this page afterwards (AC24, AC25).
export function PinButton({ masjidName, pinned, canPin, onToggle }) {
  const { t } = useTranslation()
  const location = useLocation()

  if (!canPin) {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname }}
        aria-label={t('prayerTimes.signInToPin')}
        className={`${buttonClass} text-gray-400`}
      >
        <PinIcon filled={false} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pinned}
      aria-label={t(pinned ? 'prayerTimes.unpin' : 'prayerTimes.pin', { name: masjidName })}
      className={`${buttonClass} ${pinned ? 'text-brand' : 'text-gray-400'}`}
    >
      <PinIcon filled={pinned} />
    </button>
  )
}
