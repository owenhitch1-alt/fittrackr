import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { getClientById, saveClientCheckIn } from '../data/storage.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT_BASE = {
  width: '100%',
  background: 'var(--color-bg)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-white)',
  fontSize: '15px',
  fontWeight: 500,
  fontFamily: 'var(--font)',
  padding: '11px 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const LABEL_STYLE = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

const ERROR_STYLE = {
  fontSize: '12px',
  color: 'var(--color-accent)',
  fontWeight: 600,
  marginTop: '4px',
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function today() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parsePositive(raw, max = null) {
  if (raw === '' || raw == null) return null
  const n = parseFloat(raw)
  if (isNaN(n) || n <= 0) return 'invalid'
  if (max !== null && n > max) return 'invalid'
  return n
}

// ─── Field component ──────────────────────────────────────────────────────────

function NumField({ label, value, onChange, placeholder, unit, error, min = '0', max, step = '0.1' }) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {unit && <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, marginLeft: '4px' }}>({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? '—'}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...INPUT_BASE,
          borderColor: error ? 'var(--color-accent)' : 'var(--color-border)',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--color-accent)' }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--color-border)' }}
      />
      {error && <p style={ERROR_STYLE}>{error}</p>}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddCheckInScreen({ weightUnit = 'kg', measurementUnit = 'cm', onDataChange }) {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const client = getClientById(clientId)
  if (!client) return <Navigate to="/clients" replace />

  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [waist, setWaist] = useState('')
  const [chest, setChest] = useState('')
  const [hips, setHips] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const backPath = `/clients/${clientId}`

  const handleSave = () => {
    const errs = {}

    if (!date) {
      errs.date = 'Date is required.'
    }

    const wVal = parsePositive(weight)
    const bfVal = parsePositive(bodyFat, 100)
    const mmVal = parsePositive(muscleMass)
    const waistVal = parsePositive(waist)
    const chestVal = parsePositive(chest)
    const hipsVal = parsePositive(hips)

    if (weight !== '' && wVal === 'invalid') errs.weight = 'Must be a positive number.'
    if (bodyFat !== '' && bfVal === 'invalid') errs.bodyFat = 'Must be between 1 and 100.'
    if (muscleMass !== '' && mmVal === 'invalid') errs.muscleMass = 'Must be a positive number.'
    if (waist !== '' && waistVal === 'invalid') errs.waist = 'Must be a positive number.'
    if (chest !== '' && chestVal === 'invalid') errs.chest = 'Must be a positive number.'
    if (hips !== '' && hipsVal === 'invalid') errs.hips = 'Must be a positive number.'

    const hasMeasurement =
      (weight !== '' && wVal !== 'invalid') ||
      (bodyFat !== '' && bfVal !== 'invalid') ||
      (muscleMass !== '' && mmVal !== 'invalid') ||
      (waist !== '' && waistVal !== 'invalid') ||
      (chest !== '' && chestVal !== 'invalid') ||
      (hips !== '' && hipsVal !== 'invalid') ||
      notes.trim() !== ''

    if (!hasMeasurement && !errs.date) {
      errs.general = 'Add at least one measurement or note.'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    saveClientCheckIn({
      clientId,
      date,
      weight: wVal !== 'invalid' ? wVal : null,
      weightUnit,
      bodyFatPercentage: bfVal !== 'invalid' ? bfVal : null,
      muscleMass: mmVal !== 'invalid' ? mmVal : null,
      muscleMassUnit: weightUnit,
      waist: waistVal !== 'invalid' ? waistVal : null,
      chest: chestVal !== 'invalid' ? chestVal : null,
      hips: hipsVal !== 'invalid' ? hipsVal : null,
      measurementUnit,
      notes: notes.trim() || null,
    })

    onDataChange?.()
    navigate(backPath)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Add Check-In" onBack={() => navigate(backPath)}>
        <button
          onClick={handleSave}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            padding: '8px 4px 8px 12px',
            letterSpacing: '0.3px',
          }}
        >
          Save
        </button>
      </Header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Client badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,59,48,0.10)',
            border: '1px solid rgba(255,59,48,0.25)',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontFamily: 'var(--font)',
            letterSpacing: '0.3px',
            alignSelf: 'flex-start',
          }}
        >
          Client: {client.name}
        </div>

        {/* Date */}
        <div>
          <label style={LABEL_STYLE} htmlFor="checkin-date">
            Date <span style={{ color: 'var(--color-accent)' }}>*</span>
          </label>
          <input
            id="checkin-date"
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: null })) }}
            style={{
              ...INPUT_BASE,
              colorScheme: 'dark',
              borderColor: errors.date ? 'var(--color-accent)' : 'var(--color-border)',
            }}
            onFocus={e => { if (!errors.date) e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { if (!errors.date) e.target.style.borderColor = 'var(--color-border)' }}
          />
          {errors.date && <p style={ERROR_STYLE}>{errors.date}</p>}
        </div>

        {/* Body measurements group */}
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Body Measurements
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Weight + Body Fat in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <NumField
                label="Weight"
                unit={weightUnit}
                value={weight}
                onChange={v => { setWeight(v); setErrors(p => ({ ...p, weight: null, general: null })) }}
                error={errors.weight}
              />
              <NumField
                label="Body Fat"
                unit="%"
                value={bodyFat}
                max="100"
                onChange={v => { setBodyFat(v); setErrors(p => ({ ...p, bodyFat: null, general: null })) }}
                error={errors.bodyFat}
              />
            </div>

            {/* Muscle mass full width */}
            <NumField
              label="Muscle Mass"
              unit={weightUnit}
              value={muscleMass}
              onChange={v => { setMuscleMass(v); setErrors(p => ({ ...p, muscleMass: null, general: null })) }}
              error={errors.muscleMass}
            />

            {/* Waist + Chest + Hips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <NumField
                label="Waist"
                unit={measurementUnit}
                value={waist}
                onChange={v => { setWaist(v); setErrors(p => ({ ...p, waist: null, general: null })) }}
                error={errors.waist}
                step="0.5"
              />
              <NumField
                label="Chest"
                unit={measurementUnit}
                value={chest}
                onChange={v => { setChest(v); setErrors(p => ({ ...p, chest: null, general: null })) }}
                error={errors.chest}
                step="0.5"
              />
              <NumField
                label="Hips"
                unit={measurementUnit}
                value={hips}
                onChange={v => { setHips(v); setErrors(p => ({ ...p, hips: null, general: null })) }}
                error={errors.hips}
                step="0.5"
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <div>
          <label style={LABEL_STYLE}>Notes</label>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setErrors(p => ({ ...p, general: null })) }}
            placeholder="Optional — how are they feeling, lifestyle notes…"
            rows={3}
            style={{
              ...INPUT_BASE,
              resize: 'vertical',
              lineHeight: 1.55,
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </div>

        {errors.general && (
          <p style={{ ...ERROR_STYLE, fontSize: '13px', margin: '-8px 0' }}>{errors.general}</p>
        )}

        <Button variant="primary" onClick={handleSave}>
          Save Check-In
        </Button>
      </div>
    </div>
  )
}
