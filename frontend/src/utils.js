// Tiny helpers for formatting stuff in the UI.

// Turn a date string into something readable like "Jan 5, 2026".
export function formatDate(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Get the status name for a post (published, draft, ...). Defaults to "draft".
export function postStatusName(post) {
  if (post.post_status && post.post_status.name) return post.post_status.name
  return 'draft'
}

// The CSS class used to color the status badge.
export function statusClass(name) {
  const map = {
    published: 'published',
    draft: 'draft',
    scheduled: 'scheduled',
    review: 'review',
    archived: 'archived',
    deleted: 'deleted',
  }
  return 'badge badge-' + (map[name] || 'draft')
}

// Cut a long post body down to `max` characters for the list view.
export function truncateBody(text, max) {
  if (!text) return ''
  return text.length > max ? text.substring(0, max) + '...' : text
}