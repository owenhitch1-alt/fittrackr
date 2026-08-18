import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Trash2, ChevronDown, ChevronUp, AlertTriangle, Clock, Ban } from 'lucide-react'
import Header from '../components/Header.jsx'
import {
  getAvailabilityBlocks, generateAvailability, deleteAvailabilityBlock, clearAvailabilityBlocks,
  getTimeOutBlocks, saveTimeOutBlock, deleteTimeOutBlock, findOverlappingTimeOut,
  getBookingCategories, saveBookingCategory, deleteBookingCategory,
  getBookingStatuses, saveBookingStatus, deleteBookingStatus,
  getPaymentTypes, savePaymentType, deletePaymentType,
  checkSessionVsAvailability,
} from '../data/workPlanner.js'
import { getPTScheduledSessions, calculateEndTime, getPTDurationSettings, savePTDurationSettings } from '../data/ptSchedule.js'

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function friendlyDate(dateStr) {
  const today = localDateStr()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const tStr = localDateStr(tomorrow)
  if (dateStr === today) return 'Today'
  if (dateStr === tStr) return 'Tomorrow'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const TODAY = localDateStr()

const DAYS_OF_WEEK = [
  { label: 'S', full: 'Sunday', value: 0 },
  { label: 'M', full: 'Monday', value: 1 },
  { label: 'T', full: 'Tuesday', value: 2 },
  { label: 'W', full: 'Wednesday', value: 3 },
  { label: 'T', full: 'Thursday', value: 4 },
  { label: 'F', full: 'Friday', value: 5 },
  { label: 'S', full: 'Saturday', value: 6 },
]

const RANGE_TYPES = [
  { value: 'week', label: 'Week(s)' },
  { value: 'month', label: 'Month(s)' },
  { value: 'year', label: 'Year(s)' },
]

const TIMEOUT_DURATIONS = [15, 30, 45, 60, 90, 120]

const S = {
  label: {
    fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)',
    letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px',
  },
  input: {
    width: '100%', background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-white)', fontSize: '14px',
    fontWeight: 500, fontFamily: 'var(--font)', padding: '10px 13px', outline: 'none',
    boxSizing: 'border-box', colorScheme: 'dark', transition: 'border-color 0.15s ease',
  },
  sectionCard: {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px',
  },
  sectionHeader: {
    padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '14px', fontWeight: 800, color: 'var(--color-white)',
    fontFamily: 'var(--font)', letterSpacing: '-0.1px',
  },
  pill: (active) => ({
    padding: '7px 13px', borderRadius: '20px', cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
    background: active ? 'rgba(255,59,48,0.12)' : 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
    transition: 'all 0.12s ease', letterSpacing: '0.3px',
  }),
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-accent)',
    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer',
  },
  tagItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', borderBottom: '1px solid var(--color-border)',
  },
  tagName: {
    fontSize: '14px', fontWeight: 500, color: 'var(--color-white)', fontFamily: 'var(--font)',
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-text-secondary)', padding: '4px', display: 'flex',
    borderRadius: '6px',
  },
  error: {
    fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '5px',
  },
}

// ── Reusable tag list section ─────────────────────────────────────────────────
function TagListSection({ title, items, onSave, onDelete, minItems = 1 }) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) { setError('Name required'); return }
    if (items.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Already exists')
      return
    }
    onSave({ name: trimmed })
    setNewName('')
    setError(null)
  }

  return (
    <div style={S.sectionCard}>
      <div style={S.sectionHeader}>
        <p style={S.sectionTitle}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {items.map(item => (
        <div key={item.id} style={S.tagItem}>
          {confirmId === item.id ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ ...S.tagName, flex: 1 }}>Delete "{item.name}"?</p>
              <button onClick={() => { onDelete(item.id); setConfirmId(null) }}
                style={{ ...S.pill(true), padding: '5px 10px', fontSize: '12px' }}>
                Delete
              </button>
              <button onClick={() => setConfirmId(null)}
                style={{ ...S.pill(false), padding: '5px 10px', fontSize: '12px' }}>
                Keep
              </button>
            </div>
          ) : (
            <>
              <p style={S.tagName}>{item.name}</p>
              {items.length > minItems && (
                <button onClick={() => setConfirmId(item.id)} style={S.iconBtn} aria-label={`Delete ${item.name}`}>
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      ))}

      <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Add ${title.toLowerCase().replace('booking ', '')}…`}
            style={{ ...S.input, padding: '9px 12px' }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
          {error && <p style={S.error}>{error}</p>}
        </div>
        <button onClick={handleAdd} style={{ ...S.addBtn, padding: '9px 14px', marginTop: 0 }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WorkPlannerScreen() {
  const navigate = useNavigate()

  // ── Availability state ────────────────────────────────────────────────────
  const [availBlocks, setAvailBlocks] = useState(() => getAvailabilityBlocks())
  const [showAvailForm, setShowAvailForm] = useState(false)
  const [rangeType, setRangeType] = useState('week')
  const [numberOf, setNumberOf] = useState('4')
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5])
  const [workStart, setWorkStart] = useState('09:00')
  const [workEnd, setWorkEnd] = useState('17:00')
  const [availErrors, setAvailErrors] = useState({})
  const [availResult, setAvailResult] = useState(null)
  const [confirmClearAvail, setConfirmClearAvail] = useState(false)

  // ── Time Out state ────────────────────────────────────────────────────────
  const [timeOuts, setTimeOuts] = useState(() => getTimeOutBlocks())
  const [showTimeOutForm, setShowTimeOutForm] = useState(false)
  const [toDate, setToDate] = useState(TODAY)
  const [toStart, setToStart] = useState('12:00')
  const [toDuration, setToDuration] = useState('60')
  const [toReason, setToReason] = useState('')
  const [toNotes, setToNotes] = useState('')
  const [toErrors, setToErrors] = useState({})
  const [toConflict, setToConflict] = useState(null)

  // ── Categories / Statuses / Payment Types ─────────────────────────────────
  const [categories, setCategories] = useState(() => getBookingCategories())
  const [statuses, setStatuses] = useState(() => getBookingStatuses())
  const [paymentTypes, setPaymentTypes] = useState(() => getPaymentTypes())

  // ── Session Durations state ────────────────────────────────────────────────
  const [durationSettings, setDurationSettings] = useState(() => getPTDurationSettings())
  const [newDurationInput, setNewDurationInput] = useState('')
  const [newDurationError, setNewDurationError] = useState(null)

  const updateDurationSettings = (updated) => {
    setDurationSettings(updated)
    savePTDurationSettings(updated)
  }

  const handleAddDuration = () => {
    const raw = newDurationInput.trim()
    if (!raw) { setNewDurationError('Enter a duration.'); return }
    const num = Number(raw)
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 15 || num > 240) {
      setNewDurationError('Enter a whole number between 15 and 240 minutes.')
      return
    }
    if (durationSettings.options.includes(num)) {
      setNewDurationError('This duration is already in the list.')
      return
    }
    updateDurationSettings({ ...durationSettings, options: [...durationSettings.options, num].sort((a, b) => a - b) })
    setNewDurationInput('')
    setNewDurationError(null)
  }

  const handleRemoveDuration = (mins) => {
    if (durationSettings.options.length <= 1) return
    const newOpts = durationSettings.options.filter(o => o !== mins)
    const newDefault = durationSettings.defaultMinutes === mins ? newOpts[0] : durationSettings.defaultMinutes
    updateDurationSettings({ options: newOpts, defaultMinutes: newDefault })
  }

  // ── Availability helpers ──────────────────────────────────────────────────
  const upcomingAvail = useMemo(() =>
    availBlocks
      .filter(b => b.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [availBlocks]
  )

  const toggleDay = (dow) => {
    setSelectedDays(prev =>
      prev.includes(dow) ? prev.filter(d => d !== dow) : [...prev, dow]
    )
  }

  const handleGenerateAvail = () => {
    const errs = {}
    const n = Number(numberOf)
    if (!numberOf || isNaN(n) || n < 1) errs.number = 'Enter a number (1+)'
    if (selectedDays.length === 0) errs.days = 'Select at least one day'
    if (!workStart) errs.start = 'Start time required'
    if (!workEnd) errs.end = 'End time required'
    if (workStart && workEnd && workStart >= workEnd) errs.end = 'End must be after start'
    if (Object.keys(errs).length) { setAvailErrors(errs); return }

    const result = generateAvailability({
      rangeType, numberOf: n, selectedDays, startTime: workStart, endTime: workEnd,
    })
    setAvailBlocks(getAvailabilityBlocks())
    setAvailResult(result)
    setShowAvailForm(false)
    setAvailErrors({})
  }

  const handleDeleteAvailBlock = (id) => {
    deleteAvailabilityBlock(id)
    setAvailBlocks(getAvailabilityBlocks())
  }

  const handleClearAvail = () => {
    clearAvailabilityBlocks()
    setAvailBlocks([])
    setConfirmClearAvail(false)
  }

  // ── Time Out helpers ──────────────────────────────────────────────────────
  const upcomingTimeOuts = useMemo(() =>
    timeOuts
      .filter(t => t.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [timeOuts]
  )

  const toEndTime = useMemo(() => {
    if (!toStart || !toDuration) return null
    const [h, m] = toStart.split(':').map(Number)
    const total = h * 60 + m + Number(toDuration)
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }, [toStart, toDuration])

  const handleSaveTimeOut = (force = false) => {
    const errs = {}
    if (!toDate) errs.date = 'Date is required'
    if (!toStart) errs.start = 'Start time is required'
    if (!toDuration) errs.duration = 'Select a duration'
    if (Object.keys(errs).length) { setToErrors(errs); return }

    if (!force) {
      const conflict = findOverlappingTimeOut(toDate, toStart, toEndTime)
      if (conflict) { setToConflict(conflict); return }

      const sessions = getPTScheduledSessions().filter(s => s.status === 'scheduled' && s.date === toDate)
      const sessionConflict = sessions.find(s => {
        const sEnd = s.endTime || (s.durationMinutes ? calculateEndTime(s.startTime, s.durationMinutes) : null)
        if (!sEnd || !toEndTime) return s.startTime === toStart
        const { doTimeRangesOverlap: dtr } = { doTimeRangesOverlap: (sA, eA, sB, eB) => {
          const tm = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
          return tm(sA) < tm(eB) && tm(eA) > tm(sB)
        }}
        return dtr(toStart, toEndTime, s.startTime, sEnd)
      })
      if (sessionConflict) { setToConflict({ ...sessionConflict, isSession: true }); return }
    }

    saveTimeOutBlock({
      date: toDate, startTime: toStart,
      endTime: toEndTime, durationMinutes: Number(toDuration),
      reason: toReason.trim() || undefined,
      notes: toNotes.trim() || undefined,
    })
    setTimeOuts(getTimeOutBlocks())
    setToDate(TODAY); setToStart('12:00'); setToDuration('60')
    setToReason(''); setToNotes('')
    setToErrors({}); setToConflict(null)
    setShowTimeOutForm(false)
  }

  const handleDeleteTimeOut = (id) => {
    deleteTimeOutBlock(id)
    setTimeOuts(getTimeOutBlocks())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Work Planner" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>

        {/* ── Availability Planner ─────────────────────────────────────────── */}
        <div style={S.sectionCard}>
          <div style={S.sectionHeader}>
            <p style={S.sectionTitle}>Availability</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {upcomingAvail.length > 0 && !confirmClearAvail && (
                <button onClick={() => setConfirmClearAvail(true)}
                  style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  Clear All
                </button>
              )}
              <button onClick={() => { setShowAvailForm(v => !v); setAvailResult(null) }} style={S.addBtn}>
                {showAvailForm ? <><ChevronUp size={14} /> Hide</> : <><Plus size={14} /> Add</>}
              </button>
            </div>
          </div>

          {confirmClearAvail && (
            <div style={{ padding: '14px 16px', background: 'rgba(255,59,48,0.06)', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '10px' }}>
                Clear all {availBlocks.length} availability blocks?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleClearAvail} style={{ ...S.pill(true), fontSize: '12px', padding: '6px 14px' }}>Clear All</button>
                <button onClick={() => setConfirmClearAvail(false)} style={{ ...S.pill(false), fontSize: '12px', padding: '6px 14px' }}>Cancel</button>
              </div>
            </div>
          )}

          {showAvailForm && (
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>

              {/* Range type + number */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Range</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {RANGE_TYPES.map(r => (
                      <button key={r.value} onClick={() => setRangeType(r.value)}
                        aria-pressed={rangeType === r.value}
                        style={{ ...S.pill(rangeType === r.value), padding: '7px 10px', fontSize: '12px', flex: 1 }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ width: '80px' }}>
                  <label style={S.label} htmlFor="avail-num">Amount</label>
                  <input
                    id="avail-num"
                    type="number"
                    min="1"
                    max={rangeType === 'year' ? 3 : rangeType === 'month' ? 12 : 52}
                    value={numberOf}
                    onChange={e => { setNumberOf(e.target.value); setAvailErrors(p => ({ ...p, number: null })) }}
                    style={{ ...S.input, textAlign: 'center', borderColor: availErrors.number ? 'var(--color-accent)' : 'var(--color-border)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = availErrors.number ? 'var(--color-accent)' : 'var(--color-border)' }}
                  />
                </div>
              </div>
              {availErrors.number && <p style={{ ...S.error, marginTop: '-10px', marginBottom: '10px' }}>{availErrors.number}</p>}

              {/* Working days */}
              <div style={{ marginBottom: '14px' }}>
                <label style={S.label}>Working Days</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }} role="group" aria-label="Working days">
                  {DAYS_OF_WEEK.map(day => {
                    const active = selectedDays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        aria-pressed={active}
                        aria-label={`${day.full}${active ? ', selected' : ''}`}
                        style={{
                          width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
                          border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          background: active ? 'var(--color-accent)' : 'transparent',
                          color: active ? '#fff' : 'var(--color-text-secondary)',
                          fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
                          transition: 'all 0.15s ease', flexShrink: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                {availErrors.days && <p style={{ ...S.error, marginTop: '6px' }}>{availErrors.days}</p>}
              </div>

              {/* Working hours */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label} htmlFor="avail-start">Start Time</label>
                  <input id="avail-start" type="time" value={workStart}
                    onChange={e => { setWorkStart(e.target.value); setAvailErrors(p => ({ ...p, start: null })) }}
                    style={{ ...S.input, borderColor: availErrors.start ? 'var(--color-accent)' : 'var(--color-border)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = availErrors.start ? 'var(--color-accent)' : 'var(--color-border)' }} />
                  {availErrors.start && <p style={S.error}>{availErrors.start}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label} htmlFor="avail-end">End Time</label>
                  <input id="avail-end" type="time" value={workEnd}
                    onChange={e => { setWorkEnd(e.target.value); setAvailErrors(p => ({ ...p, end: null })) }}
                    style={{ ...S.input, borderColor: availErrors.end ? 'var(--color-accent)' : 'var(--color-border)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = availErrors.end ? 'var(--color-accent)' : 'var(--color-border)' }} />
                  {availErrors.end && <p style={S.error}>{availErrors.end}</p>}
                </div>
              </div>

              <button onClick={handleGenerateAvail} style={{
                width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)', border: 'none', color: '#fff',
                fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px',
              }}>
                Generate Availability
              </button>
            </div>
          )}

          {availResult && (
            <div style={{ padding: '12px 16px', background: 'rgba(52,199,89,0.08)', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#34C759', fontFamily: 'var(--font)' }}>
                {availResult.created} day{availResult.created !== 1 ? 's' : ''} added
                {availResult.skipped > 0 ? `, ${availResult.skipped} skipped (already set)` : ''}
              </p>
            </div>
          )}

          {/* Availability list */}
          {upcomingAvail.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                No upcoming availability set. Generate blocks to define your working days.
              </p>
            </div>
          ) : (
            <div>
              {upcomingAvail.slice(0, 14).map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <Clock size={14} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {friendlyDate(b.date)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                      {b.startTime} – {b.endTime}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteAvailBlock(b.id)} style={S.iconBtn} aria-label="Remove availability block">
                    <X size={15} />
                  </button>
                </div>
              ))}
              {upcomingAvail.length > 14 && (
                <p style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                  +{upcomingAvail.length - 14} more upcoming…
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Session Durations ────────────────────────────────────────────── */}
        <div style={S.sectionCard}>
          <div style={S.sectionHeader}>
            <p style={S.sectionTitle}>Session Durations</p>
          </div>

          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '14px' }}>
              These durations appear as chips when scheduling a PT session. Tap × to remove one.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {[...durationSettings.options].sort((a, b) => a - b).map(mins => (
                <div
                  key={mins}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 10px 7px 13px',
                    borderRadius: '20px',
                    border: `1.5px solid ${durationSettings.defaultMinutes === mins ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: durationSettings.defaultMinutes === mins ? 'rgba(255,59,48,0.10)' : 'var(--color-bg)',
                  }}
                >
                  <span style={{
                    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)',
                    color: durationSettings.defaultMinutes === mins ? 'var(--color-accent)' : 'var(--color-white)',
                  }}>
                    {mins} min{durationSettings.defaultMinutes === mins ? ' (default)' : ''}
                  </span>
                  {durationSettings.options.length > 1 && (
                    <button
                      onClick={() => handleRemoveDuration(mins)}
                      aria-label={`Remove ${mins} min option`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: '2px', marginLeft: '2px', borderRadius: '50%' }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />

            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '10px' }}>
              Default Duration
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {[...durationSettings.options].sort((a, b) => a - b).map(mins => {
                const isDefault = durationSettings.defaultMinutes === mins
                return (
                  <button
                    key={mins}
                    onClick={() => updateDurationSettings({ ...durationSettings, defaultMinutes: mins })}
                    aria-pressed={isDefault}
                    style={S.pill(isDefault)}
                  >
                    {mins} min
                  </button>
                )
              })}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />

            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '10px' }}>
              Add Custom Duration
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  min="15"
                  max="240"
                  step="1"
                  value={newDurationInput}
                  onChange={e => { setNewDurationInput(e.target.value); setNewDurationError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddDuration() }}
                  placeholder="e.g. 75"
                  style={{ ...S.input, borderColor: newDurationError ? 'var(--color-accent)' : 'var(--color-border)' }}
                  onFocus={e => { if (!newDurationError) e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.target.style.borderColor = newDurationError ? 'var(--color-accent)' : 'var(--color-border)' }}
                />
              </div>
              <button onClick={handleAddDuration} style={{ ...S.addBtn, padding: '10px 16px' }}>
                <Plus size={14} /> Add
              </button>
            </div>
            {newDurationError && <p style={S.error}>{newDurationError}</p>}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
              Add a custom duration between 15 and 240 minutes.
            </p>
          </div>
        </div>

        {/* ── Time Out ─────────────────────────────────────────────────────── */}
        <div style={S.sectionCard}>
          <div style={S.sectionHeader}>
            <p style={S.sectionTitle}>Time Out</p>
            <button onClick={() => { setShowTimeOutForm(v => !v); setToConflict(null); setToErrors({}) }} style={S.addBtn}>
              {showTimeOutForm ? <><ChevronUp size={14} /> Hide</> : <><Plus size={14} /> Add</>}
            </button>
          </div>

          {showTimeOutForm && (
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>

              {/* Time out conflict warning */}
              {toConflict && (
                <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <AlertTriangle size={16} color="#FFCC00" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#FFCC00', fontFamily: 'var(--font)' }}>
                      {toConflict.isSession ? 'Conflicts with a scheduled session' : 'Overlaps another time out block'}
                    </p>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '10px', lineHeight: 1.5 }}>
                    {toConflict.isSession
                      ? `There's a PT session scheduled at ${toConflict.startTime} on this date.`
                      : `Another time out block runs ${toConflict.startTime}${toConflict.endTime ? ` – ${toConflict.endTime}` : ''} on this date.`}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleSaveTimeOut(true)}
                      style={{ ...S.pill(true), padding: '6px 12px', fontSize: '12px' }}>
                      Add Anyway
                    </button>
                    <button onClick={() => setToConflict(null)}
                      style={{ ...S.pill(false), padding: '6px 12px', fontSize: '12px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label} htmlFor="to-date">Date</label>
                  <input id="to-date" type="date" value={toDate}
                    onChange={e => { setToDate(e.target.value); setToErrors(p => ({ ...p, date: null })); setToConflict(null) }}
                    style={{ ...S.input, borderColor: toErrors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = toErrors.date ? 'var(--color-accent)' : 'var(--color-border)' }} />
                  {toErrors.date && <p style={S.error}>{toErrors.date}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label} htmlFor="to-start">Start Time</label>
                  <input id="to-start" type="time" value={toStart}
                    onChange={e => { setToStart(e.target.value); setToErrors(p => ({ ...p, start: null })); setToConflict(null) }}
                    style={{ ...S.input, borderColor: toErrors.start ? 'var(--color-accent)' : 'var(--color-border)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = toErrors.start ? 'var(--color-accent)' : 'var(--color-border)' }} />
                  {toErrors.start && <p style={S.error}>{toErrors.start}</p>}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={S.label}>Duration</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TIMEOUT_DURATIONS.map(mins => {
                    const active = toDuration === String(mins)
                    return (
                      <button key={mins} onClick={() => { setToDuration(String(mins)); setToErrors(p => ({ ...p, duration: null })) }}
                        aria-pressed={active} style={{ ...S.pill(active), padding: '7px 12px' }}>
                        {mins} min
                      </button>
                    )
                  })}
                </div>
                {toErrors.duration && <p style={S.error}>{toErrors.duration}</p>}
              </div>

              {toStart && toDuration && (
                <div style={{ padding: '9px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                    Ends at <strong style={{ color: 'var(--color-white)' }}>{toEndTime}</strong>
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={S.label} htmlFor="to-reason">Reason (optional)</label>
                <input id="to-reason" type="text" value={toReason}
                  onChange={e => setToReason(e.target.value)}
                  placeholder="e.g. Lunch break, Admin"
                  style={S.input}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }} />
              </div>

              <button onClick={() => handleSaveTimeOut(false)} style={{
                width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)', border: 'none', color: '#fff',
                fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px',
              }}>
                Add Time Out
              </button>
            </div>
          )}

          {upcomingTimeOuts.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                No time out blocks. Add one to block unavailable slots.
              </p>
            </div>
          ) : (
            <div>
              {upcomingTimeOuts.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <Ban size={14} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {friendlyDate(t.date)} · {t.startTime}{t.endTime ? ` – ${t.endTime}` : ''}
                    </p>
                    {t.reason && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                        {t.reason}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDeleteTimeOut(t.id)} style={S.iconBtn} aria-label="Delete time out">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Booking Categories ───────────────────────────────────────────── */}
        <TagListSection
          title="Booking Categories"
          items={categories}
          onSave={(cat) => { saveBookingCategory(cat); setCategories(getBookingCategories()) }}
          onDelete={(id) => { deleteBookingCategory(id); setCategories(getBookingCategories()) }}
          minItems={1}
        />

        {/* ── Booking Statuses ─────────────────────────────────────────────── */}
        <TagListSection
          title="Booking Statuses"
          items={statuses}
          onSave={(s) => { saveBookingStatus(s); setStatuses(getBookingStatuses()) }}
          onDelete={(id) => { deleteBookingStatus(id); setStatuses(getBookingStatuses()) }}
          minItems={1}
        />

        {/* ── Payment Types ────────────────────────────────────────────────── */}
        <TagListSection
          title="Payment Types"
          items={paymentTypes}
          onSave={(pt) => { savePaymentType(pt); setPaymentTypes(getPaymentTypes()) }}
          onDelete={(id) => { deletePaymentType(id); setPaymentTypes(getPaymentTypes()) }}
          minItems={1}
        />
      </div>
    </div>
  )
}
