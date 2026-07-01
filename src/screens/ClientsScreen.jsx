import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, X, ChevronRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import {
  getClients,
  saveClient,
  getWorkoutTemplates,
  getWorkoutSessions,
  setActiveClient,
} from '../data/storage.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Add Client Form (overlay) ────────────────────────────────────────────────

function AddClientForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState(null)

  const handleSave = () => {
    if (!name.trim()) { setNameError('Enter a client name.'); return }
    onSave(name.trim(), notes.trim())
  }

  const inputBase = {
    width: '100%',
    background: 'var(--color-bg)',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-white)',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'var(--font)',
    padding: '12px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '24px',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
            Add Client
          </h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '6px' }}
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label
              style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}
            >
              Client Name <span style={{ color: 'var(--color-accent)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(null) }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              placeholder="e.g. Alex Johnson"
              autoFocus
              style={{
                ...inputBase,
                borderColor: nameError ? 'var(--color-accent)' : 'var(--color-border)',
              }}
              onFocus={e => { if (!nameError) e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { if (!nameError) e.target.style.borderColor = 'var(--color-border)' }}
            />
            {nameError && (
              <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '4px' }}>
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label
              style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional — goals, injuries, preferences…"
              rows={3}
              style={{
                ...inputBase,
                resize: 'vertical',
                lineHeight: 1.5,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button variant="primary" onClick={handleSave}>Add Client</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Client Card ──────────────────────────────────────────────────────────────

function ClientCard({ client, workoutCount, sessionCount, lastDate, onView }) {
  return (
    <button
      onClick={onView}
      style={{
        width: '100%',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255,59,48,0.12)',
          border: '1px solid rgba(255,59,48,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '16px',
          fontWeight: 800,
          color: 'var(--color-accent)',
          fontFamily: 'var(--font)',
        }}
      >
        {client.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', marginBottom: '2px' }}>
          {client.name}
        </p>
        {client.notes && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font)',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {client.notes}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
            {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
            {sessionCount} session{sessionCount !== 1 ? 's' : ''}
          </span>
          {lastDate && (
            <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, fontFamily: 'var(--font)' }}>
              Last: {lastDate}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
    </button>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ClientsScreen({ onMenuOpen, onDataChange }) {
  const navigate = useNavigate()
  const [clients, setClients] = useState(() => getClients())
  const [showAddForm, setShowAddForm] = useState(false)

  const templates = getWorkoutTemplates()
  const sessions = getWorkoutSessions().filter(s => s.status === 'completed')

  const handleSaveClient = useCallback((name, notes) => {
    saveClient({ name, notes: notes || undefined })
    setClients(getClients())
    setShowAddForm(false)
    onDataChange?.()
  }, [onDataChange])

  const handleView = (client) => {
    setActiveClient(client.id)
    navigate(`/clients/${client.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {showAddForm && (
        <AddClientForm
          onSave={handleSaveClient}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <Header title="Clients" onMenuOpen={onMenuOpen}>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-white)',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '-8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
          }}
          aria-label="Add client"
        >
          <Plus size={22} />
        </button>
      </Header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients yet."
            subtitle="Add your first client to start tracking their workouts."
            action={
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                <Plus size={16} />
                Add Client
              </Button>
            }
          />
        ) : (
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} />
              Add Client
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clients.map(client => {
                const clientTemplates = templates.filter(t => t.clientId === client.id)
                const clientSessions = sessions.filter(s => s.clientId === client.id)
                const lastSession = clientSessions[0]
                return (
                  <ClientCard
                    key={client.id}
                    client={client}
                    workoutCount={clientTemplates.length}
                    sessionCount={clientSessions.length}
                    lastDate={formatLastDate(lastSession?.completedAt)}
                    onView={() => handleView(client)}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
