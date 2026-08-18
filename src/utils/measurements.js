const CM_PER_INCH = 2.54
const KG_TO_LB = 2.20462
const KM_TO_MI = 0.621371

/**
 * Converts a body measurement value between cm and in.
 * Returns null for any invalid/missing input.
 * Original stored data is never modified — this is display-only.
 *
 * @param {number|null|undefined} value
 * @param {'cm'|'in'|null|undefined} fromUnit  - unit the value was saved with; defaults to 'cm'
 * @param {'cm'|'in'|null|undefined} toUnit    - desired display unit; defaults to 'cm'
 * @returns {number|null}
 */
export function convertMeasurement(value, fromUnit, toUnit) {
  if (value == null || typeof value !== 'number' || isNaN(value)) return null
  const from = fromUnit ?? 'cm'
  const to = toUnit ?? 'cm'
  if (from === to) return value
  if (from === 'cm' && to === 'in') return parseFloat((value / CM_PER_INCH).toFixed(1))
  if (from === 'in' && to === 'cm') return parseFloat((value * CM_PER_INCH).toFixed(1))
  return value
}

/**
 * Converts and formats a body measurement for display.
 * Returns a string like "86cm" or "33.9in", or null if the value is missing.
 *
 * @param {number|null|undefined} value
 * @param {'cm'|'in'|null|undefined} fromUnit
 * @param {'cm'|'in'|null|undefined} displayUnit
 * @returns {string|null}
 */
export function formatMeasurement(value, fromUnit, displayUnit) {
  const converted = convertMeasurement(value, fromUnit, displayUnit)
  if (converted == null) return null
  const display = parseFloat(converted.toFixed(1)).toString()
  return `${display}${displayUnit ?? 'cm'}`
}

// ── Weight ────────────────────────────────────────────────────────────────────
// Stored internally as kilograms. Convert for display only.

export function convertWeight(value, fromUnit = 'kg', toUnit = 'kg') {
  if (value == null || typeof value !== 'number' || isNaN(value)) return null
  if (fromUnit === toUnit) return value
  if (fromUnit === 'kg' && toUnit === 'lb') return parseFloat((value * KG_TO_LB).toFixed(1))
  if (fromUnit === 'lb' && toUnit === 'kg') return parseFloat((value / KG_TO_LB).toFixed(1))
  return value
}

export function formatWeight(value, fromUnit = 'kg', displayUnit = 'kg') {
  const converted = convertWeight(value, fromUnit, displayUnit)
  if (converted == null) return null
  return `${parseFloat(converted.toFixed(1))}${displayUnit}`
}

// ── Height ────────────────────────────────────────────────────────────────────
// Stored internally as whole centimetres. Display as cm or ft & in.

export function formatHeight(valueInCm, displayUnit = 'cm') {
  if (valueInCm == null || typeof valueInCm !== 'number' || isNaN(valueInCm)) return null
  if (displayUnit === 'cm') return `${Math.round(valueInCm)}cm`
  const totalInches = valueInCm / CM_PER_INCH
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}ft ${inches}in`
}

// ── Distance ──────────────────────────────────────────────────────────────────
// Stored internally as kilometres. Convert for display only.

export function convertDistance(value, fromUnit = 'km', toUnit = 'km') {
  if (value == null || typeof value !== 'number' || isNaN(value)) return null
  if (fromUnit === toUnit) return value
  if (fromUnit === 'km' && toUnit === 'mi') return parseFloat((value * KM_TO_MI).toFixed(1))
  if (fromUnit === 'mi' && toUnit === 'km') return parseFloat((value / KM_TO_MI).toFixed(1))
  return value
}

export function formatDistance(value, fromUnit = 'km', displayUnit = 'km') {
  const converted = convertDistance(value, fromUnit, displayUnit)
  if (converted == null) return null
  return `${parseFloat(converted.toFixed(1))}${displayUnit}`
}
