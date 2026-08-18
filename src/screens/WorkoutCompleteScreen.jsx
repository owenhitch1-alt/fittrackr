import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Clock, Dumbbell, LayoutList } from 'lucide-react'
import Button from '../components/Button.jsx'
import { saveWorkoutSession } from '../data/storage.js'
import { awardXpForCompletedWorkout, isXpEnabled } from '../utils/xp.js'
import { features } from '../config/features.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function countCompletedSets(exercises) {
  return exercises.reduce(
    (n, ex) => n + (ex.sets?.filter(s => s.completed).length ?? 0),
    0
  )
}

// Best completed set within the current session for a single exercise
function bestSetInSession(exercise) {
  const done = (exercise.sets ?? []).filter(s => s.completed)
  if (done.length === 0) return null
  return done.reduce((best, s) => {
    if (!best) return s
    if ((s.weight ?? 0) > (best.weight ?? 0)) return s
    if ((s.weight ?? 0) === (best.weight ?? 0) && (s.reps ?? 0) > (best.reps ?? 0)) return s
    return best
  }, null)
}

function formatSetLabel(set) {
  if (!set) return null
  const wt = set.weight === 0 || set.weight == null ? 'BW' : `${set.weight} ${set.weightUnit ?? 'kg'}`
  return `${wt} × ${set.reps ?? 0}`
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WorkoutCompleteScreen({ onDataChange, appMode = 'personal' }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const session = state?.session

  const [saved, setSaved] = useState(false)

  // Guard: reached without session state (e.g. direct URL or hard refresh)
  if (!session) return <Navigate to="/" replace />

  const totalSets = countCompletedSets(session.exercises)

  const handleSave = () => {
    if (saved) return
    setSaved(true)
    saveWorkoutSession(session)
    onDataChange?.()
    if (features.levellingSystem && isXpEnabled(appMode)) {
      const result = awardXpForCompletedWorkout(session)
      if (result.xpEarned > 0 && !result.skippedClientSession) {
        navigate('/xp-overview', {
          state: { xpResult: result, workoutName: session.workoutName },
          replace: true,
        })
      }
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >

        {/* ── Wordmark ── */}
        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: 'var(--color-white)',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            FitTrackr
          </p>
          <div
            style={{
              width: '32px',
              height: '3px',
              background: 'var(--color-accent)',
              borderRadius: '2px',
              margin: '5px auto 0',
            }}
          />
        </div>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,59,48,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Dumbbell size={32} color="var(--color-accent)" strokeWidth={1.8} />
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: 'var(--color-white)',
              letterSpacing: '-0.5px',
              marginBottom: '6px',
            }}
          >
            Workout Complete!
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-accent)',
            }}
          >
            {session.workoutName}
          </p>
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          {[
            { Icon: Clock, value: formatDuration(session.durationSeconds), label: 'Duration' },
            { Icon: Dumbbell, value: session.exercises.length, label: 'Exercises' },
            { Icon: LayoutList, value: totalSets, label: 'Sets' },
          ].map(({ Icon, value, label }, i, arr) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: '16px 6px',
                textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <Icon
                size={16}
                color="var(--color-accent)"
                strokeWidth={2}
                style={{ display: 'block', margin: '0 auto 6px' }}
              />
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--color-white)',
                  lineHeight: 1.2,
                  marginBottom: '2px',
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontSize: '10px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Workout summary ── */}
        <section>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Workout Summary
          </p>
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {session.exercises.map((ex, i, arr) => {
              const completedCount = ex.sets?.filter(s => s.completed).length ?? 0
              const best = bestSetInSession(ex)
              return (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '13px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-white)',
                        marginBottom: best ? '2px' : 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ex.exerciseName}
                    </p>
                    {best && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        Best: {formatSetLabel(best)}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 500,
                      flexShrink: 0,
                      marginLeft: '12px',
                    }}
                  >
                    {completedCount} set{completedCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {saved ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                background: 'rgba(255,59,48,0.08)',
                border: '1px solid rgba(255,59,48,0.25)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                ✓ Workout saved.
              </span>
            </div>
          ) : (
            <Button variant="primary" onClick={handleSave}>
              Save Workout
            </Button>
          )}

          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Home
          </Button>

          <Button variant="tertiary" onClick={() => navigate('/history')}>
            View History
          </Button>
        </div>
      </div>
    </div>
  )
}
