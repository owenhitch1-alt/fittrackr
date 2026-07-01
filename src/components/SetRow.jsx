import { useState } from 'react'
import { Check } from 'lucide-react'

const INPUT_BASE = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '1.5px solid var(--color-border)',
  color: 'var(--color-white)',
  fontSize: '20px',
  fontWeight: 700,
  fontFamily: 'var(--font)',
  padding: '8px 4px',
  outline: 'none',
  textAlign: 'center',
  minWidth: 0,
  WebkitAppearance: 'none',
}

/**
 * One row in the set tracking table.
 *
 * Local string state manages the raw text the user types.
 * Parsed numbers are sent to the parent via onChange on blur,
 * and via onComplete when the tick button is tapped.
 *
 * Use set.id as the React key so local state resets if a set is replaced.
 */
export default function SetRow({ set, onChange, onComplete }) {
  const [weightStr, setWeightStr] = useState(set.weight != null ? String(set.weight) : '')
  const [repsStr, setRepsStr] = useState(set.reps != null ? String(set.reps) : '')
  const [repsError, setRepsError] = useState(false)

  const isCompleted = set.completed

  // ─── Weight ───────────────────────────────────────────────────────────────

  const handleWeightChange = (val) => {
    // Allow digits, one decimal point, no leading minus
    if (val === '' || /^\d*\.?\d*$/.test(val)) setWeightStr(val)
  }

  const handleWeightBlur = () => {
    const parsed = weightStr === '' ? null : parseFloat(weightStr)
    onChange({ weight: isNaN(parsed) ? null : parsed })
  }

  // ─── Reps ─────────────────────────────────────────────────────────────────

  const handleRepsChange = (val) => {
    if (val === '' || /^\d+$/.test(val)) {
      setRepsStr(val)
      if (val !== '') setRepsError(false)
    }
  }

  const handleRepsBlur = () => {
    const parsed = repsStr === '' ? null : parseInt(repsStr, 10)
    onChange({ reps: isNaN(parsed) ? null : parsed })
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  const handleComplete = () => {
    if (isCompleted) return

    // Reps: use live input first, fall back to parent state
    const repsVal =
      repsStr.trim() !== '' ? parseInt(repsStr, 10) : set.reps

    if (!repsVal || isNaN(repsVal) || repsVal <= 0) {
      setRepsError(true)
      return
    }

    // Weight: 0 is valid (bodyweight). Null means "not entered" → treat as 0.
    const rawWeight =
      weightStr.trim() !== '' ? parseFloat(weightStr) : (set.weight ?? 0)
    const weightVal = isNaN(rawWeight) ? 0 : rawWeight

    onComplete({ weight: weightVal, reps: repsVal })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isCompleted ? 'rgba(255,59,48,0.07)' : 'var(--color-surface)',
        border: `1px solid ${isCompleted ? 'rgba(255,59,48,0.25)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Set number */}
      <span
        style={{
          width: '22px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 700,
          color: isCompleted ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          flexShrink: 0,
        }}
      >
        {set.setNumber}
      </span>

      {/* Weight input */}
      <input
        type="text"
        inputMode="decimal"
        placeholder="0"
        value={weightStr}
        onChange={e => handleWeightChange(e.target.value)}
        onBlur={handleWeightBlur}
        readOnly={isCompleted}
        style={{
          ...INPUT_BASE,
          color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-white)',
          borderBottomColor: isCompleted ? 'transparent' : 'var(--color-border)',
        }}
      />

      {/* Reps input */}
      <input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={repsStr}
        onChange={e => handleRepsChange(e.target.value)}
        onBlur={handleRepsBlur}
        readOnly={isCompleted}
        style={{
          ...INPUT_BASE,
          color: isCompleted
            ? 'var(--color-text-secondary)'
            : repsError
            ? 'var(--color-accent)'
            : 'var(--color-white)',
          borderBottomColor: isCompleted
            ? 'transparent'
            : repsError
            ? 'var(--color-accent)'
            : 'var(--color-border)',
        }}
      />

      {/* Complete button */}
      <button
        onClick={handleComplete}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isCompleted ? 'var(--color-accent)' : 'transparent',
          border: `2px solid ${isCompleted ? 'var(--color-accent)' : repsError ? 'var(--color-accent)' : 'var(--color-border)'}`,
          cursor: isCompleted ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        aria-label={isCompleted ? 'Set completed' : 'Mark set complete'}
      >
        {isCompleted && <Check size={17} color="white" strokeWidth={3} />}
      </button>
    </div>
  )
}
