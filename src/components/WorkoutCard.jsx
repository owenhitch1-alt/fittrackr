import { useState } from 'react'
import { Dumbbell, Trash2 } from 'lucide-react'
import Button from './Button.jsx'

export default function WorkoutCard({ template, onStart, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const exerciseCount = template.exercises?.length ?? 0
  const previewNames = (template.exercises ?? [])
    .slice(0, 3)
    .map(e => e.exerciseName)
    .join(', ')
  const hasMore = exerciseCount > 3

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      onDelete(template.id)
    } else {
      setConfirmingDelete(true)
      // Auto-cancel after 3 s if user doesn't confirm
      setTimeout(() => setConfirmingDelete(false), 3000)
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: confirmingDelete
          ? '1px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        padding: '16px',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Top row: icon + name + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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
          <p
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-white)',
              lineHeight: 1.3,
              marginBottom: '2px',
            }}
          >
            {template.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            {exerciseCount} Exercise{exerciseCount !== 1 ? 's' : ''}
          </p>
          {previewNames && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {previewNames}{hasMore ? ` +${exerciseCount - 3} more` : ''}
            </p>
          )}
        </div>

        <button
          onClick={handleDeleteClick}
          style={{
            background: confirmingDelete ? 'rgba(255,59,48,0.15)' : 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            marginRight: '-4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            color: confirmingDelete ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            transition: 'color 0.2s ease, background 0.2s ease',
            flexShrink: 0,
          }}
          aria-label={confirmingDelete ? 'Confirm delete' : 'Delete workout'}
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Confirm delete message */}
      {confirmingDelete && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
            Delete "{template.name}"?
          </p>
          <button
            onClick={() => setConfirmingDelete(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom row: Edit + Start buttons */}
      {!confirmingDelete && (
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <Button variant="tertiary" onClick={() => onEdit(template)}>
              Edit
            </Button>
          </div>
          <div style={{ flex: 2 }}>
            <Button variant="primary" onClick={() => onStart(template)}>
              Start Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
