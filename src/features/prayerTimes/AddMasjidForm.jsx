import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JamaatTimeFields } from './JamaatTimeFields'
import { createMasjid } from './prayerTimesApi'

export function AddMasjidForm({ onDone }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [jamaatTimes, setJamaatTimes] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(false)

    try {
      await createMasjid({ name: name.trim(), address: address.trim(), jamaatTimes })
      setSaved(true)
    } catch {
      // Keep everything typed so the user can just tap again (AC31).
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  // New masjids start 'pending' and stay hidden until reviewed, so there's
  // nothing to navigate to yet — say so instead of silently going back.
  if (saved) {
    return (
      <div className="space-y-4" role="status">
        <p className="text-base text-gray-800">{t('addMasjid.submitted')}</p>
        <button
          type="button"
          onClick={onDone}
          className="w-full bg-brand text-white rounded px-3 py-3 font-semibold"
        >
          {t('addMasjid.done')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="text-xl font-bold">{t('addMasjid.heading')}</h1>

      <div className="space-y-1">
        <label htmlFor="masjid_name" className="text-sm font-medium text-gray-700">
          {t('addMasjid.nameLabel')}
        </label>
        <input
          id="masjid_name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="masjid_address" className="text-sm font-medium text-gray-700">
          {t('addMasjid.addressLabel')}
        </label>
        <input
          id="masjid_address"
          type="text"
          placeholder={t('addMasjid.addressPlaceholder')}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <JamaatTimeFields
        values={jamaatTimes}
        onChange={(prayer, time) => setJamaatTimes((prev) => ({ ...prev, [prayer]: time }))}
      />

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {t('addMasjid.saveError')}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="w-full bg-brand text-white rounded px-3 py-3 font-semibold disabled:opacity-50"
      >
        {submitting ? t('addMasjid.submitting') : t('addMasjid.submit')}
      </button>
    </form>
  )
}
