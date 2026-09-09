// A single post card used in the Home and Posts lists.
import { getUser } from '../api'
import { formatDate, postStatusName, statusClass, truncateBody } from '../utils'

export default function PostCard({ post, onDelete }) {
  const status = postStatusName(post)
  const user = getUser()
  // Only the author of a post can edit or delete it.
  const canModify = user && post.user_id === user.id

  return (
    <div className="card">
      <div className="post">
        {/* Author, date and status badge. */}
        <div className="post-meta">
          <span>By {post.user ? post.user.name : 'Anonymous'}</span>
          <span>{formatDate(post.created_at)}</span>
          <span className={statusClass(status)}>{status}</span>
        </div>
        <h3 className="post-title">
          {/* Clicking the title goes to the post detail page. */}
          <a href={`#/posts/${post.id}`}>{post.title}</a>
        </h3>
        {/* Shortened body text so cards stay compact. */}
        <p className="post-body">{truncateBody(post.body, 200)}</p>
        <div className="post-actions">
          <a href={`#/posts/${post.id}`} className="btn btn-outline btn-sm">View</a>
          {canModify && (
            <>
              <a href={`#/posts/${post.id}/edit`} className="btn btn-outline btn-sm">Edit</a>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(post.id)}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}