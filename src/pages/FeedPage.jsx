import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFeed } from '../features/feed/useFeed'
import { PostCard } from '../components/posts/PostCard'
import { LanguageToggle } from '../components/ui/LanguageToggle'
import { Skeleton } from '../components/ui/Skeleton'

function PostCardSkeleton() {
  return (
    <div className="py-4 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export default function FeedPage() {
  const { posts, loading, error, refetch } = useFeed()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-brand">mbeat</h1>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/post/new"
            className="text-sm border rounded px-3 py-2 font-medium hover:bg-gray-50"
          >
            {t('feed.newPost')}
          </Link>
        </div>
      </div>

      {loading && (
        <div className="divide-y divide-gray-100 mt-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-red-600">{t('feed.loadError')}</p>
          <button
            type="button"
            onClick={refetch}
            className="border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-500">{t('feed.empty')}</p>
          <Link
            to="/post/new"
            className="inline-block border rounded px-4 py-2 font-medium hover:bg-gray-50"
          >
            {t('feed.emptyCta')}
          </Link>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="divide-y divide-gray-100 mt-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
