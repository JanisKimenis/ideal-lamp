// The base address of the Laravel API.
const API_URL = 'http://localhost:8000/api'

// Our login token and user info, kept in localStorage so they survive a page refresh.
let token = localStorage.getItem('token') || null
let user = JSON.parse(localStorage.getItem('user') || 'null')

// Read the logged-in user.
export function getUser() {
  return user
}

// Save the token + user after login/register.
export function setAuth(t, u) {
  token = t
  user = u
  localStorage.setItem('token', t)
  localStorage.setItem('user', JSON.stringify(u))
}

// Forget the token + user on logout.
export function clearAuth() {
  token = null
  user = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Small helper used everywhere to call the API and get a JSON response (or throw an error).
export async function api(path, options = {}) {
  // Base headers for sending/receiving JSON.
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  // Add the login token if we have one.
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }
  if (options.headers) {
    Object.assign(headers, options.headers)
  }
  const res = await fetch(API_URL + path, {
    ...options,
    headers,
  })
  // Read the response body as JSON (fall back to {} if the body is empty).
  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  // If the server returned an error, turn it into a useful Error message.
  if (!res.ok) {
    const message = extractError(data)
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  return data
}

// Pull a readable message out of a failed API response.
function extractError(data) {
  if (data.message) return data.message
  if (data.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first)) return first[0]
    return first
  }
  return 'Something went wrong'
}