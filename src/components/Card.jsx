export default function Card({ children, onClick, style: extra }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'background 0.15s ease' : undefined,
        ...extra,
      }}
      onMouseEnter={onClick ? e => (e.currentTarget.style.background = 'var(--color-surface-2)') : undefined}
      onMouseLeave={onClick ? e => (e.currentTarget.style.background = 'var(--color-surface)') : undefined}
    >
      {children}
    </div>
  )
}
