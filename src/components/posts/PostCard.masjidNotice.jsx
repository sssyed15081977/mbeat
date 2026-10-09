import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRelativeTime } from '../../lib/relativeTime'
import { noticeTitle } from '../../features/masjidNotice/masjidNoticeSchema'

// A masjid notice in a list (masjid page Notice board, Feed): kind, masjid,
// when, title, photo and the start of the text (AC11). No reactions or counts
// (AC16). `from` is where the detail page's back button returns to
// (spec 4.4); defaults to the current page.
export function MasjidNoticeCard({ post, from }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const notice = post.masjid_notice

  return (
    <Link
      to={`/post/${post.id}`}
      state={{ from: from ?? location.pathname }}
      className="block py-4 space-y-2 hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex items-baseline justify-between gap-2 text-xs text-gray-500">
        <span className="min-w-0 truncate">
          <span className="uppercase tracking-wide font-medium text-brand">
            {t(`masjidNotice.kinds.${notice.kind}`)}
          </span>
          {post.entities?.name && <span> · {post.entities.name}</span>}
        </span>
        <time dateTime={post.created_at} className="flex-none">
          {formatRelativeTime(post.created_at, i18n.language)}
        </time>
      </div>
      <h2 dir="auto" className="font-semibold">
        {noticeTitle(post, t)}
      </h2>
      {notice.photo_url && (
        <img src={notice.photo_url} alt="" loading="lazy" className="w-full max-h-72 object-cover rounded-lg" />
      )}
      {post.description && (
        <p dir="auto" className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">
          {post.description}
        </p>
      )}
    </Link>
  )
}
