import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Play } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { getPurchasedProgrammeIds } from '../data/storage.js'
import { getProgrammeById } from '../data/programmes.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyColour(d) {
  if (d === 'Beginner') return '#34C759'
  if (d === 'Advanced') return '#FF9F0A'
  return 'var(--color-accent)'
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PurchasedCard({ programme, onStart }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'rgba(255,59,48,0.10)',
          border: '1px solid rgba(255,59,48,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          flexShrink: 0,
        }}>
          {programme.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '3px' }}>
            {programme.title}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
            by {programme.creator}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '16px', padding: '0 16px 12px' }}>
        {[
          { label: 'Difficulty', value: programme.difficulty, color: difficultyColour(programme.difficulty) },
          { label: 'Duration', value: `${programme.durationWeeks} weeks` },
          { label: 'Frequency', value: `${programme.sessionsPerWeek}x / week` },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '2px', fontFamily: 'var(--font)' }}>
              {label}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: color ?? 'var(--color-white)', fontFamily: 'var(--font)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', padding: '0 16px 14px', lineHeight: 1.55 }}>
        {programme.description}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Start button */}
      <div style={{ padding: '12px 16px' }}>
        <button
          onClick={() => onStart(programme)}
          style={{
            width: '100%',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            color: 'var(--color-on-accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Play size={16} strokeWidth={2.5} />
          Start Workout
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PurchasedProgrammesScreen() {
  const navigate = useNavigate()
  const [purchasedIds] = useState(() => getPurchasedProgrammeIds())

  const programmes = purchasedIds.map(id => getProgrammeById(id)).filter(Boolean)

  const handleStart = () => {
    // Future: navigate to programme-specific workout session
    // For now, start a quick workout
    navigate('/active-workout')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Purchased Programmes" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {programmes.length > 0 ? (
          programmes.map(p => (
            <PurchasedCard key={p.id} programme={p} onStart={handleStart} />
          ))
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: '60px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(255,59,48,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Package size={28} color="var(--color-accent)" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-white)', letterSpacing: '-0.3px', marginBottom: '10px', fontFamily: 'var(--font)' }}>
              No programmes yet
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '260px', marginBottom: '28px', fontFamily: 'var(--font)' }}>
              Browse the Store to discover free and premium training programmes.
            </p>
            <Button variant="primary" onClick={() => navigate('/marketplace/store')}>
              Browse Store
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
