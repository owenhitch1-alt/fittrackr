import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { runMigrations } from './data/migrations.js'

// Apply stored theme before React renders to prevent a flash of wrong theme
;(function () {
  try {
    const raw = localStorage.getItem('fittrackr_settings')
    const theme = (raw ? JSON.parse(raw) : {}).themeMode ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch {}
})()

// Backfill ids and timestamps on older records before anything reads them.
runMigrations()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
