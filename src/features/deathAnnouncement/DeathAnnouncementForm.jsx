import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import {
  DEATH_ANNOUNCEMENT_GENDERS,
  DEATH_ANNOUNCEMENT_PHOTO_ACCEPTED_TYPES,
  DEATH_ANNOUNCEMENT_PHOTO_MAX_BYTES,
  initialDeathAnnouncementForm,
} from './deathAnnouncementSchema'

// datetime-local inputs take/return local wall-clock time with no timezone;
// timestamptz columns come back as UTC instants — shift by the local offset
// so an existing death/janazah time round-trips into the input correctly.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

// Mirror of the above: a bare "YYYY-MM-DDTHH:mm" string has no timezone, so
// Postgres would otherwise interpret it as UTC instead of local wall-clock
// time. `new Date(...)` parses a timezone-less date-time string as local
// time, so converting through it and back to ISO captures the correct
// instant before it's sent to a timestamptz column.
function fromDatetimeLocalValue(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

function buildInitialForm(editingPost) {
  if (!editingPost) return initialDeathAnnouncementForm

  const details = editingPost.death_announcement || {}
  return {
    title: editingPost.title || '',
    description: editingPost.description || '',
    deceased_name: details.deceased_name || '',
    deceased_age: details.deceased_age ?? '',
    deceased_gender: details.deceased_gender || '',
    announcer_relation: details.announcer_relation || '',
    death_datetime: toDatetimeLocalValue(details.death_datetime),
    body_location: details.body_location || '',
    janazah_datetime: toDatetimeLocalValue(details.janazah_datetime),
    janazah_location: details.janazah_location || '',
    burial_location: details.burial_location || '',
    photo: null,
  }
}

export function DeathAnnouncementForm({ onSuccess, editingPost }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const isEditing = Boolean(editingPost)
  const [form, setForm] = useState(() => buildInitialForm(editingPost))
  const [existingPhotoUrl] = useState(editingPost?.death_announcement?.photo_url || null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setPhotoFile(file) {
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    updateField('photo', file)
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0] ?? null

    if (file && !DEATH_ANNOUNCEMENT_PHOTO_ACCEPTED_TYPES.includes(file.type)) {
      setError(t('deathAnnouncementForm.photoTypeError'))
      event.target.value = ''
      return
    }
    if (file && file.size > DEATH_ANNOUNCEMENT_PHOTO_MAX_BYTES) {
      setError(t('deathAnnouncementForm.photoSizeError'))
      event.target.value = ''
      return
    }

    setError(null)
    setPhotoFile(file)
  }

  async function uploadPhoto(file) {
    const extension = file.name.split('.').pop()
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage.from('post-photos').upload(path, file)
    if (uploadError) throw uploadError

    return supabase.storage.from('post-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    // Keep the existing photo unless the user picked a replacement.
    let photoUrl = isEditing ? existingPhotoUrl : null
    if (form.photo) {
      try {
        photoUrl = await uploadPhoto(form.photo)
      } catch (uploadError) {
        setSubmitting(false)
        setError(uploadError.message)
        return
      }
    }

    const extensionFields = {
      deceased_name: form.deceased_name,
      deceased_age: form.deceased_age ? Number(form.deceased_age) : null,
      deceased_gender: form.deceased_gender || null,
      announcer_relation: form.announcer_relation || null,
      death_datetime: fromDatetimeLocalValue(form.death_datetime),
      body_location: form.body_location || null,
      janazah_datetime: fromDatetimeLocalValue(form.janazah_datetime),
      janazah_location: form.janazah_location || null,
      burial_location: form.burial_location || null,
      photo_url: photoUrl,
    }

    if (isEditing) {
      const { error: postError } = await supabase
        .from('posts')
        .update({ title: form.title, description: form.description || null })
        .eq('id', editingPost.id)

      if (postError) {
        setSubmitting(false)
        setError(postError.message)
        return
      }

      const { error: extensionError } = await supabase
        .from('death_announcement')
        .update(extensionFields)
        .eq('post_id', editingPost.id)

      setSubmitting(false)
      if (extensionError) {
        setError(extensionError.message)
        return
      }

      onSuccess?.(editingPost)
      return
    }

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
      ...extensionFields,
    })

    setSubmitting(false)
    if (extensionError) {
      setError(extensionError.message)
      return
    }

    setPhotoFile(null)
    setForm(initialDeathAnnouncementForm)
    onSuccess?.(post)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="text-xl font-bold">
        {isEditing ? t('deathAnnouncementForm.editHeading') : t('deathAnnouncementForm.heading')}
      </h1>

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
        <label htmlFor="photo" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.photoLabel')}
        </label>
        {(photoPreviewUrl || existingPhotoUrl) && (
          <img
            src={photoPreviewUrl || existingPhotoUrl}
            alt=""
            className="w-20 h-20 rounded-lg object-cover mb-1"
          />
        )}
        <input
          id="photo"
          type="file"
          accept={DEATH_ANNOUNCEMENT_PHOTO_ACCEPTED_TYPES.join(',')}
          onChange={handlePhotoChange}
          className="w-full text-sm"
        />
        <p className="text-xs text-gray-500">{t('deathAnnouncementForm.photoHelp')}</p>
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
        <label htmlFor="body_location" className="text-sm font-medium text-gray-700">
          {t('deathAnnouncementForm.bodyLocationLabel')}
        </label>
        <input
          id="body_location"
          type="text"
          placeholder={t('deathAnnouncementForm.bodyLocationPlaceholder')}
          value={form.body_location}
          onChange={(event) => updateField('body_location', event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-500">{t('deathAnnouncementForm.bodyLocationHelp')}</p>
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
        {isEditing
          ? submitting
            ? t('deathAnnouncementForm.savingChanges')
            : t('deathAnnouncementForm.saveChanges')
          : submitting
            ? t('deathAnnouncementForm.posting')
            : t('deathAnnouncementForm.submit')}
      </button>
    </form>
  )
}
