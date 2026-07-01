import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Countdown rest timer.
 *
 * @param {number}  defaultSeconds  - Starting value (default 90).
 * @param {number}  autoStartSignal - Increment this from the parent to auto-start
 *                                    the timer (e.g. when a set is completed).
 */
export default function RestTimer({ defaultSeconds = 90, autoStartSignal = 0 }) {
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  // Auto-start when a set is completed.
  // Using a ref to avoid including `defaultSeconds` in this effect's deps while
  // still reading the latest value at trigger time.
  const defaultRef = useRef(defaultSeconds)
  useEffect(() => { defaultRef.current = defaultSeconds }, [defaultSeconds])

  useEffect(() => {
    if (autoStartSignal === 0) return
    setRemaining(defaultRef.current)
    setRunning(true)
  }, [autoStartSignal])

  // Single interval — cleared and re-created whenever `running` flips.
  // This guarantees no duplicate intervals even if Start is tapped rapidly.
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), [])

  const handleStartPause = () => {
    if (remaining === 0) {
      // Timer finished — restart from default
      setRemaining(defaultSeconds)
      setRunning(true)
    } else {
      setRunning(r => !r)
    }
  }

  const handleReset = () => {
    setRunning(false)
    setRemaining(defaultSeconds)
  }

  const isFinished = remaining === 0

  const btnBase = {
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'var(--font)',
    letterSpacing: '0.5px',
    border: 'none',
    transition: 'background 0.15s ease',
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '16px',
      }}
    >
      {/* Label + time display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Rest Timer
        </p>
        <p
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: isFinished
              ? 'var(--color-accent)'
              : running
              ? 'var(--color-white)'
              : 'var(--color-text-secondary)',
            letterSpacing: '-1px',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            transition: 'color 0.2s ease',
          }}
        >
          {formatTime(remaining)}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleStartPause}
          style={{
            ...btnBase,
            flex: 1,
            padding: '12px 16px',
            background: running ? 'var(--color-surface-2)' : 'var(--color-accent)',
            border: running ? '1px solid var(--color-border)' : 'none',
            color: running ? 'var(--color-white)' : '#FFFFFF',
          }}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? 'Pause' : isFinished ? 'Restart' : remaining === defaultSeconds ? 'Start' : 'Resume'}
        </button>

        <button
          onClick={handleReset}
          style={{
            ...btnBase,
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          aria-label="Reset timer"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  )
}
