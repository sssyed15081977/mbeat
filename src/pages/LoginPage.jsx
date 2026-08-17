import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/useAuth'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { Skeleton } from '../components/ui/Skeleton'

export default function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const { t } = useTranslation()

  if (session) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-48" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <LanguageToggle />
      <h1 className="text-2xl font-bold text-brand">mbeat</h1>
      <p className="text-gray-600 text-center max-w-xs">{t('auth.tagline')}</p>
      <button
        onClick={signInWithGoogle}
        className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
      >
        {t('auth.signInWithGoogle')}
      </button>
    </div>
  )
}
