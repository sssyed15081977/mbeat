import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COMING_SOON_MS = 2500

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

const tabClass = 'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-14 px-1 text-xs leading-tight text-center'

function tabLinkClass({ isActive }) {
  return `${tabClass} ${isActive ? 'text-brand font-semibold' : 'text-gray-500'}`
}

// The app's tabs, in the locked order Prayer Times · Feed · Find Now (AC21).
// Guests can tap Feed: its route asks them to sign in (AC24).
export function BottomNav() {
  const { t } = useTranslation()
  const [showComingSoon, setShowComingSoon] = useState(false)

  useEffect(() => {
    if (!showComingSoon) return
    const timer = setTimeout(() => setShowComingSoon(false), COMING_SOON_MS)
    return () => clearTimeout(timer)
  }, [showComingSoon])

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <p
        role="status"
        className={`absolute bottom-full inset-x-0 mx-auto mb-2 w-max max-w-[90%] rounded bg-gray-800 px-3 py-2 text-sm text-white transition-opacity ${showComingSoon ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {showComingSoon ? t('nav.findNowComingSoon') : ''}
      </p>

      <div className="flex max-w-sm mx-auto">
        <NavLink to="/" end className={tabLinkClass}>
          <ClockIcon />
          {t('nav.prayerTimes')}
        </NavLink>

        <NavLink to="/feed" className={tabLinkClass}>
          <FeedIcon />
          {t('nav.feed')}
        </NavLink>

        {/* Not built yet (AC22): a button, not a link, so it never navigates. */}
        <button
          type="button"
          onClick={() => setShowComingSoon(true)}
          className={`${tabClass} text-gray-400`}
        >
          <span className="relative">
            <SearchIcon />
            <span className="absolute -top-1.5 left-4 whitespace-nowrap rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600">
              {t('nav.comingSoon')}
            </span>
          </span>
          {t('nav.findNow')}
        </button>
      </div>
    </nav>
  )
}
