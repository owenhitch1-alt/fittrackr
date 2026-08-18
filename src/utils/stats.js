import { defaultExercises } from '../data/exercises.js'
import { getCustomExercises } from '../data/storage.js'

const KG_TO_LB = 2.20462

function setWeightInKg(weight, unit) {
  if (!weight || weight <= 0) return 0
  return unit === 'lb' ? weight / KG_TO_LB : weight
}

export function getLevelTitle(level) {
  if (level <= 1)  return 'Just Getting Started'
  if (level <= 3)  return 'Fresh Recruit'
  if (level <= 5)  return 'Rising Rookie'
  if (level <= 8)  return 'Iron Beginner'
  if (level <= 12) return 'Strength Starter'
  if (level <= 16) return 'Dedicated Lifter'
  if (level <= 20) return 'Strength Builder'
  if (level <= 25) return 'Iron Warrior'
  if (level <= 30) return 'Elite Athlete'
  return 'FitTrackr Legend'
}

export function displayWeightValue(volumeOrWeightKg, displayUnit) {
  const val = displayUnit === 'lb' ? volumeOrWeightKg * KG_TO_LB : volumeOrWeightKg
  return parseFloat(val.toFixed(displayUnit === 'lb' ? 0 : 1))
}

/**
 * Calculates comprehensive user stats from the full session list.
 * Returns null if the user has no completed personal sessions.
 *
 * @param {WorkoutSession[]} sessions  Full session array from getWorkoutSessions()
 */
export function calculateUserStats(sessions) {
  const completed = sessions.filter(s => s.status === 'completed' && !s.clientId)
  if (completed.length === 0) return null

  const allExercises = [...defaultExercises, ...getCustomExercises()]
  const exerciseLookup = new Map(
    allExercises.map(e => [e.name.trim().toLowerCase(), e.bodyArea])
  )

  let totalExercises      = 0
  let totalSets           = 0
  let totalReps           = 0
  let totalVolumeKg       = 0
  let totalDurationSeconds = 0

  const exerciseFrequency = {}
  const exerciseVolumeKg  = {}
  const bodyAreaCount     = {}
  const dayCount          = {}
  const sessionVolumesKg  = []

  let heaviestSet     = null
  let mostRepsSetData = null

  for (const session of completed) {
    totalDurationSeconds += session.durationSeconds ?? 0

    try {
      const d   = new Date(session.startedAt)
      const day = d.toLocaleDateString('en-GB', { weekday: 'long' })
      dayCount[day] = (dayCount[day] ?? 0) + 1
    } catch { /* invalid date — skip */ }

    let sessionVolumeKg = 0

    for (const exercise of session.exercises ?? []) {
      const validSets = (exercise.sets ?? []).filter(
        s => s.completed && s.reps != null && s.reps > 0
      )
      if (validSets.length === 0) continue

      totalExercises++
      const name = exercise.exerciseName
      exerciseFrequency[name] = (exerciseFrequency[name] ?? 0) + 1

      const area = exerciseLookup.get(name.trim().toLowerCase())
      if (area) bodyAreaCount[area] = (bodyAreaCount[area] ?? 0) + 1

      for (const set of validSets) {
        totalSets++
        const reps = set.reps ?? 0
        totalReps += reps

        const wKg = setWeightInKg(set.weight ?? 0, set.weightUnit ?? 'kg')
        const vol = wKg * reps
        totalVolumeKg   += vol
        sessionVolumeKg += vol
        exerciseVolumeKg[name] = (exerciseVolumeKg[name] ?? 0) + vol

        if (wKg > 0 && (!heaviestSet || wKg > heaviestSet.weightKg)) {
          heaviestSet = { exerciseName: name, weightKg: wKg, reps }
        }

        if (
          !mostRepsSetData ||
          reps > mostRepsSetData.reps ||
          (reps === mostRepsSetData.reps && wKg > (mostRepsSetData.weightKg ?? 0))
        ) {
          mostRepsSetData = { exerciseName: name, weightKg: wKg, reps }
        }
      }
    }

    sessionVolumesKg.push({ name: session.workoutName, volumeKg: sessionVolumeKg })
  }

  const topExerciseEntry = Object.entries(exerciseFrequency)
    .sort((a, b) => b[1] - a[1])[0]

  const exerciseMastery = Object.entries(exerciseFrequency)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const topDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]

  const highestVolumeSession = sessionVolumesKg.length
    ? sessionVolumesKg.reduce((best, s) => s.volumeKg > best.volumeKg ? s : best)
    : null

  const topArea = Object.entries(bodyAreaCount).sort((a, b) => b[1] - a[1])[0]

  return {
    totalWorkouts:    completed.length,
    totalExercises,
    totalSets,
    totalReps,
    totalVolumeKg,
    totalDurationSeconds,
    totalTrainingHours: totalDurationSeconds > 0
      ? parseFloat((totalDurationSeconds / 3600).toFixed(1))
      : null,
    mostPerformedExercise: topExerciseEntry
      ? { name: topExerciseEntry[0], count: topExerciseEntry[1], volumeKg: exerciseVolumeKg[topExerciseEntry[0]] ?? 0 }
      : null,
    exerciseMastery,
    heaviestSet,
    mostRepsSet:           mostRepsSetData,
    highestVolumeSession,
    favouriteDay:          topDay  ? topDay[0]  : null,
    favouriteBodyArea:     topArea ? topArea[0] : null,
  }
}
