import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { DEATH_ANNOUNCEMENT_GENDERS, initialDeathAnnouncementForm } from './deathAnnouncementSchema'

export function DeathAnnouncementForm({ onSuccess }) {
  const { user } = useAuth()
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
      <h1 className="text-xl font-bold">Post a death announcement</h1>

      <input
        type="text"
        placeholder="Title (e.g. Death Announcement - Name)"
        required
        value={form.title}
        onChange={(event) => updateField('title', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(event) => updateField('description', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="text"
        placeholder="Deceased's name"
        required
        value={form.deceased_name}
        onChange={(event) => updateField('deceased_name', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="number"
        placeholder="Deceased's age (optional)"
        min="0"
        value={form.deceased_age}
        onChange={(event) => updateField('deceased_age', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <select
        value={form.deceased_gender}
        onChange={(event) => updateField('deceased_gender', event.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Gender (optional)</option>
        {DEATH_ANNOUNCEMENT_GENDERS.map((gender) => (
          <option key={gender.value} value={gender.value}>
            {gender.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Announcer relation (e.g. Son, Mosque Committee)"
        value={form.announcer_relation}
        onChange={(event) => updateField('announcer_relation', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="datetime-local"
        value={form.janazah_datetime}
        onChange={(event) => updateField('janazah_datetime', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Janazah location"
        value={form.janazah_location}
        onChange={(event) => updateField('janazah_location', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Burial location (optional, if different from Janazah location)"
        value={form.burial_location}
        onChange={(event) => updateField('burial_location', event.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green-600 text-white rounded px-3 py-2 font-semibold disabled:opacity-50"
      >
        {submitting ? 'Posting…' : 'Post announcement'}
      </button>
    </form>
  )
}
