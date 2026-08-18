import { Menu, ChevronLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUserProgress } from '../data/storage.js'
import { calculateLevelFromXp } from '../utils/xp.js'
import { features } from '../config/features.js'

function LevelBadge({ level }) {
  return (
    <div
      aria-label={`Current level ${level}`}
      role="img"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,59,48,0.10)',
        border: '1.5px solid rgba(255,59,48,0.28)',
        borderRadius: '8px',
        padding: '3px 7px 4px',
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
        minWidth: '34px',
      }}
    >
      <span style={{
        fontSize: '8px',
        fontWeight: 800,
        color: 'var(--color-accent)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font)',
        marginBottom: '1px',
      }}>
        LVL
      </span>
      <span style={{
        fontSize: '14px',
        fontWeight: 900,
        color: 'var(--color-accent)',
        fontFamily: 'var(--font)',
        letterSpacing: '-0.5px',
        lineHeight: 1.1,
      }}>
        {level}
      </span>
    </div>
  )
}

// Pass onMenuOpen for drawer screens; pass onBack for sub-screens (back arrow replaces menu icon).
export default function Header({ title, onMenuOpen, onBack, children }) {
  const { level } = calculateLevelFromXp(getUserProgress().totalXp)
  const isBrand = title === 'FitTrackr'
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogoPress = () => {
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

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

      {children}

      {features.levellingSystem && (
        <button
          onClick={() => navigate('/stats')}
          aria-label={`Level ${level} — open stats`}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <LevelBadge level={level} />
        </button>
      )}

      <button
        onClick={handleLogoPress}
        aria-label="Go to Home"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: location.pathname === '/' ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="FitTrackr"
          style={{
            height: '30px',
            width: '30px',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
          }}
        />
      </button>
    </header>
  )
}
