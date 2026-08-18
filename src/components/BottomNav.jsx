import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, Clock, ShoppingBag, Users } from 'lucide-react'

const PERSONAL_TABS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/workouts', label: 'Workouts', Icon: Dumbbell },
  { path: '/history', label: 'History', Icon: Clock },
  { path: '/marketplace', label: 'Marketplace', Icon: ShoppingBag },
]

const TRAINER_TABS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/workouts', label: 'Workouts', Icon: Dumbbell },
  { path: '/history', label: 'History', Icon: Clock },
  { path: '/clients', label: 'Clients', Icon: Users },
]

export default function BottomNav({ appMode = 'personal' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const TABS = appMode === 'trainer' ? TRAINER_TABS : PERSONAL_TABS

  return (
    <nav
      style={{
        height: 'var(--nav-height)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
      }}
    >
      {TABS.map(({ path, label, Icon }) => {
        const active = path === '/'
          ? location.pathname === '/'
          : location.pathname === path || location.pathname.startsWith(path + '/')
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              transition: 'color 0.15s ease',
              padding: '8px 0 10px',
            }}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                fontFamily: 'var(--font)',
                letterSpacing: '0.3px',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
