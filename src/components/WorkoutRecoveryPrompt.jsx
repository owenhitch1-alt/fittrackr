import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearActiveWorkoutDraft } from '../data/activeWorkout.js'

/**
 * Shown once per app launch when an unfinished workout draft is found.
 * Continue restores the workout; Discard requires a second confirmation.
 */
export default function WorkoutRecoveryPrompt({ draft, onDismiss }) {
  const navigate = useNavigate()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const exerciseCount = draft.session.exercises?.length ?? 0

  const handleContinue = () => {
    onDismiss()
    navigate('/active-workout', { state: { resume: true } })
  }

  const handleDiscard = () => {
    clearActiveWorkoutDraft()
    onDismiss()
  }

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.88)',
    zIndex: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  }

  const dialog = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: '28px 24px',
    width: '100%',
    maxWidth: '320px',
  }

  const title = {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-white)',
    fontFamily: 'var(--font)',
    marginBottom: '8px',
  }

  const body = {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font)',
    lineHeight: 1.6,
    marginBottom: '24px',
  }

  const btnBase = {
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font)',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  }

  const primary = { ...btnBase, background: 'var(--color-accent)', border: 'none', color: '#FFFFFF' }
  const secondary = { ...btnBase, background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontWeight: 600 }
  const destructive = { ...btnBase, background: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }

  if (confirmDiscard) {
    return (
      <div style={overlay}>
        <div style={dialog}>
          <h3 style={title}>Discard this workout?</h3>
          <p style={body}>
            Your in-progress workout will be permanently deleted and will not be saved to your history. This cannot be undone.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setConfirmDiscard(false)} style={secondary}>Cancel</button>
            <button onClick={handleDiscard} style={destructive}>Discard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay}>
      <div style={dialog}>
        <h3 style={title}>Workout in progress found</h3>
        <p style={body}>
          {draft.session.workoutName}
          {exerciseCount > 0 && ` · ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`}
          <br />
          Would you like to continue your workout?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleContinue} style={primary}>Continue Workout</button>
          <button onClick={() => setConfirmDiscard(true)} style={destructive}>Discard</button>
        </div>
      </div>
    </div>
  )
}
