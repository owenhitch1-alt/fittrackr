import { timeToMinutes, doTimeRangesOverlap, calculateEndTime } from './ptSchedule.js'

const AVAILABILITY_KEY = 'fittrackr_pt_availability'
const TIME_OUT_KEY = 'fittrackr_pt_timeout'
const CATEGORIES_KEY = 'fittrackr_pt_booking_categories'
const STATUSES_KEY = 'fittrackr_pt_booking_statuses'
const PAYMENT_TYPES_KEY = 'fittrackr_pt_payment_types'

const DEFAULT_CATEGORIES = [
  'PT Session', 'Gym Induction', 'Check-In', 'Consultation', 'Assessment', 'Training', 'Other',
]
const DEFAULT_STATUSES = [
  'Scheduled', 'Completed', 'Cancelled', 'No Show', 'Rescheduled', 'Pending Payment', 'Paid',
]
const DEFAULT_PAYMENT_TYPES = [
  'Cash', 'Card', 'Bank Transfer', 'Online', 'Package', 'Free', 'Unpaid', 'Other',
]

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function readKey(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) ?? null) ?? fallback } catch { return fallback }
}

function writeKey(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function initDefaults(key, defaults) {
  if (localStorage.getItem(key) === null) {
    const items = defaults.map((name, i) => ({ id: `default_${i}`, name, isDefault: true }))
    writeKey(key, items)
    return items
  }
  return readKey(key, [])
}

// ── Availability ──────────────────────────────────────────────────────────────
// Block: { id, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), source }

export function getAvailabilityBlocks() {
  return readKey(AVAILABILITY_KEY, [])
}

export function saveAvailabilityBlock(block) {
  const blocks = getAvailabilityBlocks()
  const now = new Date().toISOString()
  let saved
  if (block.id) {
    const idx = blocks.findIndex(b => b.id === block.id)
    saved = { ...block, updatedAt: now }
    if (idx !== -1) blocks[idx] = saved
    else blocks.push(saved)
  } else {
    saved = { ...block, id: generateId(), createdAt: now }
    blocks.push(saved)
  }
  writeKey(AVAILABILITY_KEY, blocks)
  return saved
}

export function deleteAvailabilityBlock(id) {
  writeKey(AVAILABILITY_KEY, getAvailabilityBlocks().filter(b => b.id !== id))
}

export function clearAvailabilityBlocks() {
  writeKey(AVAILABILITY_KEY, [])
}

export function generateAvailability({ rangeType, numberOf, selectedDays, startTime, endTime }) {
  const n = Math.max(1, Math.min(Number(numberOf) || 1, 52))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  if (rangeType === 'week') end.setDate(end.getDate() + n * 7)
  else if (rangeType === 'month') end.setMonth(end.getMonth() + n)
  else end.setFullYear(end.getFullYear() + n)

  const existing = getAvailabilityBlocks()
  const existingSet = new Set(existing.map(b => `${b.date}|${b.startTime}`))

  const blocks = getAvailabilityBlocks()
  let created = 0
  let skipped = 0
  const cursor = new Date(today)

  while (cursor <= end) {
    const dow = cursor.getDay()
    if (selectedDays.includes(dow)) {
      const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      const key = `${dateStr}|${startTime}`
      if (!existingSet.has(key)) {
        blocks.push({ id: generateId(), date: dateStr, startTime, endTime, source: 'generated', createdAt: new Date().toISOString() })
        existingSet.add(key)
        created++
      } else {
        skipped++
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  writeKey(AVAILABILITY_KEY, blocks)
  return { created, skipped }
}

export function getAvailabilityForDate(date) {
  return getAvailabilityBlocks().filter(b => b.date === date)
}

export function checkSessionVsAvailability(date, startTime, endTime) {
  const dayBlocks = getAvailabilityForDate(date)
  if (dayBlocks.length === 0) return { hasAvailability: false, inside: true }
  const sStart = timeToMinutes(startTime)
  const sEnd = endTime ? timeToMinutes(endTime) : null
  const inside = dayBlocks.some(b => {
    const bStart = timeToMinutes(b.startTime)
    const bEnd = timeToMinutes(b.endTime)
    if (sEnd === null) return sStart >= bStart && sStart < bEnd
    return sStart >= bStart && sEnd <= bEnd
  })
  return { hasAvailability: true, inside }
}

// ── Time Out ──────────────────────────────────────────────────────────────────
// Block: { id, date, startTime, endTime, durationMinutes, reason, notes, createdAt }

export function getTimeOutBlocks() {
  return readKey(TIME_OUT_KEY, [])
}

export function saveTimeOutBlock(block) {
  const blocks = getTimeOutBlocks()
  const now = new Date().toISOString()
  let saved
  if (block.id) {
    const idx = blocks.findIndex(b => b.id === block.id)
    saved = { ...block, updatedAt: now }
    if (idx !== -1) blocks[idx] = saved
    else blocks.push(saved)
  } else {
    saved = { ...block, id: generateId(), createdAt: now }
    blocks.push(saved)
  }
  writeKey(TIME_OUT_KEY, blocks)
  return saved
}

export function deleteTimeOutBlock(id) {
  writeKey(TIME_OUT_KEY, getTimeOutBlocks().filter(b => b.id !== id))
}

export function findOverlappingTimeOut(date, startTime, endTime, excludeId = null) {
  const timeOuts = getTimeOutBlocks()
  return timeOuts.find(t => {
    if (excludeId && t.id === excludeId) return false
    if (t.date !== date) return false
    const tEnd = t.endTime || (t.durationMinutes ? calculateEndTime(t.startTime, t.durationMinutes) : null)
    if (!tEnd || !endTime) return t.startTime === startTime
    return doTimeRangesOverlap(startTime, endTime, t.startTime, tEnd)
  }) ?? null
}

// ── Booking Categories ────────────────────────────────────────────────────────

export function getBookingCategories() {
  return initDefaults(CATEGORIES_KEY, DEFAULT_CATEGORIES)
}

export function saveBookingCategory(cat) {
  const cats = getBookingCategories()
  const now = new Date().toISOString()
  let saved
  if (cat.id) {
    const idx = cats.findIndex(c => c.id === cat.id)
    saved = { ...cat, updatedAt: now }
    if (idx !== -1) cats[idx] = saved
    else cats.push(saved)
  } else {
    saved = { ...cat, id: generateId(), createdAt: now }
    cats.push(saved)
  }
  writeKey(CATEGORIES_KEY, cats)
  return saved
}

export function deleteBookingCategory(id) {
  writeKey(CATEGORIES_KEY, getBookingCategories().filter(c => c.id !== id))
}

// ── Booking Statuses ──────────────────────────────────────────────────────────

export function getBookingStatuses() {
  return initDefaults(STATUSES_KEY, DEFAULT_STATUSES)
}

export function saveBookingStatus(status) {
  const statuses = getBookingStatuses()
  const now = new Date().toISOString()
  let saved
  if (status.id) {
    const idx = statuses.findIndex(s => s.id === status.id)
    saved = { ...status, updatedAt: now }
    if (idx !== -1) statuses[idx] = saved
    else statuses.push(saved)
  } else {
    saved = { ...status, id: generateId(), createdAt: now }
    statuses.push(saved)
  }
  writeKey(STATUSES_KEY, statuses)
  return saved
}

export function deleteBookingStatus(id) {
  writeKey(STATUSES_KEY, getBookingStatuses().filter(s => s.id !== id))
}

// ── Payment Types ─────────────────────────────────────────────────────────────

export function getPaymentTypes() {
  return initDefaults(PAYMENT_TYPES_KEY, DEFAULT_PAYMENT_TYPES)
}

export function savePaymentType(pt) {
  const pts = getPaymentTypes()
  const now = new Date().toISOString()
  let saved
  if (pt.id) {
    const idx = pts.findIndex(p => p.id === pt.id)
    saved = { ...pt, updatedAt: now }
    if (idx !== -1) pts[idx] = saved
    else pts.push(saved)
  } else {
    saved = { ...pt, id: generateId(), createdAt: now }
    pts.push(saved)
  }
  writeKey(PAYMENT_TYPES_KEY, pts)
  return saved
}

export function deletePaymentType(id) {
  writeKey(PAYMENT_TYPES_KEY, getPaymentTypes().filter(p => p.id !== id))
}

// ── Public booking helper (foundation for future use) ─────────────────────────

export function isSlotBookableForPublicUser(date, startTime, endTime) {
  const avail = checkSessionVsAvailability(date, startTime, endTime)
  if (!avail.hasAvailability || !avail.inside) return false
  const timeOut = findOverlappingTimeOut(date, startTime, endTime)
  return !timeOut
}

// ── Time Out privacy helpers ───────────────────────────────────────────────────
//
// Privacy rule: Time Out `reason` and `notes` are PT-only.
// Public, client, and Personal-Mode-facing code must only expose that a
// slot is unavailable — never WHY it is unavailable.
//
// Always use mapTimeOutForPublicView (or getPublicAvailabilityForDate) when
// building any non-PT-facing booking UI, export, or availability preview.

export function mapTimeOutForPTView(timeOut) {
  return { ...timeOut }
}

export function mapTimeOutForPublicView(timeOut) {
  return {
    id: timeOut.id,
    date: timeOut.date,
    startTime: timeOut.startTime,
    endTime: timeOut.endTime,
    isUnavailable: true,
    label: 'Unavailable',
  }
}

export function getTimeOutDisplayLabel(timeOut, viewerRole) {
  if (viewerRole === 'pt') return timeOut.reason || 'Time Out'
  return 'Unavailable'
}

export function getPublicAvailabilityForDate(date) {
  const timeOuts = getTimeOutBlocks()
    .filter(t => t.date === date)
    .map(mapTimeOutForPublicView)

  const avail = getAvailabilityForDate(date).map(b => ({
    id: b.id,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    isAvailable: true,
  }))

  return { available: avail, unavailable: timeOuts }
}
