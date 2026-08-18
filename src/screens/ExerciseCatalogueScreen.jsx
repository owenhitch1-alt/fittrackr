import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Star, Dumbbell, ChevronDown, Check, ArrowLeft, Plus } from 'lucide-react'
import Header from '../components/Header.jsx'
import { defaultExercises } from '../data/exercises.js'
import { exerciseDescriptions } from '../data/exerciseDescriptions.js'
import {
  getCustomExercises,
  getWorkoutTemplates,
  getWorkoutSessions,
  saveWorkoutTemplate,
  getLastExercisePerformance,
  getBestExercisePerformance,
} from '../data/storage.js'
import { getFavouriteIds, toggleFavourite } from '../data/favourites.js'

// ── Search normalisation (identical to ExercisePicker) ────────────────────────
function normalizeSearch(v) {
  return v.toLowerCase().replace(/['']/g,'').replace(/-/g,' ').replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim()
}
function compactSearch(v) { return normalizeSearch(v).replace(/\s/g,'') }

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: 'all',        label: 'All' },
  { id: 'favourites', label: '★ Saved' },
  { id: 'push',       label: 'Push',        movementCategory: 'Push' },
  { id: 'pull',       label: 'Pull',        movementCategory: 'Pull' },
  { id: 'legs',       label: 'Legs',        bodyAreas: ['Legs', 'Glutes'] },
  { id: 'core',       label: 'Core',        bodyArea: 'Core' },
  { id: 'upper',      label: 'Upper Body',  bodyAreas: ['Chest','Back','Shoulders','Arms','Traps'] },
  { id: 'bodyweight', label: 'Bodyweight',  equipment: 'Bodyweight' },
  { id: 'dumbbells',  label: 'Dumbbells',   equipment: 'Dumbbells' },
  { id: 'barbell',    label: 'Barbell',     equipment: 'Barbell' },
  { id: 'cable',      label: 'Cable',       equipment: 'Cable Machine' },
  { id: 'machine',    label: 'Machine',     equipment: 'Machine' },
]

const SORT_OPTIONS = [
  { id: 'a-z',           label: 'A – Z' },
  { id: 'body-area',     label: 'Body Area' },
  { id: 'equipment',     label: 'Equipment' },
  { id: 'difficulty',    label: 'Difficulty' },
  { id: 'recently-used', label: 'Recently Used' },
  { id: 'most-used',     label: 'Most Used' },
]

const DIFF_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 }
const GROUPED_SORTS = new Set(['body-area', 'equipment'])

// ── Filter / sort / group helpers ─────────────────────────────────────────────
function applyChip(exercises, chipId, favIds) {
  if (!chipId || chipId === 'all') return exercises
  if (chipId === 'favourites') return exercises.filter(ex => favIds.includes(ex.id))
  const chip = FILTER_CHIPS.find(c => c.id === chipId)
  if (!chip) return exercises
  return exercises.filter(ex => {
    if (chip.movementCategory) return ex.movementCategory === chip.movementCategory
    if (chip.bodyAreas) return chip.bodyAreas.includes(ex.bodyArea)
    if (chip.bodyArea) return ex.bodyArea === chip.bodyArea
    if (chip.equipment) return ex.equipment === chip.equipment
    return true
  })
}

function applySearch(exercises, query) {
  const q = query.trim()
  if (!q) return exercises
  const nq = normalizeSearch(q), cq = compactSearch(q)
  return exercises.filter(ex => {
    const nn = normalizeSearch(ex.name), cn = compactSearch(ex.name)
    const nm = normalizeSearch(ex.primaryMuscle ?? '')
    return nn.includes(nq) || cn.includes(cq) || nm.includes(nq)
  })
}

function sortList(exercises, sortId, usageMap) {
  const cp = [...exercises]
  switch (sortId) {
    case 'body-area':
      return cp.sort((a,b) => (a.bodyArea??'zzz').localeCompare(b.bodyArea??'zzz') || a.name.localeCompare(b.name))
    case 'equipment':
      return cp.sort((a,b) => (a.equipment??'zzz').localeCompare(b.equipment??'zzz') || a.name.localeCompare(b.name))
    case 'difficulty':
      return cp.sort((a,b) => ((DIFF_ORDER[a.difficulty]??1)-(DIFF_ORDER[b.difficulty]??1)) || a.name.localeCompare(b.name))
    case 'recently-used':
      return cp.sort((a,b) => {
        const ka = a.name.trim().toLowerCase(), kb = b.name.trim().toLowerCase()
        const da = usageMap[ka]?.lastDate ?? '', db = usageMap[kb]?.lastDate ?? ''
        if (da && db) return db.localeCompare(da)
        if (da) return -1
        if (db) return 1
        return a.name.localeCompare(b.name)
      })
    case 'most-used':
      return cp.sort((a,b) => {
        const ca = usageMap[a.name.trim().toLowerCase()]?.count ?? 0
        const cb = usageMap[b.name.trim().toLowerCase()]?.count ?? 0
        return (cb - ca) || a.name.localeCompare(b.name)
      })
    default:
      return cp.sort((a,b) => a.name.localeCompare(b.name))
  }
}

function groupList(exercises, sortId) {
  const key = sortId === 'body-area' ? 'bodyArea' : sortId === 'equipment' ? 'equipment' : null
  if (!key) return [{ header: null, exercises }]
  const groups = {}
  for (const ex of exercises) {
    const g = ex[key] ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(ex)
  }
  return Object.entries(groups).sort(([a],[b]) => a.localeCompare(b)).map(([header, exercises]) => ({ header, exercises }))
}

// ── Data builders ─────────────────────────────────────────────────────────────
function buildLastPerfMap(sessions) {
  const map = {}
  for (const s of sessions) {
    if (s.status !== 'completed' || s.clientId) continue
    for (const ex of s.exercises ?? []) {
      const key = (ex.exerciseName ?? '').trim().toLowerCase()
      if (map[key]) continue
      const valid = (ex.sets ?? []).filter(s => s.completed && s.reps > 0)
      if (!valid.length) continue
      const last = valid.sort((a,b) => b.setNumber - a.setNumber)[0]
      map[key] = { weight: last.weight, reps: last.reps, weightUnit: last.weightUnit ?? 'kg' }
    }
  }
  return map
}

function buildUsageMap(sessions) {
  const map = {}
  for (const s of sessions) {
    if (s.status !== 'completed') continue
    for (const ex of s.exercises ?? []) {
      const key = (ex.exerciseName ?? '').trim().toLowerCase()
      if (!key) continue
      if (!map[key]) map[key] = { count: 0, lastDate: null }
      map[key].count++
      const d = s.completedAt ?? s.startedAt
      if (!map[key].lastDate || d > map[key].lastDate) map[key].lastDate = d
    }
  }
  return map
}

function buildTemplateMap(templates) {
  const map = {}
  for (const t of templates) {
    const seen = new Set()
    for (const ex of t.exercises ?? []) {
      const key = (ex.exerciseName ?? '').trim().toLowerCase()
      if (key && !seen.has(key)) { seen.add(key); map[key] = (map[key] ?? 0) + 1 }
    }
  }
  return map
}

// ── Utility ───────────────────────────────────────────────────────────────────
function fmtPerf(p) {
  if (!p) return null
  if (p.weight && p.reps) return `${p.weight}${p.weightUnit??'kg'} × ${p.reps}`
  if (p.reps) return `${p.reps} reps`
  return null
}

function fmtDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' }) }
  catch { return '' }
}

function getAlternatives(exercise, all, availableEquipment) {
  const cands = all.filter(ex => {
    if (ex.id === exercise.id || ex.name === exercise.name) return false
    const sameMusc = exercise.primaryMuscle && ex.primaryMuscle === exercise.primaryMuscle
    const sameArea = ex.bodyArea === exercise.bodyArea
    const sameMov  = ex.movementCategory === exercise.movementCategory
    return (sameMusc || sameArea) && sameMov
  })
  const avail   = cands.filter(c => availableEquipment.includes(c.equipment))
  const unavail = cands.filter(c => !availableEquipment.includes(c.equipment))
  return [...avail, ...unavail].slice(0, 5)
}

function getSuggestions(query, all) {
  if (!query.trim() || query.length < 2) return []
  const nq = normalizeSearch(query), cq = compactSearch(query)
  const seen = new Set(), out = []
  for (const ex of all) {
    const nn = normalizeSearch(ex.name), cn = compactSearch(ex.name)
    if ((nn.includes(nq) || cn.includes(cq)) && !seen.has(ex.name)) {
      seen.add(ex.name); out.push(ex.name)
      if (out.length >= 5) break
    }
  }
  return out
}

function addToWorkoutTemplate(exerciseName, templateId) {
  const templates = getWorkoutTemplates()
  const t = templates.find(t => t.id === templateId)
  if (!t) return 'not-found'
  if ((t.exercises ?? []).some(ex => (ex.exerciseName??'').trim().toLowerCase() === exerciseName.trim().toLowerCase()))
    return 'duplicate'
  saveWorkoutTemplate({
    ...t,
    exercises: [...(t.exercises ?? []), { exerciseName, exerciseOrder: (t.exercises?.length ?? 0) + 1 }],
  })
  return 'success'
}

// ── Shared mini-chip ──────────────────────────────────────────────────────────
function Chip({ label, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: small ? '5px 10px' : '6px 12px',
        borderRadius: '20px',
        border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: active ? 'rgba(255,59,48,0.12)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        fontSize: small ? '11px' : '12px',
        fontWeight: 700,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div style={{ padding: '10px 16px 5px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 1 }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {title}
      </p>
    </div>
  )
}

// ── Exercise row ──────────────────────────────────────────────────────────────
function ExerciseRow({ exercise, isAvailable, isFav, lastPerf, usedCount, onPress, onToggleFav }) {
  const perfText = fmtPerf(lastPerf)
  const meta1 = [exercise.bodyArea, exercise.primaryMuscle].filter(Boolean).join(' · ')
  const meta2 = [exercise.equipment, exercise.difficulty].filter(Boolean).join(' · ')
  const bottomLine = [perfText ? `Last: ${perfText}` : null, usedCount > 0 ? `Used in ${usedCount} workout${usedCount !== 1 ? 's' : ''}` : null].filter(Boolean).join('  ·  ')

  return (
    <button
      onClick={onPress}
      style={{ width:'100%', background:'none', border:'none', borderBottom:'1px solid var(--color-border)', padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:'10px', cursor:'pointer', textAlign:'left', transition:'background 0.1s ease' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      aria-label={`View details for ${exercise.name}`}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'15px', fontWeight:600, color:'var(--color-white)', fontFamily:'var(--font)', marginBottom: meta1 ? '2px' : 0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {exercise.name}
          {exercise.isCustom && <span style={{ marginLeft:'8px', fontSize:'10px', fontWeight:700, color:'var(--color-accent)', letterSpacing:'0.5px', textTransform:'uppercase', verticalAlign:'middle' }}>Custom</span>}
        </p>
        {meta1 && <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', marginBottom:'1px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{meta1}</p>}
        {meta2 && <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{meta2}</p>}
        {bottomLine && <p style={{ fontSize:'11px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', marginTop:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', opacity:0.75 }}>{bottomLine}</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0, paddingTop:'1px' }}>
        <button
          onClick={e => { e.stopPropagation(); onToggleFav() }}
          aria-label={isFav ? `Remove ${exercise.name} from saved` : `Save ${exercise.name}`}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', display:'flex', color: isFav ? '#F0A500' : 'var(--color-border)', transition:'color 0.15s ease' }}
        >
          <Star size={16} fill={isFav ? '#F0A500' : 'none'} />
        </button>
        <span
          style={{ width:'20px', height:'20px', borderRadius:'50%', background: isAvailable ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color: isAvailable ? '#34C759' : 'var(--color-accent)' }}
          title={isAvailable ? 'Equipment available' : 'Equipment not available'}
        >
          {isAvailable ? '✓' : '✗'}
        </span>
      </div>
    </button>
  )
}

// ── Sort sheet ────────────────────────────────────────────────────────────────
function SortSheet({ current, onSelect, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:149, background:'rgba(0,0,0,0.6)' }} />
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', zIndex:150, background:'var(--color-surface)', borderRadius:'var(--radius-md) var(--radius-md) 0 0', borderTop:'1px solid var(--color-border)', paddingBottom:'env(safe-area-inset-bottom,20px)' }}>
        <div style={{ padding:'16px 20px 8px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:'16px', fontWeight:700, color:'var(--color-white)', fontFamily:'var(--font)' }}>Sort By</p>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', padding:'4px', display:'flex' }} aria-label="Close sort">
            <X size={20} />
          </button>
        </div>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => { onSelect(opt.id); onClose() }}
            style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', color: current === opt.id ? 'var(--color-accent)' : 'var(--color-white)', fontSize:'15px', fontWeight: current === opt.id ? 700 : 500, fontFamily:'var(--font)', borderBottom:'1px solid var(--color-border)', transition:'background 0.1s ease' }}
          >
            {opt.label}
            {current === opt.id && <Check size={18} />}
          </button>
        ))}
      </div>
    </>
  )
}

// ── Add to workout sheet ──────────────────────────────────────────────────────
function AddToWorkoutSheet({ exerciseName, onClose, onSuccess }) {
  const [templates] = useState(() => getWorkoutTemplates())
  const [result, setResult] = useState(null)
  const [addedTo, setAddedTo] = useState(null)

  const handleAdd = useCallback((templateId) => {
    const r = addToWorkoutTemplate(exerciseName, templateId)
    setResult(r)
    setAddedTo(templateId)
    if (r === 'success') {
      onSuccess?.()
      setTimeout(onClose, 1500)
    }
  }, [exerciseName, onClose, onSuccess])

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:299, background:'rgba(0,0,0,0.7)' }} />
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', zIndex:300, background:'var(--color-surface)', borderRadius:'var(--radius-md) var(--radius-md) 0 0', borderTop:'1px solid var(--color-border)', maxHeight:'65vh', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom,20px)' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <p style={{ fontSize:'16px', fontWeight:700, color:'var(--color-white)', fontFamily:'var(--font)' }}>Add to Workout</p>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', padding:'4px', display:'flex' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {templates.length === 0 ? (
            <div style={{ padding:'40px 24px', textAlign:'center' }}>
              <p style={{ fontSize:'15px', fontWeight:700, color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'8px' }}>No saved workouts yet</p>
              <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>Create a workout first.</p>
            </div>
          ) : (
            templates.map(t => {
              const wasSelected = addedTo === t.id
              const msg = wasSelected ? (result === 'success' ? '✓ Added!' : result === 'duplicate' ? 'Already in this workout' : null) : null
              return (
                <button
                  key={t.id}
                  onClick={() => handleAdd(t.id)}
                  style={{ width:'100%', background: wasSelected && result === 'success' ? 'rgba(52,199,89,0.10)' : 'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--color-border)', transition:'background 0.15s ease' }}
                >
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:'15px', fontWeight:500, color:'var(--color-white)', fontFamily:'var(--font)', marginBottom: msg ? '2px' : 0 }}>{t.name}</p>
                    {msg && <p style={{ fontSize:'12px', fontWeight:600, color: result === 'success' ? '#34C759' : 'var(--color-accent)', fontFamily:'var(--font)' }}>{msg}</p>}
                  </div>
                  <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', flexShrink:0, marginLeft:'12px' }}>{(t.exercises?.length ?? 0)} exercises</p>
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// ── Exercise detail view ──────────────────────────────────────────────────────
function ExerciseDetailView({ exercise, availableEquipment, favouriteIds, onToggleFav, templateMap, allExercises, onSelectExercise, onClose, onWorkoutUpdated }) {
  const navigate = useNavigate()
  const lastPerf = useMemo(() => getLastExercisePerformance(exercise.name, null), [exercise.name])
  const bestPerf = useMemo(() => getBestExercisePerformance(exercise.name, null), [exercise.name])
  const alternatives = useMemo(() => getAlternatives(exercise, allExercises, availableEquipment), [exercise, allExercises, availableEquipment])
  const [showAddSheet, setShowAddSheet] = useState(false)

  const isAvailable = availableEquipment.includes(exercise.equipment)
  const isFav = favouriteIds.includes(exercise.id)
  const usedCount = templateMap[(exercise.name ?? '').trim().toLowerCase()] ?? 0
  const exKey = (exercise.name ?? '').trim().toLowerCase()

  const enriched = exerciseDescriptions[exercise.id] ?? {}
  const diffColor = exercise.difficulty === 'Advanced' ? 'var(--color-accent)' : exercise.difficulty === 'Intermediate' ? '#F0A500' : 'var(--color-text-secondary)'

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:'24px' }}>
      <p style={{ fontSize:'11px', fontWeight:700, color:'var(--color-text-secondary)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>{title}</p>
      {children}
    </div>
  )

  const MetaRow = ({ label, value, valueColor }) => value ? (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:'8px', borderBottom:'1px solid var(--color-border)', marginBottom:'8px' }}>
      <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>{label}</p>
      <p style={{ fontSize:'13px', fontWeight:600, color: valueColor ?? 'var(--color-white)', fontFamily:'var(--font)', textAlign:'right', maxWidth:'60%' }}>{value}</p>
    </div>
  ) : null

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--color-bg)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid var(--color-border)', flexShrink:0, background:'var(--color-surface)' }}>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', padding:'6px', display:'flex', alignItems:'center', borderRadius:'6px', flexShrink:0 }} aria-label="Close detail">
          <ArrowLeft size={22} />
        </button>
        <p style={{ flex:1, fontSize:'17px', fontWeight:800, color:'var(--color-white)', fontFamily:'var(--font)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {exercise.name}
        </p>
        <button
          onClick={() => onToggleFav(exercise.id)}
          aria-label={isFav ? `Remove ${exercise.name} from saved` : `Save ${exercise.name}`}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', display:'flex', color: isFav ? '#F0A500' : 'var(--color-text-secondary)', transition:'color 0.15s ease', flexShrink:0 }}
        >
          <Star size={22} fill={isFav ? '#F0A500' : 'none'} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 80px' }}>

        {/* Media placeholder */}
        <div style={{ height:'160px', background:'var(--color-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
          {exercise.media?.image ? (
            <img src={exercise.media.image} alt={exercise.name} style={{ maxHeight:'100%', maxWidth:'100%', borderRadius:'var(--radius-md)', objectFit:'contain' }} />
          ) : (
            <>
              <Dumbbell size={36} color="var(--color-border)" strokeWidth={1.5} />
              <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', fontStyle:'italic' }}>Exercise demo coming soon</p>
            </>
          )}
        </div>

        {/* Description */}
        {enriched.description && (
          <Section title="About">
            <div style={{ padding:'14px 16px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)' }}>
              <p style={{ fontSize:'14px', color:'var(--color-white)', fontFamily:'var(--font)', lineHeight:1.65 }}>{enriched.description}</p>
            </div>
          </Section>
        )}

        {/* Metadata */}
        <Section title="Details">
          {exercise.isCustom && <MetaRow label="Type" value="Custom Exercise" valueColor="var(--color-accent)" />}
          <MetaRow label="Body Area" value={exercise.bodyArea} />
          <MetaRow label="Primary Muscle" value={exercise.primaryMuscle} />
          {exercise.secondaryMuscles?.length > 0 && <MetaRow label="Secondary Muscles" value={exercise.secondaryMuscles.join(', ')} />}
          <MetaRow label="Movement" value={exercise.movementCategory} />
          <MetaRow label="Equipment" value={exercise.equipment} />
          <MetaRow label="Difficulty" value={exercise.difficulty} valueColor={exercise.difficulty ? diffColor : undefined} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'8px' }}>
            <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>Equipment Status</p>
            <p style={{ fontSize:'13px', fontWeight:700, color: isAvailable ? '#34C759' : 'var(--color-accent)', fontFamily:'var(--font)' }}>
              {isAvailable ? '✓ Available' : '✗ Not Available'}
            </p>
          </div>
        </Section>

        {/* Performance */}
        <Section title="Performance">
          {!lastPerf && !bestPerf.overallBest ? (
            <div style={{ padding:'16px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', textAlign:'center', border:'1px solid var(--color-border)' }}>
              <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', marginBottom:'4px' }}>No history yet</p>
              <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', opacity:0.7 }}>Complete a workout with this exercise to see your stats.</p>
            </div>
          ) : (
            <>
              {lastPerf && (
                <div style={{ background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)', padding:'12px 14px', marginBottom:'10px' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'var(--color-text-secondary)', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'8px' }}>Last Performed {lastPerf.completedAt ? `· ${fmtDate(lastPerf.completedAt)}` : ''}</p>
                  {lastPerf.sets.map((s, i) => (
                    <p key={i} style={{ fontSize:'13px', color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'3px' }}>
                      Set {s.setNumber}: {s.weight ? `${s.weight}${s.weightUnit ?? 'kg'} × ${s.reps}` : `${s.reps} reps`}
                    </p>
                  ))}
                </div>
              )}
              {bestPerf.overallBest && (
                <div style={{ background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)', padding:'12px 14px', marginBottom:'10px' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'var(--color-text-secondary)', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'8px' }}>Overall Best {bestPerf.overallBest.completedAt ? `· ${fmtDate(bestPerf.overallBest.completedAt)}` : ''}</p>
                  <p style={{ fontSize:'13px', color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'3px' }}>
                    {bestPerf.overallBest.setCount} sets · {bestPerf.overallBest.totalReps} reps
                    {bestPerf.overallBest.totalVolume > 0 ? ` · ${bestPerf.overallBest.totalVolume.toLocaleString()}${bestPerf.overallBest.volumeUnit} vol` : ''}
                  </p>
                  {bestPerf.mostRepsSet && (
                    <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', marginBottom:'2px' }}>
                      Most reps: {bestPerf.mostRepsSet.reps}{bestPerf.mostRepsSet.weight ? ` @ ${bestPerf.mostRepsSet.weight}${bestPerf.mostRepsSet.weightUnit ?? 'kg'}` : ''}
                    </p>
                  )}
                  {bestPerf.heaviestWeightSet && bestPerf.heaviestWeightSet.weight > 0 && (
                    <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>
                      Heaviest: {bestPerf.heaviestWeightSet.weight}{bestPerf.heaviestWeightSet.weightUnit ?? 'kg'} × {bestPerf.heaviestWeightSet.reps}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </Section>

        {/* Used in workouts */}
        <Section title="Workouts">
          <div style={{ padding:'12px 14px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)' }}>
            <p style={{ fontSize:'14px', fontWeight:600, color:'var(--color-white)', fontFamily:'var(--font)' }}>
              {usedCount > 0 ? `Used in ${usedCount} saved workout${usedCount !== 1 ? 's' : ''}` : 'Not used in any saved workouts yet'}
            </p>
          </div>
        </Section>

        {/* Instructions */}
        <Section title="Instructions">
          {(enriched.instructions ?? []).length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {enriched.instructions.map((step, i) => (
                <div key={i} style={{ padding:'12px 14px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'12px', fontWeight:800, color:'var(--color-accent)', fontFamily:'var(--font)', minWidth:'18px', paddingTop:'1px' }}>{i + 1}</span>
                  <p style={{ fontSize:'13px', color:'var(--color-white)', fontFamily:'var(--font)', lineHeight:1.65 }}>{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding:'14px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)', textAlign:'center' }}>
              <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', fontStyle:'italic' }}>Instructions coming soon.</p>
            </div>
          )}
        </Section>

        {/* Muscle diagram */}
        <Section title="Muscles">
          <div style={{ padding:'16px', background:'var(--color-surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)' }}>
            {exercise.primaryMuscle && (
              <p style={{ fontSize:'13px', color:'var(--color-white)', fontFamily:'var(--font)', marginBottom: exercise.secondaryMuscles?.length ? '6px' : '10px' }}>
                <span style={{ color:'var(--color-text-secondary)' }}>Primary: </span>{exercise.primaryMuscle}
              </p>
            )}
            {exercise.secondaryMuscles?.length > 0 && (
              <p style={{ fontSize:'13px', color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'10px' }}>
                <span style={{ color:'var(--color-text-secondary)' }}>Secondary: </span>{exercise.secondaryMuscles.join(', ')}
              </p>
            )}
            {exercise.muscleDiagram ? (
              <img src={exercise.muscleDiagram} alt="Muscle diagram" style={{ width:'100%', borderRadius:'var(--radius-sm)' }} />
            ) : (
              <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', fontStyle:'italic', textAlign:'center' }}>Muscle diagram coming soon</p>
            )}
          </div>
        </Section>

        {/* Alternatives */}
        <Section title="Alternatives">
          {alternatives.length === 0 ? (
            <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', fontStyle:'italic' }}>No alternatives available yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              {alternatives.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => onSelectExercise(alt)}
                  style={{ width:'100%', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'11px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', marginBottom:'4px', textAlign:'left', transition:'background 0.1s ease' }}
                  aria-label={`View ${alt.name}`}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'14px', fontWeight:600, color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{alt.name}</p>
                    <p style={{ fontSize:'12px', color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>
                      {[alt.equipment, alt.difficulty].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span style={{ flexShrink:0, width:'18px', height:'18px', borderRadius:'50%', background: availableEquipment.includes(alt.equipment) ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color: availableEquipment.includes(alt.equipment) ? '#34C759' : 'var(--color-accent)', marginLeft:'10px' }}>
                    {availableEquipment.includes(alt.equipment) ? '✓' : '✗'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <Section title="Quick Actions">
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <button
              onClick={() => setShowAddSheet(true)}
              style={{ width:'100%', background:'var(--color-accent)', border:'none', borderRadius:'var(--radius-sm)', color:'var(--color-on-accent)', fontSize:'14px', fontWeight:700, fontFamily:'var(--font)', padding:'14px', cursor:'pointer', letterSpacing:'0.4px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'opacity 0.15s ease' }}
              onMouseDown={e => { e.currentTarget.style.opacity='0.8' }}
              onMouseUp={e => { e.currentTarget.style.opacity='1' }}
              onTouchStart={e => { e.currentTarget.style.opacity='0.8' }}
              onTouchEnd={e => { e.currentTarget.style.opacity='1' }}
              aria-label="Add to existing workout"
            >
              <Plus size={16} /> Add to Existing Workout
            </button>
            <button
              onClick={() => { onClose(); navigate('/workouts/create', { state: { prefillExerciseName: exercise.name } }) }}
              style={{ width:'100%', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-white)', fontSize:'14px', fontWeight:700, fontFamily:'var(--font)', padding:'14px', cursor:'pointer', letterSpacing:'0.4px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'background 0.15s ease' }}
              aria-label="Create workout with this exercise"
            >
              Create Workout With This Exercise
            </button>
          </div>
        </Section>
      </div>

      {/* Add to workout sheet */}
      {showAddSheet && (
        <AddToWorkoutSheet
          exerciseName={exercise.name}
          onClose={() => setShowAddSheet(false)}
          onSuccess={onWorkoutUpdated}
        />
      )}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ExerciseCatalogueScreen({ availableEquipment = [] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [sortId, setSortId] = useState('a-z')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [favouriteIds, setFavouriteIds] = useState(() => getFavouriteIds())
  const [templateVersion, setTemplateVersion] = useState(0)

  const allExercises = useMemo(() => [...getCustomExercises(), ...defaultExercises], [])

  const sessions = useMemo(() => getWorkoutSessions(), [])
  const lastPerfMap = useMemo(() => buildLastPerfMap(sessions), [sessions])
  const usageMap   = useMemo(() => buildUsageMap(sessions), [sessions])
  const templateMap = useMemo(() => buildTemplateMap(getWorkoutTemplates()), [templateVersion])

  const handleToggleFav = useCallback((exerciseId) => {
    setFavouriteIds(toggleFavourite(exerciseId))
  }, [])

  const handleWorkoutUpdated = useCallback(() => {
    setTemplateVersion(v => v + 1)
  }, [])

  const suggestions = useMemo(() => getSuggestions(query, allExercises), [query, allExercises])

  const filtered = useMemo(() => {
    let list = allExercises
    list = applySearch(list, query)
    list = applyChip(list, activeChip, favouriteIds)
    if (showAvailableOnly) list = list.filter(ex => availableEquipment.includes(ex.equipment))
    list = sortList(list, sortId, usageMap)
    return list
  }, [allExercises, query, activeChip, favouriteIds, showAvailableOnly, sortId, usageMap, availableEquipment])

  const groups = useMemo(() => groupList(filtered, sortId), [filtered, sortId])
  const isGrouped = GROUPED_SORTS.has(sortId)
  const countText = query.trim() || activeChip !== 'all' || showAvailableOnly
    ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
    : `${allExercises.length} exercises`

  const currentSortLabel = SORT_OPTIONS.find(s => s.id === sortId)?.label ?? 'A – Z'

  const handleReset = () => { setQuery(''); setActiveChip('all'); setShowAvailableOnly(false) }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <Header title="Exercise Catalogue" onBack={() => navigate(-1)} />

      {/* Search bar */}
      <div style={{ padding:'12px 16px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'var(--color-surface)', border:'1.5px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'0 12px' }}>
          <Search size={16} color="var(--color-text-secondary)" style={{ flexShrink:0 }} />
          <input
            type="text"
            placeholder="Search exercises"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search exercises"
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--color-white)', fontSize:'15px', fontWeight:500, fontFamily:'var(--font)', padding:'12px 0' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', display:'flex', color:'var(--color-text-secondary)' }} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions strip */}
      {suggestions.length > 0 && query.trim().length >= 2 && (
        <div style={{ display:'flex', alignItems:'center', gap:'6px', overflowX:'auto', padding:'8px 16px 0', flexShrink:0 }}>
          <p style={{ fontSize:'11px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', flexShrink:0 }}>Suggestions:</p>
          {suggestions.map(s => (
            <button key={s} onClick={() => setQuery(s)} style={{ flexShrink:0, fontSize:'11px', fontWeight:600, color:'var(--color-accent)', background:'rgba(255,59,48,0.08)', border:'1px solid rgba(255,59,48,0.25)', borderRadius:'12px', padding:'3px 10px', cursor:'pointer', fontFamily:'var(--font)', whiteSpace:'nowrap' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Filter chips + sort */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', borderBottom:'1px solid var(--color-border)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', flex:1, paddingBottom:'2px' }} role="group" aria-label="Filter exercises">
          {FILTER_CHIPS.map(chip => (
            <Chip key={chip.id} label={chip.label} active={activeChip === chip.id} onClick={() => setActiveChip(chip.id)} />
          ))}
        </div>
        <button
          onClick={() => setShowSortSheet(true)}
          style={{ flexShrink:0, display:'flex', alignItems:'center', gap:'4px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'6px 10px', cursor:'pointer', color:'var(--color-white)', fontSize:'12px', fontWeight:700, fontFamily:'var(--font)', whiteSpace:'nowrap', letterSpacing:'0.3px' }}
          aria-label={`Sort: ${currentSortLabel}. Tap to change`}
        >
          {currentSortLabel} <ChevronDown size={13} />
        </button>
      </div>

      {/* Controls row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 16px 4px', flexShrink:0 }}>
        <button
          onClick={() => setShowAvailableOnly(v => !v)}
          style={{ padding:'5px 10px', borderRadius:'20px', border:`1.5px solid ${showAvailableOnly ? '#34C759' : 'var(--color-border)'}`, background: showAvailableOnly ? 'rgba(52,199,89,0.12)' : 'transparent', color: showAvailableOnly ? '#34C759' : 'var(--color-text-secondary)', fontSize:'11px', fontWeight:700, fontFamily:'var(--font)', cursor:'pointer', letterSpacing:'0.3px', transition:'all 0.15s ease' }}
          aria-pressed={showAvailableOnly}
        >
          {showAvailableOnly ? '✓ ' : ''}Available only
        </button>
        <p style={{ fontSize:'12px', fontWeight:600, color:'var(--color-text-secondary)', fontFamily:'var(--font)' }}>{countText}</p>
      </div>

      {/* Exercise list */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'48px 24px', textAlign:'center' }}>
            <p style={{ fontSize:'15px', fontWeight:700, color:'var(--color-white)', fontFamily:'var(--font)', marginBottom:'8px' }}>No exercises found</p>
            <p style={{ fontSize:'13px', color:'var(--color-text-secondary)', fontFamily:'var(--font)', lineHeight:1.6, marginBottom:'20px' }}>
              Try searching by muscle, equipment, or movement type.
            </p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
              {query && <Chip label="Clear Search" active={false} onClick={() => setQuery('')} small />}
              {(activeChip !== 'all' || showAvailableOnly) && <Chip label="Show All" active={false} onClick={handleReset} small />}
              {showAvailableOnly && <Chip label="Disable Available Filter" active={false} onClick={() => setShowAvailableOnly(false)} small />}
            </div>
          </div>
        ) : isGrouped ? (
          groups.map(({ header, exercises }) => (
            <div key={header ?? 'ungrouped'}>
              {header && <SectionHeader title={header} />}
              {exercises.map(ex => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  isAvailable={availableEquipment.includes(ex.equipment)}
                  isFav={favouriteIds.includes(ex.id)}
                  lastPerf={lastPerfMap[(ex.name ?? '').trim().toLowerCase()] ?? null}
                  usedCount={templateMap[(ex.name ?? '').trim().toLowerCase()] ?? 0}
                  onPress={() => setSelectedExercise(ex)}
                  onToggleFav={() => handleToggleFav(ex.id)}
                />
              ))}
            </div>
          ))
        ) : (
          filtered.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              isAvailable={availableEquipment.includes(ex.equipment)}
              isFav={favouriteIds.includes(ex.id)}
              lastPerf={lastPerfMap[(ex.name ?? '').trim().toLowerCase()] ?? null}
              usedCount={templateMap[(ex.name ?? '').trim().toLowerCase()] ?? 0}
              onPress={() => setSelectedExercise(ex)}
              onToggleFav={() => handleToggleFav(ex.id)}
            />
          ))
        )}
      </div>

      {/* Sort sheet */}
      {showSortSheet && (
        <SortSheet current={sortId} onSelect={setSortId} onClose={() => setShowSortSheet(false)} />
      )}

      {/* Exercise detail */}
      {selectedExercise && (
        <ExerciseDetailView
          key={selectedExercise.id}
          exercise={selectedExercise}
          availableEquipment={availableEquipment}
          favouriteIds={favouriteIds}
          onToggleFav={handleToggleFav}
          templateMap={templateMap}
          allExercises={allExercises}
          onSelectExercise={setSelectedExercise}
          onClose={() => setSelectedExercise(null)}
          onWorkoutUpdated={handleWorkoutUpdated}
        />
      )}
    </div>
  )
}
