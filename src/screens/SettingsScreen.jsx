import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import {
  getDefaultRestTimerSeconds,
  saveDefaultRestTimerSeconds,
  getThemeMode,
  saveThemeMode,
  getShowExerciseNotePrompt,
  setShowExerciseNotePrompt,
} from '../data/storage.js'
import { EQUIPMENT_TYPES } from '../data/exercises.js'
import { THEMES } from '../data/themes.js'
import { features } from '../config/features.js'


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

function UnitToggle({ currentValue, options, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange?.(value)}
          aria-pressed={currentValue === value}
          style={{
            flex: 1,
            background: currentValue === value ? 'var(--color-accent)' : 'transparent',
            border: 'none',
            borderRadius: '5px',
            color: currentValue === value ? '#FFFFFF' : 'var(--color-text-secondary)',
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

export default function SettingsScreen({ onMenuOpen, onResetData, appMode = 'personal', onAppModeChange, weightUnit = 'kg', onWeightUnitChange, availableEquipment = [], onAvailableEquipmentChange, measurementUnit = 'cm', onMeasurementUnitChange, heightUnit = 'cm', onHeightUnitChange, distanceUnit = 'km', onDistanceUnitChange }) {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState(() => String(getDefaultRestTimerSeconds()))
  const [savedSeconds, setSavedSeconds] = useState(() => getDefaultRestTimerSeconds())
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [themeMode, setThemeMode] = useState(() => getThemeMode())
  const [themeSuccess, setThemeSuccess] = useState(false)

  const [notePromptEnabled, setNotePromptEnabled] = useState(() => getShowExerciseNotePrompt())

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
        {/* ── Profile (Personal Mode only) ── */}
        {features.avatarSystem && appMode === 'personal' && (
          <SettingsSection title="Profile">
            <SettingsRow label="Avatar Settings" onClick={() => navigate('/avatar-settings')} />
            <SettingsRow label="Avatar Marketplace" onClick={() => navigate('/avatar-marketplace')} />
          </SettingsSection>
        )}

        {/* ── Measurement Units (Personal Mode only) ── */}
        {appMode === 'personal' && (
          <SettingsSection title="Measurement Units">
            <div style={{ padding: '16px' }}>

              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                Weight
              </p>
              <UnitToggle
                currentValue={weightUnit}
                options={[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]}
                onChange={onWeightUnitChange}
              />

              <div style={{ height: '1px', background: 'var(--color-border)', margin: '18px 0' }} />

              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                Height
              </p>
              <UnitToggle
                currentValue={heightUnit}
                options={[{ value: 'cm', label: 'Centimetres' }, { value: 'ft/in', label: 'Feet & Inches' }]}
                onChange={onHeightUnitChange}
              />

              <div style={{ height: '1px', background: 'var(--color-border)', margin: '18px 0' }} />

              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                Distance
              </p>
              <UnitToggle
                currentValue={distanceUnit}
                options={[{ value: 'km', label: 'Kilometres' }, { value: 'mi', label: 'Miles' }]}
                onChange={onDistanceUnitChange}
              />

            </div>
          </SettingsSection>
        )}

        {/* ── Appearance ── */}
        <SettingsSection title="Appearance">
          <div style={{ padding: '12px 8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '0 8px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                Theme
              </p>
              <span
                aria-label="beta"
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  background: 'rgba(255,59,48,0.12)',
                  border: '1px solid rgba(255,59,48,0.30)',
                  borderRadius: '20px',
                  padding: '2px 7px',
                  lineHeight: 1.6,
                  userSelect: 'none',
                }}
              >
                Beta
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {THEMES.map(theme => {
                const isSelected = themeMode === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '11px 12px',
                      background: isSelected ? 'var(--color-surface-2)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      gap: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-white)',
                      fontFamily: 'var(--font)',
                      flex: 1,
                    }}>
                      {theme.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {theme.swatches.map((color, i) => (
                        <div
                          key={i}
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: color,
                            boxShadow: '0 0 0 1px rgba(128,128,128,0.4)',
                            flexShrink: 0,
                          }}
                        />
                      ))}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        marginLeft: '6px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? 'var(--color-accent)' : 'transparent',
                        border: isSelected ? 'none' : '1.5px solid var(--color-border)',
                      }}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1.5"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ stroke: 'var(--color-on-accent)' }}
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {themeSuccess && (
              <p style={{ fontSize: '13px', color: '#34C759', fontWeight: 600, marginTop: '8px', textAlign: 'center', padding: '0 8px' }}>
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

          {appMode === 'trainer' && (
            <>
              <div style={{ height: '1px', background: 'var(--color-border)' }} />

              <div style={{ padding: '16px 16px 4px' }}>
                {/* Weight Unit */}
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '12px' }}>
                  Weight Unit
                </p>
                <UnitToggle
                  currentValue={weightUnit}
                  options={[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]}
                  onChange={onWeightUnitChange}
                />

                <div style={{ height: '1px', background: 'var(--color-border)', margin: '20px 0 16px' }} />

                {/* Client Body Measurement Unit */}
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                  Client Measurement Unit
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '12px' }}>
                  Used for client body measurements such as waist, chest, and hips.
                </p>
                <UnitToggle
                  currentValue={measurementUnit}
                  options={[{ value: 'cm', label: 'CM' }, { value: 'in', label: 'Inches' }]}
                  onChange={onMeasurementUnitChange}
                />

                <div style={{ height: '1px', background: 'var(--color-border)', marginTop: '20px', marginBottom: '16px' }} />
              </div>
            </>
          )}

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

        {/* ── Notifications ── */}
        <SettingsSection title="Notifications">
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '4px' }}>
                  Exercise note reminder
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  Ask before replacing the saved note shown as a reminder for an exercise.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !notePromptEnabled
                  setNotePromptEnabled(next)
                  setShowExerciseNotePrompt(next)
                }}
                aria-pressed={notePromptEnabled}
                style={{
                  width: '51px',
                  height: '31px',
                  borderRadius: '16px',
                  background: notePromptEnabled ? 'var(--color-accent)' : 'var(--color-border)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notePromptEnabled ? '23px' : '3px',
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            </div>
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
