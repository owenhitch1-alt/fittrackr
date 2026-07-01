import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, ChevronUp, Plus, ArrowLeft } from 'lucide-react'
import { defaultExercises, BODY_AREAS, EQUIPMENT_TYPES, MOVEMENT_CATEGORIES, DIFFICULTY_LEVELS } from '../data/exercises.js'
import { getCustomExercises, saveCustomExercise } from '../data/storage.js'

// ─── Shared mini-styles ───────────────────────────────────────────────────────

const INPUT_BASE = {
  width: '100%',
  background: 'var(--color-bg)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-white)',
  fontSize: '15px',
  fontWeight: 500,
  fontFamily: 'var(--font)',
  padding: '12px 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const SELECT_BASE = {
  ...INPUT_BASE,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
}

const LABEL_BASE = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

const ERR_TEXT = {
  fontSize: '12px',
  color: 'var(--color-accent)',
  fontWeight: 600,
  marginTop: '4px',
}

// ─── Search normalisation ─────────────────────────────────────────────────────

function normalizeSearch(value) {
  return value
    .toLowerCase()
    .replace(/['']/g, '')        // remove apostrophes
    .replace(/-/g, ' ')          // hyphens → spaces
    .replace(/[^a-z0-9\s]/g, '') // strip remaining punctuation
    .replace(/\s+/g, ' ')        // collapse whitespace
    .trim()
}

function compactSearch(value) {
  return normalizeSearch(value).replace(/\s/g, '')
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        borderRadius: '20px',
        border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: active ? 'rgba(255,59,48,0.12)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </button>
  )
}

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, onSelect, isAvailable }) {
  return (
    <button
      onClick={() => onSelect(exercise.name)}
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--color-border)',
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.1s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-white)',
            fontFamily: 'var(--font)',
            marginBottom: exercise.bodyArea || exercise.equipment ? '2px' : 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {exercise.name}
          {exercise.isCustom && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                verticalAlign: 'middle',
              }}
            >
              Custom
            </span>
          )}
        </p>
        {(exercise.bodyArea || exercise.equipment) && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {[exercise.bodyArea, exercise.equipment, exercise.movementCategory]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>
      {exercise.difficulty && (
        <span
          style={{
            flexShrink: 0,
            fontSize: '11px',
            fontWeight: 700,
            color:
              exercise.difficulty === 'Advanced'
                ? 'var(--color-accent)'
                : exercise.difficulty === 'Intermediate'
                ? '#F0A500'
                : 'var(--color-text-secondary)',
            letterSpacing: '0.3px',
          }}
        >
          {exercise.difficulty}
        </span>
      )}
      <span
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isAvailable ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: isAvailable ? '#34C759' : 'var(--color-accent)',
        }}
        title={isAvailable ? 'Equipment available' : 'Equipment not available'}
      >
        {isAvailable ? '✓' : '✗'}
      </span>
    </button>
  )
}

// ─── Custom exercise form ─────────────────────────────────────────────────────

function CustomExerciseForm({ onBack, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    bodyArea: '',
    equipment: '',
    movementCategory: '',
    primaryMuscle: '',
    difficulty: '',
  })
  const [errors, setErrors] = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: null }))
  }

  const handleSave = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Exercise name is required.'
    if (!form.bodyArea) newErrors.bodyArea = 'Body area is required.'
    if (!form.equipment) newErrors.equipment = 'Equipment is required.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const saved = saveCustomExercise({
      name: form.name.trim(),
      bodyArea: form.bodyArea,
      equipment: form.equipment,
      movementCategory: form.movementCategory || undefined,
      primaryMuscle: form.primaryMuscle.trim() || undefined,
      difficulty: form.difficulty || undefined,
    })
    onSaved(saved.name)
  }

  const fieldStyle = (key) => ({
    ...INPUT_BASE,
    borderColor: errors[key] ? 'var(--color-accent)' : 'var(--color-border)',
  })

  const selectStyle = (key) => ({
    ...SELECT_BASE,
    borderColor: errors[key] ? 'var(--color-accent)' : 'var(--color-border)',
    color: form[key] ? 'var(--color-white)' : 'var(--color-text-secondary)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            flexShrink: 0,
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <p
          style={{
            flex: 1,
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--color-white)',
            fontFamily: 'var(--font)',
          }}
        >
          Add Custom Exercise
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Name * */}
        <div>
          <label style={LABEL_BASE}>
            Exercise Name <span style={{ color: 'var(--color-accent)' }}>*</span>
          </label>
          <input
            ref={nameRef}
            type="text"
            placeholder="e.g. Single Arm Smith Row"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            style={fieldStyle('name')}
            onFocus={e => { if (!errors.name) e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { if (!errors.name) e.target.style.borderColor = 'var(--color-border)' }}
          />
          {errors.name && <p style={ERR_TEXT}>{errors.name}</p>}
        </div>

        {/* Body Area * */}
        <div>
          <label style={LABEL_BASE}>
            Body Area <span style={{ color: 'var(--color-accent)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.bodyArea}
              onChange={e => set('bodyArea', e.target.value)}
              style={selectStyle('bodyArea')}
            >
              <option value="" disabled>Select body area</option>
              {BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {errors.bodyArea && <p style={ERR_TEXT}>{errors.bodyArea}</p>}
        </div>

        {/* Equipment * */}
        <div>
          <label style={LABEL_BASE}>
            Equipment <span style={{ color: 'var(--color-accent)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.equipment}
              onChange={e => set('equipment', e.target.value)}
              style={selectStyle('equipment')}
            >
              <option value="" disabled>Select equipment</option>
              {EQUIPMENT_TYPES.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {errors.equipment && <p style={ERR_TEXT}>{errors.equipment}</p>}
        </div>

        {/* Movement Category (optional) */}
        <div>
          <label style={LABEL_BASE}>Movement Category</label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.movementCategory}
              onChange={e => set('movementCategory', e.target.value)}
              style={{ ...SELECT_BASE, color: form.movementCategory ? 'var(--color-white)' : 'var(--color-text-secondary)' }}
            >
              <option value="">Select movement (optional)</option>
              {MOVEMENT_CATEGORIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Primary Muscle (optional) */}
        <div>
          <label style={LABEL_BASE}>Primary Muscle</label>
          <input
            type="text"
            placeholder="e.g. Lats (optional)"
            value={form.primaryMuscle}
            onChange={e => set('primaryMuscle', e.target.value)}
            style={INPUT_BASE}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </div>

        {/* Difficulty (optional) */}
        <div>
          <label style={LABEL_BASE}>Difficulty</label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.difficulty}
              onChange={e => set('difficulty', e.target.value)}
              style={{ ...SELECT_BASE, color: form.difficulty ? 'var(--color-white)' : 'var(--color-text-secondary)' }}
            >
              <option value="">Select difficulty (optional)</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            padding: '15px',
            cursor: 'pointer',
            letterSpacing: '0.4px',
            marginTop: '4px',
          }}
        >
          Save Custom Exercise
        </button>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Fields marked <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>*</span> are required.
        </p>
      </div>
    </div>
  )
}

// ─── Browse view ──────────────────────────────────────────────────────────────

function BrowseView({ onSelect, onAddCustom, availableEquipment = [] }) {
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [bodyArea, setBodyArea] = useState('')
  const [equipment, setEquipment] = useState('')
  const [movement, setMovement] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [customExercises] = useState(() => getCustomExercises())
  const searchRef = useRef(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const hasFilters = bodyArea || equipment || movement

  const allExercises = useMemo(() => {
    return [...customExercises, ...defaultExercises]
  }, [customExercises])

  const filtered = useMemo(() => {
    const q = query.trim()
    const nq = normalizeSearch(q)
    const cq = compactSearch(q)

    return allExercises.filter(ex => {
      if (q) {
        const nn = normalizeSearch(ex.name)
        const cn = compactSearch(ex.name)
        const npm = normalizeSearch(ex.primaryMuscle ?? '')
        if (!nn.includes(nq) && !cn.includes(cq) && !npm.includes(nq)) return false
      }
      if (bodyArea && ex.bodyArea !== bodyArea) return false
      if (equipment && ex.equipment !== equipment) return false
      if (movement && ex.movementCategory !== movement) return false
      if (showAvailableOnly && !availableEquipment.includes(ex.equipment)) return false
      return true
    })
  }, [allExercises, query, bodyArea, equipment, movement, showAvailableOnly, availableEquipment])

  const clearFilters = () => {
    setBodyArea('')
    setEquipment('')
    setMovement('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Add Custom Exercise — always visible at top */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onAddCustom}
          style={{
            width: '100%',
            background: 'rgba(255,59,48,0.08)',
            border: '1.5px solid rgba(255,59,48,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            letterSpacing: '0.4px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.08)' }}
        >
          <Plus size={15} />
          Add Custom Exercise
        </button>
      </div>

      {/* Search bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--color-bg)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0 12px',
          }}
        >
          <Search size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search exercises..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-white)',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: 'var(--font)',
              padding: '12px 0',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: 'var(--color-text-secondary)' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filters toggle */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            color: hasFilters ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            letterSpacing: '0.3px',
          }}
        >
          {filtersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {hasFilters ? `Filters (${[bodyArea, equipment, movement].filter(Boolean).length} active)` : 'Filters'}
          {hasFilters && (
            <button
              onClick={e => { e.stopPropagation(); clearFilters() }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-accent)',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font)',
                padding: '2px 6px',
              }}
            >
              Clear All
            </button>
          )}
        </button>

        {filtersOpen && (
          <div
            style={{
              padding: '0 16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Body Area */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Body Area
              </p>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                <Chip label="All" active={!bodyArea} onClick={() => setBodyArea('')} />
                {BODY_AREAS.map(a => (
                  <Chip key={a} label={a} active={bodyArea === a} onClick={() => setBodyArea(a === bodyArea ? '' : a)} />
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Equipment
              </p>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                <Chip label="All" active={!equipment} onClick={() => setEquipment('')} />
                {EQUIPMENT_TYPES.map(eq => (
                  <Chip key={eq} label={eq} active={equipment === eq} onClick={() => setEquipment(eq === equipment ? '' : eq)} />
                ))}
              </div>
            </div>

            {/* Movement */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Movement
              </p>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                <Chip label="All" active={!movement} onClick={() => setMovement('')} />
                {MOVEMENT_CATEGORIES.map(m => (
                  <Chip key={m} label={m} active={movement === m} onClick={() => setMovement(m === movement ? '' : m)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available only toggle */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setShowAvailableOnly(v => !v)}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: `1.5px solid ${showAvailableOnly ? '#34C759' : 'var(--color-border)'}`,
            background: showAvailableOnly ? 'rgba(52,199,89,0.12)' : 'transparent',
            color: showAvailableOnly ? '#34C759' : 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'all 0.15s ease',
          }}
        >
          {showAvailableOnly ? '✓ ' : ''}Available equipment only
        </button>
      </div>

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', marginBottom: '8px' }}>
              No exercises found.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Try changing your search or filters, or use{' '}
              <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>Add Custom Exercise</span> above.
            </p>
          </div>
        ) : (
          filtered.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              onSelect={onSelect}
              isAvailable={availableEquipment.includes(ex.equipment)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── ExercisePicker (exported) ────────────────────────────────────────────────

export default function ExercisePicker({ visible, onClose, onSelect, availableEquipment = [] }) {
  const [view, setView] = useState('browse')

  // Reset to browse whenever picker opens
  useEffect(() => {
    if (visible) setView('browse')
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Picker header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          background: 'var(--color-surface)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            flexShrink: 0,
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p
          style={{
            flex: 1,
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--color-white)',
            fontFamily: 'var(--font)',
          }}
        >
          {view === 'browse' ? 'Select Exercise' : 'Add Custom Exercise'}
        </p>
      </div>

      {/* View content */}
      {view === 'browse' ? (
        <BrowseView
          onSelect={onSelect}
          onAddCustom={() => setView('custom')}
          availableEquipment={availableEquipment}
        />
      ) : (
        <CustomExerciseForm
          onBack={() => setView('browse')}
          onSaved={onSelect}
        />
      )}
    </div>
  )
}
