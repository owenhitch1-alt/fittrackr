import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Trash2, Check, ChevronRight, AlertTriangle, Settings } from 'lucide-react'
import Header from '../components/Header.jsx'
import { getClients, getWorkoutTemplates } from '../data/storage.js'
import {
  getPTScheduledSessions,
  savePTScheduledSession,
  deletePTScheduledSession,
  getPTDurationSettings,
  calculateEndTime,
  crossesMidnight,
  findPTSessionConflict,
} from '../data/ptSchedule.js'
import {
  getBookingCategories,
  getBookingStatuses,
  getPaymentTypes,
  getTimeOutBlocks,
  findOverlappingTimeOut,
  checkSessionVsAvailability,
} from '../data/workPlanner.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildDateStrip() {
  const strip = []
  const today = new Date()
  for (let i = -3; i <= 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    strip.push({
      dateStr: localDateStr(d),
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      num: d.getDate(),
      isToday: i === 0,
    })
  }
  return strip
}

const DATE_STRIP = buildDateStrip()
const TODAY_STR = localDateStr()

function friendlyDate(dateStr) {
  if (dateStr === TODAY_STR) return 'Today'
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dateStr === localDateStr(tomorrow)) return 'Tomorrow'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function calcEndTime(startTime, endTime, durationMinutes) {
  if (endTime) return endTime
  if (durationMinutes) {
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + Number(durationMinutes)
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
  return null
}

function fmtTimeRange(startTime, endTime, durationMinutes) {
  const end = calcEndTime(startTime, endTime, durationMinutes)
  return end ? `${startTime} – ${end}` : startTime
}

const STATUS_META = {
  scheduled: { label: 'Scheduled', color: 'var(--color-accent)', bg: 'rgba(255,59,48,0.10)' },
  completed: { label: 'Completed', color: '#34C759', bg: 'rgba(52,199,89,0.10)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-text-secondary)', bg: 'rgba(128,128,128,0.10)' },
}

const EMPTY_FORM = {
  clientId: '',
  date: TODAY_STR,
  startTime: '09:00',
  endTime: '',
  durationMinutes: '',
  workoutId: '',
  notes: '',
  status: 'scheduled',
  categoryId: '',
  categoryName: '',
  bookingStatusId: '',
  bookingStatusName: '',
  paymentTypeId: '',
  paymentTypeName: '',
}

// ── Date strip cell ───────────────────────────────────────────────────────────
function DateCell({ day, selected, sessionCount, onClick, scrollRef }) {
  return (
    <button
      ref={scrollRef}
      onClick={onClick}
      aria-label={`${day.isToday ? 'Today, ' : ''}${day.dateStr}`}
      aria-pressed={selected}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${selected ? 'var(--color-accent)' : 'transparent'}`,
        background: selected ? 'rgba(255,59,48,0.10)' : 'transparent',
        cursor: 'pointer',
        minWidth: '52px',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 700, color: selected ? 'var(--color-accent)' : 'var(--color-text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {day.isToday ? 'Today' : day.label}
      </span>
      <span style={{ fontSize: '18px', fontWeight: 800, color: selected ? 'var(--color-accent)' : 'var(--color-white)', fontFamily: 'var(--font)' }}>
        {day.num}
      </span>
      {sessionCount > 0 && (
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
      )}
      {sessionCount === 0 && <span style={{ width: '6px', height: '6px' }} />}
    </button>
  )
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session, clients, templates, onEdit }) {
  const client = clients.find(c => c.id === session.clientId)
  const workout = session.workoutId ? templates.find(t => t.id === session.workoutId) : null
  const st = STATUS_META[session.status] ?? STATUS_META.scheduled
  const timeStr = fmtTimeRange(session.startTime, session.endTime, session.durationMinutes)
  const isCancelled = session.status === 'cancelled'

  return (
    <button
      onClick={onEdit}
      aria-label={`Edit session for ${client?.name ?? 'Unknown client'}`}
      style={{
        width: '100%',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        opacity: isCancelled ? 0.55 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {/* Accent bar */}
      <div style={{ width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: st.color, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', textDecoration: isCancelled ? 'line-through' : 'none' }}>
            {client?.name ?? 'Client removed'}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 700, color: st.color, background: st.bg, borderRadius: '20px', padding: '2px 8px', flexShrink: 0, marginLeft: '8px', letterSpacing: '0.3px' }}>
            {st.label}
          </span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '3px' }}>
          {timeStr}
        </p>
        {workout ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '2px' }}>
            {workout.name}
          </p>
        ) : session.workoutId ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '2px', fontStyle: 'italic' }}>
            Workout removed
          </p>
        ) : null}
        {(session.categoryName || session.paymentTypeName) && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '2px' }}>
            {[session.categoryName, session.paymentTypeName].filter(Boolean).join(' · ')}
          </p>
        )}
        {session.notes ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.notes}
          </p>
        ) : null}
      </div>

      <ChevronRight size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
    </button>
  )
}

// ── Session form sheet ────────────────────────────────────────────────────────
function SessionFormSheet({ initial, clients, templates, onSave, onDelete, onClose }) {
  const isEdit = Boolean(initial?.id)
  const [form, setForm] = useState(() => {
    const settings = getPTDurationSettings()
    const base = initial ? { ...EMPTY_FORM, ...initial } : { ...EMPTY_FORM }
    if (!initial?.id && !base.durationMinutes) {
      base.durationMinutes = String(settings.defaultMinutes)
    } else if (base.durationMinutes) {
      base.durationMinutes = String(base.durationMinutes)
    }
    return base
  })
  const durationOptions = useMemo(() => {
    const settings = getPTDurationSettings()
    const opts = new Set(settings.options)
    const cur = Number(form.durationMinutes)
    if (form.durationMinutes && !isNaN(cur) && !opts.has(cur)) opts.add(cur)
    return [...opts].sort((a, b) => a - b)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [warningState, setWarningState] = useState(null)
  const categories = useMemo(() => getBookingCategories(), [])
  const bookingStatuses = useMemo(() => getBookingStatuses(), [])
  const paymentTypes = useMemo(() => getPaymentTypes(), [])

  const clientTemplates = useMemo(
    () => form.clientId ? templates.filter(t => t.clientId === form.clientId) : [],
    [form.clientId, templates]
  )

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: null }))
  }, [])

  const handleClientChange = useCallback((clientId) => {
    setForm(f => ({ ...f, clientId, workoutId: '' }))
    setErrors(e => ({ ...e, clientId: null }))
  }, [])

  const runChecks = (pendingData, checks) => {
    if (checks.length === 0) { onSave(pendingData); return }
    const [check, ...rest] = checks
    const sessionEnd = pendingData.durationMinutes
      ? calculateEndTime(pendingData.startTime, pendingData.durationMinutes)
      : pendingData.endTime || null

    if (check === 'timeout') {
      const timeOut = findOverlappingTimeOut(pendingData.date, pendingData.startTime, sessionEnd)
      if (timeOut) {
        setWarningState({ type: 'timeout', timeOut, pendingData, proceed: () => runChecks(pendingData, rest) })
        return
      }
      runChecks(pendingData, rest)
    } else if (check === 'availability') {
      const av = checkSessionVsAvailability(pendingData.date, pendingData.startTime, sessionEnd)
      if (av.hasAvailability && !av.inside) {
        setWarningState({ type: 'availability', pendingData, proceed: () => runChecks(pendingData, rest) })
        return
      }
      runChecks(pendingData, rest)
    } else if (check === 'conflict') {
      const conflict = findPTSessionConflict({ ...pendingData, id: initial?.id }, getPTScheduledSessions())
      if (conflict) {
        setWarningState({ type: 'conflict', conflict, pendingData, proceed: () => onSave(pendingData) })
        return
      }
      onSave(pendingData)
    }
  }

  const handleSave = () => {
    const errs = {}
    if (!form.clientId) errs.clientId = 'Select a client'
    if (!form.date) errs.date = 'Date is required'
    if (!form.startTime) errs.startTime = 'Start time is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    const pendingData = {
      ...form,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
      endTime: form.durationMinutes ? undefined : (form.endTime || undefined),
      workoutId: form.workoutId || undefined,
      notes: form.notes.trim() || undefined,
      categoryName: form.categoryName || undefined,
      categoryId: form.categoryId || undefined,
      bookingStatusName: form.bookingStatusName || undefined,
      bookingStatusId: form.bookingStatusId || undefined,
      paymentTypeName: form.paymentTypeName || undefined,
      paymentTypeId: form.paymentTypeId || undefined,
    }
    runChecks(pendingData, ['timeout', 'availability', 'conflict'])
  }

  const inputStyle = {
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
    colorScheme: 'dark',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  }

  const errorStyle = { fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '5px' }

  const sectionGap = { marginBottom: '18px' }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.7)' }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '92vh',
        zIndex: 200,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>

        {/* Sheet header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
            {isEdit ? 'Edit Session' : 'Add Session'}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Client */}
          <div style={sectionGap}>
            <label style={labelStyle}>Client <span style={{ color: 'var(--color-accent)' }}>*</span></label>
            {clients.length === 0 ? (
              <div style={{ padding: '14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '4px' }}>No clients yet</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', opacity: 0.7 }}>Add a client before scheduling a session.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleClientChange(c.id)}
                    aria-pressed={form.clientId === c.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      background: form.clientId === c.id ? 'rgba(255,59,48,0.10)' : 'var(--color-bg)',
                      border: `1.5px solid ${form.clientId === c.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: form.clientId === c.id ? 'var(--color-accent)' : 'var(--color-white)',
                      fontSize: '14px',
                      fontWeight: form.clientId === c.id ? 700 : 500,
                      fontFamily: 'var(--font)',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {c.name}
                    {form.clientId === c.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
            {errors.clientId && <p style={errorStyle}>{errors.clientId}</p>}
          </div>

          {/* Date */}
          <div style={sectionGap}>
            <label style={labelStyle} htmlFor="session-date">Date <span style={{ color: 'var(--color-accent)' }}>*</span></label>
            <input
              id="session-date"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = errors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
            />
            {errors.date && <p style={errorStyle}>{errors.date}</p>}
          </div>

          {/* Start time */}
          <div style={sectionGap}>
            <label style={labelStyle} htmlFor="session-start">Start Time <span style={{ color: 'var(--color-accent)' }}>*</span></label>
            <input
              id="session-start"
              type="time"
              value={form.startTime}
              onChange={e => set('startTime', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.startTime ? 'var(--color-accent)' : 'var(--color-border)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = errors.startTime ? 'var(--color-accent)' : 'var(--color-border)' }}
            />
            {errors.startTime && <p style={errorStyle}>{errors.startTime}</p>}
          </div>

          {/* Duration chips */}
          <div style={sectionGap}>
            <label style={labelStyle}>Duration</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {durationOptions.map(mins => {
                const active = form.durationMinutes === String(mins)
                return (
                  <button
                    key={mins}
                    onClick={() => set('durationMinutes', active ? '' : String(mins))}
                    aria-pressed={active}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: active ? 'rgba(255,59,48,0.12)' : 'transparent',
                      color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: 'var(--font)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {mins} min
                  </button>
                )
              })}
            </div>
          </div>

          {/* Auto-calculated end time (read-only) */}
          {form.startTime && form.durationMinutes && (
            <div style={sectionGap}>
              <label style={labelStyle}>End Time</label>
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                  {calculateEndTime(form.startTime, form.durationMinutes)}
                </span>
                {crossesMidnight(form.startTime, form.durationMinutes) && (
                  <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'var(--font)', letterSpacing: '0.3px' }}>
                    +1 day
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Workout */}
          <div style={sectionGap}>
            <label style={labelStyle}>Workout</label>
            {!form.clientId ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontStyle: 'italic' }}>
                Select a client to see their workouts.
              </p>
            ) : clientTemplates.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontStyle: 'italic' }}>
                No workouts for this client.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => set('workoutId', '')}
                  aria-pressed={!form.workoutId}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: !form.workoutId ? 'rgba(255,59,48,0.06)' : 'var(--color-bg)',
                    border: `1.5px solid ${!form.workoutId ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    color: !form.workoutId ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: !form.workoutId ? 700 : 500,
                    fontFamily: 'var(--font)',
                    fontStyle: !form.workoutId ? 'normal' : 'italic',
                    textAlign: 'left',
                  }}
                >
                  No workout attached
                  {!form.workoutId && <Check size={15} />}
                </button>
                {clientTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => set('workoutId', t.id)}
                    aria-pressed={form.workoutId === t.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: form.workoutId === t.id ? 'rgba(255,59,48,0.10)' : 'var(--color-bg)',
                      border: `1.5px solid ${form.workoutId === t.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: form.workoutId === t.id ? 'var(--color-accent)' : 'var(--color-white)',
                      fontSize: '13px',
                      fontWeight: form.workoutId === t.id ? 700 : 500,
                      fontFamily: 'var(--font)',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {t.name}
                    {form.workoutId === t.id && <Check size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={sectionGap}>
            <label style={labelStyle} htmlFor="session-notes">
              Notes
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '8px', fontSize: '11px' }}>
                {(form.notes ?? '').length}/200
              </span>
            </label>
            <textarea
              id="session-notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value.slice(0, 200))}
              rows={3}
              placeholder="e.g. Focus on shoulder control"
              style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', lineHeight: 1.5 }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div style={sectionGap}>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.categoryId && (
                  <button onClick={() => { set('categoryId', ''); set('categoryName', '') }}
                    style={{ padding: '7px 12px', borderRadius: '20px', border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                    None
                  </button>
                )}
                {categories.map(c => {
                  const active = form.categoryId === c.id
                  return (
                    <button key={c.id} onClick={() => { set('categoryId', active ? '' : c.id); set('categoryName', active ? '' : c.name) }}
                      aria-pressed={active}
                      style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Booking Status */}
          {bookingStatuses.length > 0 && (
            <div style={sectionGap}>
              <label style={labelStyle}>Booking Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.bookingStatusId && (
                  <button onClick={() => { set('bookingStatusId', ''); set('bookingStatusName', '') }}
                    style={{ padding: '7px 12px', borderRadius: '20px', border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                    None
                  </button>
                )}
                {bookingStatuses.map(s => {
                  const active = form.bookingStatusId === s.id
                  return (
                    <button key={s.id} onClick={() => { set('bookingStatusId', active ? '' : s.id); set('bookingStatusName', active ? '' : s.name) }}
                      aria-pressed={active}
                      style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Payment Type */}
          {paymentTypes.length > 0 && (
            <div style={sectionGap}>
              <label style={labelStyle}>Payment Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.paymentTypeId && (
                  <button onClick={() => { set('paymentTypeId', ''); set('paymentTypeName', '') }}
                    style={{ padding: '7px 12px', borderRadius: '20px', border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                    None
                  </button>
                )}
                {paymentTypes.map(p => {
                  const active = form.paymentTypeId === p.id
                  return (
                    <button key={p.id} onClick={() => { set('paymentTypeId', active ? '' : p.id); set('paymentTypeName', active ? '' : p.name) }}
                      aria-pressed={active}
                      style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status (edit only) */}
          {isEdit && (
            <div style={sectionGap}>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => set('status', key)}
                    aria-pressed={form.status === key}
                    style={{
                      flex: 1,
                      padding: '9px 4px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${form.status === key ? meta.color : 'var(--color-border)'}`,
                      background: form.status === key ? meta.bg : 'transparent',
                      color: form.status === key ? meta.color : 'var(--color-text-secondary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delete confirm inline */}
          {confirmDelete && (
            <div style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '4px' }}>Delete this session?</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '14px' }}>This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onDelete(initial.id)}
                  style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}
                >
                  Keep
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleSave}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}
          >
            {isEdit ? 'Save Changes' : 'Save Session'}
          </button>
          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid rgba(255,59,48,0.35)', color: 'var(--color-accent)', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Trash2 size={15} /> Delete Session
            </button>
          )}
          <button
            onClick={onClose}
            style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>

        {/* Warning overlay — timeout / availability / conflict */}
        {warningState && (() => {
          const ws = warningState
          let title, body, detail = null
          if (ws.type === 'timeout') {
            title = 'Time Out Conflict'
            body = 'The selected time overlaps with a blocked-off period:'
            detail = (
              <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,204,0,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: ws.timeOut.reason ? '4px' : 0 }}>
                  {ws.timeOut.startTime}{ws.timeOut.endTime ? ` – ${ws.timeOut.endTime}` : ''}
                </p>
                {ws.timeOut.reason && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>{ws.timeOut.reason}</p>}
              </div>
            )
          } else if (ws.type === 'availability') {
            title = 'Outside Availability'
            body = 'This time is outside your set working hours for this day. You can still schedule the session.'
          } else if (ws.type === 'conflict') {
            const cc = clients.find(c => c.id === ws.conflict.clientId)
            const cw = ws.conflict.workoutId ? templates.find(t => t.id === ws.conflict.workoutId) : null
            title = 'Session time conflict'
            body = 'The selected time overlaps with an existing scheduled session:'
            detail = (
              <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,59,48,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: cw ? '2px' : '4px' }}>
                  {cc?.name ?? 'Unknown client'}
                </p>
                {cw && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '4px' }}>{cw.name}</p>}
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font)' }}>
                  {fmtTimeRange(ws.conflict.startTime, ws.conflict.endTime, ws.conflict.durationMinutes)}
                </p>
              </div>
            )
          }
          return (
            <div style={{ position: 'absolute', inset: 0, background: 'var(--color-surface)', borderRadius: 'inherit', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>{title}</p>
                <button onClick={() => setWarningState(null)} aria-label="Back to form" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,204,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <AlertTriangle size={22} color="#FFCC00" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>{body}</p>
                {detail}
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Do you want to {isEdit ? 'save' : 'schedule'} this session anyway?
                </p>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={ws.proceed} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}>
                  {isEdit ? 'Save Anyway' : 'Schedule Anyway'}
                </button>
                <button onClick={() => setWarningState(null)} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )
        })()}
      </div>
    </>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PTScheduleScreen() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState(() => getPTScheduledSessions())
  const [selectedDate, setSelectedDate] = useState(TODAY_STR)
  const [editingSession, setEditingSession] = useState(null) // null = closed, {new or existing} = open
  const todayRef = useRef(null)

  const clients = useMemo(() => getClients(), [])
  const templates = useMemo(() => getWorkoutTemplates(), [])
  const timeOutBlocks = useMemo(() => getTimeOutBlocks(), [sessions]) // re-derive when sessions refresh

  // Scroll date strip to today on mount
  useEffect(() => {
    todayRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
  }, [])

  // Sessions for selected date, all statuses (cancelled shown dimmed)
  const daySessions = useMemo(() =>
    sessions
      .filter(s => s.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions, selectedDate]
  )

  // Session counts per date for dot indicators
  const sessionCountMap = useMemo(() => {
    const map = {}
    for (const s of sessions) {
      if (s.status !== 'cancelled') map[s.date] = (map[s.date] ?? 0) + 1
    }
    return map
  }, [sessions])

  const handleOpenNew = () => {
    setEditingSession({ date: selectedDate })
  }

  const handleOpenEdit = (session) => {
    setEditingSession(session)
  }

  const handleSave = (formData) => {
    savePTScheduledSession({ ...formData, id: editingSession?.id })
    setSessions(getPTScheduledSessions())
    if (formData.date !== selectedDate) setSelectedDate(formData.date)
    setEditingSession(null)
  }

  const handleDelete = (id) => {
    deletePTScheduledSession(id)
    setSessions(getPTScheduledSessions())
    setEditingSession(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="PT Schedule" onBack={() => navigate(-1)} />

      {/* Date strip */}
      <div
        style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}
        role="group"
        aria-label="Select date"
      >
        {DATE_STRIP.map(day => (
          <DateCell
            key={day.dateStr}
            day={day}
            selected={selectedDate === day.dateStr}
            sessionCount={sessionCountMap[day.dateStr] ?? 0}
            onClick={() => setSelectedDate(day.dateStr)}
            scrollRef={day.isToday ? todayRef : null}
          />
        ))}
      </div>

      {/* Date heading */}
      <div style={{ padding: '14px 20px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
          {friendlyDate(selectedDate)}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontWeight: 600 }}>
          {daySessions.length > 0 ? `${daySessions.length} session${daySessions.length !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {/* Time Out blocks for selected date */}
      {timeOutBlocks.filter(t => t.date === selectedDate).length > 0 && (
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          {timeOutBlocks
            .filter(t => t.date === selectedDate)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0 }}>Time Out</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                  {t.startTime}{t.endTime ? ` – ${t.endTime}` : ''}
                  {t.reason ? ` · ${t.reason}` : ''}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Sessions list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 150px' }}>
        {daySessions.length === 0 ? (
          <div style={{ padding: '48px 0 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
              No sessions scheduled
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.6, marginBottom: '24px' }}>
              Add a PT session to plan your day.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
            {daySessions.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                clients={clients}
                templates={templates}
                onEdit={() => handleOpenEdit(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fixed action area — Add Session + Work Planner */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '430px',
          padding: '12px 16px env(safe-area-inset-bottom, 16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleOpenNew}
          aria-label="Add session"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent)',
            border: 'none',
            color: 'var(--color-on-accent)',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} strokeWidth={2.5} /> Add Session
        </button>
        <button
          onClick={() => navigate('/work-planner')}
          aria-label="Open Work Planner"
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 'var(--radius-sm)',
            background: 'none',
            border: '1px solid var(--color-border)',
            color: 'var(--color-white)',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Settings size={16} strokeWidth={2} /> Work Planner
        </button>
      </div>

      {/* Form sheet */}
      {editingSession !== null && (
        <SessionFormSheet
          key={editingSession?.id ?? 'new'}
          initial={editingSession?.id ? editingSession : { ...EMPTY_FORM, date: editingSession?.date ?? TODAY_STR }}
          clients={clients}
          templates={templates}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  )
}
