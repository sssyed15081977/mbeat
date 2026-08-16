// Generic shell rendering the fields every post type shares (posts table
// columns only). Type-specific rendering (PostCard.<type>.jsx, pulling in
// extension-table fields like death_announcement's janazah info) is deferred
// until feedApi actually joins that data in — premature to build the dispatch
// mechanism for a single post type.
export function PostCard({ post }) {
  return (
    <div className="border rounded p-4 space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="uppercase tracking-wide">{post.type.replaceAll('_', ' ')}</span>
        <span>{post.moderation_status}</span>
      </div>
      <h2 className="font-semibold">{post.title}</h2>
      {post.description && <p className="text-sm text-gray-600">{post.description}</p>}
    </div>
  )
}
