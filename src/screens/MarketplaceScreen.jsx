import { ShoppingBag } from 'lucide-react'
import Header from '../components/Header.jsx'

export default function MarketplaceScreen({ onMenuOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Marketplace" onMenuOpen={onMenuOpen} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '48px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(255,59,48,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <ShoppingBag size={34} color="var(--color-accent)" strokeWidth={1.8} />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: 'var(--color-white)',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          Marketplace Coming Soon
        </h1>

        {/* Primary message */}
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '300px',
            marginBottom: '20px',
          }}
        >
          Soon you'll be able to discover workout plans from personal trainers and fitness creators.
        </p>

        {/* Secondary message */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '280px',
            marginBottom: '36px',
          }}
        >
          For now, keep building your own workouts and tracking your progress.
        </p>

        {/* Coming Soon tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 20px',
            borderRadius: '100px',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          Coming Soon
        </div>
      </div>
    </div>
  )
}
