import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { ImageLightbox } from '../../components/ui/ImageLightbox'
import { formatRelativeTime } from '../../lib/relativeTime'
import { deleteMasjidNotice, fetchAuthorName } from './masjidNoticeApi'
import { isNoticeLive, noticeTitle } from './masjidNoticeSchema'

const BUTTON = 'flex items-center justify-center gap-2 rounded px-3 py-3 font-medium'

// show_until is a plain date ("2026-10-12"); format it as that calendar day,
// without letting the device's timezone shift it.
function formatDate(dateString, language) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
}

// Pay with UPI + Copy UPI ID, the payment QR, and the fixed "confirm with the
// masjid" note, which the poster can't turn off (AC17–AC19).
function DonationBlock({ notice, masjidName, onOpenQr }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const upiLink = notice.upi_id
    ? `upi://pay?pa=${encodeURIComponent(notice.upi_id)}&pn=${encodeURIComponent(masjidName ?? '')}&cu=INR`
    : null

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-3">
      {upiLink && (
        <div className="space-y-2">
          <a href={upiLink} className={`${BUTTON} w-full bg-brand text-white font-semibold`}>
            {t('masjidNotice.payWithUpi')}
          </a>
          {/* The fallback when no UPI app opens (AC17). */}
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                ?.writeText(notice.upi_id)
                .then(() => setCopied(true))
                .catch(() => {})
            }
            className={`${BUTTON} w-full border bg-white hover:bg-gray-50`}
          >
            <span className="font-mono text-sm break-all">{notice.upi_id}</span>
            <span aria-live="polite" className="text-brand">
              · {copied ? t('masjidNotice.copied') : t('masjidNotice.copyUpi')}
            </span>
          </button>
        </div>
      )}

      {notice.payment_qr_url && (
        <button
          type="button"
          onClick={onOpenQr}
          aria-label={t('masjidNotice.viewQr')}
          className="block mx-auto"
        >
          <img src={notice.payment_qr_url} alt="" className="w-48 h-48 object-contain rounded bg-white" />
        </button>
      )}

      <p className="text-sm font-medium text-amber-800">{t('masjidNotice.confirmNote')}</p>
    </div>
  )
}

// A masjid notice on /post/:id (spec 4.4). Order: kind · masjid · title ·
// photo · text · source · donation block · show-until / ended · posted by +
// when · Share · (author only) Edit, Remove.
export function MasjidNoticeDetail({ post, onRemoved }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const notice = post.masjid_notice
  const masjid = post.entities
  const title = noticeTitle(post, t)
  const isAuthor = user?.id === post.author_id
  const [authorName, setAuthorName] = useState(null)
  const [openImage, setOpenImage] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAuthorName(post.author_id)
      .then((name) => {
        if (!cancelled) setAuthorName(name)
      })
      // No name: fall back to "Posted by a masjid volunteer".
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [post.author_id])

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url })
      } catch {
        // Cancelled by the user; nothing to do.
      }
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`, '_blank', 'noopener')
  }

  async function handleRemove() {
    setRemoving(true)
    setRemoveError(false)
    try {
      await deleteMasjidNotice(post.id)
      onRemoved()
    } catch {
      setRemoveError(true)
      setRemoving(false)
    }
  }

  return (
    <article className="space-y-4">
      <p className="text-xs text-gray-500">
        <span className="uppercase tracking-wide font-medium text-brand">{t(`masjidNotice.kinds.${notice.kind}`)}</span>
        {masjid && (
          <>
            {' · '}
            <Link to={`/masjid/${masjid.id}`} className="font-medium text-gray-700 underline underline-offset-2">
              {masjid.name}
            </Link>
          </>
        )}
      </p>

      <h1 dir="auto" className="text-xl font-bold">
        {title}
      </h1>

      {notice.photo_url && (
        <button
          type="button"
          onClick={() => setOpenImage(notice.photo_url)}
          aria-label={t('masjidNotice.viewPhoto')}
          className="block w-full"
        >
          <img src={notice.photo_url} alt="" className="w-full h-auto rounded-lg" />
        </button>
      )}

      {post.description && (
        <p dir="auto" className="text-gray-700 whitespace-pre-line">
          {post.description}
        </p>
      )}

      {notice.source_reference && (
        <p className="text-sm text-gray-600 border-l-2 border-brand pl-3">
          {t('masjidNotice.source', { source: notice.source_reference })}
        </p>
      )}

      {notice.kind === 'donation' && (
        <DonationBlock
          notice={notice}
          masjidName={masjid?.name}
          onOpenQr={() => setOpenImage(notice.payment_qr_url)}
        />
      )}

      {notice.show_until &&
        (isNoticeLive(notice) ? (
          <p className="text-sm text-gray-500">
            {t('masjidNotice.showUntil', { date: formatDate(notice.show_until, i18n.language) })}
          </p>
        ) : (
          <p className="text-sm font-medium text-amber-800">{t('masjidNotice.ended')}</p>
        ))}

      <p className="text-sm text-gray-500">
        {authorName ? t('masjidNotice.postedBy', { name: authorName }) : t('masjidNotice.postedByVolunteer')}
        {' · '}
        <time dateTime={post.created_at}>{formatRelativeTime(post.created_at, i18n.language)}</time>
      </p>

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" onClick={handleShare} className={`${BUTTON} flex-1 border hover:bg-gray-50`}>
          {t('masjidNotice.share')}
        </button>
        {isAuthor && (
          <>
            <Link to={`/post/${post.id}/edit`} className={`${BUTTON} flex-1 border hover:bg-gray-50`}>
              {t('masjidNotice.edit')}
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-haspopup="dialog"
              className={`${BUTTON} flex-1 border text-red-700 hover:bg-red-50`}
            >
              {t('masjidNotice.remove')}
            </button>
          </>
        )}
      </div>

      {/* Destructive, so it asks once (AC21). */}
      <BottomSheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('masjidNotice.removeConfirm')}>
        <div className="space-y-3 px-2">
          <p className="text-sm text-gray-600">{t('masjidNotice.removeConfirmBody')}</p>
          {removeError && (
            <p className="text-sm text-red-600" role="alert">
              {t('masjidNotice.removeError')}
            </p>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className={`${BUTTON} w-full bg-red-600 text-white font-semibold disabled:opacity-50`}
          >
            {removing ? t('masjidNotice.removing') : t('masjidNotice.remove')}
          </button>
          <button
            type="button"
            data-autofocus
            onClick={() => setConfirmOpen(false)}
            className={`${BUTTON} w-full border hover:bg-gray-50`}
          >
            {t('masjidNotice.cancel')}
          </button>
        </div>
      </BottomSheet>

      {openImage && (
        <ImageLightbox src={openImage} alt={title} open onClose={() => setOpenImage(null)} />
      )}
    </article>
  )
}
