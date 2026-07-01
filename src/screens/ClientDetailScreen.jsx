import { useState, useCallback } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Dumbbell, Clock, ChevronRight, Plus, TrendingUp } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import WorkoutCard from '../components/WorkoutCard.jsx'
import {
  getClientById,
  getWorkoutTemplates,
  getWorkoutSessions,
  deleteWorkoutTemplate,
  getLatestClientCheckIn,
} from '../data/storage.js'
import { convertMeasurement } from '../utils/measurements.js'
import { LITE_MAX_WORKOUTS } from '../data/limits.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null
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

// ─── Stat cell ────────────────────────────────────────────────────────────────

function StatCell({ value, label, last = false }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '14px 8px',
        textAlign: 'center',
        borderRight: last ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '2px' }}>
        {value}
      </p>
      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--font)' }}>
        {label}
      </p>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font)' }}>
      {children}
    </p>
  )
}

// ─── Check-In summary card ────────────────────────────────────────────────────

function fmtNum(n) {
  if (n == null) return null
  return parseFloat(n.toFixed(1)).toString()
}

function CheckInSummary({ clientId, onAddCheckIn, onViewProgress, weightUnit, measurementUnit = 'cm' }) {
  const latest = getLatestClientCheckIn(clientId)

  return (
    <section>
      <SectionLabel>Progress</SectionLabel>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
        }}
      >
        {!latest ? (
          <EmptyState
            icon={TrendingUp}
            title="No check-ins yet."
            subtitle="Track body measurements to monitor progress over time."
            action={
              <Button variant="primary" onClick={onAddCheckIn}>
                <Plus size={15} />
                Add Check-In
              </Button>
            }
          />
        ) : (
          <>
            {/* Latest stats */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'var(--font)' }}>
              Latest · {formatDate(latest.date)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginBottom: '14px' }}>
              {latest.weight != null && (
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font)', marginBottom: '1px' }}>Weight</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                    {fmtNum(latest.weight)}<span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '2px' }}>{latest.weightUnit}</span>
                  </p>
                </div>
              )}
              {latest.bodyFatPercentage != null && (
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font)', marginBottom: '1px' }}>Body Fat</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                    {fmtNum(latest.bodyFatPercentage)}<span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '1px' }}>%</span>
                  </p>
                </div>
              )}
              {latest.waist != null && (
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font)', marginBottom: '1px' }}>Waist</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                    {fmtNum(convertMeasurement(latest.waist, latest.measurementUnit ?? 'cm', measurementUnit))}<span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '2px' }}>{measurementUnit}</span>
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onAddCheckIn}
                style={{
                  flex: 1,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-white)',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <Plus size={14} />
                Add Check-In
              </button>
              <button
                onClick={onViewProgress}
                style={{
                  flex: 1,
                  background: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <TrendingUp size={14} />
                View Progress
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ClientDetailScreen({ appMode = 'personal', weightUnit = 'kg', measurementUnit = 'cm', onDataChange }) {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [client] = useState(() => getClientById(clientId))
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => { setVersion(v => v + 1); onDataChange?.() }, [onDataChange])

  if (!client) return <Navigate to="/clients" replace />

  const allTemplates = getWorkoutTemplates()
  const allSessions = getWorkoutSessions()

  const clientTemplates = allTemplates.filter(t => t.clientId === clientId)
  const clientSessions = allSessions.filter(s => s.clientId === clientId && s.status === 'completed')
  const lastSession = clientSessions[0] ?? null

  const handleStart = (template) => navigate(`/active-workout/${template.id}`)
  const handleEdit = (template) => navigate(`/workouts/edit/${template.id}`, { state: { clientId, clientName: client.name } })
  const handleDelete = (id) => { deleteWorkoutTemplate(id); refresh() }

  const handleCreateWorkout = () => {
    navigate('/workouts/create', { state: { clientId, clientName: client.name } })
  }

  const handleQuickStart = () => {
    navigate('/active-workout', { state: { clientId, workoutName: '' } })
  }

  // eslint-disable-next-line no-unused-vars
  void version // triggers re-render on refresh

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title={client.name} onBack={() => navigate('/clients')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Client info */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: client.notes ? '12px' : 0 }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255,59,48,0.12)',
                border: '1px solid rgba(255,59,48,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-accent)',
                fontFamily: 'var(--font)',
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-white)', fontFamily: 'var(--font)', letterSpacing: '-0.3px' }}>
                {client.name}
              </p>
              {lastSession && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                  Last session: {formatDate(lastSession.completedAt)}
                </p>
              )}
            </div>
          </div>
          {client.notes && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55, fontFamily: 'var(--font)' }}>
              {client.notes}
            </p>
          )}
        </section>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <StatCell value={clientTemplates.length} label="Workouts" />
          <StatCell value={clientSessions.length} label="Sessions" last />
        </div>

        {/* Quick actions */}
        <section>
          <SectionLabel>Start a Session</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="primary" onClick={handleQuickStart}>
              Quick Start
            </Button>
            <Button variant="secondary" onClick={handleCreateWorkout}>
              <Plus size={15} />
              Create Workout
            </Button>
          </div>
        </section>

        {/* Check-In / Progress summary */}
        <CheckInSummary
          clientId={clientId}
          onAddCheckIn={() => navigate(`/clients/${clientId}/add-checkin`)}
          onViewProgress={() => navigate(`/clients/${clientId}/progress`)}
          weightUnit={weightUnit}
          measurementUnit={measurementUnit}
        />

        {/* Saved Workouts */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <SectionLabel>Saved Workouts</SectionLabel>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, fontFamily: 'var(--font)' }}>
              {clientTemplates.length} {appMode !== 'trainer' ? `/ ${LITE_MAX_WORKOUTS}` : ''}
            </span>
          </div>

          {clientTemplates.length === 0 ? (
            <Card>
              <EmptyState
                icon={Dumbbell}
                title="No workouts yet."
                subtitle="Create a workout for this client to start tracking their sessions."
                action={
                  <Button variant="primary" onClick={handleCreateWorkout}>
                    <Plus size={15} />
                    Create Workout
                  </Button>
                }
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clientTemplates.map(template => (
                <WorkoutCard
                  key={template.id}
                  template={template}
                  onStart={handleStart}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Session History */}
        <section>
          <SectionLabel>Session History</SectionLabel>

          {clientSessions.length === 0 ? (
            <Card>
              <EmptyState
                icon={Clock}
                title="No sessions yet."
                subtitle="Completed workouts for this client will appear here."
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clientSessions.slice(0, 20).map(session => (
                <Card key={session.id} onClick={() => navigate(`/history/${session.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255,59,48,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Dumbbell size={18} color="var(--color-accent)" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.workoutName}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '1px', fontFamily: 'var(--font)' }}>
                        {formatDate(session.completedAt)}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                        {sessionStats(session)}
                      </p>
                    </div>
                    <ChevronRight size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
