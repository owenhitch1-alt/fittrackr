import { useState } from 'react'
import { Download } from 'lucide-react'
import {
  RESET_CATEGORIES,
  downloadLocalDataExport,
  resetCategory,
  resetAllLocalData,
} from '../data/appData.js'

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.88)',
  zIndex: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
}

const dialogStyle = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  padding: '28px 24px',
  width: '100%',
  maxWidth: '320px',
}

const dialogTitleStyle = {
  fontSize: '18px',
  fontWeight: 800,
  color: 'var(--color-white)',
  fontFamily: 'var(--font)',
  marginBottom: '8px',
}

const dialogBodyStyle = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  fontFamily: 'var(--font)',
  lineHeight: 1.6,
  marginBottom: '20px',
}

const btnBase = {
  padding: '14px',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: 'var(--font)',
  cursor: 'pointer',
  letterSpacing: '0.3px',
}

const cancelBtnStyle = {
  ...btnBase,
  background: 'none',
  border: '1px solid var(--color-border)',
  color: 'var(--color-white)',
  fontWeight: 600,
}

const destructiveBtnStyle = {
  ...btnBase,
  background: 'var(--color-accent)',
  border: 'none',
  color: '#FFFFFF',
}

const rowStyle = {
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '16px',
  textAlign: 'left',
  borderBottom: '1px solid var(--color-border)',
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────

function ResetConfirmDialog({ title, message, confirmLabel, requireTypedConfirm, onCancel, onConfirm }) {
  const [typed, setTyped] = useState('')
  const canConfirm = !requireTypedConfirm || typed.trim().toUpperCase() === 'RESET'

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={dialogStyle}>
        <h3 style={dialogTitleStyle}>{title}</h3>
        <p style={dialogBodyStyle}>{message}</p>

        {requireTypedConfirm && (
          <input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="Type RESET"
            aria-label="Type RESET to confirm"
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-white)',
              fontSize: '15px',
              fontFamily: 'var(--font)',
              padding: '12px',
              marginBottom: '20px',
              letterSpacing: '1px',
            }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              ...destructiveBtnStyle,
              opacity: canConfirm ? 1 : 0.45,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            {confirmLabel ?? 'Reset'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

/**
 * Settings → Privacy & Data.
 * Local export and per-category reset tools. No cloud or account data is involved.
 */
export default function PrivacyDataSection({ onDataChange }) {
  const [pending, setPending] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)
  const [resetStatus, setResetStatus] = useState(null)

  const handleExport = () => {
    const result = downloadLocalDataExport()
    setExportStatus(result.ok ? `Exported ${result.filename}` : result.error)
    setTimeout(() => setExportStatus(null), 4000)
  }

  const handleConfirm = () => {
    if (!pending) return
    if (pending.category === 'all') {
      resetAllLocalData()
      setResetStatus('All local data has been reset.')
    } else {
      resetCategory(pending.category)
      setResetStatus(`${RESET_CATEGORIES[pending.category].label.replace('Reset ', '')} has been reset.`)
    }
    setPending(null)
    onDataChange?.()
    setTimeout(() => setResetStatus(null), 4000)
  }

  const labelStyle = {
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--color-white)',
    fontFamily: 'var(--font)',
  }

  const hintStyle = {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font)',
    lineHeight: 1.5,
    marginTop: '3px',
  }

  return (
    <section>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '0 16px 8px',
          fontFamily: 'var(--font)',
        }}
      >
        Privacy &amp; Data
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {/* Export */}
        <button onClick={handleExport} style={rowStyle}>
          <span style={{ flex: 1 }}>
            <span style={labelStyle}>Export Local Data</span>
            <span style={{ ...hintStyle, display: 'block' }}>
              Export a copy of your local FitTrackr data before cloud accounts are added.
            </span>
          </span>
          <Download size={18} color="var(--color-text-secondary)" />
        </button>

        {exportStatus && (
          <p style={{ ...hintStyle, padding: '10px 16px', borderBottom: '1px solid var(--color-border)', margin: 0 }}>
            {exportStatus}
          </p>
        )}

        {/* Per-category resets */}
        {Object.entries(RESET_CATEGORIES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setPending({ category: key })}
            style={rowStyle}
          >
            <span style={{ flex: 1 }}>
              <span style={labelStyle}>{config.label}</span>
              <span style={{ ...hintStyle, display: 'block' }}>{config.description}</span>
            </span>
          </button>
        ))}

        {/* Reset everything */}
        <button
          onClick={() => setPending({ category: 'all' })}
          style={{ ...rowStyle, borderBottom: 'none' }}
        >
          <span style={{ flex: 1 }}>
            <span style={{ ...labelStyle, color: 'var(--color-accent)', fontWeight: 700 }}>
              Reset All Local Data
            </span>
            <span style={{ ...hintStyle, display: 'block' }}>
              Deletes everything FitTrackr has stored on this device.
            </span>
          </span>
        </button>

        {resetStatus && (
          <p style={{ ...hintStyle, padding: '12px 16px', borderTop: '1px solid var(--color-border)', margin: 0 }}>
            {resetStatus}
          </p>
        )}
      </div>

      {pending && (
        <ResetConfirmDialog
          title={
            pending.category === 'all'
              ? 'Reset all local data?'
              : RESET_CATEGORIES[pending.category].confirmMessage
                ? 'Reset demo data?'
                : RESET_CATEGORIES[pending.category].label + '?'
          }
          message={
            pending.category === 'all'
              ? 'This will permanently delete all FitTrackr data from this device, including workouts, history, PT data and settings. This cannot be undone. Type RESET to confirm.'
              : RESET_CATEGORIES[pending.category].confirmMessage
                ?? 'This will permanently delete this local data from this device. This cannot be undone. Are you sure?'
          }
          confirmLabel={pending.category === 'all' ? undefined : RESET_CATEGORIES[pending.category].confirmLabel}
          requireTypedConfirm={pending.category === 'all'}
          onCancel={() => setPending(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  )
}
