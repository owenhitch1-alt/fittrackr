import { useNavigate } from 'react-router-dom'
import { ShoppingBag, BookOpen, Package, Layout, Briefcase, GraduationCap, LifeBuoy, ChevronRight } from 'lucide-react'
import Header from '../components/Header.jsx'

// ─── Nav row ─────────────────────────────────────────────────────────────────

function MarketplaceRow({ Icon, label, description, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'var(--color-surface)',
        border: 'none',
        borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px 16px',
        textAlign: 'left',
        transition: 'background 0.12s ease',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(255,59,48,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="var(--color-accent)" strokeWidth={1.8} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
            {label}
          </p>
          {badge && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              background: 'rgba(255,59,48,0.12)',
              border: '1px solid rgba(255,59,48,0.25)',
              borderRadius: '20px',
              padding: '2px 7px',
            }}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginTop: '2px', lineHeight: 1.4 }}>
            {description}
          </p>
        )}
      </div>

      <ChevronRight size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '11px',
      fontWeight: 700,
      color: 'var(--color-text-secondary)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      padding: '20px 20px 8px',
    }}>
      {children}
    </p>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MarketplaceScreen({ onMenuOpen, appMode = 'personal' }) {
  const navigate = useNavigate()
  const isTrainer = appMode === 'trainer'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Marketplace" onMenuOpen={onMenuOpen} />

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Shared section ── */}
        <SectionLabel>Browse</SectionLabel>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', margin: '0 20px', overflow: 'hidden' }}>
          <MarketplaceRow
            Icon={ShoppingBag}
            label="Store"
            description="Discover workout programmes, plans, and challenges"
            onClick={() => navigate('/marketplace/store')}
          />
          <MarketplaceRow
            Icon={BookOpen}
            label="Saved Programmes"
            description="Programmes you've bookmarked"
            onClick={() => navigate('/marketplace/saved')}
          />
          <MarketplaceRow
            Icon={Package}
            label="Purchased Programmes"
            description="Your owned programmes and plans"
            onClick={() => navigate('/marketplace/purchased')}
            style={{ borderBottom: 'none' }}
          />
        </div>

        {/* ── PT-only section ── */}
        {isTrainer && (
          <>
            <SectionLabel>PT Tools</SectionLabel>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', margin: '0 20px', overflow: 'hidden' }}>
              <MarketplaceRow
                Icon={Layout}
                label="Programme Templates"
                description="Reusable training templates to assign to clients"
                onClick={() => navigate('/marketplace/templates')}
                badge="PT"
              />
              <MarketplaceRow
                Icon={Briefcase}
                label="Business Tools"
                description="Client onboarding, forms, and business resources"
                onClick={() => navigate('/marketplace/business-tools')}
                badge="PT"
              />
              <MarketplaceRow
                Icon={GraduationCap}
                label="Trainer Resources"
                description="CPD, coaching guides, and educational content"
                onClick={() => navigate('/marketplace/trainer-resources')}
                badge="PT"
              />
              <MarketplaceRow
                Icon={LifeBuoy}
                label="Client Support"
                description="Nutrition guides, recovery resources, and FAQs"
                onClick={() => navigate('/marketplace/client-support')}
                badge="PT"
              />
            </div>
          </>
        )}

        <div style={{ height: '32px' }} />
      </div>
    </div>
  )
}
