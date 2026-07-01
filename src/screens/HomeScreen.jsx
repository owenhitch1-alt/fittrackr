import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Dumbbell, Users } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { getUserProgress } from '../data/storage.js'
import { calculateLevelFromXp } from '../utils/xp.js'

function sessionSubtitle(session) {
  const exerciseCount = session.exercises?.length ?? 0
  const setCount = session.exercises?.reduce((n, e) => n + (e.sets?.filter(s => s.completed).length ?? 0), 0) ?? 0
  const mins = session.durationSeconds ? Math.round(session.durationSeconds / 60) : null
  const parts = []
  if (mins) parts.push(`${mins} mins`)
  parts.push(`${exerciseCount} Exercise${exerciseCount !== 1 ? 's' : ''}`)
  parts.push(`${setCount} Set${setCount !== 1 ? 's' : ''}`)
  return parts.join(' · ')
}

export default function HomeScreen({ onMenuOpen, recentSession, appMode = 'personal', firstName = '' }) {
  const navigate = useNavigate()
  const [showNameModal, setShowNameModal] = useState(false)
  const [quickStartName, setQuickStartName] = useState('')

  // Read level info fresh on each mount (updated after workout saves)
  const levelInfo = calculateLevelFromXp(getUserProgress().totalXp)

  const modeLabel = appMode === 'trainer' ? 'Personal Trainer Mode' : 'Personal Mode'

  const openNameModal = () => {
    setQuickStartName('')
    setShowNameModal(true)
  }

  const startQuickWorkout = (name) => {
    navigate('/active-workout', { state: { workoutName: name.trim() || 'Quick Start Workout' } })
    setShowNameModal(false)
    setQuickStartName('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* ── Quick Start naming modal ── */}
      {showNameModal && (
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
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--color-white)',
                marginBottom: '6px',
              }}
            >
              Name your workout
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '18px',
                lineHeight: 1.5,
              }}
            >
              Optional — leave blank to use "Quick Start Workout".
            </p>
            <input
              type="text"
              value={quickStartName}
              onChange={e => setQuickStartName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startQuickWorkout(quickStartName) }}
              placeholder="e.g. Push Day, Client Session, Upper Body"
              style={{
                width: '100%',
                background: 'var(--color-bg)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-white)',
                fontSize: '15px',
                fontWeight: 500,
                fontFamily: 'var(--font)',
                padding: '11px 14px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => startQuickWorkout(quickStartName)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                Start Workout
              </button>
              <button
                onClick={() => startQuickWorkout('')}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-white)',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <Header title="FitTrackr" onMenuOpen={onMenuOpen} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Hero */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <h1
              style={{
                fontSize: '30px',
                fontWeight: 900,
                color: 'var(--color-white)',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}
            >
              {firstName ? `Welcome back, ${firstName}` : 'Ready to train?'}
            </h1>
          </div>

          {/* Mode badge */}
          <p
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              color: appMode === 'trainer' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              background: appMode === 'trainer' ? 'rgba(255,59,48,0.10)' : 'var(--color-surface)',
              border: `1px solid ${appMode === 'trainer' ? 'rgba(255,59,48,0.25)' : 'var(--color-border)'}`,
              borderRadius: '20px',
              padding: '4px 12px',
              marginBottom: '24px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {modeLabel}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button variant="primary" onClick={openNameModal}>
              Quick Start
            </Button>
            <Button variant="secondary" onClick={() => navigate('/workouts')}>
              Start Workout
            </Button>
            <Button variant="tertiary" onClick={() => navigate('/workouts/create')}>
              Create Workout
            </Button>
            {appMode === 'trainer' && (
              <Button variant="secondary" onClick={() => navigate('/clients')}>
                <Users size={16} />
                Manage Clients
              </Button>
            )}
          </div>
        </section>

        {/* Level progress card — Personal Mode only */}
        {appMode === 'personal' && <section>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font)',
                  letterSpacing: '-0.2px',
                }}
              >
                Level {levelInfo.level}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font)',
                  fontWeight: 600,
                }}
              >
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
              </p>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '6px',
                background: 'var(--color-border)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${levelInfo.progressPercent}%`,
                  height: '100%',
                  background: 'var(--color-accent)',
                  borderRadius: '3px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <p
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
                marginTop: '8px',
              }}
            >
              {levelInfo.nextLevelXp - levelInfo.currentLevelXp} XP to Level {levelInfo.level + 1} · Keep training to level up.
            </p>
          </div>
        </section>}

        {/* Recent workout */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Recent Workout
            </h2>
            {recentSession && (
              <button
                onClick={() => navigate('/history')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                View History
              </button>
            )}
          </div>

          {recentSession ? (
            <Card onClick={() => navigate(`/history/${recentSession.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(255,59,48,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Dumbbell size={20} color="var(--color-accent)" strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', marginBottom: '2px' }}>
                    {recentSession.workoutName}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {sessionSubtitle(recentSession)}
                  </p>
                </div>
                <ChevronRight size={18} color="var(--color-text-secondary)" />
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={Dumbbell}
                title="No workouts completed yet."
                subtitle="Create your first workout to start tracking."
                action={
                  <Button variant="primary" onClick={() => navigate('/workouts')}>
                    Create Workout
                  </Button>
                }
              />
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
