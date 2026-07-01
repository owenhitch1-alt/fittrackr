const CM_PER_INCH = 2.54

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
