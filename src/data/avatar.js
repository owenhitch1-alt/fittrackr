const AVATAR_KEY = 'fittrackr_avatar'

export const DEFAULT_AVATAR = {
  bodyType: 'athletic',
  skinTone: '#C68642',
  hairStyle: 'short',
  hairColour: 'black',
  top: 'tshirt',
  topColour: '#FF3B30',
  bottom: 'shorts',
  bottomColour: '#1C1C1E',
  shoes: 'training',
  shoeColour: '#FFFFFF',
  accessories: [],
  accessoryColour: '#000000',
  unlockedItems: [],
  updatedAt: '',
}

export function getAvatarConfig() {
  try {
    const raw = localStorage.getItem(AVATAR_KEY)
    if (!raw) return { ...DEFAULT_AVATAR }
    return { ...DEFAULT_AVATAR, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_AVATAR }
  }
}

export function saveAvatarConfig(config) {
  try {
    localStorage.setItem(AVATAR_KEY, JSON.stringify(config))
  } catch { /* noop */ }
}
