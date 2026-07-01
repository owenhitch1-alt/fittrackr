import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import LineGraph from '../components/LineGraph.jsx'
import { getClientById, getClientCheckIns, deleteClientCheckIn } from '../data/storage.js'
import { convertMeasurement } from '../utils/measurements.js'

// ─── Metric definitions ───────────────────────────────────────────────────────

function getMetrics(weightUnit, measurementUnit) {
  return [
    {
      key: 'weight',
      label: 'Weight',
      getValue: (c) => c.weight,
      getUnit: () => weightUnit,
      isMeasurement: false,
    },
    {
      key: 'bodyFatPercentage',
      label: 'Body Fat',
      getValue: (c) => c.bodyFatPercentage,
      getUnit: () => '%',
      isMeasurement: false,
    },
    {
      key: 'muscleMass',
      label: 'Muscle Mass',
      getValue: (c) => c.muscleMass,
      getUnit: () => weightUnit,
      isMeasurement: false,
    },
    {
      key: 'waist',
      label: 'Waist',
      getValue: (c) => c.waist,
      getUnit: () => measurementUnit,
      isMeasurement: true,
    },
    {
      key: 'chest',
      label: 'Chest',
      getValue: (c) => c.chest,
      getUnit: () => measurementUnit,
      isMeasurement: true,
    },
    {
      key: 'hips',
      label: 'Hips',
      getValue: (c) => c.hips,
      getUnit: () => measurementUnit,
      isMeasurement: true,
    },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtNum(n) {
  if (n == null) return null
  return parseFloat(n.toFixed(1)).toString()
}

// ─── Check-in card ────────────────────────────────────────────────────────────

function CheckInCard({ checkIn, displayMeasurementUnit = 'cm', onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const storedMu = checkIn.measurementUnit ?? 'cm'
  const stats = []
  if (checkIn.weight != null) stats.push(`${fmtNum(checkIn.weight)} ${checkIn.weightUnit}`)
  if (checkIn.bodyFatPercentage != null) stats.push(`${fmtNum(checkIn.bodyFatPercentage)}% BF`)
  if (checkIn.muscleMass != null) stats.push(`${fmtNum(checkIn.muscleMass)} ${checkIn.muscleMassUnit} MM`)
  if (checkIn.waist != null) stats.push(`W: ${fmtNum(convertMeasurement(checkIn.waist, storedMu, displayMeasurementUnit))}${displayMeasurementUnit}`)
  if (checkIn.chest != null) stats.push(`C: ${fmtNum(convertMeasurement(checkIn.chest, storedMu, displayMeasurementUnit))}${displayMeasurementUnit}`)
  if (checkIn.hips != null) stats.push(`H: ${fmtNum(convertMeasurement(checkIn.hips, storedMu, displayMeasurementUnit))}${displayMeasurementUnit}`)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font)', marginBottom: '6px', letterSpacing: '0.1px' }}>
            {formatDate(checkIn.date)}
          </p>

          {stats.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginBottom: checkIn.notes ? '8px' : 0 }}>
              {stats.map(s => (
                <span key={s} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {checkIn.notes && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.5, marginTop: stats.length > 0 ? 0 : 0 }}>
              {checkIn.notes}
            </p>
          )}
        </div>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete check-in"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
              flexShrink: 0,
            }}
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={onDelete}
              style={{
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font)',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font)',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ClientProgressScreen({ weightUnit = 'kg', measurementUnit = 'cm', onDataChange }) {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const client = getClientById(clientId)
  if (!client) return <Navigate to="/clients" replace />

  const METRICS = getMetrics(weightUnit, measurementUnit)
  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [checkIns, setCheckIns] = useState(() => getClientCheckIns(clientId))

  const metric = METRICS.find(m => m.key === selectedMetric) ?? METRICS[0]

  // Build graph data.
  // For body measurement metrics: convert every check-in's value to the current display
  // unit before plotting, so cm and inch entries appear together on a single y-axis.
  // For weight/muscle mass/body fat: include raw values as-is.
  const graphData = checkIns
    .filter(c => metric.getValue(c) != null)
    .map(c => ({
      date: c.date,
      value: metric.isMeasurement
        ? convertMeasurement(metric.getValue(c), c.measurementUnit ?? 'cm', measurementUnit)
        : metric.getValue(c),
    }))
    .filter(d => d.value != null)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const handleDelete = (id) => {
    deleteClientCheckIn(id)
    setCheckIns(getClientCheckIns(clientId))
    onDataChange?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title={client.name} onBack={() => navigate(`/clients/${clientId}`)}>
        <button
          onClick={() => navigate(`/clients/${clientId}/add-checkin`)}
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
          aria-label="Add check-in"
        >
          <Plus size={22} />
        </button>
      </Header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Section title */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font)' }}>
            Progress
          </p>
          <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-white)', fontFamily: 'var(--font)', letterSpacing: '-0.3px' }}>
            {client.name}
          </p>
        </div>

        {/* Metric selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {METRICS.map(m => {
            const active = m.key === selectedMetric
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                style={{
                  background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  borderRadius: '20px',
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'var(--font)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  transition: 'background 0.15s ease, color 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Graph */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 12px 8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '4px', paddingRight: '4px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
              {metric.label}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
              {metric.getUnit()} · {graphData.length} point{graphData.length !== 1 ? 's' : ''}
            </p>
          </div>

          {graphData.length < 2 ? (
            <div style={{ padding: '28px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', lineHeight: 1.6 }}>
                {checkIns.length === 0
                  ? 'No check-ins yet. Add your first check-in to start tracking.'
                  : `Add at least two check-ins with a ${metric.label.toLowerCase()} value to see a progress trend.`}
              </p>
              <div style={{ marginTop: '14px' }}>
                <Button variant="primary" onClick={() => navigate(`/clients/${clientId}/add-checkin`)}>
                  <Plus size={15} />
                  Add Check-In
                </Button>
              </div>
            </div>
          ) : (
            <LineGraph data={graphData} unit={metric.getUnit()} />
          )}
        </div>

        {/* Unit note for body measurement metrics */}
        {metric.isMeasurement && checkIns.some(c => metric.getValue(c) != null) && (
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontStyle: 'italic', marginTop: '-8px' }}>
            Measurements displayed in {measurementUnit === 'in' ? 'inches' : 'centimetres'}.
          </p>
        )}

        {/* Check-in history */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font)' }}>
              Check-In History
            </p>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', fontWeight: 600 }}>
              {checkIns.length} total
            </span>
          </div>

          {checkIns.length === 0 ? (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '28px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
                No check-ins yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checkIns.map(c => (
                <CheckInCard
                  key={c.id}
                  checkIn={c}
                  displayMeasurementUnit={measurementUnit}
                  onDelete={() => handleDelete(c.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
