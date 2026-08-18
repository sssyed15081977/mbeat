import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { DEATH_ANNOUNCEMENT_GENDERS, initialDeathAnnouncementForm } from './deathAnnouncementSchema'

export function DeathAnnouncementForm({ onSuccess }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState(initialDeathAnnouncementForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        type: 'death_announcement',
        author_id: user.id,
        title: form.title,
        description: form.description || null,
        lifecycle_status: 'upcoming_janazah',
      })
      .select()
      .single()

    if (postError) {
      setSubmitting(false)
      setError(postError.message)
      return
    }

    const { error: extensionError } = await supabase.from('death_announcement').insert({
      post_id: post.id,
      deceased_name: form.deceased_name,
      deceased_age: form.deceased_age ? Number(form.deceased_age) : null,
      deceased_gender: form.deceased_gender || null,
      announcer_relation: form.announcer_relation || null,
      death_datetime: form.death_datetime || null,
      janazah_datetime: form.janazah_datetime || null,
      janazah_location: form.janazah_location || null,
      burial_location: form.burial_location || null,
    })

    setSubmitting(false)
    if (extensionError) {
      setError(extensionError.message)
      return
    }

    setForm(initialDeathAnnouncementForm)
    onSuccess?.(post)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="text-xl font-bold">{t('deathAnnouncementForm.heading')}</h1>

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.titleLabel')}
        </label>
        <input
          id="title"
          type="text"
          placeholder={t('deathAnnouncementForm.titlePlaceholder')}
          required
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.descriptionLabel')}
        </label>
        <textarea
          id="description"
          placeholder={t('deathAnnouncementForm.descriptionPlaceholder')}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="deceased_name" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.deceasedNameLabel')}
        </label>
        <input
          id="deceased_name"
          type="text"
          placeholder={t('deathAnnouncementForm.deceasedNamePlaceholder')}
          required
          value={form.deceased_name}
          onChange={(event) => updateField('deceased_name', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="deceased_age" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.deceasedAgeLabel')}
        </label>
        <input
          id="deceased_age"
          type="number"
          placeholder={t('deathAnnouncementForm.deceasedAgePlaceholder')}
          min="0"
          value={form.deceased_age}
          onChange={(event) => updateField('deceased_age', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="deceased_gender" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.genderLabel')}
        </label>
        <select
          id="deceased_gender"
          value={form.deceased_gender}
          onChange={(event) => updateField('deceased_gender', event.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">{t('deathAnnouncementForm.genderPlaceholder')}</option>
          {DEATH_ANNOUNCEMENT_GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {t(`gender.${gender}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="announcer_relation" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.announcerRelationLabel')}
        </label>
        <input
          id="announcer_relation"
          type="text"
          placeholder={t('deathAnnouncementForm.announcerRelationPlaceholder')}
          value={form.announcer_relation}
          onChange={(event) => updateField('announcer_relation', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="death_datetime" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.deathDatetimeLabel')}
        </label>
        <input
          id="death_datetime"
          type="datetime-local"
          value={form.death_datetime}
          onChange={(event) => updateField('death_datetime', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="janazah_datetime" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.janazahDatetimeLabel')}
        </label>
        <input
          id="janazah_datetime"
          type="datetime-local"
          value={form.janazah_datetime}
          onChange={(event) => updateField('janazah_datetime', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="janazah_location" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.janazahLocationLabel')}
        </label>
        <input
          id="janazah_location"
          type="text"
          placeholder={t('deathAnnouncementForm.janazahLocationPlaceholder')}
          value={form.janazah_location}
          onChange={(event) => updateField('janazah_location', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="burial_location" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.burialLocationLabel')}
        </label>
        <input
          id="burial_location"
          type="text"
          placeholder={t('deathAnnouncementForm.burialLocationPlaceholder')}
          value={form.burial_location}
          onChange={(event) => updateField('burial_location', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand text-white rounded px-3 py-2 font-semibold disabled:opacity-50"
      >
        {submitting ? t('deathAnnouncementForm.posting') : t('deathAnnouncementForm.submit')}
      </button>
    </form>
  )
}
