import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Bookmark, ChevronRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { getSavedProgrammeIds, unsaveProgramme } from '../data/storage.js'
import { getProgrammeById } from '../data/programmes.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyColour(d) {
  if (d === 'Beginner') return '#34C759'
  if (d === 'Advanced') return '#FF9F0A'
  return 'var(--color-accent)'
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function SavedCard({ programme, onRemove }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(255,59,48,0.10)',
          border: '1px solid rgba(255,59,48,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}>
          {programme.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '3px' }}>
            {programme.title}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: difficultyColour(programme.difficulty), fontFamily: 'var(--font)' }}>
              {programme.difficulty}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>·</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
              {programme.durationWeeks} weeks
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>·</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
              {programme.category}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 16px 14px' }}>
        <button
          onClick={() => onRemove(programme.id)}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Bookmark size={14} strokeWidth={2} />
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SavedProgrammesScreen() {
  const navigate = useNavigate()
  const [savedIds, setSavedIds] = useState(() => getSavedProgrammeIds())

  const programmes = savedIds.map(id => getProgrammeById(id)).filter(Boolean)

  const handleRemove = (id) => {
    unsaveProgramme(id)
    setSavedIds(prev => prev.filter(i => i !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Saved Programmes" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {programmes.length > 0 ? (
          programmes.map(p => (
            <SavedCard key={p.id} programme={p} onRemove={handleRemove} />
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
              <BookOpen size={28} color="var(--color-accent)" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-white)', letterSpacing: '-0.3px', marginBottom: '10px', fontFamily: 'var(--font)' }}>
              No saved programmes yet
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '260px', marginBottom: '28px', fontFamily: 'var(--font)' }}>
              Browse the Store and bookmark programmes you want to try.
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
