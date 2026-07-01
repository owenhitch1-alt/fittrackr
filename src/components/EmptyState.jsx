export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 32px',
        gap: '12px',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <Icon size={28} color="var(--color-text-secondary)" strokeWidth={1.5} />
        </div>
      )}
      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-white)',
          lineHeight: 1.4,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '260px',
          }}
        >
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: '8px', width: '100%', maxWidth: '260px' }}>{action}</div>}
    </div>
  )
}
