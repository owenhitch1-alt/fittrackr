import { Lock } from 'lucide-react'

export default function LiteModal({ visible, heading, body, onClose }) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255,59,48,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Lock size={22} color="var(--color-accent)" />
        </div>

        <h3
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--color-white)',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
        >
          {heading}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.65,
            marginBottom: '24px',
          }}
        >
          {body}
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            letterSpacing: '0.4px',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
