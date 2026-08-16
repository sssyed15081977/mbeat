import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from './useAuth'

export function ProfileCompletion({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ full_name: '', phone: '', locality: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return
      if (error) setError(error.message)
      setProfile(data)
      setLoading(false)
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: user.id, ...form })
      .select()
      .single()

    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setProfile(data)
  }

  if (loading) return null
  if (profile) return children

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Complete your profile</h1>
        <p className="text-sm text-gray-600">
          Real names are required to post on mbeat — this keeps the community accountable.
        </p>

        <input
          type="text"
          placeholder="Full name"
          required
          value={form.full_name}
          onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="tel"
          placeholder="Phone number"
          required
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Locality (e.g. area in Melapalayam)"
          required
          value={form.locality}
          onChange={(event) => setForm({ ...form, locality: event.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white rounded px-3 py-2 font-semibold disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
