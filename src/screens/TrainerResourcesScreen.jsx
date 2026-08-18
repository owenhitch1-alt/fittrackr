import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Header from '../components/Header.jsx'

const PLANNED = [
  { label: 'Exercise Guides', desc: 'Curated technique guides and coaching cues for major lifts.' },
  { label: 'Programming Advice', desc: 'Periodisation, volume, and intensity planning resources.' },
  { label: 'Coaching Tips', desc: 'Client communication, motivation, and session management.' },
  { label: 'Training Articles', desc: 'Evidence-based articles on training and sports science.' },
]

export default function TrainerResourcesScreen() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Trainer Resources" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px 48px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,59,48,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px',
          }}>
            <GraduationCap size={34} color="var(--color-accent)" strokeWidth={1.8} />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-white)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '14px', fontFamily: 'var(--font)' }}>
            Coming Soon
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '300px', marginBottom: '10px', fontFamily: 'var(--font)' }}>
            Education and coaching resources to help you grow as a trainer.
          </p>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', opacity: 0.7, lineHeight: 1.5, maxWidth: '260px', marginBottom: '28px', fontFamily: 'var(--font)' }}>
            CPD content, exercise guides, and evidence-based programming advice.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', padding: '9px 20px',
            borderRadius: '100px', border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', color: 'var(--color-text-secondary)',
            fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', userSelect: 'none', fontFamily: 'var(--font)',
          }}>
            In Development
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PLANNED.map(t => (
            <div key={t.label} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '16px', opacity: 0.55,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', background: 'var(--color-bg)',
                border: '1px solid var(--color-border)', borderRadius: '20px', padding: '3px 8px',
              }}>
                Planned
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '5px', paddingRight: '64px' }}>
                {t.label}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.5 }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
