import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import { POST_PHOTO_ACCEPTED_TYPES, uploadPostPhoto, validatePostPhoto } from '../../lib/postPhotos'
import { createMasjidNotice, updateMasjidNotice } from './masjidNoticeApi'
import { KINDS_NEEDING_SOURCE, MASJID_NOTICE_KINDS, initialNoticeForm, kolkataToday } from './masjidNoticeSchema'

const INPUT = 'w-full border rounded px-3 py-2'
const LABEL = 'text-sm font-medium text-gray-700'

// A photo input with a preview of the picked file (or the existing photo
// while editing).
function PhotoField({ id, label, existingUrl, onPick, onInvalid }) {
  const { t } = useTranslation()
  const [pickedPreview, setPickedPreview] = useState(null)
  const previewUrl = pickedPreview || existingUrl

  function handleChange(event) {
    const file = event.target.files?.[0] ?? null
    const problem = file && validatePostPhoto(file)
    if (problem) {
      onInvalid(t(problem === 'type' ? 'postPhoto.typeError' : 'postPhoto.sizeError'))
      event.target.value = ''
      return
    }
    setPickedPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    onPick(file)
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {previewUrl && <img src={previewUrl} alt="" className="w-24 h-24 rounded-lg object-cover" />}
      <input
        id={id}
        type="file"
        accept={POST_PHOTO_ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="w-full text-sm"
      />
      <p className="text-xs text-gray-500">{t('postPhoto.help')}</p>
    </div>
  )
}

// Add notice (`/masjid/:id/notice/new`) and Edit notice (`/post/:id/edit`)
// share this form (spec 4.3, 4.5). Fields in AC2's order; the kind is locked
// once posted. On an error everything typed is kept (AC7).
export function MasjidNoticeForm({ masjid, editingPost = null, onSuccess }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isEditing = Boolean(editingPost)
  const [form, setForm] = useState(() => initialNoticeForm(editingPost))
  const [existingPhotoUrl] = useState(editingPost?.masjid_notice?.photo_url ?? null)
  const [existingQrUrl] = useState(editingPost?.masjid_notice?.payment_qr_url ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const needsSource = KINDS_NEEDING_SOURCE.includes(form.kind)
  const isDonation = form.kind === 'donation'
  // AC3: at least a photo, a title or text.
  const hasContent = Boolean(form.title.trim() || form.description.trim() || form.photo || existingPhotoUrl)
  const canSubmit = Boolean(form.kind) && hasContent && (!needsSource || form.source_reference.trim()) && !submitting

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const photoUrl = form.photo ? await uploadPostPhoto(user.id, form.photo) : existingPhotoUrl
      const qrUrl = isDonation ? (form.qr ? await uploadPostPhoto(user.id, form.qr) : existingQrUrl) : null

      const fields = {
        kind: form.kind,
        title: form.title.trim(),
        description: form.description.trim() || null,
        source_reference: needsSource ? form.source_reference.trim() : null,
        show_until: form.show_until || null,
        photo_url: photoUrl,
        upi_id: isDonation ? form.upi_id.trim() || null : null,
        payment_qr_url: qrUrl,
      }

      if (isEditing) {
        await updateMasjidNotice(editingPost.id, fields)
        onSuccess(editingPost.id)
      } else {
        onSuccess(await createMasjidNotice(masjid.id, fields))
      }
    } catch {
      setError(t(isEditing ? 'masjidNotice.saveError' : 'masjidNotice.postError'))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{t(isEditing ? 'masjidNotice.editHeading' : 'masjidNotice.addNotice')}</h1>
        <p className="text-sm text-gray-600">{masjid.name}</p>
      </div>

      <fieldset className="space-y-2">
        <legend className={LABEL}>{t('masjidNotice.kindLabel')}</legend>
        <div className="flex flex-wrap gap-2">
          {MASJID_NOTICE_KINDS.map((kind) => {
            const active = form.kind === kind
            return (
              <label
                key={kind}
                className={`text-sm font-medium px-3 py-2 rounded-full cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-brand ${
                  active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isEditing && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="kind"
                  value={kind}
                  checked={active}
                  disabled={isEditing}
                  onChange={() => updateField('kind', kind)}
                  className="sr-only"
                />
                {t(`masjidNotice.kinds.${kind}`)}
              </label>
            )
          })}
        </div>
      </fieldset>

      <PhotoField
        id="notice-photo"
        label={t('masjidNotice.photoLabel')}
        existingUrl={existingPhotoUrl}
        onPick={(file) => {
          setError(null)
          updateField('photo', file)
        }}
        onInvalid={setError}
      />

      <div className="space-y-1">
        <label htmlFor="notice-title" className={LABEL}>
          {t('masjidNotice.titleLabel')}
        </label>
        <input
          id="notice-title"
          type="text"
          dir="auto"
          placeholder={t('masjidNotice.optional')}
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          className={INPUT}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="notice-text" className={LABEL}>
          {t('masjidNotice.textLabel')}
        </label>
        <textarea
          id="notice-text"
          dir="auto"
          rows={5}
          placeholder={t('masjidNotice.optional')}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          className={INPUT}
        />
      </div>

      {needsSource && (
        <div className="space-y-1">
          <label htmlFor="notice-source" className={LABEL}>
            {t('masjidNotice.sourceLabel')}
          </label>
          <input
            id="notice-source"
            type="text"
            dir="auto"
            required
            placeholder={t('masjidNotice.sourcePlaceholder')}
            value={form.source_reference}
            onChange={(event) => updateField('source_reference', event.target.value)}
            className={INPUT}
          />
        </div>
      )}

      {isDonation && (
        <>
          <div className="space-y-1">
            <label htmlFor="notice-upi" className={LABEL}>
              {t('masjidNotice.upiLabel')}
            </label>
            <input
              id="notice-upi"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t('masjidNotice.upiPlaceholder')}
              value={form.upi_id}
              onChange={(event) => updateField('upi_id', event.target.value)}
              className={INPUT}
            />
          </div>
          <PhotoField
            id="notice-qr"
            label={t('masjidNotice.qrLabel')}
            existingUrl={existingQrUrl}
            onPick={(file) => {
              setError(null)
              updateField('qr', file)
            }}
            onInvalid={setError}
          />
        </>
      )}

      <div className="space-y-1">
        <label htmlFor="notice-show-until" className={LABEL}>
          {t('masjidNotice.showUntilLabel')}
        </label>
        <input
          id="notice-show-until"
          type="date"
          min={kolkataToday()}
          value={form.show_until}
          onChange={(event) => updateField('show_until', event.target.value)}
          className={INPUT}
        />
        <p className="text-xs text-gray-500">{t('masjidNotice.showUntilHelp')}</p>
      </div>

      {form.kind && !hasContent && <p className="text-sm text-gray-500">{t('masjidNotice.contentHint')}</p>}

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-brand text-white rounded px-3 py-3 font-semibold disabled:opacity-50"
      >
        {isEditing
          ? t(submitting ? 'masjidNotice.saving' : 'masjidNotice.saveChanges')
          : t(submitting ? 'masjidNotice.posting' : 'masjidNotice.submit')}
      </button>
    </form>
  )
}
