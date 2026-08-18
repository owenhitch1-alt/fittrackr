export const THEMES = [
  {
    id: 'dark',
    label: 'Dark',
    swatches: ['#0D0D0D', '#1B1B1B', '#FF3B30', '#FFFFFF'],
  },
  {
    id: 'light',
    label: 'Light',
    swatches: ['#FFFFFF', '#F2F2F2', '#FF3B30', '#0D0D0D'],
  },
  {
    id: 'neon-lime',
    label: 'Neon Lime + Violet Ink',
    swatches: ['#12001F', '#1D0A2E', '#B7FF00', '#F0E8FF'],
  },
  {
    id: 'burnt-orange',
    label: 'Burnt Orange + Vanilla',
    swatches: ['#FFF4DF', '#FFEAD0', '#C85A17', '#1E0F05'],
  },
  {
    id: 'warm-lime',
    label: 'Warm Lime + Olive Ink',
    swatches: ['#11180B', '#1B2511', '#D6FF4D', '#F2FFE0'],
  },
  {
    id: 'electric-indigo',
    label: 'Electric Indigo + Soft Lilac',
    swatches: ['#100B2E', '#1A1245', '#4F46FF', '#F0EAFF'],
  },
  {
    id: 'sky-mint',
    label: 'Sky Mint + Graphite',
    swatches: ['#101718', '#162124', '#74F7D1', '#EDFFF9'],
  },
  {
    id: 'electric-orchid',
    label: 'Electric Orchid + Deep Plum',
    swatches: ['#160018', '#250328', '#FF4DDE', '#FFF0FE'],
  },
]

export const VALID_THEME_IDS = THEMES.map(t => t.id)
