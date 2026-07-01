import { Menu, ChevronLeft } from 'lucide-react'

// Pass onMenuOpen for drawer screens; pass onBack for sub-screens (back arrow replaces menu icon).
export default function Header({ title, onMenuOpen, onBack, children }) {
  const isBrand = title === 'FitTrackr'

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <button
        onClick={onBack ?? onMenuOpen}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-white)',
          cursor: 'pointer',
          padding: '8px',
          marginLeft: '-8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
        aria-label={onBack ? 'Go back' : 'Open menu'}
      >
        {onBack ? <ChevronLeft size={24} /> : <Menu size={22} />}
      </button>

      <span
        style={{
          flex: 1,
          fontSize: isBrand ? '20px' : '18px',
          fontWeight: isBrand ? 800 : 700,
          letterSpacing: isBrand ? '-0.3px' : '-0.2px',
          color: 'var(--color-white)',
        }}
      >
        {title}
      </span>

      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="FitTrackr"
        style={{
          height: '30px',
          width: '30px',
          objectFit: 'cover',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />

      {children}
    </header>
  )
}
