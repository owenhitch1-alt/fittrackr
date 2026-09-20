/**
 * FitTrackr — Local Data Registry
 *
 * Single source of truth for every localStorage key the app owns.
 * Powers Export Local Data and the Reset tools in Settings → Privacy & Data.
 *
 * When adding a new localStorage key anywhere in the app, register it here so
 * it is included in exports and cleared by the matching reset category.
 */

export const STORAGE_KEYS = {
  settings:           'fittrackr_settings',
  templates:          'fittrackr_templates',
  sessions:           'fittrackr_sessions',
  customExercises:    'fittrackr_custom_exercises',
  exerciseNotes:      'fittrackr_exercise_notes',
  exerciseFavourites: 'fittrackr_exercise_favourites',
  exerciseProgress:   'fittrackr_exercise_progress',
  userProgress:       'fittrackr_user_progress',
  avatar:             'fittrackr_avatar',
  clients:            'fittrackr_clients',
  activeClient:       'fittrackr_active_client',
  checkins:           'fittrackr_checkins',
  ptSchedule:         'fittrackr_pt_schedule',
  ptDurationSettings: 'fittrackr_pt_duration_settings',
  ptAvailability:     'fittrackr_pt_availability',
  ptTimeOut:          'fittrackr_pt_timeout',
  ptCategories:       'fittrackr_pt_booking_categories',
  ptStatuses:         'fittrackr_pt_booking_statuses',
  ptPaymentTypes:     'fittrackr_pt_payment_types',
  programmeAccess:    'fittrackr_programme_access',
  activeWorkout:      'fittrackr_active_workout',
  schemaVersion:      'fittrackr_schema_version',
}

/**
 * Reset categories shown in Settings → Privacy & Data.
 * Each maps to the STORAGE_KEYS entries it clears.
 */
export const RESET_CATEGORIES = {
  history: {
    label: 'Reset Workout History',
    description: 'Deletes all completed workout sessions and exercise progress.',
    keys: ['sessions', 'exerciseProgress', 'userProgress'],
  },
  workouts: {
    label: 'Reset Workouts',
    description: 'Deletes saved workout templates, custom exercises and exercise notes.',
    keys: ['templates', 'customExercises', 'exerciseNotes', 'exerciseFavourites', 'activeWorkout'],
  },
  pt: {
    label: 'Reset PT Data',
    description: 'Deletes clients, check-ins, schedules and Work Planner data.',
    keys: [
      'clients', 'activeClient', 'checkins', 'ptSchedule', 'ptDurationSettings',
      'ptAvailability', 'ptTimeOut', 'ptCategories', 'ptStatuses', 'ptPaymentTypes',
    ],
  },
  marketplace: {
    label: 'Reset Demo Data',
    description: 'Removes demo/test content from this device.',
    confirmMessage: 'This will remove demo workouts, demo programmes and test marketplace content from this device. Your app structure and settings will remain available.',
    confirmLabel: 'Reset Demo Data',
    keys: ['programmeAccess'],
  },
  settings: {
    label: 'Reset Settings',
    description: 'Restores app preferences, units and appearance to defaults.',
    keys: ['settings', 'avatar'],
  },
}

// ─── Read / write helpers ─────────────────────────────────────────────────────

function readRaw(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function removeRaw(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error('FitTrackr: failed to remove key', key, err)
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const EXPORT_FORMAT_VERSION = 1

/**
 * Builds the full local-data export payload.
 * Keys with no stored value are included as null so the shape stays stable.
 * @returns {Object}
 */
export function buildExportPayload() {
  const data = {}
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    data[name] = readRaw(key)
  }
  return {
    app: 'FitTrackr',
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/**
 * Returns the export filename for a given date.
 * @param {Date} [date]
 * @returns {string} e.g. fittrackr-local-data-export-2026-09-17.json
 */
export function buildExportFilename(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `fittrackr-local-data-export-${stamp}.json`
}

/**
 * Triggers a browser download of the full local-data export.
 * @returns {{ ok: boolean, filename?: string, error?: string }}
 */
export function downloadLocalDataExport() {
  try {
    const payload = buildExportPayload()
    const filename = buildExportFilename()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // Revoke on the next tick so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return { ok: true, filename }
  } catch (err) {
    console.error('FitTrackr: export failed', err)
    return { ok: false, error: 'Export failed. Please try again.' }
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

/**
 * Clears every key belonging to a reset category.
 * @param {keyof typeof RESET_CATEGORIES} category
 */
export function resetCategory(category) {
  const config = RESET_CATEGORIES[category]
  if (!config) return
  for (const name of config.keys) removeRaw(STORAGE_KEYS[name])
}

/** Clears every key the app owns. */
export function resetAllLocalData() {
  for (const key of Object.values(STORAGE_KEYS)) removeRaw(key)
}
