import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import WorkoutCard from '../components/WorkoutCard.jsx'
import LiteModal from '../components/LiteModal.jsx'
import { deleteWorkoutTemplate } from '../data/storage.js'
import { LITE_MAX_WORKOUTS } from '../data/limits.js'

export default function WorkoutsScreen({ onMenuOpen, templates, onDataChange, appMode = 'personal' }) {
  const navigate = useNavigate()
  const [showLimitModal, setShowLimitModal] = useState(false)

  const handleCreateClick = () => {
    if (appMode !== 'trainer' && (templates?.length ?? 0) >= LITE_MAX_WORKOUTS) {
      setShowLimitModal(true)
      return
    }
    navigate('/workouts/create')
  }

  const handleDelete = (id) => {
    deleteWorkoutTemplate(id)
    onDataChange?.()
  }

  const handleStart = (template) => {
    navigate(`/active-workout/${template.id}`)
  }

  const handleEdit = (template) => {
    navigate(`/workouts/edit/${template.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <LiteModal
        visible={showLimitModal}
        heading={`FitTrackr Lite allows up to ${LITE_MAX_WORKOUTS} workouts.`}
        body="Upgrade options will be available in a future release."
        onClose={() => setShowLimitModal(false)}
      />

      <Header title="Workouts" onMenuOpen={onMenuOpen}>
        <button
          onClick={handleCreateClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-white)',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '-8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
          aria-label="Create workout"
        >
          <Plus size={22} />
        </button>
      </Header>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {templates && templates.length > 0 ? (
          <>
            <Button variant="secondary" onClick={handleCreateClick}>
              <Plus size={16} />
              Create Workout
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templates.map((template) => (
                <WorkoutCard
                  key={template.id}
                  template={template}
                  onStart={handleStart}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="No saved workouts yet."
            subtitle="Create a workout so you can start tracking your sessions."
            action={
              <Button variant="primary" onClick={handleCreateClick}>
                <Plus size={16} />
                Create Workout
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
