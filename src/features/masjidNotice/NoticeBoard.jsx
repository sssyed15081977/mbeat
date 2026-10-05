import { useTranslation } from 'react-i18next'
import { Skeleton } from '../../components/ui/Skeleton'
import { MasjidNoticeCard } from '../../components/posts/PostCard.masjidNotice'
import { useMasjidNotices } from './useMasjidNotices'

// Anchor the Prayer Times tab's "Notice board →" link scrolls to (AC8).
export const NOTICE_BOARD_ANCHOR = 'notices'

function NoticeCardSkeleton() {
  return (
    <div className="py-4 space-y-2">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

// The masjid page's Notice board: all live notices, newest first (AC9).
// Below the Jamaat board, so loading here never shifts the board (AC28).
export function NoticeBoard({ masjidId }) {
  const { t } = useTranslation()
  const { notices, loading, error, refetch } = useMasjidNotices(masjidId)
  const from = `/masjid/${masjidId}#${NOTICE_BOARD_ANCHOR}`

  return (
    <section id={NOTICE_BOARD_ANCHOR} aria-labelledby="notice-board-heading" className="scroll-mt-4">
      <h2 id="notice-board-heading" className="text-sm font-semibold text-gray-500 uppercase">
        {t('masjidNotice.noticeBoard')}
      </h2>

      {loading && (
        <div className="divide-y divide-gray-100">
          <NoticeCardSkeleton />
          <NoticeCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <div className="py-4 text-center space-y-3" role="alert">
          <p className="text-red-600">
            {navigator.onLine ? t('masjidNotice.loadError') : t('prayerTimes.offline')}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* One muted line, not hidden, so residents learn the section exists (4.2). */}
      {!loading && !error && notices.length === 0 && (
        <p className="py-3 text-sm text-gray-500">{t('masjidNotice.empty')}</p>
      )}

      {!loading && !error && notices.length > 0 && (
        <div className="divide-y divide-gray-100">
          {notices.map((post) => (
            <MasjidNoticeCard key={post.id} post={post} from={from} />
          ))}
        </div>
      )}
    </section>
  )
}
