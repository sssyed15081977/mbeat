import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchPostById } from '../features/feed/feedApi'
import { BackButton } from '../components/ui/BackButton'
import { Skeleton } from '../components/ui/Skeleton'
import { DeathAnnouncementDetail } from '../features/deathAnnouncement/DeathAnnouncementDetail'

export default function PostDetailPage() {
  const { id } = useParams()
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

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <BackButton to="/" />

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
        <DeathAnnouncementDetail post={post} />
      )}
    </div>
  )
}
