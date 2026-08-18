import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import Header from '../components/Header.jsx'

const PLACEHOLDER_CARDS = [
  { label: 'Outfits', desc: 'Complete outfit sets for your avatar — gym wear, casual looks, and special kits.' },
  { label: 'Accessories', desc: 'Hats, headbands, watches, sunglasses, and more to personalise your look.' },
  { label: 'Special Items', desc: 'Rare and limited-edition items earned through challenges and milestones.' },
  { label: 'Level Rewards', desc: 'Exclusive items unlocked as you level up through consistent training.' },
]

export default function AvatarMarketplaceScreen() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Avatar Marketplace" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px 48px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '36px' }}>
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
            <ShoppingBag size={34} color="var(--color-accent)" strokeWidth={1.8} />
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
            Avatar Marketplace Coming Soon
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
            Unlock outfits, accessories, and exclusive items to make your FitTrackr avatar uniquely yours.
          </p>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              opacity: 0.7,
              lineHeight: 1.5,
              maxWidth: '260px',
              marginBottom: '28px',
            }}
          >
            Earn items through levelling up and completing challenges.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 20px',
              borderRadius: '100px',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            Coming Soon
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PLACEHOLDER_CARDS.map(card => (
            <div
              key={card.label}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                opacity: 0.6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '20px',
                  padding: '3px 8px',
                }}
              >
                Planned
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '5px', paddingRight: '64px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
