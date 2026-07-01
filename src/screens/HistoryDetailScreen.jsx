import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { Clock, Dumbbell, LayoutList, Calendar } from 'lucide-react'
import Header from '../components/Header.jsx'
import { getWorkoutSessionById } from '../data/storage.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFullDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '—'
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

function formatWeight(set) {
  if (set.weight === 0 || set.weight == null) return 'BW'
  return `${set.weight} ${set.weightUnit ?? 'kg'}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({ Icon, value, label }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon
        size={16}
        color="var(--color-accent)"
        strokeWidth={2}
        style={{ display: 'block', margin: '0 auto 5px' }}
      />
      <p
        style={{
          fontSize: '18px',
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
  )
}

function ExerciseBlock({ exercise, isLast }) {
  const completedSets = (exercise.sets ?? []).filter(s => s.completed)

  return (
    <div
      style={{
        paddingBottom: isLast ? 0 : '20px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        marginBottom: isLast ? 0 : '20px',
      }}
    >
      {/* Exercise name */}
      <p
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--color-white)',
          marginBottom: '10px',
        }}
      >
        {exercise.exerciseName}
      </p>

      {completedSets.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          No completed sets.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {completedSets.map(set => (
            <div
              key={set.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  minWidth: '44px',
                }}
              >
                Set {set.setNumber}
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-white)',
                }}
              >
                {formatWeight(set)} × {set.reps ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryDetailScreen() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const session = getWorkoutSessionById(sessionId)

  if (!session) return <Navigate to="/history" replace />

  const totalSets = countCompletedSets(session.exercises)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header
        title={session.workoutName}
        onBack={() => navigate('/history')}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

        {/* ── Completion date ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <Calendar size={14} color="var(--color-accent)" strokeWidth={2} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Completed: <span style={{ color: 'var(--color-white)' }}>{formatFullDate(session.completedAt)}</span>
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
            marginBottom: '24px',
          }}
        >
          {[
            { Icon: Clock,       value: formatDuration(session.durationSeconds), label: 'Duration'  },
            { Icon: Dumbbell,    value: session.exercises.length,                label: 'Exercises' },
            { Icon: LayoutList,  value: totalSets,                               label: 'Sets'      },
          ].map(({ Icon, value, label }, i, arr) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: '14px 6px',
                borderRight: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <StatChip Icon={Icon} value={value} label={label} />
            </div>
          ))}
        </div>

        {/* ── Exercise breakdown ── */}
        <section>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Exercise Breakdown
          </p>

          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
            }}
          >
            {session.exercises.map((ex, i, arr) => (
              <ExerciseBlock
                key={ex.id}
                exercise={ex}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
