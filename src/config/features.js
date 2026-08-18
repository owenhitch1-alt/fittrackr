/**
 * FitTrackr Feature Flags
 *
 * Set a flag to `true` to re-enable that feature.
 * All code, data, and components are preserved — only rendering and XP
 * execution are gated here.
 *
 * Avatar system:        avatarSystem, avatarMarketplace
 * Levelling system:     levellingSystem, achievements
 * Marketplace content:  marketplaceSeedContent
 */
export const features = {
  avatarSystem:           false,
  levellingSystem:        false,
  achievements:           false,
  avatarMarketplace:      false,
  marketplaceSeedContent: false, // set true to show placeholder Store catalogue
}
