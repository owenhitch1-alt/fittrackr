import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { getAvatarConfig, saveAvatarConfig } from '../data/avatar.js'
import AvatarPreview from '../components/AvatarPreview.jsx'
import { features } from '../config/features.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const SKIN_TONES = ['#FDBCB4', '#F1C27D', '#C68642', '#8D5524', '#5C3317', '#3B1F0E']

const HAIR_COLOUR_SWATCHES = [
  { value: 'black',  hex: '#111111', label: 'Black'  },
  { value: 'brown',  hex: '#6F4E37', label: 'Brown'  },
  { value: 'blonde', hex: '#DAA520', label: 'Blonde' },
  { value: 'red',    hex: '#C0392B', label: 'Red'    },
  { value: 'grey',   hex: '#9E9E9E', label: 'Grey'   },
]

const CLOTHING_COLOURS = [
  '#FF3B30', '#FF9F0A', '#FFD60A', '#34C759',
  '#00C7BE', '#0A84FF', '#1C4E8A', '#AF52DE',
  '#F5F5F5', '#C7C7CC', '#636366', '#1C1C1E',
  '#8D5524', '#2D6A4F',
]

const ACCESSORIES_LIST = [
  { value: 'cap',       label: 'Cap'       },
  { value: 'headband',  label: 'Headband'  },
  { value: 'sunglasses',label: 'Sunglasses'},
  { value: 'watch',     label: 'Watch'     },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function AvatarSection({ title, children }) {
  return (
    <section>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '0 0 8px',
        }}
      >
        {title}
      </p>
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '16px',
        }}
      >
        {children}
      </div>
    </section>
  )
}

function OptionChips({ value, options, onChange, multiValue, onMultiToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const isSelected = multiValue ? multiValue.includes(opt.value) : value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => multiValue ? onMultiToggle(opt.value) : onChange(opt.value)}
            aria-pressed={isSelected}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isSelected ? 'rgba(255,59,48,0.12)' : 'transparent',
              color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ColourPicker({ value, colours, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {colours.map(hex => {
        const isSelected = value === hex
        return (
          <button
            key={hex}
            onClick={() => onChange(hex)}
            aria-pressed={isSelected}
            aria-label={hex}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: hex,
              border: isSelected ? '2.5px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              outline: isSelected ? '2px solid var(--color-bg)' : 'none',
              outlineOffset: '-4px',
              boxShadow: (hex === '#F5F5F5' || hex === '#FDBCB4' || hex === '#F1C27D')
                ? 'inset 0 0 0 1px rgba(0,0,0,0.12), 0 0 0 1px var(--color-border)'
                : '0 0 0 1px var(--color-border)',
              transition: 'border 0.12s ease, outline 0.12s ease',
            }}
          />
        )
      })}
    </div>
  )
}

function NamedColourPicker({ value, swatches, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {swatches.map(s => {
        const isSelected = value === s.value
        return (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            aria-pressed={isSelected}
            aria-label={s.label}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: s.hex,
              border: isSelected ? '2.5px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              outline: isSelected ? '2px solid var(--color-bg)' : 'none',
              outlineOffset: '-4px',
              boxShadow: '0 0 0 1px var(--color-border)',
              transition: 'all 0.12s ease',
            }}
          />
        )
      })}
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function AvatarSettingsScreen() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(() => getAvatarConfig())
  const [saved, setSaved] = useState(false)

  const update = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const toggleAccessory = (value) => {
    const current = config.accessories ?? []
    const next = current.includes(value)
      ? current.filter(a => a !== value)
      : [...current, value]
    update('accessories', next)
  }

  const handleSave = () => {
    saveAvatarConfig({ ...config, updatedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!features.avatarSystem) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Header title="Avatar Settings" onBack={() => navigate(-1)} />
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '60px 20px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(255,59,48,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <UserCircle2 size={34} color="var(--color-accent)" strokeWidth={1.8} />
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: 'var(--color-white)',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              marginBottom: '14px',
            }}
          >
            Coming Soon
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: '300px',
              marginBottom: '10px',
            }}
          >
            Avatar customisation is currently being developed.
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              opacity: 0.7,
              lineHeight: 1.5,
              maxWidth: '260px',
            }}
          >
            You'll be able to personalise your FitTrackr avatar in a future update.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Avatar Settings" onBack={() => navigate(-1)} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >

        {/* ── Live preview ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div
            style={{
              width: '140px',
              height: '196px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AvatarPreview config={config} />
          </div>
        </div>

        {/* ── Body Type ── */}
        <AvatarSection title="Body Type">
          <OptionChips
            value={config.bodyType}
            options={[
              { value: 'slim',     label: 'Slim'     },
              { value: 'athletic', label: 'Athletic' },
              { value: 'muscular', label: 'Muscular' },
              { value: 'large',    label: 'Large'    },
            ]}
            onChange={v => update('bodyType', v)}
          />
        </AvatarSection>

        {/* ── Skin Tone ── */}
        <AvatarSection title="Skin Tone">
          <ColourPicker
            value={config.skinTone}
            colours={SKIN_TONES}
            onChange={v => update('skinTone', v)}
          />
        </AvatarSection>

        {/* ── Hair ── */}
        <AvatarSection title="Hair">
          <OptionChips
            value={config.hairStyle}
            options={[
              { value: 'short',    label: 'Short'   },
              { value: 'medium',   label: 'Medium'  },
              { value: 'long',     label: 'Long'    },
              { value: 'curly',    label: 'Curly'   },
              { value: 'braided',  label: 'Braided' },
              { value: 'buzz',     label: 'Buzz'    },
              { value: 'none',     label: 'None'    },
            ]}
            onChange={v => update('hairStyle', v)}
          />
          {config.hairStyle !== 'none' && (
            <>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Hair Colour
              </p>
              <NamedColourPicker
                value={config.hairColour}
                swatches={HAIR_COLOUR_SWATCHES}
                onChange={v => update('hairColour', v)}
              />
            </>
          )}
        </AvatarSection>

        {/* ── Top ── */}
        <AvatarSection title="Top">
          <OptionChips
            value={config.top}
            options={[
              { value: 'tshirt',      label: 'T-Shirt'     },
              { value: 'performance', label: 'Performance' },
              { value: 'hoodie',      label: 'Hoodie'      },
              { value: 'tank',        label: 'Tank'        },
              { value: 'jacket',      label: 'Jacket'      },
            ]}
            onChange={v => update('top', v)}
          />
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            Colour
          </p>
          <ColourPicker
            value={config.topColour}
            colours={CLOTHING_COLOURS}
            onChange={v => update('topColour', v)}
          />
        </AvatarSection>

        {/* ── Bottom ── */}
        <AvatarSection title="Bottom">
          <OptionChips
            value={config.bottom}
            options={[
              { value: 'shorts',   label: 'Shorts'   },
              { value: 'joggers',  label: 'Joggers'  },
              { value: 'pants',    label: 'Pants'    },
              { value: 'leggings', label: 'Leggings' },
            ]}
            onChange={v => update('bottom', v)}
          />
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            Colour
          </p>
          <ColourPicker
            value={config.bottomColour}
            colours={CLOTHING_COLOURS}
            onChange={v => update('bottomColour', v)}
          />
        </AvatarSection>

        {/* ── Shoes ── */}
        <AvatarSection title="Shoes">
          <OptionChips
            value={config.shoes}
            options={[
              { value: 'training',  label: 'Training'  },
              { value: 'running',   label: 'Running'   },
              { value: 'hightops',  label: 'High Tops' },
              { value: 'barefoot',  label: 'Barefoot'  },
            ]}
            onChange={v => update('shoes', v)}
          />
          {config.shoes !== 'barefoot' && (
            <>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Colour
              </p>
              <ColourPicker
                value={config.shoeColour}
                colours={CLOTHING_COLOURS}
                onChange={v => update('shoeColour', v)}
              />
            </>
          )}
        </AvatarSection>

        {/* ── Accessories ── */}
        <AvatarSection title="Accessories">
          <OptionChips
            multiValue={config.accessories ?? []}
            options={ACCESSORIES_LIST}
            onMultiToggle={toggleAccessory}
          />
          {(config.accessories ?? []).length > 0 && (
            <>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Accessory Colour
              </p>
              <ColourPicker
                value={config.accessoryColour}
                colours={CLOTHING_COLOURS}
                onChange={v => update('accessoryColour', v)}
              />
            </>
          )}
        </AvatarSection>

        {/* ── Save ── */}
        <Button variant="primary" onClick={handleSave}>
          Save Avatar
        </Button>

        {saved && (
          <p
            style={{
              fontSize: '13px',
              color: '#34C759',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: '-8px',
            }}
          >
            Avatar saved!
          </p>
        )}

        <div style={{ height: '20px' }} />
      </div>
    </div>
  )
}
