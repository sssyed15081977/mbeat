import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabaseClient'
import i18n, { setLanguage } from '../../lib/i18n'
import { useAuth } from './useAuth'
import { Skeleton } from '../../components/ui/Skeleton'

export function ProfileCompletion({ children }) {
  const { user } = useAuth()
  const { t } = useTranslation()
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
      if (data?.preferred_language && data.preferred_language !== i18n.language) {
        setLanguage(data.preferred_language)
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }
  if (profile) return children

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">{t('profileCompletion.title')}</h1>
        <p className="text-sm text-gray-600">{t('profileCompletion.subtitle')}</p>

        <div className="space-y-1">
          <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
            {t('profileCompletion.fullNameLabel')}
          </label>
          <input
            id="full_name"
            type="text"
            placeholder={t('profileCompletion.fullNamePlaceholder')}
            required
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            {t('profileCompletion.phoneLabel')}
          </label>
          <input
            id="phone"
            type="tel"
            placeholder={t('profileCompletion.phonePlaceholder')}
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="locality" className="text-sm font-medium text-gray-700">
            {t('profileCompletion.localityLabel')}
          </label>
          <input
            id="locality"
            type="text"
            placeholder={t('profileCompletion.localityPlaceholder')}
            required
            value={form.locality}
            onChange={(event) => setForm({ ...form, locality: event.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand text-white rounded px-3 py-2 font-semibold disabled:opacity-50"
        >
          {submitting ? t('profileCompletion.saving') : t('profileCompletion.continue')}
        </button>
      </form>
    </div>
  )
}
