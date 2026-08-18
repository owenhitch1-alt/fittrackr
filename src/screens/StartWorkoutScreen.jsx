import { useNavigate } from 'react-router-dom'
import { Zap, Dumbbell, Package, BookOpen, ChevronRight } from 'lucide-react'
import Header from '../components/Header.jsx'

function StartOption({ Icon, label, description, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: accent ? 'var(--color-accent)' : 'var(--color-surface)',
        border: accent ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 18px',
        textAlign: 'left',
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: accent ? 'rgba(255,255,255,0.18)' : 'rgba(255,59,48,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon
          size={22}
          color={accent ? 'var(--color-on-accent)' : 'var(--color-accent)'}
          strokeWidth={accent ? 2.5 : 2}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '16px',
          fontWeight: 800,
          fontFamily: 'var(--font)',
          color: accent ? 'var(--color-on-accent)' : 'var(--color-white)',
          letterSpacing: '-0.2px',
          marginBottom: '3px',
        }}>
          {label}
        </p>
        {description && (
          <p style={{
            fontSize: '12px',
            color: accent ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary)',
            fontFamily: 'var(--font)',
            lineHeight: 1.4,
          }}>
            {description}
          </p>
        )}
      </div>

      <ChevronRight
        size={20}
        color={accent ? 'rgba(255,255,255,0.70)' : 'var(--color-text-secondary)'}
        style={{ flexShrink: 0 }}
      />
    </button>
  )
}

export default function StartWorkoutScreen() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Start Workout" onBack={() => navigate(-1)} />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>

        <StartOption
          Icon={Zap}
          label="Quick Start"
          description="Jump in and add exercises as you go"
          onClick={() => navigate('/active-workout')}
          accent
        />

        <StartOption
          Icon={Dumbbell}
          label="My Workouts"
          description="Choose from your saved workout templates"
          onClick={() => navigate('/workouts')}
        />

        <StartOption
          Icon={Package}
          label="Purchased Programmes"
          description="Start a session from your owned programmes"
          onClick={() => navigate('/marketplace/purchased')}
        />

        <StartOption
          Icon={BookOpen}
          label="Saved Programmes"
          description="Browse and start from your bookmarked programmes"
          onClick={() => navigate('/marketplace/saved')}
        />
      </div>
    </div>
  )
}
