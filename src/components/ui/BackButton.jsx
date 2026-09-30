import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function BackButton({ to }) {
  const { t } = useTranslation()

  return (
    <Link
      to={to}
      aria-label={t('common.back')}
      className="inline-flex items-center justify-center p-2 -ml-2 rounded hover:bg-gray-100"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  )
}
