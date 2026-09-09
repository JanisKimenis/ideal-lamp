// Homepage: a hero section + the latest published posts.
import { useEffect, useState } from 'react'
import { api, getUser } from './api'
import PostCard from './components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState(null) // null = not loaded yet
  const [error, setError] = useState('')
  const user = getUser()

  // Fetch all posts from the API once when this page opens.
  useEffect(() => {
    api('/posts')
      .then((data) => {
        // Only show published posts (a post with no status counts as published).
        setPosts(data.filter((p) => !p.post_status || p.post_status.name === 'published'))
      })
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

  return (
    <>
      <div className="hero">
        <h1>Laravel Blog</h1>
        <p>A simple blog built on Laravel REST API with a React frontend.</p>
        <div>
          <a href="#/posts" className="btn btn-primary">Browse Posts</a>
          {!user && (
            <a href="#/register" className="btn btn-outline mt-20">Create Account</a>
          )}
        </div>
      </div>
      <h2 className="mb-20">Latest Posts</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {!posts && !error && <div className="loading"><div className="spinner"></div><div>Loading...</div></div>}
      {posts && posts.length === 0 && (
        <div className="empty-state"><p>No posts found.</p></div>
      )}
      {posts && posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </>
  )
}