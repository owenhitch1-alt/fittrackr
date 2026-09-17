/**
 * FitTrackr — Active Workout Draft
 *
 * Persists the in-progress workout so a refresh, tab close or accidental
 * navigation does not lose the user's sets. The draft is written on every
 * session mutation and cleared when the workout is completed or discarded.
 *
 * Only one draft exists at a time — starting a new workout replaces it.
 */

import { STORAGE_KEYS } from './appData.js'

const KEY = STORAGE_KEYS.activeWorkout
const DRAFT_VERSION = 1

/**
 * @typedef {Object} ActiveWorkoutDraft
 * @property {number} version
 * @property {import('./storage.js').WorkoutSession} session
 * @property {'quickStart'|'template'} mode
 * @property {string|null} templateId
 * @property {number} exerciseIndex
 * @property {string} savedAt
 */

/**
 * Returns the saved draft, or null if none exists or it is unreadable.
 * A draft with no exercises and no logged data is treated as empty.
 * @returns {ActiveWorkoutDraft|null}
 */
export function getActiveWorkoutDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (!draft?.session?.id || draft.version !== DRAFT_VERSION) return null
    return draft
  } catch {
    return null
  }
}

/**
 * Writes the current workout state as the active draft.
 * @param {{ session: Object, mode: 'quickStart'|'template', templateId?: string|null, exerciseIndex?: number }} state
 */
export function saveActiveWorkoutDraft({ session, mode, templateId = null, exerciseIndex = 0 }) {
  if (!session?.id) return
  try {
    localStorage.setItem(KEY, JSON.stringify({
      version: DRAFT_VERSION,
      session,
      mode,
      templateId,
      exerciseIndex,
      savedAt: new Date().toISOString(),
    }))
  } catch (err) {
    console.error('FitTrackr: failed to save active workout draft', err)
  }
}

/** Removes the active draft. Called on completion and on discard. */
export function clearActiveWorkoutDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

/**
 * True when the draft holds work worth recovering — at least one exercise.
 * Prevents prompting to resume a workout the user never actually started.
 * @param {ActiveWorkoutDraft|null} draft
 * @returns {boolean}
 */
export function draftHasProgress(draft) {
  return (draft?.session?.exercises?.length ?? 0) > 0
}

/**
 * True when the session contains any user-entered data that would be lost.
 * Used to decide whether leaving needs a confirmation prompt.
 * @param {Object} session
 * @returns {boolean}
 */
export function sessionHasUnsavedWork(session) {
  const exercises = session?.exercises ?? []
  if (exercises.length === 0) return false
  return exercises.some(ex =>
    (ex.note ?? '').trim().length > 0 ||
    (ex.sets ?? []).some(s => s.completed || s.weight != null || s.reps != null)
  )
}
