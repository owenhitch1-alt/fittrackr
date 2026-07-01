export default function Button({ children, variant = 'primary', onClick, fullWidth = true, style: extra }) {
  const base = {
    width: fullWidth ? '100%' : 'auto',
    padding: '16px 24px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font)',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease, background 0.15s ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }

  const variants = {
    primary: {
      background: 'var(--color-accent)',
      color: '#FFFFFF',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-white)',
      border: '2px solid var(--color-white)',
    },
    tertiary: {
      background: 'var(--color-surface)',
      color: 'var(--color-white)',
      border: '1px solid var(--color-border)',
    },
    danger: {
      background: 'transparent',
      color: 'var(--color-accent)',
      border: '2px solid var(--color-accent)',
    },
  }

  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...extra }}
      onMouseDown={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseUp={e => (e.currentTarget.style.opacity = '1')}
      onTouchStart={e => (e.currentTarget.style.opacity = '0.8')}
      onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  )
}
