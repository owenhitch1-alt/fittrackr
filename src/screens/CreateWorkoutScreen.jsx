import { useState } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { X, Dumbbell, CalendarDays, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import LiteModal from '../components/LiteModal.jsx'
import ExercisePicker from '../components/ExercisePicker.jsx'
import { saveWorkoutTemplate, getWorkoutTemplates, getClientById } from '../data/storage.js'
import { getPTScheduledSessions, savePTScheduledSession, getPTDurationSettings, calculateEndTime, crossesMidnight, findPTSessionConflict } from '../data/ptSchedule.js'
import { getBookingCategories, getBookingStatuses, getPaymentTypes, findOverlappingTimeOut, checkSessionVsAvailability } from '../data/workPlanner.js'
import { LITE_MAX_WORKOUTS, LITE_MAX_EXERCISES_PER_WORKOUT } from '../data/limits.js'

function localDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function friendlyScheduleDate(dateStr) {
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

const INPUT_STYLE = {
  width: '100%',
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-white)',
  fontSize: '15px',
  fontWeight: 500,
  fontFamily: 'var(--font)',
  padding: '14px 16px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
}

const INPUT_ERROR_STYLE = {
  ...INPUT_STYLE,
  borderColor: 'var(--color-accent)',
}

const LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
}

const ERROR_STYLE = {
  fontSize: '13px',
  color: 'var(--color-accent)',
  fontWeight: 600,
  marginTop: '6px',
}

const PLAN_LABEL_STYLE = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginBottom: '4px',
}

const PLAN_INPUT_STYLE = {
  width: '100%',
  background: 'var(--color-bg)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-white)',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'var(--font)',
  padding: '8px 10px',
  outline: 'none',
  textAlign: 'center',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box',
}

export default function CreateWorkoutScreen({ onDataChange, appMode = 'personal', availableEquipment = [] }) {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const { state: locationState } = useLocation()
  const isEdit = Boolean(templateId)

  // Client context — set when navigating from ClientDetailScreen
  // For edit mode, fall back to clientId embedded in the template itself
  const existingTemplate = isEdit
    ? getWorkoutTemplates().find(t => t.id === templateId) ?? null
    : null

  const clientId = locationState?.clientId ?? existingTemplate?.clientId ?? null
  const clientName = locationState?.clientName ?? null
  const prefillExerciseName = locationState?.prefillExerciseName ?? null

  const [name, setName] = useState(() => existingTemplate?.name ?? '')
  const [exercises, setExercises] = useState(() => {
    if (existingTemplate?.exercises) return existingTemplate.exercises
    if (prefillExerciseName) return [{ id: `_prefill_${Date.now()}`, exerciseName: prefillExerciseName, exerciseOrder: 1, plannedSets: null, targetReps: null }]
    return []
  })
  const [errors, setErrors] = useState({})
  const [exerciseErrors, setExerciseErrors] = useState([])
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitModalContent, setLimitModalContent] = useState({ heading: '', body: '' })
  const [showPicker, setShowPicker] = useState(false)

  // Schedule section — only relevant for client workouts (clientId is set)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [schedDate, setSchedDate] = useState(localDateStr())
  const [schedStart, setSchedStart] = useState('09:00')
  const [schedDuration, setSchedDuration] = useState(() => String(getPTDurationSettings().defaultMinutes))
  const [schedDurationOptions] = useState(() => getPTDurationSettings().options.slice().sort((a, b) => a - b))
  const [schedErrors, setSchedErrors] = useState({})
  const [schedWarning, setSchedWarning] = useState(null) // { type, data, proceed }
  const [schedCategoryId, setSchedCategoryId] = useState('')
  const [schedCategoryName, setSchedCategoryName] = useState('')
  const [schedPaymentTypeId, setSchedPaymentTypeId] = useState('')
  const [schedPaymentTypeName, setSchedPaymentTypeName] = useState('')
  const [categories] = useState(() => getBookingCategories())
  const [paymentTypes] = useState(() => getPaymentTypes())

  // Upcoming scheduled sessions for this workout (edit mode only)
  const today = localDateStr()
  const nowTime = (() => { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}` })()
  const upcomingWorkoutSessions = isEdit && templateId
    ? getPTScheduledSessions()
        .filter(s => s.workoutId === templateId && s.status === 'scheduled')
        .filter(s => s.date > today || (s.date === today && s.startTime >= nowTime))
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
        .slice(0, 3)
    : []

  const backPath = clientId ? `/clients/${clientId}` : '/workouts'

  // Guard: edit mode but template not found — redirect rather than showing a broken screen
  if (isEdit && !existingTemplate) {
    return <Navigate to={backPath} replace />
  }

  const clearError = (key) => setErrors(prev => ({ ...prev, [key]: null }))

  const showLimit = (heading, body) => {
    setLimitModalContent({ heading, body })
    setShowLimitModal(true)
  }

  const openPicker = () => {
    if (appMode !== 'trainer' && exercises.length >= LITE_MAX_EXERCISES_PER_WORKOUT) {
      showLimit(
        `FitTrackr Lite allows up to ${LITE_MAX_EXERCISES_PER_WORKOUT} exercises per workout.`,
        'Keep this workout focused or edit your existing exercises.'
      )
      return
    }
    setShowPicker(true)
  }

  const handleExerciseSelected = (exerciseName) => {
    setShowPicker(false)
    setExercises(prev => [
      ...prev,
      { exerciseName, exerciseOrder: prev.length + 1 },
    ])
    clearError('exercises')
  }

  const updateExercisePlan = (index, field, rawValue) => {
    const intVal = rawValue === '' ? null : parseInt(rawValue, 10)
    setExercises(prev =>
      prev.map((ex, i) =>
        i !== index ? ex : { ...ex, [field]: (rawValue === '' || isNaN(intVal)) ? null : intVal }
      )
    )
    setExerciseErrors(prev => {
      const next = [...prev]
      if (!next[index]) next[index] = {}
      next[index] = { ...next[index], [field]: null }
      return next
    })
  }

  const removeExercise = (index) => {
    setExercises(prev =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, exerciseOrder: i + 1 }))
    )
    setExerciseErrors(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Please name your workout.'
    if (exercises.length === 0) newErrors.exercises = 'Add at least one exercise before saving.'

    const newExErrors = exercises.map(ex => {
      const errs = {}
      if (ex.plannedSets != null && (ex.plannedSets < 1 || ex.plannedSets > 20 || !Number.isInteger(ex.plannedSets))) {
        errs.plannedSets = 'Planned sets must be a whole number between 1 and 20.'
      }
      if (ex.targetReps != null && (ex.targetReps < 1 || ex.targetReps > 100 || !Number.isInteger(ex.targetReps))) {
        errs.targetReps = 'Target reps must be a whole number between 1 and 100.'
      }
      return errs
    })
    const hasExErrors = newExErrors.some(e => Object.keys(e).length > 0)

    // Validate schedule fields if open
    const newSchedErrors = {}
    if (scheduleOpen && clientId) {
      if (!schedDate) newSchedErrors.date = 'Date is required'
      if (!schedStart) newSchedErrors.start = 'Start time is required'
    }

    if (Object.keys(newErrors).length > 0 || hasExErrors || Object.keys(newSchedErrors).length > 0) {
      setErrors(newErrors)
      setExerciseErrors(newExErrors)
      setSchedErrors(newSchedErrors)
      return
    }

    // For create mode, enforce the workout count limit at save time as a safety net (Personal only)
    if (!isEdit && appMode !== 'trainer') {
      const currentCount = getWorkoutTemplates().length
      if (currentCount >= LITE_MAX_WORKOUTS) {
        showLimit(
          `FitTrackr Lite allows up to ${LITE_MAX_WORKOUTS} workouts.`,
          'Upgrade options will be available in a future release.'
        )
        return
      }
    }

    // Run schedule checks if scheduling is open
    if (scheduleOpen && clientId) {
      const pendingSched = {
        date: schedDate, startTime: schedStart,
        durationMinutes: schedDuration ? Number(schedDuration) : undefined,
      }
      runSchedChecks(pendingSched, ['timeout', 'availability', 'conflict'])
      return
    }

    doFinalSave()
  }

  const runSchedChecks = (pendingSched, checks) => {
    if (checks.length === 0) { doFinalSave(); return }
    const [check, ...rest] = checks
    const sessionEnd = pendingSched.durationMinutes ? calculateEndTime(pendingSched.startTime, pendingSched.durationMinutes) : null

    if (check === 'timeout') {
      const to = findOverlappingTimeOut(pendingSched.date, pendingSched.startTime, sessionEnd)
      if (to) { setSchedWarning({ type: 'timeout', to, proceed: () => { setSchedWarning(null); runSchedChecks(pendingSched, rest) } }); return }
      runSchedChecks(pendingSched, rest)
    } else if (check === 'availability') {
      const av = checkSessionVsAvailability(pendingSched.date, pendingSched.startTime, sessionEnd)
      if (av.hasAvailability && !av.inside) { setSchedWarning({ type: 'availability', proceed: () => { setSchedWarning(null); runSchedChecks(pendingSched, rest) } }); return }
      runSchedChecks(pendingSched, rest)
    } else if (check === 'conflict') {
      const conflict = findPTSessionConflict(pendingSched, getPTScheduledSessions())
      if (conflict) { setSchedWarning({ type: 'conflict', conflict, proceed: () => { setSchedWarning(null); doFinalSave() } }); return }
      doFinalSave()
    }
  }

  const doFinalSave = () => {
    const saved = saveWorkoutTemplate({
      ...(isEdit ? { id: templateId } : {}),
      name: name.trim(),
      exercises,
      ...(clientId ? { clientId } : {}),
    })
    if (scheduleOpen && clientId && saved?.id) {
      savePTScheduledSession({
        clientId,
        workoutId: saved.id,
        date: schedDate,
        startTime: schedStart,
        durationMinutes: schedDuration ? Number(schedDuration) : undefined,
        status: 'scheduled',
        categoryId: schedCategoryId || undefined,
        categoryName: schedCategoryName || undefined,
        paymentTypeId: schedPaymentTypeId || undefined,
        paymentTypeName: schedPaymentTypeName || undefined,
      })
    }
    onDataChange?.()
    navigate(backPath)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleExerciseSelected}
        availableEquipment={availableEquipment}
      />
      <LiteModal
        visible={showLimitModal}
        heading={limitModalContent.heading}
        body={limitModalContent.body}
        onClose={() => setShowLimitModal(false)}
      />

      {/* Schedule warning modal: timeout / availability / conflict */}
      {schedWarning && (() => {
        const sw = schedWarning
        let title, body, detail = null
        if (sw.type === 'timeout') {
          title = 'Time Out Conflict'
          body = 'The selected time overlaps with a blocked-off period.'
          detail = sw.to ? (
            <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,204,0,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>{sw.to.startTime}{sw.to.endTime ? ` – ${sw.to.endTime}` : ''}</p>
              {sw.to.reason && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>{sw.to.reason}</p>}
            </div>
          ) : null
        } else if (sw.type === 'availability') {
          title = 'Outside Availability'
          body = 'This time is outside your set working hours for this day. You can still schedule the session.'
        } else if (sw.type === 'conflict') {
          const cc = getClientById(sw.conflict.clientId)
          const cw = sw.conflict.workoutId ? getWorkoutTemplates().find(t => t.id === sw.conflict.workoutId) : null
          const cEnd = sw.conflict.endTime || (sw.conflict.durationMinutes ? calculateEndTime(sw.conflict.startTime, sw.conflict.durationMinutes) : null)
          title = 'Session time conflict'
          body = 'The selected time overlaps with an existing scheduled session:'
          detail = (
            <div style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,59,48,0.30)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: cw ? '2px' : '4px' }}>{cc?.name ?? 'Unknown client'}</p>
              {cw && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '4px' }}>{cw.name}</p>}
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font)' }}>{cEnd ? `${sw.conflict.startTime} – ${cEnd}` : sw.conflict.startTime}</p>
            </div>
          )
        }
        return (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 290 }} />
            <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 'calc(100% - 40px)', maxWidth: '360px', zIndex: 291, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', padding: '24px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,204,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <AlertTriangle size={20} color="#FFCC00" />
              </div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '8px' }}>{title}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>{body}</p>
              {detail}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={sw.proceed} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}>
                  Schedule Anyway
                </button>
                <button onClick={() => setSchedWarning(null)} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        )
      })()}

      <Header
        title={isEdit ? 'Edit Workout' : 'Create Workout'}
        onBack={() => navigate(backPath)}
      >
        <button
          onClick={handleSave}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            padding: '8px 4px 8px 12px',
          }}
        >
          Save
        </button>
      </Header>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Client context label */}
        {clientName && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,59,48,0.10)',
              border: '1px solid rgba(255,59,48,0.25)',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              fontFamily: 'var(--font)',
              letterSpacing: '0.3px',
              marginTop: '-4px',
            }}
          >
            Client: {clientName}
          </div>
        )}

        {/* Workout Name */}
        <section>
          <label style={LABEL_STYLE} htmlFor="workout-name">
            Workout Name
          </label>
          <input
            id="workout-name"
            type="text"
            placeholder="e.g. Push Day"
            value={name}
            onChange={e => { setName(e.target.value); clearError('name') }}
            style={errors.name ? INPUT_ERROR_STYLE : INPUT_STYLE}
            onFocus={e => { if (!errors.name) e.target.style.borderColor = 'var(--color-accent)' }}
            onBlur={e => { if (!errors.name) e.target.style.borderColor = 'var(--color-border)' }}
          />
          {errors.name && <p style={ERROR_STYLE}>{errors.name}</p>}
        </section>

        {/* Exercise list */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Exercises</label>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: appMode !== 'trainer' && exercises.length >= LITE_MAX_EXERCISES_PER_WORKOUT
                  ? 'var(--color-accent)'
                  : 'var(--color-text-secondary)',
              }}
            >
              {appMode === 'trainer'
                ? `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`
                : `${exercises.length}/${LITE_MAX_EXERCISES_PER_WORKOUT}`}
            </span>
          </div>

          {exercises.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {exercises.map((ex, index) => {
                const exErr = exerciseErrors[index] ?? {}
                return (
                  <div
                    key={index}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                    }}
                  >
                    {/* Name row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--color-accent)',
                          minWidth: '20px',
                          textAlign: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {ex.exerciseOrder}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'var(--color-white)',
                        }}
                      >
                        {ex.exerciseName}
                      </span>
                      <button
                        onClick={() => removeExercise(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                          flexShrink: 0,
                        }}
                        aria-label={`Remove ${ex.exerciseName}`}
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {/* Optional plan targets */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingLeft: '32px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={PLAN_LABEL_STYLE}>Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          step="1"
                          placeholder="—"
                          value={ex.plannedSets ?? ''}
                          onChange={e => updateExercisePlan(index, 'plannedSets', e.target.value)}
                          style={{
                            ...PLAN_INPUT_STYLE,
                            borderColor: exErr.plannedSets ? 'var(--color-accent)' : 'var(--color-border)',
                          }}
                          onFocus={e => { if (!exErr.plannedSets) e.target.style.borderColor = 'var(--color-accent)' }}
                          onBlur={e => { if (!exErr.plannedSets) e.target.style.borderColor = 'var(--color-border)' }}
                        />
                        {exErr.plannedSets && (
                          <p style={{ ...ERROR_STYLE, fontSize: '11px', marginTop: '4px' }}>
                            {exErr.plannedSets}
                          </p>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={PLAN_LABEL_STYLE}>Target Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          placeholder="—"
                          value={ex.targetReps ?? ''}
                          onChange={e => updateExercisePlan(index, 'targetReps', e.target.value)}
                          style={{
                            ...PLAN_INPUT_STYLE,
                            borderColor: exErr.targetReps ? 'var(--color-accent)' : 'var(--color-border)',
                          }}
                          onFocus={e => { if (!exErr.targetReps) e.target.style.borderColor = 'var(--color-accent)' }}
                          onBlur={e => { if (!exErr.targetReps) e.target.style.borderColor = 'var(--color-border)' }}
                        />
                        {exErr.targetReps && (
                          <p style={{ ...ERROR_STYLE, fontSize: '11px', marginTop: '4px' }}>
                            {exErr.targetReps}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add exercise button */}
          <button
            onClick={openPicker}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              letterSpacing: '0.4px',
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            <Dumbbell size={16} />
            Add Exercise
          </button>

          {errors.exercises && <p style={{ ...ERROR_STYLE, marginTop: '10px' }}>{errors.exercises}</p>}
        </section>

        {/* Save button */}
        <Button variant="primary" onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Save Workout'}
        </Button>

        {/* Schedule section — PT client workouts only */}
        {clientId && (
          <section>
            {/* Existing upcoming sessions (edit mode) */}
            {upcomingWorkoutSessions.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Scheduled Sessions</label>
                  <button
                    onClick={() => navigate('/pt-schedule')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', letterSpacing: '0.3px' }}
                  >
                    View Schedule
                  </button>
                </div>
                {upcomingWorkoutSessions.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '6px' }}>
                    <CalendarDays size={15} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                      {friendlyScheduleDate(s.date)}, {s.startTime}{s.endTime ? ` – ${s.endTime}` : s.durationMinutes ? ` – ${calculateEndTime(s.startTime, s.durationMinutes)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle button */}
            <button
              onClick={() => setScheduleOpen(v => !v)}
              aria-expanded={scheduleOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                background: scheduleOpen ? 'rgba(255,59,48,0.08)' : 'var(--color-surface)',
                border: `1.5px solid ${scheduleOpen ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: scheduleOpen ? 'var(--color-accent)' : 'var(--color-white)',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font)',
                letterSpacing: '0.3px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={16} />
                Schedule this workout
              </div>
              {scheduleOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Expanded schedule fields */}
            {scheduleOpen && (
              <div style={{ padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label htmlFor="cw-sched-date" style={LABEL_STYLE}>
                    Date <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <input
                    id="cw-sched-date"
                    type="date"
                    value={schedDate}
                    onChange={e => { setSchedDate(e.target.value); setSchedErrors(p => ({ ...p, date: null })) }}
                    style={{
                      width: '100%',
                      background: 'var(--color-bg)',
                      border: `1.5px solid ${schedErrors.date ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-white)',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: 'var(--font)',
                      padding: '11px 14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = schedErrors.date ? 'var(--color-accent)' : 'var(--color-border)' }}
                  />
                  {schedErrors.date && <p style={ERROR_STYLE}>{schedErrors.date}</p>}
                </div>

                <div>
                  <label htmlFor="cw-sched-start" style={LABEL_STYLE}>
                    Start Time <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <input
                    id="cw-sched-start"
                    type="time"
                    value={schedStart}
                    onChange={e => { setSchedStart(e.target.value); setSchedErrors(p => ({ ...p, start: null })) }}
                    style={{
                      width: '100%',
                      background: 'var(--color-bg)',
                      border: `1.5px solid ${schedErrors.start ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-white)',
                      fontSize: '15px',
                      fontWeight: 500,
                      fontFamily: 'var(--font)',
                      padding: '11px 14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                    onBlur={e => { e.target.style.borderColor = schedErrors.start ? 'var(--color-accent)' : 'var(--color-border)' }}
                  />
                  {schedErrors.start && <p style={ERROR_STYLE}>{schedErrors.start}</p>}
                </div>

                <div>
                  <label style={LABEL_STYLE}>Duration</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {schedDurationOptions.map(mins => {
                      const active = schedDuration === String(mins)
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSchedDuration(active ? '' : String(mins))}
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

                {schedStart && schedDuration && (
                  <div>
                    <label style={LABEL_STYLE}>End Time</label>
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
                        {calculateEndTime(schedStart, schedDuration)}
                      </span>
                      {crossesMidnight(schedStart, schedDuration) && (
                        <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'var(--font)', letterSpacing: '0.3px' }}>
                          +1 day
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <label style={LABEL_STYLE}>Category</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {categories.map(c => {
                        const active = schedCategoryId === c.id
                        return (
                          <button key={c.id} type="button"
                            onClick={() => { setSchedCategoryId(active ? '' : c.id); setSchedCategoryName(active ? '' : c.name) }}
                            aria-pressed={active}
                            style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                            {c.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {paymentTypes.length > 0 && (
                  <div>
                    <label style={LABEL_STYLE}>Payment Type</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {paymentTypes.map(p => {
                        const active = schedPaymentTypeId === p.id
                        return (
                          <button key={p.id} type="button"
                            onClick={() => { setSchedPaymentTypeId(active ? '' : p.id); setSchedPaymentTypeName(active ? '' : p.name) }}
                            aria-pressed={active}
                            style={{ padding: '7px 12px', borderRadius: '20px', border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(255,59,48,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                            {p.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.5 }}>
                  This will create a scheduled session in PT Schedule linked to this workout.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
