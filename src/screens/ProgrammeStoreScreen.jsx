import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Lock, ShoppingBag } from 'lucide-react'
import Header from '../components/Header.jsx'
import { STORE_PROGRAMMES, PROGRAMME_CATEGORIES } from '../data/programmes.js'
import { isProgrammeSaved, isProgrammePurchased, saveProgramme, unsaveProgramme, purchaseProgramme } from '../data/storage.js'
import { features } from '../config/features.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyColour(d) {
  if (d === 'Beginner') return '#34C759'
  if (d === 'Advanced') return '#FF9F0A'
  return 'var(--color-accent)'
}

// ─── Programme card ───────────────────────────────────────────────────────────

function ProgrammeCard({ programme }) {
  const [saved, setSaved] = useState(() => isProgrammeSaved(programme.id))
  const [purchased, setPurchased] = useState(() => isProgrammePurchased(programme.id))
  const [showPremiumNote, setShowPremiumNote] = useState(false)

  const handleSave = (e) => {
    e.stopPropagation()
    if (saved) {
      unsaveProgramme(programme.id)
      setSaved(false)
    } else {
      saveProgramme(programme.id)
      setSaved(true)
    }
  }

  const handleGet = (e) => {
    e.stopPropagation()
    if (programme.isPremium) {
      setShowPremiumNote(true)
      setTimeout(() => setShowPremiumNote(false), 2500)
      return
    }
    purchaseProgramme(programme.id)
    setPurchased(true)
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Header strip */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Emoji icon */}
        <div
          style={{
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
            lineHeight: 1,
          }}
        >
          {programme.emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', lineHeight: 1.3 }}>
              {programme.title}
            </p>
            <button
              onClick={handleSave}
              aria-label={saved ? 'Remove from saved' : 'Save programme'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: saved ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {saved
                ? <BookmarkCheck size={20} strokeWidth={2} />
                : <Bookmark size={20} strokeWidth={1.8} />
              }
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginTop: '2px' }}>
            by {programme.creator}
          </p>
        </div>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', flexWrap: 'wrap' }}>
        <Chip color={difficultyColour(programme.difficulty)}>{programme.difficulty}</Chip>
        <Chip>{programme.category}</Chip>
        <Chip>{programme.durationWeeks}w · {programme.sessionsPerWeek}x/wk</Chip>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', padding: '0 16px 14px', lineHeight: 1.55 }}>
        {programme.description}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {purchased ? (
          <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#34C759', fontFamily: 'var(--font)' }}>
            ✓ Added to your programmes
          </div>
        ) : (
          <button
            onClick={handleGet}
            style={{
              flex: 1,
              background: programme.isPremium ? 'transparent' : 'var(--color-accent)',
              border: programme.isPremium ? '1.5px solid var(--color-border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              color: programme.isPremium ? 'var(--color-text-secondary)' : 'var(--color-on-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {programme.isPremium && <Lock size={13} strokeWidth={2} />}
            {programme.isPremium ? 'Premium — Coming Soon' : 'Get Programme — Free'}
          </button>
        )}
      </div>

      {/* Premium note */}
      {showPremiumNote && (
        <div style={{
          margin: '0 16px 12px',
          padding: '10px 14px',
          background: 'rgba(255,159,10,0.10)',
          border: '1px solid rgba(255,159,10,0.30)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: '#FF9F0A',
          fontFamily: 'var(--font)',
          fontWeight: 600,
        }}>
          Premium programmes will be available when purchasing launches.
        </div>
      )}
    </div>
  )
}

function Chip({ children, color }) {
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: 700,
      fontFamily: 'var(--font)',
      color: color ?? 'var(--color-text-secondary)',
      background: color ? `${color}18` : 'var(--color-bg)',
      border: `1px solid ${color ? `${color}35` : 'var(--color-border)'}`,
      borderRadius: '20px',
      padding: '3px 9px',
      letterSpacing: '0.3px',
    }}>
      {children}
    </span>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProgrammeStoreScreen() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')

  // Catalogue is gated behind a feature flag — set marketplaceSeedContent: true to show placeholder items
  const catalogue = features.marketplaceSeedContent ? STORE_PROGRAMMES : []
  const filtered = activeFilter === 'All'
    ? catalogue
    : catalogue.filter(p => p.category === activeFilter)

  const isEmpty = catalogue.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Store" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {isEmpty ? (
          /* ── Empty state ── */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: '60px',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(255,59,48,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              <ShoppingBag size={32} color="var(--color-accent)" strokeWidth={1.8} />
            </div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 900,
              color: 'var(--color-white)',
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
              marginBottom: '12px',
              fontFamily: 'var(--font)',
            }}>
              No marketplace items available yet
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              maxWidth: '280px',
              marginBottom: '10px',
              fontFamily: 'var(--font)',
            }}>
              Marketplace content will be added in a future update.
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              opacity: 0.65,
              lineHeight: 1.5,
              maxWidth: '240px',
              fontFamily: 'var(--font)',
            }}>
              Check back soon for programmes, resources, and tools.
            </p>
          </div>
        ) : (
          <>
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PROGRAMME_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  aria-pressed={activeFilter === cat}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: `1.5px solid ${activeFilter === cat ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: activeFilter === cat ? 'rgba(255,59,48,0.12)' : 'transparent',
                    color: activeFilter === cat ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Programme cards */}
            {filtered.map(programme => (
              <ProgrammeCard key={programme.id} programme={programme} />
            ))}

            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px', padding: '40px 0', fontFamily: 'var(--font)' }}>
                No programmes in this category yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
