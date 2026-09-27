/**
 * App branding — single source of truth for the user-facing app name.
 *
 * Note: localStorage keys (`fittrackr_*`) and the Vite `base` path keep the
 * legacy slug. Renaming those would orphan existing user data and break the
 * GitHub Pages deploy path, so they are intentionally left alone.
 */
export const APP_BRAND = {
  name: 'One More Workout',
  shortName: 'One More',
  slug: 'one-more-workout',
  previousName: 'FitTrackr',
}
