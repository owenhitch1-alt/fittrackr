import { useState } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { X, Dumbbell } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import LiteModal from '../components/LiteModal.jsx'
import ExercisePicker from '../components/ExercisePicker.jsx'
import { saveWorkoutTemplate, getWorkoutTemplates } from '../data/storage.js'
import { LITE_MAX_WORKOUTS, LITE_MAX_EXERCISES_PER_WORKOUT } from '../data/limits.js'

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
  const clientId = locationState?.clientId ?? null
  const clientName = locationState?.clientName ?? null

  // In edit mode, find the existing template once (lazy initializer so it only runs on mount)
  const existingTemplate = isEdit
    ? getWorkoutTemplates().find(t => t.id === templateId) ?? null
    : null

  const [name, setName] = useState(() => existingTemplate?.name ?? '')
  const [exercises, setExercises] = useState(() => existingTemplate?.exercises ?? [])
  const [errors, setErrors] = useState({})
  const [exerciseErrors, setExerciseErrors] = useState([])
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitModalContent, setLimitModalContent] = useState({ heading: '', body: '' })
  const [showPicker, setShowPicker] = useState(false)

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

    if (Object.keys(newErrors).length > 0 || hasExErrors) {
      setErrors(newErrors)
      setExerciseErrors(newExErrors)
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

    // Pass the existing id when editing so saveWorkoutTemplate performs an update, not a create
    saveWorkoutTemplate({
      ...(isEdit ? { id: templateId } : {}),
      name: name.trim(),
      exercises,
      ...(clientId ? { clientId } : {}),
    })
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
      </div>
    </div>
  )
}
