import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import {
  getDefaultRestTimerSeconds,
  saveDefaultRestTimerSeconds,
  getThemeMode,
  saveThemeMode,
} from '../data/storage.js'
import { EQUIPMENT_TYPES } from '../data/exercises.js'

const APP_MODES = [
  {
    value: 'personal',
    label: 'Personal',
    description: 'Designed for your own training. Lite limits apply.',
  },
  {
    value: 'trainer',
    label: 'Personal Trainer',
    description: 'For local PT testing. Workout limits are removed. Data stays on this device.',
  },
]

function SettingsRow({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        textAlign: 'left',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span
        style={{
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--color-white)',
          fontFamily: 'var(--font)',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {value && (
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
            {value}
          </span>
        )}
        {onClick && <ChevronRight size={16} color="var(--color-text-secondary)" />}
      </div>
    </button>
  )
}

function SettingsSection({ title, children }) {
  return (
    <section>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '0 16px 8px',
        }}
      >
        {title}
      </p>
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </section>
  )
}

function validate(raw) {
  const trimmed = raw.trim()
  if (trimmed === '') return 'Enter a whole number between 1 and 300 seconds.'
  const num = Number(trimmed)
  if (!Number.isFinite(num)) return 'Enter a whole number between 1 and 300 seconds.'
  if (!Number.isInteger(num)) return 'Enter a whole number between 1 and 300 seconds.'
  if (num < 1 || num > 300) return 'Enter a whole number between 1 and 300 seconds.'
  return null
}

export default function SettingsScreen({ onMenuOpen, onResetData, appMode = 'personal', onAppModeChange, weightUnit = 'kg', onWeightUnitChange, availableEquipment = [], onAvailableEquipmentChange, measurementUnit = 'cm', onMeasurementUnitChange }) {
  const [inputValue, setInputValue] = useState(() => String(getDefaultRestTimerSeconds()))
  const [savedSeconds, setSavedSeconds] = useState(() => getDefaultRestTimerSeconds())
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [themeMode, setThemeMode] = useState(() => getThemeMode())
  const [themeSuccess, setThemeSuccess] = useState(false)

  const handleChange = (val) => {
    setInputValue(val)
    setError(null)
    setSuccess(false)
  }

  const handleThemeChange = (mode) => {
    setThemeMode(mode)
    saveThemeMode(mode)
    document.documentElement.setAttribute('data-theme', mode)
    setThemeSuccess(true)
    setTimeout(() => setThemeSuccess(false), 2000)
  }

  const handleSave = () => {
    const err = validate(inputValue)
    if (err) {
      setError(err)
      setSuccess(false)
      return
    }
    const seconds = Number(inputValue)
    saveDefaultRestTimerSeconds(seconds)
    setSavedSeconds(seconds)
    setSuccess(true)
    setError(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Settings" onMenuOpen={onMenuOpen} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* ── App Mode ── */}
        <SettingsSection title="App Mode">
          <div style={{ padding: '16px 16px 20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
              Choose how you want to use FitTrackr on this device.
            </p>

            <div
              style={{
                display: 'flex',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px',
                marginBottom: '14px',
              }}
            >
              {APP_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onAppModeChange?.(value)}
                  style={{
                    flex: 1,
                    background: appMode === value ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    color: appMode === value ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '9px 8px',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
              {APP_MODES.find(m => m.value === appMode)?.description}
            </p>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
              Cloud accounts and client sharing will be added later.
            </p>
          </div>
        </SettingsSection>

        {/* ── Appearance ── */}
        <SettingsSection title="Appearance">
          <div style={{ padding: '16px 16px 20px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '12px' }}>
              Theme
            </p>

            <div
              style={{
                display: 'flex',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px',
              }}
            >
              {['light', 'dark'].map(mode => (
                <button
                  key={mode}
                  onClick={() => handleThemeChange(mode)}
                  style={{
                    flex: 1,
                    background: themeMode === mode ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    color: themeMode === mode ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '9px 8px',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
                </button>
              ))}
            </div>

            {themeSuccess && (
              <p style={{ fontSize: '13px', color: '#34C759', fontWeight: 600, marginTop: '12px', textAlign: 'center' }}>
                Theme updated.
              </p>
            )}
          </div>
        </SettingsSection>

        {/* ── Workout Preferences ── */}
        <SettingsSection title="Workout Preferences">
          <div style={{ padding: '16px 16px 20px' }}>
            {/* Available Equipment */}
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
              Available Equipment
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '14px' }}>
              Select the equipment you have access to. FitTrackr will use this to show which exercises are available when adding exercises to a workout.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EQUIPMENT_TYPES.map(eq => {
                const isSelected = availableEquipment.includes(eq)
                return (
                  <button
                    key={eq}
                    onClick={() => {
                      const updated = isSelected
                        ? availableEquipment.filter(e => e !== eq)
                        : [...availableEquipment, eq]
                      onAvailableEquipmentChange?.(updated)
                    }}
                    aria-pressed={isSelected}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '20px',
                      border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: isSelected ? 'rgba(255,59,48,0.12)' : 'transparent',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'var(--font)',
                      cursor: 'pointer',
                      letterSpacing: '0.3px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{eq}
                  </button>
                )
              })}
            </div>
            {availableEquipment.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '10px' }}>
                No equipment selected — all exercises will show as unavailable.
              </p>
            )}
          </div>

          <div style={{ height: '1px', background: 'var(--color-border)' }} />

          <div style={{ padding: '16px 16px 4px' }}>
            {/* Weight Unit */}
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '12px' }}>
              Weight Unit
            </p>
            <div
              style={{
                display: 'flex',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px',
                marginBottom: '20px',
              }}
            >
              {[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onWeightUnitChange?.(value)}
                  style={{
                    flex: 1,
                    background: weightUnit === value ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: '5px',
                    color: weightUnit === value ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font)',
                    padding: '9px 8px',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />

            {/* Measurement Unit — PT Mode only */}
            <div>
              <div
                style={{
                  opacity: appMode !== 'trainer' ? 0.42 : 1,
                  pointerEvents: appMode !== 'trainer' ? 'none' : 'auto',
                  transition: 'opacity 0.2s ease',
                  userSelect: appMode !== 'trainer' ? 'none' : 'auto',
                }}
                aria-disabled={appMode !== 'trainer'}
              >
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                  Measurement Unit
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '12px' }}>
                  Used for body measurements such as waist, chest, and hips.
                </p>
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px',
                    marginBottom: appMode !== 'trainer' ? '8px' : '20px',
                  }}
                >
                  {[{ value: 'cm', label: 'CM' }, { value: 'in', label: 'Inches' }].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => onMeasurementUnitChange?.(value)}
                      disabled={appMode !== 'trainer'}
                      style={{
                        flex: 1,
                        background: measurementUnit === value ? 'var(--color-accent)' : 'transparent',
                        border: 'none',
                        borderRadius: '5px',
                        color: measurementUnit === value ? '#FFFFFF' : 'var(--color-text-secondary)',
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: 'var(--font)',
                        padding: '9px 8px',
                        cursor: 'not-allowed',
                        letterSpacing: '0.5px',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {appMode !== 'trainer' && (
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font)',
                    fontStyle: 'italic',
                    marginBottom: '20px',
                    letterSpacing: '0.1px',
                  }}
                >
                  Feature coming soon via upgrade plan
                </p>
              )}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />
          </div>

          <div style={{ padding: '0 16px 20px' }}>
            {/* Row label + current value */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                Default Rest Timer
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                Current: {savedSeconds}s
              </p>
            </div>

            {/* Input + unit label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <input
                type="number"
                min="1"
                max="300"
                step="1"
                value={inputValue}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                style={{
                  width: '88px',
                  background: 'var(--color-bg)',
                  border: `1.5px solid ${error ? 'var(--color-accent)' : 'var(--color-border)'}`,
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
                onFocus={e => { if (!error) e.target.style.borderColor = 'var(--color-accent)' }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--color-border)' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontWeight: 500 }}>
                seconds
              </span>
            </div>

            {/* Helper text */}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '14px' }}>
              Choose a default rest time between 1 second and 5 minutes.
            </p>

            {/* Error */}
            {error && (
              <p style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px', lineHeight: 1.4 }}>
                {error}
              </p>
            )}

            {/* Save button */}
            <Button variant="primary" onClick={handleSave}>
              Save Rest Timer
            </Button>

            {/* Success */}
            {success && (
              <p style={{ fontSize: '13px', color: '#34C759', fontWeight: 600, marginTop: '12px', textAlign: 'center' }}>
                Default rest timer updated.
              </p>
            )}
          </div>
        </SettingsSection>

        {/* ── App ── */}
        <SettingsSection title="App">
          <SettingsRow label="Version" value="Phase 1 MVP" />
        </SettingsSection>

        <Button variant="danger" onClick={onResetData}>
          Reset Demo Data
        </Button>
      </div>
    </div>
  )
}
