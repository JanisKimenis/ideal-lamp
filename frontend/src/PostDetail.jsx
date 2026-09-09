// One post + its comments. Used at "#/posts/:id".
import { useEffect, useState } from 'react'
import { api, getUser } from './api'
import { formatDate, postStatusName, statusClass } from './utils'

export default function PostDetail({ postId }) {
  const [post, setPost] = useState(null)      // null = not loaded yet
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')
  const user = getUser()

  // Load the post and its comments when the page opens.
  useEffect(() => {
    api('/posts/' + postId)
      .then(setPost)
      .catch((err) => setError(err.message))
    api('/posts/' + postId + '/comments')
      .then(setComments)
      .catch(() => {})
  }, [postId])

  if (error) {
    return (
      <>
        <div className="alert alert-error">{error}</div>
        <a href="#/posts" className="btn btn-outline">Back</a>
      </>
    )
  }

  if (!post) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div>Loading...</div>
      </div>
    )
  }

  const status = postStatusName(post)
  const canModify = user && post.user_id === user.id

  // Delete the post, then redirect to the posts list.
  async function handleDeletePost() {
    if (!window.confirm('Delete this post?')) return
    try {
      await api('/posts/' + postId, { method: 'DELETE' })
      window.location.hash = '#/posts'
    } catch (err) {
      window.alert(err.message)
    }
  }

  // Send a new comment to the API and add it to the list.
  async function handleAddComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const created = await api('/posts/' + postId + '/comments', {
        method: 'POST',
        body: JSON.stringify({ content: commentText }),
      })
      // Add the new comment (with its author) unless it's somehow already there.
      setComments((prev) => {
        const withUser = { ...created, user: user }
        const exists = prev.some((c) => c.id === created.id)
        return exists ? prev : [...prev, withUser]
      })
      setCommentText('')
    } catch (err) {
      window.alert(err.message)
    }
  }

  // Delete a comment and remove it from the list.
  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api('/posts/' + postId + '/comments/' + commentId, { method: 'DELETE' })
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      window.alert(err.message)
    }
  }

  // Ask for new text (simple prompt) and update the comment via the API.
  async function handleEditComment(commentId, content) {
    const newContent = window.prompt('Edit comment:', content)
    if (!newContent) return
    try {
      const updated = await api('/posts/' + postId + '/comments/' + commentId, {
        method: 'PUT',
        body: JSON.stringify({ content: newContent }),
      })
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <>
      {/* Simple link back to the list. */}
      <a href="#/posts" className="mb-20" style={{ display: 'inline-block', color: 'var(--primary)', textDecoration: 'none' }}>
        &larr; Back to posts
      </a>

      {/* The post itself: meta, title, body, edit/delete for the author. */}
      <div className="card">
        <div className="card-body" style={{ padding: 32 }}>
          <div className="post-meta">
            <span>By {post.user ? post.user.name : 'Anonymous'}</span>
            <span>{formatDate(post.created_at)}</span>
            <span className={statusClass(status)}>{status}</span>
          </div>
          <h1 style={{ marginBottom: 16 }}>{post.title}</h1>
          <p className="post-body" style={{ fontSize: '1.05rem' }}>{post.body}</p>
          {canModify && (
            <div className="post-actions">
              <a href={`#/posts/${post.id}/edit`} className="btn btn-outline btn-sm">Edit</a>
              <button className="btn btn-danger btn-sm" onClick={handleDeletePost}>Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Comments block: a form for logged-in users, otherwise a login hint. */}
      <div className="card">
        <div className="card-header"><div className="card-title">Comments ({comments.length})</div></div>
        {user ? (
          <div className="comment-form">
            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Post Comment</button>
            </form>
          </div>
        ) : (
          <div className="comment-form">
            <p className="text-center"><a href="#/login">Log in</a> to comment.</p>
          </div>
        )}
        {comments.length === 0 && (
          <p className="comment" style={{ color: 'var(--muted)' }}>No comments yet.</p>
        )}
        {comments.map((c) => (
          <div className="comment" key={c.id}>
            <p className="comment-body">{c.content}</p>
            <p className="comment-meta">
              <span>{c.user ? c.user.name : 'Anonymous'} &middot; {formatDate(c.created_at)}</span>
              {/* Only the comment author can edit/delete their own comment. */}
              {user && c.user_id === user.id && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEditComment(c.id, c.content)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}