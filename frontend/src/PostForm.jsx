// Create a new post OR edit an existing one (which one depends on whether `postId` is set).
import { useEffect, useState } from 'react'
import { api, getUser } from './api'

export default function PostForm({ postId }) {
  const isEdit = Boolean(postId)
  const [form, setForm] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(isEdit) // only needs "loading" when editing (we must fetch the post first)
  const [error, setError] = useState('')

  // When editing: load the existing post. Only the author may edit it.
  useEffect(() => {
    if (!isEdit) return
    api('/posts/' + postId)
      .then((post) => {
        const user = getUser()
        if (user && post.user_id === user.id) {
          setForm({ title: post.title, body: post.body })
        } else {
          setError('You do not have permission to edit this post.')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [postId, isEdit])

  // Save the post: POST for new, PUT for edit. Then go to the post's page.
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const post = await api('/posts' + (isEdit ? '/' + postId : ''), {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      window.location.hash = '#/posts/' + post.id
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card-header"><div className="card-title">{isEdit ? 'Edit Post' : 'Create New Post'}</div></div>
      <div className="card-body">
        {error && <div className="alert alert-error">{error}</div>}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <div>Loading...</div>
          </div>
        )}
        {!loading && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                maxLength="255"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Body</label>
              <textarea
                id="body"
                name="body"
                required
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">{isEdit ? 'Save Changes' : 'Create Post'}</button>
          </form>
        )}
      </div>
    </div>
  )
}