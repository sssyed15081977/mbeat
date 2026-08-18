import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Generic shell rendering the fields every post type shares (posts table
// columns only), plus a single optional thumbnail. Full type-specific
// rendering (PostCard.<type>.jsx, pulling in the rest of an extension
// table's fields like death_announcement's janazah info) is deferred until a
// second type needs its own layout — premature to build the dispatch
// mechanism for one post type. Full details live behind PostDetailPage,
// which does the per-type extension-table join.
//
// The thumbnail is the one piece of extension-table data every post type is
// expected to eventually carry (a representative photo), so it's looked up
// here directly rather than waiting for that dispatch mechanism. Add a case
// per type as photos land elsewhere.
function getThumbnailUrl(post) {
  if (post.type === 'death_announcement') return post.death_announcement?.photo_url
  return null
}

export function PostCard({ post }) {
  const { t } = useTranslation()
  const thumbnailUrl = getThumbnailUrl(post)

  return (
    <Link to={`/post/${post.id}`} className="block py-4 space-y-1 hover:bg-gray-50 active:bg-gray-100">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="uppercase tracking-wide">{t(`postType.${post.type}`)}</span>
        <span>{t(`moderationStatus.${post.moderation_status}`)}</span>
      </div>
      <h2 className="font-semibold">{post.title}</h2>
      {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-auto rounded-lg" />}
      {post.description && <p className="text-sm text-gray-600">{post.description}</p>}
    </Link>
  )
}
