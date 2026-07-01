import { useNavigate, useParams } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { getWorkoutTemplates } from '../data/storage.js'

export default function ActiveWorkoutPlaceholder() {
  const navigate = useNavigate()
  const { templateId } = useParams()

  const template = getWorkoutTemplates().find(t => t.id === templateId)
  const workoutName = template?.name ?? 'Workout'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title={workoutName} onBack={() => navigate('/workouts')}>
        <button
          onClick={() => navigate('/workouts')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            padding: '8px 4px 8px 12px',
          }}
        >
          Finish
        </button>
      </Header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(255,59,48,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <Dumbbell size={32} color="var(--color-accent)" strokeWidth={1.8} />
        </div>
        <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-white)', letterSpacing: '-0.3px' }}>
          {workoutName}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '260px' }}>
          Active workout tracking is coming in the next phase.
        </p>
        <div style={{ marginTop: '8px', width: '100%', maxWidth: '280px' }}>
          <Button variant="secondary" onClick={() => navigate('/workouts')}>
            Back to Workouts
          </Button>
        </div>
      </div>
    </div>
  )
}
