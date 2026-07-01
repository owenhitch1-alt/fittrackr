import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Dumbbell, X } from 'lucide-react'
import Header from '../components/Header.jsx'
import RestTimer from '../components/RestTimer.jsx'
import SetRow from '../components/SetRow.jsx'
import LiteModal from '../components/LiteModal.jsx'
import ExercisePicker from '../components/ExercisePicker.jsx'
import {
  getWorkoutTemplates,
  getLastPerformance,
  getBestPerformance,
  getLastExercisePerformance,
  getBestExercisePerformance,
  initWorkoutSession,
  initQuickStartSession,
  createSet,
  createSessionExercise,
  getDefaultRestTimerSeconds,
  getClientById,
  getLatestExerciseNote,
  saveLatestExerciseNote,
  getShowExerciseNotePrompt,
  setShowExerciseNotePrompt,
} from '../data/storage.js'
import { LITE_MAX_EXERCISES_PER_WORKOUT } from '../data/limits.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPerfWeight(set) {
  if (!set || set.weight === 0 || set.weight == null) return 'BW'
  const unit = set.weightUnit ?? 'kg'
  return `${set.weight} ${unit}`
}

// ─── Workout Overview Overlay ─────────────────────────────────────────────────

function PerfRow({ label, set, emptyText, accent = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          minWidth: '52px',
          flexShrink: 0,
        }}
      >
        {label}:
      </span>
      {set ? (
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
          {formatPerfWeight(set)} × {set.reps}
        </span>
      ) : (
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font)' }}>
          {emptyText}
        </span>
      )}
    </div>
  )
}

function WorkoutOverviewModal({ session, clientId = null, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          background: 'var(--color-surface)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back to workout"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          <X size={20} />
        </button>
        <p
          style={{
            flex: 1,
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--color-white)',
            fontFamily: 'var(--font)',
          }}
        >
          Current Workout
        </p>
      </div>

      {/* Workout name + count */}
      <div style={{ padding: '20px 20px 4px', flexShrink: 0 }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--color-white)',
            fontFamily: 'var(--font)',
            letterSpacing: '-0.3px',
            marginBottom: '4px',
          }}
        >
          {session.workoutName}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
          {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Exercise cards */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {session.exercises.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font)' }}>
            No exercises added yet.
          </p>
        ) : (
          session.exercises.map(ex => {
            const completedSets = (ex.sets ?? []).filter(s => s.completed && s.reps != null && s.reps > 0)
            const last = getLastPerformance(ex.exerciseName, clientId)
            const best = getBestPerformance(ex.exerciseName, clientId)
            return (
              <div
                key={ex.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '14px 16px',
                }}
              >
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font)',
                    marginBottom: (ex.plannedSets || ex.targetReps) ? '2px' : '10px',
                    letterSpacing: '-0.1px',
                  }}
                >
                  {ex.exerciseName}
                </p>

                {(ex.plannedSets || ex.targetReps) && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '10px' }}>
                    Target:{' '}
                    {ex.plannedSets && ex.targetReps
                      ? `${ex.plannedSets} sets × ${ex.targetReps} reps`
                      : ex.plannedSets
                      ? `${ex.plannedSets} sets`
                      : `${ex.targetReps} reps`}
                  </p>
                )}

                {/* Today's completed sets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                  {completedSets.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font)' }}>
                      No completed sets yet
                    </p>
                  ) : (
                    completedSets.map(set => (
                      <div key={set.id} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            minWidth: '38px',
                            flexShrink: 0,
                          }}
                        >
                          Set {set.setNumber}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                          {formatPerfWeight(set)} × {set.reps}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '10px' }} />

                {/* History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <PerfRow label="Last" set={last} emptyText="No previous data" />
                  <PerfRow label="Best" set={best} emptyText="No previous data" />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Back to Workout footer */}
      <div
        style={{
          padding: '12px 20px 28px',
          flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-white)',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            padding: '14px',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          Back to Workout
        </button>
      </div>
    </div>
  )
}

// ─── Outer shell — resolves mode before any hooks ────────────────────────────

export default function ActiveWorkoutScreen({ appMode = 'personal', weightUnit = 'kg', availableEquipment = [] }) {
  const { templateId } = useParams()
  const { state } = useLocation()

  if (templateId) {
    const template = getWorkoutTemplates().find(t => t.id === templateId)
    if (!template) return <Navigate to="/workouts" replace />
    return <ActiveWorkoutContent mode="template" template={template} appMode={appMode} weightUnit={weightUnit} availableEquipment={availableEquipment} />
  }

  return (
    <ActiveWorkoutContent
      mode="quickStart"
      quickStartName={state?.workoutName}
      clientId={state?.clientId ?? null}
      appMode={appMode}
      weightUnit={weightUnit}
      availableEquipment={availableEquipment}
    />
  )
}

// ─── Inner component — all state and UI ──────────────────────────────────────

function ActiveWorkoutContent({ mode, template, appMode = 'personal', quickStartName, clientId = null, weightUnit = 'kg', availableEquipment = [] }) {
  const navigate = useNavigate()
  const isQuickStart = mode === 'quickStart'
  const isPersonal = appMode === 'personal'

  // Read saved default once on mount — stays constant for the whole workout
  const [defaultRestSeconds] = useState(() => getDefaultRestTimerSeconds())

  const [session, setSession] = useState(() =>
    isQuickStart ? initQuickStartSession(quickStartName, clientId) : initWorkoutSession(template, weightUnit)
  )

  const activeClientId = session.clientId ?? null
  const activeClient = activeClientId ? getClientById(activeClientId) : null
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [perfMode, setPerfMode] = useState('last')
  const [timerAutoStart, setTimerAutoStart] = useState(0)
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)

  // Quick Start: exercise picker state
  const [showExPicker, setShowExPicker] = useState(false)
  const [showExLimitModal, setShowExLimitModal] = useState(false)

  // Workout overview overlay
  const [showOverview, setShowOverview] = useState(false)

  // Exercise note state
  const [noteConfirmState, setNoteConfirmState] = useState(null)
  const [noteConfirmNeverAsk, setNoteConfirmNeverAsk] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  // Scroll container ref — reset to top whenever the active exercise changes
  const scrollRef = useRef(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [exerciseIndex])

  useEffect(() => {
    setNoteSaved(false)
  }, [exerciseIndex])

  const hasExercises = session.exercises.length > 0
  const currentExercise = hasExercises ? session.exercises[exerciseIndex] : null
  const totalExercises = session.exercises.length
  const isLastExercise = hasExercises && exerciseIndex === totalExercises - 1

  // Performance lookups — only when there is a current exercise
  const lastPerformance = currentExercise ? getLastExercisePerformance(currentExercise.exerciseName, activeClientId) : null
  const bestPerformance = currentExercise ? getBestExercisePerformance(currentExercise.exerciseName, activeClientId) : null
  const previousNote = currentExercise ? getLatestExerciseNote(currentExercise.exerciseName, activeClientId) : null

  // ─── Session mutations ──────────────────────────────────────────────────────

  const updateSet = useCallback((setIndex, changes) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) =>
        ei !== exerciseIndex
          ? ex
          : { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, ...changes } : s)) }
      ),
    }))
  }, [exerciseIndex])

  const completeSet = useCallback((setIndex, { weight, reps }) => {
    updateSet(setIndex, { weight, reps, completed: true })
    setTimerAutoStart(v => v + 1)
  }, [updateSet])

  const addSet = useCallback(() => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, createSet(ex.sets.length + 1, { weight: last?.weight, reps: last?.reps }, weightUnit)],
        }
      }),
    }))
  }, [exerciseIndex, weightUnit])

  const openExercisePicker = () => {
    if (isPersonal && session.exercises.length >= LITE_MAX_EXERCISES_PER_WORKOUT) {
      setShowExLimitModal(true)
      return
    }
    setShowExPicker(true)
  }

  const handleExerciseSelected = (name) => {
    setShowExPicker(false)
    const newIndex = session.exercises.length
    const newEx = createSessionExercise(name, newIndex + 1, weightUnit)
    setSession(prev => ({ ...prev, exercises: [...prev.exercises, newEx] }))
    setExerciseIndex(newIndex)
  }

  const updateExerciseNote = useCallback((note) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) =>
        ei !== exerciseIndex ? ex : { ...ex, note }
      ),
    }))
  }, [exerciseIndex])

  const handleSaveNote = useCallback(() => {
    if (!currentExercise) return
    const note = (currentExercise.note ?? '').trim()
    if (!note) return
    const existingNote = getLatestExerciseNote(currentExercise.exerciseName, activeClientId)
    const latestNote = existingNote?.latestNote ?? null
    if (latestNote !== null && note !== latestNote && getShowExerciseNotePrompt()) {
      setNoteConfirmState({ exerciseName: currentExercise.exerciseName, note, clientId: activeClientId })
      return
    }
    saveLatestExerciseNote(currentExercise.exerciseName, note, activeClientId)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }, [currentExercise, activeClientId])

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleFinish = () => {
    const now = new Date()
    navigate('/workout-complete', {
      state: {
        session: {
          ...session,
          status: 'completed',
          completedAt: now.toISOString(),
          durationSeconds: Math.round((now - new Date(session.startedAt)) / 1000),
        },
      },
    })
  }

  // ─── Shared styles ───────────────────────────────────────────────────────────

  const navBtnBase = {
    flex: 1,
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: '13px 16px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'var(--font)',
    letterSpacing: '0.4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'opacity 0.15s ease',
  }

  // ─── Add Exercise panel (Quick Start only) ──────────────────────────────────

  const atExerciseLimit = isPersonal && session.exercises.length >= LITE_MAX_EXERCISES_PER_WORKOUT

  const addExercisePanel = isQuickStart ? (
    atExerciseLimit ? (
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '12px 16px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          FitTrackr Lite allows up to {LITE_MAX_EXERCISES_PER_WORKOUT} exercises per workout.
        </p>
      </div>
    ) : (
      <button
        onClick={openExercisePicker}
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          border: '1.5px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'var(--font)',
          letterSpacing: '0.4px',
          marginBottom: '20px',
          transition: 'border-color 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
      >
        <Dumbbell size={16} />
        Add Exercise
      </button>
    )
  ) : null

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Workout overview overlay */}
      {showOverview && (
        <WorkoutOverviewModal session={session} clientId={activeClientId} onClose={() => setShowOverview(false)} />
      )}

      {/* Exercise picker */}
      <ExercisePicker
        visible={showExPicker}
        onClose={() => setShowExPicker(false)}
        onSelect={handleExerciseSelected}
        availableEquipment={availableEquipment}
      />

      {/* Exercise limit modal (Quick Start) */}
      <LiteModal
        visible={showExLimitModal}
        heading={`FitTrackr Lite allows up to ${LITE_MAX_EXERCISES_PER_WORKOUT} exercises per workout.`}
        body="You've reached the exercise limit for this workout."
        onClose={() => setShowExLimitModal(false)}
      />

      {/* ── Exercise note confirmation overlay ── */}
      {noteConfirmState && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 200,
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', marginBottom: '8px' }}>
              Update exercise note?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              This will replace the reminder note shown next time you do{' '}
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{noteConfirmState.exerciseName}</span>.
            </p>

            {/* Never ask again */}
            <button
              onClick={() => setNoteConfirmNeverAsk(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                marginBottom: '20px',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `2px solid ${noteConfirmNeverAsk ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: noteConfirmNeverAsk ? 'var(--color-accent)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {noteConfirmNeverAsk && (
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>✓</span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', textAlign: 'left' }}>
                Don't ask again
              </span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  if (noteConfirmNeverAsk) setShowExerciseNotePrompt(false)
                  saveLatestExerciseNote(noteConfirmState.exerciseName, noteConfirmState.note, noteConfirmState.clientId)
                  setNoteConfirmState(null)
                  setNoteConfirmNeverAsk(false)
                  setNoteSaved(true)
                  setTimeout(() => setNoteSaved(false), 2000)
                }}
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
                Update Note
              </button>
              <button
                onClick={() => { setNoteConfirmState(null); setNoteConfirmNeverAsk(false) }}
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Leave-workout confirmation overlay ── */}
      {showLeaveWarning && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 200,
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
                marginBottom: '8px',
              }}
            >
              Leave workout?
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              Unsaved progress may be lost.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate(isQuickStart ? '/' : '/workouts')}
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
                Leave Workout
              </button>
              <button
                onClick={() => setShowLeaveWarning(false)}
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
                Stay in Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <Header title={session.workoutName} onBack={() => setShowLeaveWarning(true)}>
        {hasExercises && (
          <button
            onClick={handleFinish}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              padding: '8px 4px 8px 12px',
              letterSpacing: '0.3px',
            }}
          >
            Finish
          </button>
        )}
      </Header>

      {/* ── Body ── */}
      {!hasExercises ? (
        // Quick Start empty state
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '44px 20px 32px',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(255,59,48,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <Dumbbell size={24} color="var(--color-accent)" strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-white)' }}>
              No exercises added yet.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Add your first exercise to begin tracking.
            </p>
          </div>
          {addExercisePanel}
        </div>
      ) : (
        // Exercise tracking UI
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>

          {/* Exercise info */}
          <section style={{ marginBottom: '20px' }}>
            {activeClient && (
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font)', marginBottom: '6px', letterSpacing: '0.2px' }}>
                Client: {activeClient.name}
              </p>
            )}
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Exercise {exerciseIndex + 1} of {totalExercises}
            </p>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: 'var(--color-white)',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                marginBottom: (currentExercise.plannedSets || currentExercise.targetReps || currentExercise.preFilled) ? '6px' : '16px',
              }}
            >
              {currentExercise.exerciseName}
            </h2>

            {currentExercise.preFilled && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font)',
                  fontStyle: 'italic',
                  marginBottom: (currentExercise.plannedSets || currentExercise.targetReps) ? '4px' : '16px',
                }}
              >
                Pre-filled from last workout
              </p>
            )}

            {/* Target summary (template workouts only) */}
            {(currentExercise.plannedSets || currentExercise.targetReps) && (
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font)',
                  marginBottom: '16px',
                  letterSpacing: '0.1px',
                }}
              >
                Target:{' '}
                {currentExercise.plannedSets && currentExercise.targetReps
                  ? `${currentExercise.plannedSets} sets × ${currentExercise.targetReps} reps`
                  : currentExercise.plannedSets
                  ? `${currentExercise.plannedSets} sets`
                  : `${currentExercise.targetReps} reps`}
              </p>
            )}

            {/* Last / Best segmented toggle */}
            <div
              style={{
                display: 'flex',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px',
                marginBottom: '10px',
              }}
            >
              {['last', 'best'].map(m => (
                <button
                  key={m}
                  onClick={() => setPerfMode(m)}
                  style={{
                    flex: 1,
                    background: perfMode === m ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    color: perfMode === m ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '8px',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {m === 'last' ? 'Last' : 'Best'}
                </button>
              ))}
            </div>

            {/* Last panel — all sets from most recent session */}
            {perfMode === 'last' && (
              lastPerformance && lastPerformance.sets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {lastPerformance.sets.map(set => (
                    <div key={set.id} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--color-accent)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          minWidth: '38px',
                          flexShrink: 0,
                        }}
                      >
                        Set {set.setNumber}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                        {formatPerfWeight(set)} × {set.reps}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  No previous sets
                </p>
              )
            )}

            {/* Best panel — three performance metrics */}
            {perfMode === 'best' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                    Total Volume
                  </p>
                  {bestPerformance?.overallBest ? (
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {`${bestPerformance.overallBest.setCount} sets • ${bestPerformance.overallBest.totalReps} reps${bestPerformance.overallBest.totalVolume > 0 ? ` • ${bestPerformance.overallBest.totalVolume.toLocaleString()}${bestPerformance.overallBest.volumeUnit} vol` : ''}`}
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No volume record yet</p>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                    Most Reps
                  </p>
                  {bestPerformance?.mostRepsSet ? (
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {`${bestPerformance.mostRepsSet.reps} reps at ${formatPerfWeight(bestPerformance.mostRepsSet)}`}
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No reps record yet</p>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                    Heaviest Weight
                  </p>
                  {bestPerformance?.heaviestWeightSet ? (
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {`${formatPerfWeight(bestPerformance.heaviestWeightSet)} × ${bestPerformance.heaviestWeightSet.reps}`}
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No weight record yet</p>
                  )}
                </div>

              </div>
            )}
          </section>

          <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />

          {/* Sets */}
          <section style={{ marginBottom: '16px' }}>
            {/* Column headers */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
                paddingRight: '52px',
              }}
            >
              <span style={{ width: '22px', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center', flexShrink: 0 }}>#</span>
              <span style={{ flex: 1, fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center' }}>Wt ({weightUnit})</span>
              <span style={{ flex: 1, fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center' }}>Reps</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentExercise.sets.map((set, i) => (
                <SetRow
                  key={set.id}
                  set={set}
                  onChange={changes => updateSet(i, changes)}
                  onComplete={values => completeSet(i, values)}
                />
              ))}
            </div>

            {/* Add Set */}
            <button
              onClick={addSet}
              style={{
                marginTop: '10px',
                width: '100%',
                background: 'none',
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font)',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'border-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <Plus size={15} />
              Add Set
            </button>
          </section>

          {/* Rest timer */}
          <div style={{ marginBottom: '8px' }}>
            <RestTimer defaultSeconds={defaultRestSeconds} autoStartSignal={timerAutoStart} />
          </div>

          {/* Exercise note */}
          <section style={{ marginBottom: '20px' }}>
            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '14px' }} />

            {previousNote && (
              <p
                style={{
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font)',
                  lineHeight: 1.5,
                  marginBottom: '8px',
                }}
              >
                Previous note: {previousNote.latestNote}
              </p>
            )}

            <textarea
              value={currentExercise.note ?? ''}
              onChange={e => {
                if (e.target.value.length <= 100) updateExerciseNote(e.target.value)
              }}
              placeholder="Add a note for this exercise..."
              rows={2}
              style={{
                width: '100%',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-white)',
                fontSize: '14px',
                fontFamily: 'var(--font)',
                padding: '11px 14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                {(currentExercise.note ?? '').length} / 100
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {noteSaved && (
                  <span style={{ fontSize: '12px', color: '#34C759', fontWeight: 600, fontFamily: 'var(--font)' }}>
                    Saved ✓
                  </span>
                )}
                <button
                  onClick={handleSaveNote}
                  disabled={!(currentExercise.note ?? '').trim()}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '6px 12px',
                    cursor: !(currentExercise.note ?? '').trim() ? 'not-allowed' : 'pointer',
                    opacity: !(currentExercise.note ?? '').trim() ? 0.45 : 1,
                    letterSpacing: '0.3px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if ((currentExercise.note ?? '').trim()) {
                      e.currentTarget.style.borderColor = 'var(--color-accent)'
                      e.currentTarget.style.color = 'var(--color-accent)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                >
                  Save note
                </button>
              </div>
            </div>
          </section>

          {/* Add Exercise panel (Quick Start only, when exercises already exist) */}
          {addExercisePanel}

        </div>
      )}

      {/* ── Exercise navigation footer — only when there are exercises ── */}
      {hasExercises && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px 20px 18px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            flexShrink: 0,
          }}
        >
          {/* View Workout */}
          <button
            onClick={() => setShowOverview(true)}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              padding: '9px',
              cursor: 'pointer',
              letterSpacing: '0.3px',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-white)'; e.currentTarget.style.borderColor = 'var(--color-white)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
          >
            View Workout
          </button>

          {/* Previous / Next */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setExerciseIndex(i => Math.max(0, i - 1))}
              disabled={exerciseIndex === 0}
              style={{
                ...navBtnBase,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: exerciseIndex === 0 ? 'var(--color-text-secondary)' : 'var(--color-white)',
                opacity: exerciseIndex === 0 ? 0.4 : 1,
                cursor: exerciseIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={isLastExercise ? handleFinish : () => setExerciseIndex(i => i + 1)}
              style={{
                ...navBtnBase,
                background: isLastExercise ? 'var(--color-accent)' : 'var(--color-surface)',
                border: isLastExercise ? 'none' : '1px solid var(--color-border)',
                color: isLastExercise ? '#FFFFFF' : 'var(--color-white)',
              }}
            >
              {isLastExercise ? 'Finish Workout' : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
