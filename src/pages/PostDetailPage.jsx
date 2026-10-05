import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { fetchPostById } from '../features/feed/feedApi'
import { useAuth } from '../features/auth/useAuth'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { DeathAnnouncementDetail } from '../features/deathAnnouncement/DeathAnnouncementDetail'
import { MasjidNoticeDetail } from '../features/masjidNotice/MasjidNoticeDetail'
import { NOTICE_BOARD_ANCHOR } from '../features/masjidNotice/NoticeBoard'

// Back goes to wherever the post was opened from (cards pass `state.from`).
// Opened directly (e.g. a WhatsApp link): a notice goes to its masjid's page;
// anything else to the Feed, or for guests (the Feed needs sign-in) to the
// Prayer Times tab.
function backTarget(from, post, session) {
  if (from) return from
  if (post?.type === 'masjid_notice' && post.entity_id) return `/masjid/${post.entity_id}`
  return session ? '/feed' : '/'
}

// Open to guests (masjid-notices.md AC15): RLS already limits them to
// published posts.
export default function PostDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchPostById(id)
      .then((data) => {
        if (!cancelled) setPost(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchPostById(id)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  // Optimistic: reflect the new status immediately, revert if the write fails.
  const handleLifecycleStatusChange = useCallback(
    async (newStatus) => {
      let previousStatus
      setPost((prev) => {
        previousStatus = prev?.lifecycle_status
        return prev ? { ...prev, lifecycle_status: newStatus } : prev
      })

      const { error: updateError } = await supabase
        .from('posts')
        .update({ lifecycle_status: newStatus })
        .eq('id', id)

      if (updateError) {
        setPost((prev) => (prev ? { ...prev, lifecycle_status: previousStatus } : prev))
        throw updateError
      }
    },
    [id],
  )

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to={backTarget(location.state?.from, post, session)} />

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center space-y-3 mt-8">
          <p className="text-red-600">{t('postDetail.loadError')}</p>
          <button
            type="button"
            onClick={retry}
            className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!loading && !error && !post && (
        <p className="text-gray-500 text-center mt-8">{t('postDetail.notFound')}</p>
      )}

      {!loading && !error && post?.type === 'death_announcement' && (
        <DeathAnnouncementDetail post={post} onLifecycleStatusChange={handleLifecycleStatusChange} />
      )}

      {!loading && !error && post?.type === 'masjid_notice' && (
        <MasjidNoticeDetail
          post={post}
          // Back to the masjid's notices; replace so Back doesn't reopen the removed notice (AC21).
          onRemoved={() => navigate(`/masjid/${post.entity_id}#${NOTICE_BOARD_ANCHOR}`, { replace: true })}
        />
      )}
    </div>
  )
}
