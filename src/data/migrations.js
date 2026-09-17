/**
 * FitTrackr — Local Data Migrations
 *
 * Backfills stable ids and createdAt/updatedAt timestamps on records saved
 * before those fields existed, so local data can be matched to cloud rows
 * during a future migration without relying on array order or display names.
 *
 * Runs once per schema version on app start. Safe to run repeatedly.
 */

import { STORAGE_KEYS } from './appData.js'

const SCHEMA_VERSION_KEY = STORAGE_KEYS.schemaVersion
const CURRENT_SCHEMA_VERSION = 1

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function readKey(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('FitTrackr: migration write failed for', key, err)
  }
}

/**
 * Ensures a record has an id and both timestamps.
 * `fallbackDate` seeds createdAt for records that predate the field.
 */
function ensureRecordFields(record, fallbackDate) {
  if (!record || typeof record !== 'object') return record
  const created = record.createdAt ?? fallbackDate ?? new Date().toISOString()
  return {
    ...record,
    id: record.id ?? generateId(),
    createdAt: created,
    updatedAt: record.updatedAt ?? created,
  }
}

/** Applies ensureRecordFields to every item in an array-backed key. */
function migrateArrayKey(key, fallbackDateFor) {
  const records = readKey(key)
  if (!Array.isArray(records) || records.length === 0) return 0
  let changed = 0
  const migrated = records.map(record => {
    const next = ensureRecordFields(record, fallbackDateFor?.(record))
    if (next.id !== record.id || next.createdAt !== record.createdAt || next.updatedAt !== record.updatedAt) {
      changed += 1
    }
    return next
  })
  if (changed > 0) writeKey(key, migrated)
  return changed
}

/**
 * Programme access is stored as a { [programmeId]: {...} } map rather than an
 * array, so it needs its own pass. The programmeId is already the stable key.
 */
function migrateProgrammeAccess() {
  const map = readKey(STORAGE_KEYS.programmeAccess)
  if (!map || typeof map !== 'object' || Array.isArray(map)) return 0
  let changed = 0
  const migrated = {}
  for (const [programmeId, value] of Object.entries(map)) {
    if (!value || typeof value !== 'object') continue
    const created = value.createdAt ?? value.savedAt ?? value.purchasedAt ?? new Date().toISOString()
    const next = {
      ...value,
      id: value.id ?? programmeId,
      programmeId,
      createdAt: created,
      updatedAt: value.updatedAt ?? created,
    }
    if (next.createdAt !== value.createdAt || next.updatedAt !== value.updatedAt || next.id !== value.id) {
      changed += 1
    }
    migrated[programmeId] = next
  }
  if (changed > 0) writeKey(STORAGE_KEYS.programmeAccess, migrated)
  return changed
}

/**
 * Runs all pending migrations. No-op once the stored schema version matches.
 * @returns {{ ran: boolean, changes: Object }}
 */
export function runMigrations() {
  let storedVersion = 0
  try {
    storedVersion = Number(localStorage.getItem(SCHEMA_VERSION_KEY) ?? 0)
  } catch {
    storedVersion = 0
  }
  if (storedVersion >= CURRENT_SCHEMA_VERSION) return { ran: false, changes: {} }

  const changes = {
    // Completed workouts predate createdAt — seed from when the workout started.
    sessions:         migrateArrayKey(STORAGE_KEYS.sessions, r => r.startedAt ?? r.completedAt),
    templates:        migrateArrayKey(STORAGE_KEYS.templates),
    customExercises:  migrateArrayKey(STORAGE_KEYS.customExercises),
    clients:          migrateArrayKey(STORAGE_KEYS.clients),
    checkins:         migrateArrayKey(STORAGE_KEYS.checkins, r => r.date ? new Date(r.date).toISOString() : null),
    ptSchedule:       migrateArrayKey(STORAGE_KEYS.ptSchedule),
    ptAvailability:   migrateArrayKey(STORAGE_KEYS.ptAvailability),
    ptTimeOut:        migrateArrayKey(STORAGE_KEYS.ptTimeOut),
    ptCategories:     migrateArrayKey(STORAGE_KEYS.ptCategories),
    ptStatuses:       migrateArrayKey(STORAGE_KEYS.ptStatuses),
    ptPaymentTypes:   migrateArrayKey(STORAGE_KEYS.ptPaymentTypes),
    programmeAccess:  migrateProgrammeAccess(),
  }

  try {
    localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION))
  } catch {}

  return { ran: true, changes }
}
