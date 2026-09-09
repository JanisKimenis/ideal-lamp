// Login / Register form. The mode prop decides which action to perform.
import { useState } from 'react'
import { api, setAuth } from './api'

export default function AuthForm({ mode, onSuccess }) {
  const isLogin = mode === 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  // Submit the form to the API. On success, save auth and go to the posts page.
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api(isLogin ? '/login' : '/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      // Store the token + user, then tell App to refresh its "logged in" state.
      setAuth(data.token, data.user)
      if (onSuccess) onSuccess()
      window.location.hash = '#/posts'
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">{isLogin ? 'Log In' : 'Create Account'}</h2>
      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Name field: only shown on the register form (login only needs email + password). */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  maxLength="255"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">{isLogin ? 'Log In' : 'Register'}</button>
          </form>
        </div>
      </div>
      {/* Switch between the login and register pages. */}
      <p className="text-center mt-20">
        {isLogin ? (
          <>Don't have an account? <a href="#/register" style={{ color: 'var(--primary)' }}>Register</a></>
        ) : (
          <>Already have an account? <a href="#/login" style={{ color: 'var(--primary)' }}>Log in</a></>
        )}
      </p>
    </div>
  )
}