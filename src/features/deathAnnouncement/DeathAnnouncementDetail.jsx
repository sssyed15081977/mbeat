import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import { ImageLightbox } from '../../components/ui/ImageLightbox'
import { DEATH_ANNOUNCEMENT_LIFECYCLE_STATUSES } from './lifecycleStatus'

function formatDateTime(value, language) {
  if (!value) return null
  return new Date(value).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function DetailRow({ label, value }) {
  if (!value) return null

  return (
    <div className="py-2 flex justify-between gap-4 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function LifecycleStatusControl({ status, onChange, updating }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{t('deathAnnouncementDetail.statusControlLabel')}</p>
      <div className="flex flex-wrap gap-2">
        {DEATH_ANNOUNCEMENT_LIFECYCLE_STATUSES.map((value) => {
          const active = value === status
          return (
            <button
              key={value}
              type="button"
              disabled={updating}
              onClick={() => onChange(value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full disabled:opacity-50 ${
                active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`lifecycleStatus.deathAnnouncement.${value}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DeathAnnouncementDetail({ post, onLifecycleStatusChange }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const details = post.death_announcement
  const [photoOpen, setPhotoOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const isOwner = user?.id === post.author_id

  async function handleStatusChange(newStatus) {
    if (newStatus === post.lifecycle_status || !onLifecycleStatusChange) return

    setStatusUpdating(true)
    setStatusError(null)
    try {
      await onLifecycleStatusChange(newStatus)
    } catch {
      setStatusError(t('deathAnnouncementDetail.statusUpdateError'))
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="uppercase tracking-wide">{t(`postType.${post.type}`)}</span>
        <div className="flex items-center gap-3">
          <span>{t(`moderationStatus.${post.moderation_status}`)}</span>
          {isOwner && (
            <Link to={`/post/${post.id}/edit`} className="text-brand font-medium">
              {t('deathAnnouncementDetail.editLink')}
            </Link>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        {post.lifecycle_status && !isOwner && (
          <p className="text-sm text-brand font-medium mt-1">
            {t(`lifecycleStatus.deathAnnouncement.${post.lifecycle_status}`)}
          </p>
        )}
      </div>

      {isOwner && post.lifecycle_status && (
        <div className="space-y-1">
          <LifecycleStatusControl
            status={post.lifecycle_status}
            onChange={handleStatusChange}
            updating={statusUpdating}
          />
          {statusError && <p className="text-xs text-red-600">{statusError}</p>}
        </div>
      )}

      {details?.photo_url && (
        <button
          type="button"
          onClick={() => setPhotoOpen(true)}
          aria-label={t('deathAnnouncementDetail.viewPhoto')}
          className="block w-full"
        >
          <img
            src={details.photo_url}
            alt=""
            className="w-full h-auto rounded-lg"
          />
        </button>
      )}

      {post.description && <p className="text-gray-700">{post.description}</p>}

      {details && (
        <dl className="border-t border-gray-100 divide-y divide-gray-100">
          <DetailRow label={t('deathAnnouncementForm.deceasedNameLabel')} value={details.deceased_name} />
          <DetailRow label={t('deathAnnouncementForm.deceasedAgeLabel')} value={details.deceased_age} />
          <DetailRow
            label={t('deathAnnouncementForm.genderLabel')}
            value={details.deceased_gender ? t(`gender.${details.deceased_gender}`) : null}
          />
          <DetailRow label={t('deathAnnouncementForm.announcerRelationLabel')} value={details.announcer_relation} />
          <DetailRow
            label={t('deathAnnouncementForm.deathDatetimeLabel')}
            value={formatDateTime(details.death_datetime, i18n.language)}
          />
          <DetailRow label={t('deathAnnouncementForm.bodyLocationLabel')} value={details.body_location} />
          <DetailRow
            label={t('deathAnnouncementForm.janazahDatetimeLabel')}
            value={formatDateTime(details.janazah_datetime, i18n.language)}
          />
          <DetailRow label={t('deathAnnouncementForm.janazahLocationLabel')} value={details.janazah_location} />
          <DetailRow label={t('deathAnnouncementForm.burialLocationLabel')} value={details.burial_location} />
        </dl>
      )}

      <Link
        to="/guide/janazah-prayer"
        className="inline-block text-sm text-brand font-medium underline underline-offset-2"
      >
        {t('deathAnnouncementDetail.janazahGuideLink')}
      </Link>

      {details?.photo_url && (
        <ImageLightbox
          src={details.photo_url}
          alt={details.deceased_name || ''}
          open={photoOpen}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </div>
  )
}
