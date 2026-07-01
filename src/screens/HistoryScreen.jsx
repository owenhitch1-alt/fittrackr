import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, Dumbbell, Plus } from 'lucide-react'
import Header from '../components/Header.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPeriodLabel(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'This Week'
  if (diffDays < 14) return 'Last Week'
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatCardDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDuration(seconds) {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} mins`
}

function sessionStats(session) {
  const exerciseCount = session.exercises?.length ?? 0
  const setCount = session.exercises?.reduce(
    (n, e) => n + (e.sets?.filter(s => s.completed).length ?? 0), 0
  ) ?? 0
  const parts = []
  const dur = formatDuration(session.durationSeconds)
  if (dur) parts.push(dur)
  parts.push(`${exerciseCount} Exercise${exerciseCount !== 1 ? 's' : ''}`)
  parts.push(`${setCount} Set${setCount !== 1 ? 's' : ''}`)
  return parts.join(' · ')
}

function groupByPeriod(sessions) {
  const groups = {}
  for (const session of sessions) {
    const label = formatPeriodLabel(session.completedAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(session)
  }
  return groups
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen({ onMenuOpen, sessions }) {
  const navigate = useNavigate()
  const grouped = sessions && sessions.length > 0 ? groupByPeriod(sessions) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="History" onMenuOpen={onMenuOpen} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {grouped ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {Object.entries(grouped).map(([period, entries]) => (
              <section key={period}>
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
                  {period}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {entries.map(session => (
                    <Card
                      key={session.id}
                      onClick={() => navigate(`/history/${session.id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Icon */}
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

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: 'var(--color-white)',
                              marginBottom: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {session.workoutName}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '1px' }}>
                            {formatCardDate(session.completedAt)}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {sessionStats(session)}
                          </p>
                        </div>

                        <ChevronRight size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="No workout history yet."
            subtitle="Complete your first workout to see it here."
            action={
              <Button variant="primary" onClick={() => navigate('/workouts')}>
                <Plus size={16} />
                Start Workout
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
