/**
 * FitTrackr Phase 1 — Local Storage Layer
 *
 * All data is stored in localStorage under two keys:
 *   fittrackr_templates  → WorkoutTemplate[]
 *   fittrackr_sessions   → WorkoutSession[]
 *
 * Each function maps 1-to-1 with a future backend API endpoint.
 * To migrate: replace the body of each function with an API call
 * and remove the localStorage helpers below.
 */

// ─── Storage keys ────────────────────────────────────────────────────────────

const TEMPLATES_KEY        = 'fittrackr_templates'
const SESSIONS_KEY         = 'fittrackr_sessions'
const CLIENTS_KEY          = 'fittrackr_clients'
const ACTIVE_CLIENT_KEY    = 'fittrackr_active_client'
const CHECKINS_KEY         = 'fittrackr_checkins'
const USER_PROGRESS_KEY     = 'fittrackr_user_progress'
const EXERCISE_PROGRESS_KEY = 'fittrackr_exercise_progress'
const EXERCISE_NOTES_KEY    = 'fittrackr_exercise_notes'

// ─── Type definitions (JSDoc) ─────────────────────────────────────────────────

/**
 * @typedef {Object} WorkoutSet
 * @property {string}  id
 * @property {number}  setNumber
 * @property {number|null} weight      - kg
 * @property {number|null} reps
 * @property {number}  restSeconds
 * @property {boolean} completed
 * @property {string}  createdAt       - ISO date string
 */

/**
 * @typedef {Object} WorkoutSessionExercise
 * @property {string}       id
 * @property {string}       exerciseName
 * @property {number}       exerciseOrder
 * @property {WorkoutSet[]} sets
 */

/**
 * @typedef {Object} WorkoutSession
 * @property {string}  id
 * @property {string|null} workoutTemplateId
 * @property {string}  workoutName
 * @property {string|null} [clientId]       - links session to a PT client
 * @property {string}  startedAt           - ISO date string
 * @property {string|null} completedAt     - ISO date string
 * @property {number|null} durationSeconds
 * @property {'active'|'completed'|'cancelled'} status
 * @property {WorkoutSessionExercise[]} exercises
 */

/**
 * @typedef {Object} Client
 * @property {string}  id
 * @property {string}  name
 * @property {string}  [notes]
 * @property {string}  createdAt   - ISO date string
 * @property {string}  updatedAt   - ISO date string
 */

/**
 * @typedef {Object} WorkoutTemplateExercise
 * @property {string}      id
 * @property {string}      exerciseName
 * @property {number}      exerciseOrder
 * @property {number|null} [plannedSets]  - optional, 1–20
 * @property {number|null} [targetReps]   - optional, 1–100
 */

/**
 * @typedef {Object} WorkoutTemplate
 * @property {string}  id
 * @property {string}  name
 * @property {string|null} [clientId]       - links template to a PT client
 * @property {WorkoutTemplateExercise[]} exercises
 * @property {string}  createdAt           - ISO date string
 * @property {string}  updatedAt           - ISO date string
 */

/**
 * @typedef {Object} ClientCheckIn
 * @property {string}  id
 * @property {string}  clientId
 * @property {string}  date                 - YYYY-MM-DD
 * @property {number|null} weight
 * @property {'kg'|'lb'} weightUnit
 * @property {number|null} bodyFatPercentage
 * @property {number|null} muscleMass
 * @property {'kg'|'lb'} muscleMassUnit
 * @property {number|null} waist
 * @property {number|null} chest
 * @property {number|null} hips
 * @property {'cm'} measurementUnit
 * @property {string}  [notes]
 * @property {string}  createdAt
 * @property {string}  updatedAt
 */

// ─── Internal helpers ─────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function readKey(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('FitTrackr: failed to write to localStorage', err)
  }
}

// ─── Session initialisation helpers ──────────────────────────────────────────

/**
 * Creates a blank WorkoutSet for use during an active workout.
 * Optionally pre-fills weight and reps from the previous set.
 * @param {number} setNumber
 * @param {{ weight?: number|null, reps?: number|null }} defaults
 * @param {'kg'|'lb'} weightUnit
 * @returns {WorkoutSet}
 */
export function createSet(setNumber, defaults = {}, weightUnit = 'kg') {
  return {
    id: generateId(),
    setNumber,
    weight: defaults.weight ?? null,
    reps: defaults.reps ?? null,
    weightUnit,
    restSeconds: 90,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Builds an in-progress WorkoutSession from a saved template.
 * The session is kept in React state and is NOT persisted until the user
 * confirms on the Workout Complete screen.
 * @param {WorkoutTemplate} template
 * @param {'kg'|'lb'} weightUnit
 * @returns {WorkoutSession}
 */
export function initWorkoutSession(template, weightUnit = 'kg') {
  const clientId = template.clientId ?? null
  return {
    id: generateId(),
    workoutTemplateId: template.id,
    workoutName: template.name,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationSeconds: null,
    status: 'active',
    clientId,
    exercises: template.exercises.map(ex => {
      const historySets = getLastCompletedExerciseSets(ex.exerciseName, clientId)
      if (historySets && historySets.length > 0) {
        return {
          id: ex.id,
          exerciseName: ex.exerciseName,
          exerciseOrder: ex.exerciseOrder,
          plannedSets: ex.plannedSets ?? null,
          targetReps: ex.targetReps ?? null,
          preFilled: true,
          sets: historySets.map((hs, i) =>
            createSet(i + 1, { weight: hs.weight, reps: hs.reps }, hs.weightUnit ?? weightUnit)
          ),
        }
      }
      const numSets = (ex.plannedSets != null && ex.plannedSets >= 1) ? ex.plannedSets : 1
      const prefillReps = (ex.targetReps != null && ex.targetReps >= 1) ? ex.targetReps : null
      return {
        id: ex.id,
        exerciseName: ex.exerciseName,
        exerciseOrder: ex.exerciseOrder,
        plannedSets: ex.plannedSets ?? null,
        targetReps: ex.targetReps ?? null,
        sets: Array.from({ length: numSets }, (_, i) =>
          createSet(i + 1, { reps: prefillReps }, weightUnit)
        ),
      }
    }),
  }
}

/**
 * Builds an in-progress WorkoutSession for Quick Start mode (no template).
 * Starts with zero exercises; the user adds them during the workout.
 * @param {string} [workoutName]
 * @returns {WorkoutSession}
 */
export function initQuickStartSession(workoutName = 'Quick Start Workout', clientId = null) {
  return {
    id: generateId(),
    workoutTemplateId: null,
    workoutName,
    clientId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationSeconds: null,
    status: 'active',
    exercises: [],
  }
}

/**
 * Creates a WorkoutSessionExercise with a single blank set.
 * Used by Quick Start mode when the user adds an exercise during a workout.
 * @param {string} exerciseName
 * @param {number} exerciseOrder
 * @param {'kg'|'lb'} weightUnit
 * @returns {WorkoutSessionExercise}
 */
export function createSessionExercise(exerciseName, exerciseOrder, weightUnit = 'kg') {
  return {
    id: generateId(),
    exerciseName,
    exerciseOrder,
    sets: [createSet(1, {}, weightUnit)],
  }
}

// ─── Workout Templates ────────────────────────────────────────────────────────

/**
 * Returns all saved workout templates, newest first.
 * @returns {WorkoutTemplate[]}
 */
export function getWorkoutTemplates() {
  return readKey(TEMPLATES_KEY)
}

/**
 * Saves a workout template.
 * Pass a template without an id to create; pass one with an existing id to update.
 * @param {Partial<WorkoutTemplate>} template
 * @returns {WorkoutTemplate} the saved template
 */
export function saveWorkoutTemplate(template) {
  const templates = getWorkoutTemplates()
  const now = new Date().toISOString()

  let saved

  // Ensure every exercise has an id and a correct exerciseOrder
  const exercises = (template.exercises ?? []).map((ex, i) => ({
    exerciseOrder: i + 1,
    ...ex,
    id: ex.id || generateId(),
  }))

  if (template.id) {
    const index = templates.findIndex(t => t.id === template.id)
    saved = { ...template, exercises, updatedAt: now }
    if (index !== -1) {
      templates[index] = saved
    } else {
      templates.push(saved)
    }
  } else {
    saved = {
      ...template,
      exercises,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    templates.push(saved)
  }

  writeKey(TEMPLATES_KEY, templates)
  return saved
}

/**
 * Deletes a workout template by id. Has no effect if id is not found.
 * @param {string} id
 */
export function deleteWorkoutTemplate(id) {
  const templates = getWorkoutTemplates().filter(t => t.id !== id)
  writeKey(TEMPLATES_KEY, templates)
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

/**
 * Returns all workout sessions, newest first by startedAt.
 * @returns {WorkoutSession[]}
 */
export function getWorkoutSessions() {
  const sessions = readKey(SESSIONS_KEY)
  return sessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
}

/**
 * Saves a workout session.
 * Pass a session without an id to create; pass one with an existing id to update.
 * @param {Partial<WorkoutSession>} session
 * @returns {WorkoutSession} the saved session
 */
export function saveWorkoutSession(session) {
  const sessions = readKey(SESSIONS_KEY)
  const now = new Date().toISOString()

  let saved

  if (session.id) {
    const index = sessions.findIndex(s => s.id === session.id)
    saved = { ...session }
    if (index !== -1) {
      sessions[index] = saved
    } else {
      sessions.push(saved)
    }
  } else {
    saved = {
      exercises: [],
      durationSeconds: null,
      completedAt: null,
      workoutTemplateId: null,
      status: 'active',
      ...session,
      id: generateId(),
      startedAt: session.startedAt ?? now,
    }
    sessions.push(saved)
  }

  writeKey(SESSIONS_KEY, sessions)
  return saved
}

/**
 * Returns a single session by id, or null if not found.
 * @param {string} id
 * @returns {WorkoutSession|null}
 */
export function getWorkoutSessionById(id) {
  return getWorkoutSessions().find(s => s.id === id) ?? null
}

// ─── Clear all ────────────────────────────────────────────────────────────────

/**
 * Deletes all workout templates, session history, client data, check-ins,
 * and XP progress from local storage.
 * Called by Reset Demo Data. Does NOT reset app settings (e.g. rest timer preference).
 */
export function clearAllWorkoutData() {
  try {
    localStorage.removeItem(TEMPLATES_KEY)
    localStorage.removeItem(SESSIONS_KEY)
    localStorage.removeItem(CLIENTS_KEY)
    localStorage.removeItem(ACTIVE_CLIENT_KEY)
    localStorage.removeItem(CHECKINS_KEY)
    localStorage.removeItem(USER_PROGRESS_KEY)
    localStorage.removeItem(EXERCISE_PROGRESS_KEY)
    localStorage.removeItem(EXERCISE_NOTES_KEY)
  } catch {}
}

// ─── App Settings ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'fittrackr_settings'

function getAppSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAppSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('FitTrackr: failed to write settings to localStorage', err)
  }
}

/**
 * Returns the user's saved default rest timer in seconds.
 * Falls back to 90 if no preference has been saved.
 * @returns {number}
 */
export function getDefaultRestTimerSeconds() {
  return getAppSettings().defaultRestTimerSeconds ?? 90
}

/**
 * Persists the user's preferred default rest timer.
 * @param {number} seconds  Must be a positive integer (1–300).
 */
export function saveDefaultRestTimerSeconds(seconds) {
  saveAppSettings({ ...getAppSettings(), defaultRestTimerSeconds: seconds })
}

/**
 * Returns the saved theme mode. Falls back to 'dark'.
 * @returns {'dark'|'light'}
 */
export function getThemeMode() {
  return getAppSettings().themeMode ?? 'dark'
}

/**
 * Persists the selected theme mode.
 * @param {'dark'|'light'} mode
 */
export function saveThemeMode(mode) {
  saveAppSettings({ ...getAppSettings(), themeMode: mode })
}

/**
 * Returns the saved app mode. Falls back to 'personal'.
 * @returns {'personal'|'trainer'}
 */
export function getAppMode() {
  return getAppSettings().appMode ?? 'personal'
}

/**
 * Persists the selected app mode.
 * @param {'personal'|'trainer'} mode
 */
export function saveAppMode(mode) {
  saveAppSettings({ ...getAppSettings(), appMode: mode })
}

const DEFAULT_AVAILABLE_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Barbell', 'Bench', 'Machine', 'Cable Machine']

/**
 * Returns the user's saved available equipment list. Falls back to sensible gym defaults.
 * @returns {string[]}
 */
export function getAvailableEquipment() {
  return getAppSettings().availableEquipment ?? DEFAULT_AVAILABLE_EQUIPMENT
}

/**
 * Persists the user's available equipment selection.
 * @param {string[]} equipment
 */
export function saveAvailableEquipment(equipment) {
  saveAppSettings({ ...getAppSettings(), availableEquipment: equipment })
}

/**
 * Returns the saved weight unit preference. Falls back to 'kg'.
 * @returns {'kg'|'lb'}
 */
export function getWeightUnit() {
  return getAppSettings().weightUnit ?? 'kg'
}

/**
 * Persists the selected weight unit.
 * @param {'kg'|'lb'} unit
 */
export function saveWeightUnit(unit) {
  saveAppSettings({ ...getAppSettings(), weightUnit: unit })
}

/**
 * Returns the saved body measurement unit preference. Falls back to 'cm'.
 * @returns {'cm'|'in'}
 */
export function getMeasurementUnit() {
  return getAppSettings().measurementUnit ?? 'cm'
}

/**
 * Persists the selected body measurement unit.
 * @param {'cm'|'in'} unit
 */
export function saveMeasurementUnit(unit) {
  saveAppSettings({ ...getAppSettings(), measurementUnit: unit })
}

/**
 * Returns the user's first name. Falls back to ''.
 * @returns {string}
 */
export function getFirstName() {
  return getAppSettings().firstName ?? ''
}

/**
 * Persists the user's first name.
 * @param {string} name
 */
export function saveFirstName(name) {
  saveAppSettings({ ...getAppSettings(), firstName: name })
}

/**
 * Returns the user's saved training goals. Falls back to [].
 * @returns {string[]}
 */
export function getGoals() {
  return getAppSettings().goals ?? []
}

/**
 * Returns whether the first-time setup questionnaire has been completed.
 * @returns {boolean}
 */
export function getHasCompletedFirstSetup() {
  return getAppSettings().hasCompletedFirstSetup ?? false
}

/**
 * Saves all first-setup answers in a single atomic write.
 * Existing settings fields not included here are preserved.
 *
 * @param {{
 *   firstName: string,
 *   appMode: 'personal'|'trainer',
 *   goals: string[],
 *   availableEquipment: string[],
 *   weightUnit: 'kg'|'lb',
 *   defaultRestTimerSeconds: number,
 *   measurementUnit: 'cm'|'in',
 * }} answers
 */
export function saveSetupAnswers(answers) {
  saveAppSettings({
    ...getAppSettings(),
    firstName: answers.firstName ?? '',
    appMode: answers.appMode ?? 'personal',
    goals: answers.goals ?? [],
    availableEquipment: answers.availableEquipment ?? [],
    weightUnit: answers.weightUnit ?? 'kg',
    defaultRestTimerSeconds: answers.defaultRestTimerSeconds ?? 90,
    measurementUnit: answers.measurementUnit ?? 'cm',
    hasCompletedFirstSetup: true,
  })
}

// ─── Custom Exercises ─────────────────────────────────────────────────────────

const CUSTOM_EXERCISES_KEY = 'fittrackr_custom_exercises'

/**
 * Returns all user-created custom exercises.
 * @returns {import('./exercises.js').Exercise[]}
 */
export function getCustomExercises() {
  try {
    const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves a new custom exercise. Generates a unique id from the name + timestamp.
 * @param {Omit<import('./exercises.js').Exercise, 'id'|'isCustom'>} exercise
 * @returns {import('./exercises.js').Exercise} the saved exercise with id
 */
export function saveCustomExercise(exercise) {
  const exercises = getCustomExercises()
  const slug = exercise.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const saved = {
    ...exercise,
    id: `custom-${slug}-${Date.now()}`,
    isCustom: true,
  }
  exercises.push(saved)
  try {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises))
  } catch (err) {
    console.error('FitTrackr: failed to save custom exercise', err)
  }
  return saved
}

/**
 * Deletes a custom exercise by id. Has no effect if id is not found.
 * @param {string} id
 */
export function deleteCustomExercise(id) {
  const exercises = getCustomExercises().filter(e => e.id !== id)
  try {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises))
  } catch {}
}

// ─── Performance lookups ──────────────────────────────────────────────────────

function getFilteredSessions(clientId) {
  const completed = getWorkoutSessions().filter(s => s.status === 'completed')
  if (clientId) return completed.filter(s => s.clientId === clientId)
  return completed.filter(s => !s.clientId)
}

/**
 * Returns the most recent completed set for a given exercise name.
 * When clientId is provided, only searches sessions for that client.
 * When clientId is null, only searches personal (non-client) sessions.
 *
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {WorkoutSet|null}
 */
export function getLastPerformance(exerciseName, clientId = null) {
  const name = exerciseName.trim().toLowerCase()

  // Sessions are sorted newest first — return from the first matching session found
  for (const session of getFilteredSessions(clientId)) {
    const exercise = session.exercises?.find(
      e => e.exerciseName.trim().toLowerCase() === name
    )
    if (!exercise) continue

    // Only count sets that are completed AND have valid reps
    const validSets = (exercise.sets ?? []).filter(
      s => s.completed && s.reps != null && s.reps > 0
    )
    if (validSets.length === 0) continue

    // Highest setNumber = the last set the user logged in that session
    return validSets.slice().sort((a, b) => b.setNumber - a.setNumber)[0]
  }

  return null
}

/**
 * Returns the single best completed set for a given exercise name.
 * Best = highest weight. Ties broken by highest reps.
 * When clientId is provided, only searches sessions for that client.
 *
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {WorkoutSet|null}
 */
export function getBestPerformance(exerciseName, clientId = null) {
  const name = exerciseName.trim().toLowerCase()
  let best = null

  for (const session of getFilteredSessions(clientId)) {
    const exercise = session.exercises?.find(
      e => e.exerciseName.trim().toLowerCase() === name
    )
    if (!exercise) continue

    for (const set of exercise.sets ?? []) {
      if (!set.completed || set.reps == null || set.reps <= 0) continue
      if (!best) {
        best = set
        continue
      }
      const betterWeight = (set.weight ?? 0) > (best.weight ?? 0)
      const sameWeightMoreReps =
        (set.weight ?? 0) === (best.weight ?? 0) && (set.reps ?? 0) > (best.reps ?? 0)
      if (betterWeight || sameWeightMoreReps) {
        best = set
      }
    }
  }

  return best
}

/**
 * Returns all valid completed sets from the most recent session containing the
 * given exercise, sorted by setNumber ascending. Used to pre-populate a new
 * active workout with the user's last performance.
 *
 * Scoped by clientId — same rules as getFilteredSessions.
 * Returns null if no matching history exists.
 *
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {WorkoutSet[]|null}
 */
export function getLastCompletedExerciseSets(exerciseName, clientId = null) {
  const name = exerciseName.trim().toLowerCase()
  for (const session of getFilteredSessions(clientId)) {
    const exercise = session.exercises?.find(
      e => e.exerciseName.trim().toLowerCase() === name
    )
    if (!exercise) continue
    const validSets = (exercise.sets ?? []).filter(
      s => s.completed && s.reps != null && s.reps > 0
    )
    if (validSets.length === 0) continue
    return validSets.slice().sort((a, b) => a.setNumber - b.setNumber)
  }
  return null
}

/**
 * Returns the completed sets from the most recent session containing the given
 * exercise, with the session's completedAt date. Used by the Last panel.
 *
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {{ completedAt: string|null, sets: WorkoutSet[] }|null}
 */
export function getLastExercisePerformance(exerciseName, clientId = null) {
  const name = exerciseName.trim().toLowerCase()
  for (const session of getFilteredSessions(clientId)) {
    const exercise = session.exercises?.find(
      e => e.exerciseName.trim().toLowerCase() === name
    )
    if (!exercise) continue
    const validSets = (exercise.sets ?? []).filter(
      s => s.completed && s.reps != null && s.reps > 0
    )
    if (validSets.length === 0) continue
    return {
      completedAt: session.completedAt ?? null,
      sets: validSets.slice().sort((a, b) => a.setNumber - b.setNumber),
    }
  }
  return null
}

/**
 * Returns three best-performance metrics across all history for a given exercise.
 *   overallBest      — session with highest total volume (weight × reps summed)
 *   mostRepsSet      — single set with highest reps (tie-break: heavier weight)
 *   heaviestWeightSet — single set with highest weight (tie-break: more reps)
 *
 * Weight comparisons use raw numeric values. Mixed-unit history is not converted.
 *
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {{
 *   overallBest: { setCount: number, totalReps: number, totalVolume: number, volumeUnit: string, completedAt: string|null }|null,
 *   mostRepsSet: (WorkoutSet & { completedAt: string|null })|null,
 *   heaviestWeightSet: (WorkoutSet & { completedAt: string|null })|null,
 * }}
 */
export function getBestExercisePerformance(exerciseName, clientId = null) {
  const name = exerciseName.trim().toLowerCase()
  let overallBest = null
  let mostRepsSet = null
  let heaviestWeightSet = null

  for (const session of getFilteredSessions(clientId)) {
    const exercise = session.exercises?.find(
      e => e.exerciseName.trim().toLowerCase() === name
    )
    if (!exercise) continue

    const validSets = (exercise.sets ?? []).filter(
      s => s.completed && s.reps != null && s.reps > 0
    )
    if (validSets.length === 0) continue

    // Overall Best — session with highest total volume
    const totalVolume = validSets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0)
    const totalReps = validSets.reduce((sum, s) => sum + (s.reps ?? 0), 0)
    if (!overallBest || totalVolume > overallBest.totalVolume) {
      overallBest = {
        setCount: validSets.length,
        totalReps,
        totalVolume,
        volumeUnit: validSets[0]?.weightUnit ?? 'kg',
        completedAt: session.completedAt ?? null,
      }
    }

    // Set-level bests
    for (const set of validSets) {
      const setWithDate = { ...set, completedAt: session.completedAt ?? null }

      // Most Reps: highest reps, tie-break: heavier weight
      if (
        !mostRepsSet ||
        (set.reps ?? 0) > (mostRepsSet.reps ?? 0) ||
        ((set.reps ?? 0) === (mostRepsSet.reps ?? 0) && (set.weight ?? 0) > (mostRepsSet.weight ?? 0))
      ) {
        mostRepsSet = setWithDate
      }

      // Heaviest Weight: highest weight, tie-break: more reps
      if (
        !heaviestWeightSet ||
        (set.weight ?? 0) > (heaviestWeightSet.weight ?? 0) ||
        ((set.weight ?? 0) === (heaviestWeightSet.weight ?? 0) && (set.reps ?? 0) > (heaviestWeightSet.reps ?? 0))
      ) {
        heaviestWeightSet = setWithDate
      }
    }
  }

  return { overallBest, mostRepsSet, heaviestWeightSet }
}

// ─── Clients ──────────────────────────────────────────────────────────────────

/** @returns {Client[]} */
export function getClients() {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Creates or updates a client.
 * Pass an object without id to create; pass one with an existing id to update.
 * @param {Partial<Client>} client
 * @returns {Client}
 */
export function saveClient(client) {
  const clients = getClients()
  const now = new Date().toISOString()
  let saved
  if (client.id) {
    const idx = clients.findIndex(c => c.id === client.id)
    saved = { ...client, updatedAt: now }
    if (idx !== -1) clients[idx] = saved
    else clients.push(saved)
  } else {
    saved = { ...client, id: generateId(), createdAt: now, updatedAt: now }
    clients.push(saved)
  }
  try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)) } catch {}
  return saved
}

/**
 * @param {string} id
 * @returns {Client|null}
 */
export function getClientById(id) {
  return getClients().find(c => c.id === id) ?? null
}

/** @param {string} id */
export function deleteClient(id) {
  const clients = getClients().filter(c => c.id !== id)
  try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)) } catch {}
}

// ─── Active Client ────────────────────────────────────────────────────────────

/** @param {string|null} id */
export function setActiveClient(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_CLIENT_KEY, id)
    else localStorage.removeItem(ACTIVE_CLIENT_KEY)
  } catch {}
}

/** @returns {string|null} */
export function getActiveClient() {
  try { return localStorage.getItem(ACTIVE_CLIENT_KEY) ?? null } catch { return null }
}

// ─── Client Check-Ins ─────────────────────────────────────────────────────────

/**
 * Returns all check-ins for a given client, newest date first.
 * @param {string} clientId
 * @returns {ClientCheckIn[]}
 */
export function getClientCheckIns(clientId) {
  return readKey(CHECKINS_KEY)
    .filter(c => c.clientId === clientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Creates or updates a check-in.
 * Pass an object without id to create; pass one with an existing id to update.
 * @param {Partial<ClientCheckIn>} checkIn
 * @returns {ClientCheckIn}
 */
export function saveClientCheckIn(checkIn) {
  const all = readKey(CHECKINS_KEY)
  const now = new Date().toISOString()
  let saved
  if (checkIn.id) {
    const idx = all.findIndex(c => c.id === checkIn.id)
    saved = { ...checkIn, updatedAt: now }
    if (idx !== -1) all[idx] = saved
    else all.push(saved)
  } else {
    saved = { ...checkIn, id: generateId(), createdAt: now, updatedAt: now }
    all.push(saved)
  }
  writeKey(CHECKINS_KEY, all)
  return saved
}

/**
 * Deletes a check-in by id. Has no effect if id is not found.
 * @param {string} checkInId
 */
export function deleteClientCheckIn(checkInId) {
  writeKey(CHECKINS_KEY, readKey(CHECKINS_KEY).filter(c => c.id !== checkInId))
}

/**
 * Returns the most recent check-in for a client, or null if none exist.
 * @param {string} clientId
 * @returns {ClientCheckIn|null}
 */
export function getLatestClientCheckIn(clientId) {
  return getClientCheckIns(clientId)[0] ?? null
}

// ─── User Progress (XP & levels) ─────────────────────────────────────────────
// Future: extend with avatar unlocks, milestone events, etc.

/**
 * Returns the user's overall XP progress. New users start at { totalXp: 0 }.
 * @returns {{ totalXp: number, updatedAt: string|null }}
 */
export function getUserProgress() {
  try {
    const raw = localStorage.getItem(USER_PROGRESS_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    return { totalXp: 0, updatedAt: null, ...saved }
  } catch {
    return { totalXp: 0, updatedAt: null }
  }
}

/**
 * Merges an update into the saved user progress.
 * @param {{ totalXp?: number, updatedAt?: string }} update
 */
export function saveUserProgress(update) {
  try {
    const current = getUserProgress()
    localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify({ ...current, ...update }))
  } catch (err) {
    console.error('FitTrackr: failed to save user progress', err)
  }
}

// ─── Exercise Progress (XP & levels) ─────────────────────────────────────────
// Keyed by normalised exercise name (exerciseKey). Stored as a flat object map.
// Future: power exercise-specific avatars, unlock animations, etc.

/**
 * Returns the XP progress object for a single exercise, or null if not found.
 * @param {string} exerciseKey  Normalised key from normaliseExerciseKey()
 * @returns {{ exerciseKey: string, exerciseName: string, totalXp: number, updatedAt: string }|null}
 */
export function getExerciseProgressByKey(exerciseKey) {
  try {
    const raw = localStorage.getItem(EXERCISE_PROGRESS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[exerciseKey] ?? null
  } catch {
    return null
  }
}

/**
 * Returns all exercise progress records as a key → object map.
 * @returns {Object.<string, { exerciseKey: string, exerciseName: string, totalXp: number }>}
 */
export function getAllExerciseProgress() {
  try {
    const raw = localStorage.getItem(EXERCISE_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Saves (upserts) an exercise progress record.
 * @param {{ exerciseKey: string, exerciseName: string, totalXp: number, updatedAt: string }} progress
 */
export function saveExerciseProgress(progress) {
  try {
    const raw = localStorage.getItem(EXERCISE_PROGRESS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[progress.exerciseKey] = progress
    localStorage.setItem(EXERCISE_PROGRESS_KEY, JSON.stringify(all))
  } catch (err) {
    console.error('FitTrackr: failed to save exercise progress', err)
  }
}

// ─── Exercise Notes ───────────────────────────────────────────────────────────

function normForNote(name) {
  if (!name || typeof name !== 'string') return 'unknown'
  return name.trim().toLowerCase().replace(/-/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

function makeNoteKey(exerciseKey, clientId) {
  return clientId ? `${exerciseKey}::c::${clientId}` : exerciseKey
}

/**
 * Returns the latest note record for an exercise, or null if none saved.
 * Pass clientId in PT mode to scope notes per-client.
 * @param {string} exerciseName
 * @param {string|null} [clientId]
 * @returns {{ exerciseKey: string, exerciseName: string, latestNote: string, clientId: string|null, updatedAt: string }|null}
 */
export function getLatestExerciseNote(exerciseName, clientId = null) {
  try {
    const raw = localStorage.getItem(EXERCISE_NOTES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[makeNoteKey(normForNote(exerciseName), clientId)] ?? null
  } catch {
    return null
  }
}

/**
 * Saves an exercise note as the latest reminder for that exercise.
 * Ignores empty notes. Scoped by clientId in PT mode.
 * @param {string} exerciseName
 * @param {string} note
 * @param {string|null} [clientId]
 */
export function saveLatestExerciseNote(exerciseName, note, clientId = null) {
  const trimmed = (note ?? '').trim()
  if (!trimmed) return
  try {
    const raw = localStorage.getItem(EXERCISE_NOTES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const exerciseKey = normForNote(exerciseName)
    all[makeNoteKey(exerciseKey, clientId)] = {
      exerciseKey,
      exerciseName,
      latestNote: trimmed,
      clientId: clientId ?? null,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(EXERCISE_NOTES_KEY, JSON.stringify(all))
  } catch {}
}

/**
 * Returns whether the note update confirmation prompt is enabled.
 * Defaults to true.
 * @returns {boolean}
 */
export function getShowExerciseNotePrompt() {
  return getAppSettings().showExerciseNoteOverwritePrompt !== false
}

/**
 * Persists the user's preference for showing the note overwrite prompt.
 * @param {boolean} value
 */
export function setShowExerciseNotePrompt(value) {
  saveAppSettings({ ...getAppSettings(), showExerciseNoteOverwritePrompt: value })
}
