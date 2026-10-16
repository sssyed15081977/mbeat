import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { requestToVolunteer } from './masjidVolunteersApi'

const NOTE_MAX_LENGTH = 200

// "Offer to volunteer" (spec 4.2, AC6): masjid name, what volunteers do, an
// optional note, Send request. On error the note is kept (AC10).
export function OfferToVolunteerSheet({ open, onClose, masjid, onSent }) {
  const { t } = useTranslation()
  const noteId = useId()
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setError(false)

    try {
      await requestToVolunteer(masjid.id, note.trim())
    } catch (err) {
      // Already waiting (e.g. sent from another tab): that's what they wanted.
      if (err?.hint !== 'already_requested') {
        setError(true)
        setSending(false)
        return
      }
    }

    setSending(false)
    setNote('')
    onSent()
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('volunteers.offer')}>
      <form onSubmit={handleSubmit} className="space-y-3 px-2">
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{masjid.name}</p>
          <p className="text-sm text-gray-600">{t('volunteers.whatTheyDo')}</p>
        </div>

        <div className="space-y-1">
          <label htmlFor={noteId} className="block text-sm font-medium text-gray-700">
            {t('volunteers.noteLabel')}
          </label>
          <textarea
            id={noteId}
            data-autofocus
            dir="auto"
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-400 text-right" aria-hidden="true">
            {note.length}/{NOTE_MAX_LENGTH}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {t('volunteers.sendError')}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-brand text-white rounded px-3 py-3 font-semibold disabled:opacity-50"
        >
          {sending ? t('volunteers.sending') : t('volunteers.send')}
        </button>
      </form>
    </BottomSheet>
  )
}
