import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

export default function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold text-green-600">mbeat</h1>
      <p className="text-gray-600 text-center max-w-xs">
        MPM Helpline — community info for Melapalayam, in one place.
      </p>
      <button
        onClick={signInWithGoogle}
        className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
      >
        Sign in with Google
      </button>
    </div>
  )
}
