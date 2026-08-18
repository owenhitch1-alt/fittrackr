import { useState } from 'react'
import { X, CalendarDays, AlertTriangle } from 'lucide-react'
import {
  savePTScheduledSession,
  getPTScheduledSessions,
  getPTDurationSettings,
  calculateEndTime,
  crossesMidnight,
  findPTSessionConflict,
} from '../data/ptSchedule.js'
import { getClientById, getWorkoutTemplates } from '../data/storage.js'
import {
  getBookingCategories,
  getBookingStatuses,
  getPaymentTypes,
  findOverlappingTimeOut,
  checkSessionVsAvailability,
} from '../data/workPlanner.js'

function localDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function friendlyDate(dateStr) {
  const today = localDateStr()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  if (dateStr === today) return 'Today'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch { return dateStr }
}

function conflictTimeStr(session) {
  const end = session.endTime || (session.durationMinutes ? calculateEndTime(session.startTime, session.durationMinutes) : null)
  return end ? `${session.startTime} – ${end}` : session.startTime
}

// Reusable bottom sheet for scheduling a PT session with client/workout pre-filled.
// The caller supplies clientId (required), clientName (display), workoutId/workoutName (optional).
// onSaved(session) is called immediately after storage write.
// onClose is called after the success animation or on cancel.
export default function ScheduleSessionSheet({
  clientId,
  clientName,
  workoutId,
  workoutName,
  onClose,
  onSaved,
}) {
  const [durationOptions] = useState(() => getPTDurationSettings().options.slice().sort((a, b) => a - b))
  const [date, setDate] = useState(localDateStr())
  const [startTime, setStartTime] = useState('09:00')
  const [durationMinutes, setDurationMinutes] = useState(() => String(getPTDurationSettings().defaultMinutes))
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [bookingStatusId, setBookingStatusId] = useState('')
  const [bookingStatusName, setBookingStatusName] = useState('')
  const [paymentTypeId, setPaymentTypeId] = useState('')
  const [paymentTypeName, setPaymentTypeName] = useState('')
  const [errors, setErrors] = useState({})
  const [savedSession, setSavedSession] = useState(null)
  const [warningState, setWarningState] = useState(null)
  const [categories] = useState(() => getBookingCategories())
  const [bookingStatuses] = useState(() => getBookingStatuses())
  const [paymentTypes] = useState(() => getPaymentTypes())

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

  const doSave = (pending) => {
    const session = savePTScheduledSession(pending)
    setSavedSession(session)
    onSaved?.(session)
    setTimeout(onClose, 1800)
  }

  const runChecks = (pending, checks) => {
    if (checks.length === 0) { doSave(pending); return }
    const [check, ...rest] = checks
    const sessionEnd = pending.durationMinutes ? calculateEndTime(pending.startTime, pending.durationMinutes) : null

    if (check === 'timeout') {
      const to = findOverlappingTimeOut(pending.date, pending.startTime, sessionEnd)
      if (to) { setWarningState({ type: 'timeout', to, pending, proceed: () => runChecks(pending, rest) }); return }
      runChecks(pending, rest)
    } else if (check === 'availability') {
      const av = checkSessionVsAvailability(pending.date, pending.startTime, sessionEnd)
      if (av.hasAvailability && !av.inside) { setWarningState({ type: 'availability', pending, proceed: () => runChecks(pending, rest) }); return }
      runChecks(pending, rest)
    } else if (check === 'conflict') {
      const conflict = findPTSessionConflict(pending, getPTScheduledSessions())
      if (conflict) { setWarningState({ type: 'conflict', conflict, pending, proceed: () => doSave(pending) }); return }
      doSave(pending)
    }
  }

  const handleSave = () => {
    const errs = {}
    if (!date) errs.date = 'Date is required'
    if (!startTime) errs.startTime = 'Start time is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const pending = {
      clientId,
      workoutId: workoutId || undefined,
      date,
      startTime,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      notes: notes.trim() || undefined,
      status: 'scheduled',
      categoryId: categoryId || undefined,
      categoryName: categoryName || undefined,
      bookingStatusId: bookingStatusId || undefined,
      bookingStatusName: bookingStatusName || undefined,
      paymentTypeId: paymentTypeId || undefined,
      paymentTypeName: paymentTypeName || undefined,
    }

    runChecks(pending, ['timeout', 'availability', 'conflict'])
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 249, background: 'rgba(0,0,0,0.7)' }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '88vh',
        zIndex: 250,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>Schedule Session</p>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {savedSession ? (
          /* Success state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(52,199,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <CalendarDays size={26} color="#34C759" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '6px' }}>Session scheduled</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
              {clientName ?? 'Client'} · {friendlyDate(savedSession.date)} at {savedSession.startTime}
              {savedSession.durationMinutes ? ` – ${calculateEndTime(savedSession.startTime, savedSession.durationMinutes)}` : ''}
            </p>
          </div>
        ) : warningState ? (
          /* Warning: timeout / availability / conflict */
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,204,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <AlertTriangle size={22} color="#FFCC00" />
              </div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>
                {warningState.type === 'timeout' ? 'Time Out Conflict' : warningState.type === 'availability' ? 'Outside Availability' : 'Session time conflict'}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                {warningState.type === 'timeout'
                  ? 'The selected time overlaps with a blocked-off period.'
                  : warningState.type === 'availability'
                  ? 'This time is outside your set working hours for this day.'
                  : 'The selected time overlaps with an existing scheduled session:'}
              </p>
              {warningState.type === 'timeout' && (
                <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,204,0,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: warningState.to.reason ? '4px' : 0 }}>
                    {warningState.to.startTime}{warningState.to.endTime ? ` – ${warningState.to.endTime}` : ''}
                  </p>
                  {warningState.to.reason && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>{warningState.to.reason}</p>}
                </div>
              )}
              {warningState.type === 'conflict' && (() => {
                const cc = getClientById(warningState.conflict.clientId)
                const cw = warningState.conflict.workoutId ? getWorkoutTemplates().find(t => t.id === warningState.conflict.workoutId) : null
                return (
                  <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,59,48,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: cw ? '2px' : '4px' }}>{cc?.name ?? 'Unknown client'}</p>
                    {cw && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '4px' }}>{cw.name}</p>}
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font)' }}>{conflictTimeStr(warningState.conflict)}</p>
                  </div>
                )
              })()}
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Do you want to schedule this session anyway?</p>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={warningState.proceed} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}>
                Schedule Anyway
              </button>
              <button onClick={() => setWarningState(null)} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          /* Normal form */
          <>
            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {/* Client / workout context chip */}
              <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: workoutName ? '2px' : 0 }}>
                  {clientName ?? 'Client'}
                </p>
                {workoutName && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>{workoutName}</p>
                )}
              </div>

              {/* Date */}
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="sched-date" style={labelStyle}>
                  Date <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <input
                  id="sched-date"
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: null })) }}
                  style={{ ...inputStyle, borderColor: errors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.target.style.borderColor = errors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
                />
                {errors.date && <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '5px' }}>{errors.date}</p>}
              </div>

              {/* Start time */}
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="sched-start" style={labelStyle}>
                  Start Time <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <input
                  id="sched-start"
                  type="time"
                  value={startTime}
                  onChange={e => { setStartTime(e.target.value); setErrors(p => ({ ...p, startTime: null })) }}
                  style={{ ...inputStyle, borderColor: errors.startTime ? 'var(--color-accent)' : 'var(--color-border)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.target.style.borderColor = errors.startTime ? 'var(--color-accent)' : 'var(--color-border)' }}
                />
                {errors.startTime && <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '5px' }}>{errors.startTime}</p>}
              </div>

              {/* Duration chips */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Duration</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {durationOptions.map(mins => {
                    const active = durationMinutes === String(mins)
                    return (
                      <button
                        key={mins}
                        onClick={() => setDurationMinutes(active ? '' : String(mins))}
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
              {startTime && durationMinutes && (
                <div style={{ marginBottom: '16px' }}>
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
                      {calculateEndTime(startTime, durationMinutes)}
                    </span>
                    {crossesMidnight(startTime, durationMinutes) && (
                      <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'var(--font)', letterSpacing: '0.3px' }}>
                        +1 day
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <label style={labelStyle}>Category</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {categories.map(c => {
                      const active = categoryId === c.id
                      return (
                        <button key={c.id} onClick={() => { setCategoryId(active ? '' : c.id); setCategoryName(active ? '' : c.name) }}
                          aria-pressed={active}
                          style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Payment Type */}
              {paymentTypes.length > 0 && (
                <div>
                  <label style={labelStyle}>Payment Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {paymentTypes.map(p => {
                      const active = paymentTypeId === p.id
                      return (
                        <button key={p.id} onClick={() => { setPaymentTypeId(active ? '' : p.id); setPaymentTypeName(active ? '' : p.name) }}
                          aria-pressed={active}
                          style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                          {p.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="sched-notes" style={labelStyle}>
                  Notes
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '8px', fontSize: '11px' }}>
                    {notes.length}/200
                  </span>
                </label>
                <textarea
                  id="sched-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value.slice(0, 200))}
                  rows={2}
                  placeholder="e.g. Focus on technique"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '60px', lineHeight: 1.5 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSave}
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}
              >
                Save Schedule
              </button>
              <button
                onClick={onClose}
                style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
