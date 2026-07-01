import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Clock, ShoppingBag, Settings, X, RotateCcw, Users } from 'lucide-react'

function getMenuItems(appMode) {
  return [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/workouts', label: 'Workouts', Icon: Dumbbell },
    { path: '/history', label: 'Workout History', Icon: Clock },
    ...(appMode === 'trainer'
      ? [{ path: '/clients', label: 'Clients', Icon: Users }]
      : [{ path: '/marketplace', label: 'Marketplace', Icon: ShoppingBag }]),
    { path: '/settings', label: 'Settings', Icon: Settings },
  ]
}

export default function MenuDrawer({ open, onClose, onResetData, appMode = 'personal', onAppModeChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState({ visible: false, message: '' })

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  const handleModeToggle = (mode) => {
    if (mode === appMode) return
    onAppModeChange?.(mode)
    const message = mode === 'trainer' ? 'PT view enabled' : 'Personal view enabled'
    setToast({ visible: true, message })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1000)
  }

  return (
    <>
      {/* ── Toast ── */}
      {toast.visible && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 500,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            color: 'var(--color-white)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--color-surface)',
          zIndex: 101,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Drawer header — wordmark + mode toggle + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '18px 16px 14px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Wordmark */}
          <span
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--color-white)',
              letterSpacing: '-0.3px',
              flexShrink: 0,
            }}
          >
            FitTrackr
          </span>

          {/* Mode toggle — [Personal] [PT] */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            {[
              { value: 'personal', label: 'Personal' },
              { value: 'trainer', label: 'PT' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleModeToggle(value)}
                aria-pressed={appMode === value}
                style={{
                  flex: 1,
                  background: appMode === value ? 'var(--color-accent)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: appMode === value ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  padding: '5px 4px',
                  cursor: 'pointer',
                  letterSpacing: '0.4px',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              flexShrink: 0,
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {getMenuItems(appMode).map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                style={{
                  width: '100%',
                  background: active ? 'rgba(255,59,48,0.12)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  color: active ? 'var(--color-accent)' : 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'var(--font)',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Reset demo data */}
        <div
          style={{
            padding: '16px 20px 32px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => {
              onResetData()
              onClose()
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 0',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'var(--font)',
              textAlign: 'left',
            }}
          >
            <RotateCcw size={18} strokeWidth={1.8} />
            Reset Demo Data
          </button>
        </div>
      </div>
    </>
  )
}
