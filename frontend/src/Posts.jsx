// All posts page: shows every post and lets you search/filter them.
import { useEffect, useState } from 'react'
import { api, getUser } from './api'
import PostCard from './components/PostCard'

export default function Posts() {
  const [posts, setPosts] = useState(null) // null = not loaded yet
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const user = getUser()

  // Load all posts from the API once when this page opens.
  useEffect(() => {
    api('/posts')
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message))
  }, [])

  // Delete a post, then remove it from the list on screen.
  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return
    try {
      await api('/posts/' + id, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      window.alert(err.message)
    }
  }

  // Keep only posts whose title or body contains the search text.
  const filtered = posts
    ? posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.body.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <>
      {/* Header with a "New Post" button (only for logged-in users) and a search box. */}
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: '1.5rem' }}>All Posts</h2>
            {user && <a href="#/posts/new" className="btn btn-primary">+ New Post</a>}
          </div>
          <div className="mt-20">
            <input
              type="search"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!posts && !error && <div className="loading"><div className="spinner"></div><div>Loading...</div></div>}
      {posts && filtered.length === 0 && (
        <div className="empty-state"><p>No posts found.</p></div>
      )}
      {posts && filtered.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </>
  )
}