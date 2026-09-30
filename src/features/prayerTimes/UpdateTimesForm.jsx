import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JamaatTimeFields } from './JamaatTimeFields'
import { updateJamaatTimes, confirmTimesUnchanged } from './prayerTimesApi'

// "05:15:00" (Postgres `time`) -> "05:15" (what a time input holds).
function toInputTime(time) {
  return time.slice(0, 5)
}

// The prayers whose time was actually changed (AC12). A cleared input is
// ignored rather than treated as a change: prayers can't be deleted from the
// app (spec §6), only from the dashboard.
function getChangedTimes(original, edited) {
  return Object.fromEntries(
    Object.entries(edited).filter(([prayer, time]) => time && time !== original[prayer]),
  )
}

// Pre-filled with the masjid's current jamaat times (AC11). Either action
// hands back to the detail page, where the freshness now reads "Confirmed
// today" (the database triggers stamp it, AC13).
export function UpdateTimesForm({ masjid, onDone }) {
  const { t } = useTranslation()
  const [original] = useState(() =>
    Object.fromEntries(masjid.prayer_times.map((row) => [row.prayer, toInputTime(row.jamaat_time)])),
  )
  const [jamaatTimes, setJamaatTimes] = useState(original)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const changedTimes = getChangedTimes(original, jamaatTimes)
  const hasChanges = Object.keys(changedTimes).length > 0

  async function run(action) {
    setSubmitting(true)
    setError(false)

    try {
      await action()
      onDone()
    } catch {
      // Keep the volunteer's edits so they can just tap again (4.3).
      setError(true)
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    run(() => updateJamaatTimes(masjid.id, changedTimes))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{t('updateTimes.heading')}</h1>
        <p className="text-sm text-gray-600">{masjid.name}</p>
      </div>

      <JamaatTimeFields
        values={jamaatTimes}
        onChange={(prayer, time) => setJamaatTimes((prev) => ({ ...prev, [prayer]: time }))}
      />

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {t('updateTimes.saveError')}
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={submitting || !hasChanges}
          className="w-full bg-brand text-white rounded px-3 py-3 font-semibold disabled:opacity-50"
        >
          {submitting ? t('updateTimes.saving') : t('updateTimes.saveChanges')}
        </button>
        {/* One tap, no confirmation dialog (AC14). */}
        <button
          type="button"
          onClick={() => run(() => confirmTimesUnchanged(masjid.id))}
          disabled={submitting}
          className="w-full border rounded px-3 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {t('updateTimes.boardUnchanged')}
        </button>
      </div>
    </form>
  )
}
