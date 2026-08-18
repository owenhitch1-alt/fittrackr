// FitTrackr Programme Catalogue
// Static store listings. No real payment or delivery system yet.
// isPremium: true = purchase required (placeholder, no checkout flow exists).
// Future: replace with API call to fetch live catalogue from cloud.

/** @typedef {{ id: string, title: string, creator: string, description: string, difficulty: 'Beginner'|'Intermediate'|'Advanced', durationWeeks: number, sessionsPerWeek: number, category: string, emoji: string, isPremium: boolean }} Programme */

/** @type {Programme[]} */
export const STORE_PROGRAMMES = [
  {
    id: 'prog-beginner-strength',
    title: 'Beginner Strength Foundation',
    creator: 'FitTrackr',
    description: 'A structured 4-week introduction to resistance training. Build foundational strength with compound lifts and simple progression.',
    difficulty: 'Beginner',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    category: 'Strength',
    emoji: '🏋️',
    isPremium: false,
  },
  {
    id: 'prog-hypertrophy-block',
    title: 'Hypertrophy Block',
    creator: 'FitTrackr',
    description: 'An 8-week hypertrophy programme focused on muscle growth. Progressive overload, volume accumulation, and strategic deloads.',
    difficulty: 'Intermediate',
    durationWeeks: 8,
    sessionsPerWeek: 4,
    category: 'Strength',
    emoji: '💪',
    isPremium: true,
  },
  {
    id: 'prog-full-body-power',
    title: 'Full Body Power',
    creator: 'FitTrackr',
    description: 'Train 3 days per week with full-body sessions emphasising strength and power. Great for busy schedules.',
    difficulty: 'Intermediate',
    durationWeeks: 6,
    sessionsPerWeek: 3,
    category: 'Strength',
    emoji: '⚡',
    isPremium: false,
  },
  {
    id: 'prog-mobility-flex',
    title: 'Mobility & Flexibility',
    creator: 'FitTrackr',
    description: 'Improve range of motion, reduce stiffness, and move better. Daily 20-minute sessions that complement any training programme.',
    difficulty: 'Beginner',
    durationWeeks: 4,
    sessionsPerWeek: 5,
    category: 'Mobility',
    emoji: '🧘',
    isPremium: false,
  },
  {
    id: 'prog-fat-loss-challenge',
    title: 'Fat Loss Challenge',
    creator: 'FitTrackr',
    description: 'A 6-week high-intensity programme combining strength and conditioning to maximise calorie burn and improve fitness.',
    difficulty: 'Intermediate',
    durationWeeks: 6,
    sessionsPerWeek: 4,
    category: 'HIIT',
    emoji: '🔥',
    isPremium: true,
  },
  {
    id: 'prog-advanced-powerlifting',
    title: 'Advanced Powerlifting',
    creator: 'FitTrackr',
    description: 'A 12-week peaking programme for experienced lifters. Periodised approach to maximise squat, bench, and deadlift totals.',
    difficulty: 'Advanced',
    durationWeeks: 12,
    sessionsPerWeek: 4,
    category: 'Strength',
    emoji: '🏆',
    isPremium: true,
  },
]

/** @param {string} id @returns {Programme|null} */
export function getProgrammeById(id) {
  return STORE_PROGRAMMES.find(p => p.id === id) ?? null
}

export const PROGRAMME_CATEGORIES = ['All', 'Strength', 'Mobility', 'HIIT']
