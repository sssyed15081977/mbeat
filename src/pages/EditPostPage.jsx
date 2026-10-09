import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPostById } from '../features/feed/feedApi'
import { useAuth } from '../features/auth/useAuth'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { DeathAnnouncementForm } from '../features/deathAnnouncement/DeathAnnouncementForm'
import { MasjidNoticeForm } from '../features/masjidNotice/MasjidNoticeForm'

// "You can only edit your own …" message per type.
const NOT_AUTHORIZED = {
  death_announcement: 'deathAnnouncementForm.notAuthorized',
  masjid_notice: 'masjidNotice.notAuthorized',
}

// /post/:id/edit for every post type: loads the post and shows its type's
// form, pre-filled. Only the author sees the form; RLS rejects anyone else's
// writes anyway.
export default function EditPostPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
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

  const isAuthor = post && post.author_id === user.id
  const detailPath = `/post/${id}`
  // Replace, so Back from the updated post doesn't return to the form.
  const backToPost = () => navigate(detailPath, { replace: true })

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to={detailPath} />

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
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

      {!loading && !error && post && !isAuthor && (
        <p className="text-gray-500 text-center mt-8">
          {t(NOT_AUTHORIZED[post.type] ?? 'deathAnnouncementForm.notAuthorized')}
        </p>
      )}

      {!loading && !error && isAuthor && post.type === 'death_announcement' && (
        <DeathAnnouncementForm editingPost={post} onSuccess={() => navigate(detailPath)} />
      )}

      {!loading && !error && isAuthor && post.type === 'masjid_notice' && (
        <MasjidNoticeForm masjid={post.entities} editingPost={post} onSuccess={backToPost} />
      )}
    </div>
  )
}
