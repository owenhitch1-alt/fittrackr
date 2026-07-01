/**
 * FitTrackr XP and Levelling System
 *
 * All XP logic lives here. Screens only call awardXpForCompletedWorkout()
 * and read helpers like calculateLevelFromXp() — no XP logic is duplicated.
 *
 * Future avatar/reward systems can hook into:
 *   - level-up events (didLevelUp, levelAfter) from awardXpForCompletedWorkout
 *   - exercise level-up events (exerciseXpAwards[].didLevelUp)
 *   - getUserProgress() for total XP milestones
 *   - getAllExerciseProgress() for per-exercise level gates
 */

import {
  getUserProgress,
  saveUserProgress,
  getExerciseProgressByKey,
  saveExerciseProgress,
  getWorkoutSessions,
  saveWorkoutSession,
} from '../data/storage.js'

// ─── Mode gate ───────────────────────────────────────────────────────────────

/**
 * XP and levelling are Personal Mode only.
 * Returns false in PT Mode so all XP paths can be skipped with a single check.
 */
export function isXpEnabled(appMode) {
  return appMode === 'personal'
}

// ─── Exercise name normalisation ──────────────────────────────────────────────

/**
 * Converts an exercise display name to a consistent storage key.
 * Ensures "Bench Press", "bench press", "BENCH PRESS", "Bench  Press" all map
 * to the same key so exercise XP is not fragmented by casing or spacing.
 *
 * @param {string} name
 * @returns {string}
 */
export function normaliseExerciseKey(name) {
  if (!name || typeof name !== 'string') return 'unknown'
  return name
    .trim()
    .toLowerCase()
    .replace(/-/g, ' ')            // hyphens → spaces
    .replace(/[^a-z0-9 ]/g, '')   // strip non-alphanumeric (keep spaces)
    .replace(/\s+/g, ' ')         // collapse multiple spaces
    .trim()
}

// ─── Level formula ────────────────────────────────────────────────────────────
//
// Cumulative XP required to reach level N:  100 * (N-1) * N / 2
//
//   Level 1:    0 XP
//   Level 2:  100 XP  (+100)
//   Level 3:  300 XP  (+200)
//   Level 4:  600 XP  (+300)
//   Level 5: 1000 XP  (+400)
//
// XP needed to go from level N to N+1 = N * 100

function xpToReachLevel(level) {
  if (level <= 1) return 0
  return 100 * (level - 1) * level / 2
}

/**
 * Derives level info from a raw cumulative XP total.
 *
 * @param {number} totalXp
 * @returns {{
 *   level: number,
 *   currentLevelXp: number,   XP accumulated within the current level
 *   nextLevelXp: number,      XP needed to reach the next level
 *   progressPercent: number,  0–100
 * }}
 */
export function calculateLevelFromXp(totalXp) {
  const xp = Math.max(0, totalXp ?? 0)
  let level = 1
  while (xpToReachLevel(level + 1) <= xp) level++
  const currentLevelXp = xp - xpToReachLevel(level)
  const nextLevelXp = level * 100
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100))
  return { level, currentLevelXp, nextLevelXp, progressPercent }
}

// ─── XP Calculation (pure — no storage side effects) ─────────────────────────

/**
 * Calculates XP earned for a completed workout session.
 *
 * XP rules:
 *   +50   base workout completed (requires at least 1 valid set)
 *   +5    per completed set (weight/reps entered + set marked complete)
 *   +25   per exercise where this workout contains a new best weight
 *   +15   per exercise where this workout contains a new best reps
 *   +20   bonus if the workout has 3+ exercises each with ≥1 completed set
 *
 * Personal bests are compared against previousCompletedPersonalSessions only —
 * the current session must be excluded by the caller.
 *
 * @param {object} session  The completed WorkoutSession
 * @param {object[]} previousCompletedPersonalSessions  Historical sessions to compare against
 * @returns {{
 *   baseWorkoutXp: number,
 *   completedSetsXp: number,
 *   personalBestWeightXp: number,
 *   personalBestRepsXp: number,
 *   workoutExerciseBonusXp: number,
 *   totalXp: number,
 *   exerciseXpAwards: Array<{
 *     exerciseKey: string,
 *     exerciseName: string,
 *     xpEarned: number,
 *     newBestWeight: boolean,
 *     newBestReps: boolean,
 *   }>
 * }}
 */
export function calculateWorkoutXp(session, previousCompletedPersonalSessions) {
  const exercises = session.exercises ?? []

  // Valid completed set = marked complete AND has reps > 0
  const isValidSet = (s) => s.completed && s.reps != null && s.reps > 0

  const allCompletedSets = exercises.flatMap(ex => (ex.sets ?? []).filter(isValidSet))

  // No valid completed sets → no XP at all
  if (allCompletedSets.length === 0) {
    return {
      baseWorkoutXp: 0,
      completedSetsXp: 0,
      personalBestWeightXp: 0,
      personalBestRepsXp: 0,
      workoutExerciseBonusXp: 0,
      totalXp: 0,
      exerciseXpAwards: [],
    }
  }

  const baseWorkoutXp = 50
  const completedSetsXp = allCompletedSets.length * 5

  // Exercises that have at least one valid completed set
  const activeExercises = exercises.filter(ex => (ex.sets ?? []).some(isValidSet))
  const workoutExerciseBonusXp = activeExercises.length >= 3 ? 20 : 0

  // Build historical best weight and best reps per exercise key
  const histBestWeight = {}
  const histBestReps = {}

  for (const prev of previousCompletedPersonalSessions) {
    for (const ex of prev.exercises ?? []) {
      const key = normaliseExerciseKey(ex.exerciseName)
      for (const set of ex.sets ?? []) {
        if (!isValidSet(set)) continue
        const w = set.weight ?? 0
        const r = set.reps ?? 0
        if (w > (histBestWeight[key] ?? 0)) histBestWeight[key] = w
        if (r > (histBestReps[key] ?? 0)) histBestReps[key] = r
      }
    }
  }

  let personalBestWeightXp = 0
  let personalBestRepsXp = 0
  const exerciseXpAwards = []

  for (const ex of activeExercises) {
    const key = normaliseExerciseKey(ex.exerciseName)
    const completedSets = (ex.sets ?? []).filter(isValidSet)
    const exSetsXp = completedSets.length * 5

    // Best weight and reps achieved in this workout for this exercise
    const sessionBestWeight = Math.max(...completedSets.map(s => s.weight ?? 0))
    const sessionBestReps = Math.max(...completedSets.map(s => s.reps ?? 0))

    // New best weight: must have a weight > 0 AND beat the historical record
    const newBestWeight = sessionBestWeight > 0 && sessionBestWeight > (histBestWeight[key] ?? 0)
    // New best reps: must beat historical record (first-ever is always a best)
    const newBestReps = sessionBestReps > (histBestReps[key] ?? 0)

    let exXp = exSetsXp
    if (newBestWeight) { exXp += 25; personalBestWeightXp += 25 }
    if (newBestReps)   { exXp += 15; personalBestRepsXp += 15 }

    exerciseXpAwards.push({
      exerciseKey: key,
      exerciseName: ex.exerciseName,
      xpEarned: exXp,
      newBestWeight,
      newBestReps,
    })
  }

  const totalXp =
    baseWorkoutXp +
    completedSetsXp +
    personalBestWeightXp +
    personalBestRepsXp +
    workoutExerciseBonusXp

  return {
    baseWorkoutXp,
    completedSetsXp,
    personalBestWeightXp,
    personalBestRepsXp,
    workoutExerciseBonusXp,
    totalXp,
    exerciseXpAwards,
  }
}

// ─── Award XP (commits to storage) ───────────────────────────────────────────

/**
 * Awards XP for a completed workout session and persists all changes.
 *
 * This function is idempotent: if session.xpAlreadyAwarded is true it returns
 * the stored result immediately without modifying any data. This prevents
 * double-awarding XP if WorkoutComplete is revisited.
 *
 * Client sessions (session.clientId !== null) are skipped — client XP is
 * not yet implemented. This avoids inflating the trainer's personal XP.
 * Future: add client progress storage and award XP per clientId.
 *
 * @param {object} session  The completed WorkoutSession (must already have status === 'completed')
 * @returns {{
 *   xpEarned: number,
 *   alreadyAwarded: boolean,
 *   skippedClientSession?: boolean,
 *   xpBreakdown: object|null,
 * }}
 */
export function awardXpForCompletedWorkout(session) {
  // ── Already awarded guard ────────────────────────────────────────────────
  if (session.xpAlreadyAwarded) {
    return {
      xpEarned: session.xpEarned ?? 0,
      xpBreakdown: session.xpBreakdown ?? null,
      alreadyAwarded: true,
    }
  }

  // ── PT client session: skip (Option A) ───────────────────────────────────
  if (session.clientId) {
    // Mark as awarded so we don't attempt again
    saveWorkoutSession({
      ...session,
      xpEarned: 0,
      xpBreakdown: null,
      awardedXpAt: new Date().toISOString(),
      xpAlreadyAwarded: true,
    })
    return { xpEarned: 0, xpBreakdown: null, skippedClientSession: true, alreadyAwarded: false }
  }

  // ── Get previous personal sessions (exclude current) ──────────────────────
  const previousSessions = getWorkoutSessions().filter(
    s => s.status === 'completed' && !s.clientId && s.id !== session.id
  )

  // ── Calculate XP ──────────────────────────────────────────────────────────
  const breakdown = calculateWorkoutXp(session, previousSessions)

  // ── Read current user level before award ─────────────────────────────────
  const userProgress = getUserProgress()
  const levelBefore = calculateLevelFromXp(userProgress.totalXp)
  const newTotalXp = userProgress.totalXp + breakdown.totalXp
  const levelAfter = calculateLevelFromXp(newTotalXp)

  // ── Persist user XP ───────────────────────────────────────────────────────
  if (breakdown.totalXp > 0) {
    saveUserProgress({ totalXp: newTotalXp, updatedAt: new Date().toISOString() })
  }

  // ── Persist exercise XP and decorate awards with level change info ────────
  for (const award of breakdown.exerciseXpAwards) {
    if (award.xpEarned === 0) continue
    const existing = getExerciseProgressByKey(award.exerciseKey) ?? {
      exerciseKey: award.exerciseKey,
      exerciseName: award.exerciseName,
      totalXp: 0,
    }
    const exLevelBefore = calculateLevelFromXp(existing.totalXp)
    const newExTotalXp = existing.totalXp + award.xpEarned
    const exLevelAfter = calculateLevelFromXp(newExTotalXp)

    saveExerciseProgress({
      ...existing,
      exerciseName: award.exerciseName, // keep display name fresh
      totalXp: newExTotalXp,
      updatedAt: new Date().toISOString(),
    })

    // Mutate award in-place to include level info (used by WorkoutComplete display)
    award.levelBefore = exLevelBefore.level
    award.levelAfter = exLevelAfter.level
    award.didLevelUp = exLevelAfter.level > exLevelBefore.level
  }

  // ── Build full breakdown with level info ──────────────────────────────────
  const fullBreakdown = {
    ...breakdown,
    levelBefore: levelBefore.level,
    levelAfter: levelAfter.level,
    didLevelUp: levelAfter.level > levelBefore.level,
    levelProgressBefore: levelBefore,
    levelProgressAfter: levelAfter,
  }

  // ── Mark session as awarded in storage ────────────────────────────────────
  saveWorkoutSession({
    ...session,
    xpEarned: breakdown.totalXp,
    xpBreakdown: fullBreakdown,
    awardedXpAt: new Date().toISOString(),
    xpAlreadyAwarded: true,
  })

  return {
    xpEarned: breakdown.totalXp,
    xpBreakdown: fullBreakdown,
    alreadyAwarded: false,
  }
}
