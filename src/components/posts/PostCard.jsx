import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Generic shell rendering the fields every post type shares (posts table
// columns only). Type-specific rendering (PostCard.<type>.jsx, pulling in
// extension-table fields like death_announcement's janazah info) is deferred
// until feedApi actually joins that data in — premature to build the dispatch
// mechanism for a single post type. Full details live behind PostDetailPage,
// which does the per-type extension-table join.
export function PostCard({ post }) {
  const { t } = useTranslation()

  return (
    <Link to={`/post/${post.id}`} className="block py-4 space-y-1 hover:bg-gray-50 active:bg-gray-100">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="uppercase tracking-wide">{t(`postType.${post.type}`)}</span>
        <span>{t(`moderationStatus.${post.moderation_status}`)}</span>
      </div>
      <h2 className="font-semibold">{post.title}</h2>
      {post.description && <p className="text-sm text-gray-600">{post.description}</p>}
    </Link>
  )
}
