// The main app: a top bar + which page to show based on the URL hash.
import { useEffect, useState } from 'react'
import { api, clearAuth, getUser } from './api'
import Home from './Home'
import Posts from './Posts'
import PostDetail from './PostDetail'
import PostForm from './PostForm'
import AuthForm from './AuthForm'

// Re-render whenever the part of the URL after "#" changes (e.g. "#/posts").
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash
}

export default function App() {
  const hash = useHashRoute()
  // The logged-in user (or null) — read from localStorage.
  const [user, setUser] = useState(getUser())

  // Split e.g. "#/posts/3/edit" into ["posts", "3", "edit"] to figure out the page.
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const top = parts[0] || ''

  // Logout: forget auth state, go home, and tell the API to revoke the token.
  function handleLogout() {
    clearAuth()
    setUser(null)
    window.location.hash = '#/'
    api('/logout', { method: 'POST' }).catch(() => {})
  }

  // Called after login/register so the top bar shows the new user right away.
  function handleAuthChange() {
    setUser(getUser())
  }

  // Decide which component to render for the current URL.
  let content
  if (top === '' || top === 'home') {
    content = <Home />
  } else if (top === 'posts') {
    if (parts[1] === 'new') {
      content = <PostForm />                      // creating a new post
    } else if (parts[2] === 'edit') {
      content = <PostForm postId={parts[1]} />    // editing an existing post
    } else if (parts.length === 2) {
      content = <PostDetail postId={parts[1]} />  // viewing one post
    } else {
      content = <Posts />                         // the list of all posts
    }
  } else if (top === 'login') {
    content = <AuthForm mode="login" onSuccess={handleAuthChange} />
  } else if (top === 'register') {
    content = <AuthForm mode="register" onSuccess={handleAuthChange} />
  } else {
    // Unknown route -> simple 404.
    content = (
      <div className="empty-state">
        <h2 style={{ fontSize: '2rem', color: 'var(--text)' }}>404</h2>
        <p>Page not found.</p>
        <a href="#/" className="btn btn-primary mt-20">Go Home</a>
      </div>
    )
  }

  return (
    <>
      {/* Top navigation bar. Links are plain <a href="#/..."> so the hash router picks them up. */}
      <header className="navbar">
        <div className="nav-inner">
          <a href="#/" className="brand">Laravel Blog</a>
          <nav className="nav-links">
            <a href="#/" className="nav-link">Home</a>
            <a href="#/posts" className="nav-link">Posts</a>
            {user ? (
              // Logged in: show name + logout button.
              <>
                <span className="nav-link">Hi, {user.name}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              // Not logged in: show login / register links.
              <>
                <a href="#/login" className="nav-link">Login</a>
                <a href="#/register" className="btn btn-primary btn-sm">Register</a>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Below the bar: the page chosen above. */}
      <main className="container">{content}</main>
    </>
  )
}