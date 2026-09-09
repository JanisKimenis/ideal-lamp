// This file is the entry point. Vite loads it for us.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

// Put the whole app on the page, inside the empty <div id="root"> in index.html.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)