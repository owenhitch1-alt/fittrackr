const KEY = 'fittrackr_pt_schedule'
const DURATION_KEY = 'fittrackr_pt_duration_settings'

const DEFAULT_DURATION_OPTIONS = [30, 45, 60, 90, 120]
const DEFAULT_DURATION_MINUTES = 60

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function write(sessions) {
  try { localStorage.setItem(KEY, JSON.stringify(sessions)) } catch {}
}

export function getPTScheduledSessions() { return read() }

export function savePTScheduledSession(session) {
  const sessions = read()
  const now = new Date().toISOString()
  let saved
  if (session.id) {
    const idx = sessions.findIndex(s => s.id === session.id)
    saved = { ...session, updatedAt: now }
    if (idx !== -1) sessions[idx] = saved
    else sessions.push(saved)
  } else {
    saved = { ...session, id: generateId(), status: session.status ?? 'scheduled', createdAt: now, updatedAt: now }
    sessions.push(saved)
  }
  write(sessions)
  return saved
}

export function deletePTScheduledSession(id) {
  write(read().filter(s => s.id !== id))
}

export function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return null
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + Number(durationMinutes)
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function crossesMidnight(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return false
  const [h, m] = startTime.split(':').map(Number)
  return h * 60 + m + Number(durationMinutes) >= 24 * 60
}

export function getPTDurationSettings() {
  try {
    const raw = localStorage.getItem(DURATION_KEY)
    if (!raw) return { options: [...DEFAULT_DURATION_OPTIONS], defaultMinutes: DEFAULT_DURATION_MINUTES }
    const parsed = JSON.parse(raw)
    return {
      options: Array.isArray(parsed.options) && parsed.options.length ? parsed.options : [...DEFAULT_DURATION_OPTIONS],
      defaultMinutes: parsed.defaultMinutes ?? DEFAULT_DURATION_MINUTES,
    }
  } catch {
    return { options: [...DEFAULT_DURATION_OPTIONS], defaultMinutes: DEFAULT_DURATION_MINUTES }
  }
}

export function savePTDurationSettings(settings) {
  try { localStorage.setItem(DURATION_KEY, JSON.stringify(settings)) } catch {}
}

export function timeToMinutes(time) {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function doTimeRangesOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB)
}

// Returns the first conflicting session, or null.
// Excludes the session with newSession.id (for edit self-check).
// Ignores cancelled/completed sessions.
// Falls back to exact start-time match when either session has no end time.
export function findPTSessionConflict(newSession, existingSessions) {
  const { date, startTime, durationMinutes } = newSession
  const newEnd = newSession.endTime || (durationMinutes ? calculateEndTime(startTime, durationMinutes) : null)

  return existingSessions.find(s => {
    if (s.status !== 'scheduled') return false
    if (s.date !== date) return false
    if (newSession.id && s.id === newSession.id) return false
    if (s.startTime === startTime) return true
    const existingEnd = s.endTime || (s.durationMinutes ? calculateEndTime(s.startTime, s.durationMinutes) : null)
    return Boolean(newEnd && existingEnd && doTimeRangesOverlap(startTime, newEnd, s.startTime, existingEnd))
  }) ?? null
}

export function getNextUpcomingPTSession() {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    read()
      .filter(s => s.status === 'scheduled')
      .filter(s => s.date > todayStr || (s.date === todayStr && s.startTime >= nowTime))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      [0] ?? null
  )
}
