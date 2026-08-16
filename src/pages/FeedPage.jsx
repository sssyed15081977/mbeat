import { Link } from 'react-router-dom'
import { useFeed } from '../features/feed/useFeed'
import { PostCard } from '../components/posts/PostCard'

export default function FeedPage() {
  const { posts, loading, error } = useFeed()

  if (loading) return null
  if (error) return <p className="text-red-600 p-4">{error}</p>

  return (
    <div className="min-h-screen p-4 space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-600">mbeat</h1>
        <Link to="/post/new" className="text-sm border rounded px-3 py-1.5 font-medium hover:bg-gray-50">
          + New
        </Link>
      </div>
      {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
