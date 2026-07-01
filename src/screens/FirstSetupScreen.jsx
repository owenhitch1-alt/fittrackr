import { useState } from 'react'
import { EQUIPMENT_TYPES } from '../data/exercises.js'
import { saveSetupAnswers } from '../data/storage.js'

// ─── Constants ────────────────────────────────────────────────────────────────

// Hidden from setup UI but always saved as available by default.
// Users can disable these later in Settings → Available Equipment.
const SETUP_HIDDEN_AVAILABLE = ['Machine', 'Resistance Band', 'Other']
const SETUP_VISIBLE_EQUIPMENT = EQUIPMENT_TYPES.filter(e => !SETUP_HIDDEN_AVAILABLE.includes(e))

const GOALS = [
  'Build muscle',
  'Gain strength',
  'Lose fat',
  'Improve fitness',
  'Track progress',
  'General health',
]

const REST_PRESETS = [
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '120s', value: 120 },
  { label: 'Custom', value: 'custom' },
]

const APP_MODES = [
  { value: 'personal', label: 'Personal' },
  { value: 'trainer', label: 'Personal Trainer' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '10px',
        fontFamily: 'var(--font)',
      }}
    >
      {children}
    </p>
  )
}

function SectionTitle({ children }) {
  return (
    <p
      style={{
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--color-white)',
        marginBottom: '12px',
        fontFamily: 'var(--font)',
      }}
    >
      {children}
    </p>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '3px',
      }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            background: value === opt.value ? 'var(--color-accent)' : 'transparent',
            border: 'none',
            borderRadius: '5px',
            color: value === opt.value ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            padding: '10px 8px',
            cursor: 'pointer',
            letterSpacing: '0.4px',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ChipGrid({ options, selected, onToggle, compact = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? '6px' : '8px' }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            aria-pressed={isSelected}
            style={{
              padding: compact ? '6px 10px' : '7px 13px',
              borderRadius: '20px',
              border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isSelected ? 'rgba(255,59,48,0.12)' : 'transparent',
              color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: compact ? '12px' : '13px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              letterSpacing: '0.2px',
              transition: 'all 0.12s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {isSelected ? '✓ ' : ''}{opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateCustomRest(raw) {
  const trimmed = String(raw).trim()
  if (trimmed === '') return 'Enter a whole number between 1 and 300 seconds.'
  const num = Number(trimmed)
  if (!Number.isFinite(num) || !Number.isInteger(num)) return 'Enter a whole number between 1 and 300 seconds.'
  if (num < 1 || num > 300) return 'Enter a whole number between 1 and 300 seconds.'
  return null
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FirstSetupScreen({ onComplete }) {
  const [firstName, setFirstName] = useState('')
  const [appMode, setAppMode] = useState('personal')
  const [goals, setGoals] = useState([])
  const [equipment, setEquipment] = useState([])
  const [weightUnit, setWeightUnit] = useState('kg')
  const [restChoice, setRestChoice] = useState(90)
  const [customRest, setCustomRest] = useState('')
  const [restError, setRestError] = useState(null)
  const [measurementUnit, setMeasurementUnit] = useState('cm')
  const [showSkipMessage, setShowSkipMessage] = useState(false)

  const toggleGoal = (g) =>
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const toggleEquipment = (e) =>
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

  const handleRestChoice = (val) => {
    setRestChoice(val)
    setRestError(null)
  }

  const resolveRestTimer = () => {
    if (restChoice !== 'custom') return { valid: true, value: restChoice }
    const err = validateCustomRest(customRest)
    if (err) {
      setRestError(err)
      return { valid: false }
    }
    return { valid: true, value: Number(customRest) }
  }

  const handleStart = () => {
    const rest = resolveRestTimer()
    if (!rest.valid) return

    saveSetupAnswers({
      firstName: firstName.trim(),
      appMode,
      goals,
      availableEquipment: [...new Set([...equipment, ...SETUP_HIDDEN_AVAILABLE])],
      weightUnit,
      defaultRestTimerSeconds: rest.value,
      measurementUnit,
    })
    onComplete()
  }

  const handleSkip = () => {
    saveSetupAnswers({
      firstName: '',
      appMode: 'personal',
      goals: [],
      availableEquipment: EQUIPMENT_TYPES,
      weightUnit: 'kg',
      defaultRestTimerSeconds: 90,
      measurementUnit: 'cm',
    })
    setShowSkipMessage(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      {/* Skip confirmation modal */}
      {showSkipMessage && (
        <div
          style={{
            position: 'fixed',
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
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            <p
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--color-white)',
                fontFamily: 'var(--font)',
                marginBottom: '10px',
                letterSpacing: '-0.2px',
              }}
            >
              Setup skipped
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              You can personalise your experience later in Settings.
            </p>
            <button
              onClick={onComplete}
              style={{
                width: '100%',
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
              Continue
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '48px 24px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="FitTrackr"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              objectFit: 'cover',
            }}
          />
          <div>
            <p
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--color-white)',
                letterSpacing: '-0.4px',
                fontFamily: 'var(--font)',
                lineHeight: 1.2,
              }}
            >
              Set up FitTrackr
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
                marginTop: '2px',
                lineHeight: 1.4,
              }}
            >
              Choose a few preferences so FitTrackr is ready for your training.
            </p>
          </div>
        </div>

        {/* ── First Name ── */}
        <div>
          <SectionLabel>First name</SectionLabel>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-white)',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: 'var(--font)',
              padding: '13px 14px',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font)',
              marginTop: '6px',
            }}
          >
            Optional. Used to personalise your home screen greeting.
          </p>
        </div>

        {/* ── App Mode ── */}
        <div>
          <SectionLabel>How will you use FitTrackr?</SectionLabel>
          <SegmentedControl
            options={APP_MODES}
            value={appMode}
            onChange={setAppMode}
          />
          {appMode === 'trainer' && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
                marginTop: '8px',
                lineHeight: 1.5,
              }}
            >
              PT Mode removes workout limits and adds client management. Data stays on this device.
            </p>
          )}
        </div>

        {/* ── Goals ── */}
        <div>
          <SectionTitle>What are your main goals?</SectionTitle>
          <ChipGrid options={GOALS} selected={goals} onToggle={toggleGoal} />
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font)',
              marginTop: '8px',
            }}
          >
            Optional — select all that apply.
          </p>
        </div>

        {/* ── Equipment ── */}
        <div>
          <SectionTitle>What equipment do you have available?</SectionTitle>
          <ChipGrid options={SETUP_VISIBLE_EQUIPMENT} selected={equipment} onToggle={toggleEquipment} compact />
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font)',
              marginTop: '8px',
              lineHeight: 1.5,
            }}
          >
            Optional. FitTrackr uses this to show which exercises are available when building workouts.
          </p>
        </div>

        {/* ── Weight Unit ── */}
        <div>
          <SectionLabel>Weight unit</SectionLabel>
          <SegmentedControl
            options={[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]}
            value={weightUnit}
            onChange={setWeightUnit}
          />
        </div>

        {/* ── Default Rest Timer ── */}
        <div>
          <SectionLabel>Default rest timer</SectionLabel>
          <div style={{ display: 'flex', gap: '8px', marginBottom: restChoice === 'custom' ? '12px' : 0 }}>
            {REST_PRESETS.map(p => {
              const active = restChoice === p.value
              return (
                <button
                  key={p.value}
                  onClick={() => handleRestChoice(p.value)}
                  style={{
                    flex: 1,
                    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                    border: active ? 'none' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '10px 4px',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {restChoice === 'custom' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max="300"
                  step="1"
                  value={customRest}
                  onChange={e => { setCustomRest(e.target.value); setRestError(null) }}
                  placeholder="e.g. 75"
                  style={{
                    width: '100px',
                    background: 'var(--color-surface)',
                    border: `1.5px solid ${restError ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-white)',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '11px 14px',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => { if (!restError) e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { if (!restError) e.target.style.borderColor = 'var(--color-border)' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontWeight: 500 }}>
                  seconds
                </span>
              </div>
              {restError && (
                <p style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '8px', lineHeight: 1.4, fontFamily: 'var(--font)' }}>
                  {restError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Measurement Unit (PT only) ── */}
        {appMode === 'trainer' && (
          <div>
            <SectionLabel>Measurement unit</SectionLabel>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              Used for client body measurements such as waist, chest, and hips.
            </p>
            <SegmentedControl
              options={[{ value: 'cm', label: 'CM' }, { value: 'in', label: 'Inches' }]}
              value={measurementUnit}
              onChange={setMeasurementUnit}
            />
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            Start FitTrackr
          </button>
          <button
            onClick={handleSkip}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
