const KEY = 'fittrackr_exercise_favourites'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function write(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch {}
}

export function getFavouriteIds() {
  return read()
}

// Returns the new favourites array after toggling
export function toggleFavourite(exerciseId) {
  const ids = read()
  const next = ids.includes(exerciseId) ? ids.filter(id => id !== exerciseId) : [...ids, exerciseId]
  write(next)
  return next
}
