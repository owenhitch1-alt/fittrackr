// Pure SVG line graph — no external chart library.
// Props:
//   data: Array<{ date: string (YYYY-MM-DD), value: number }> — sorted ascending
//   unit: string — appended to y-axis tick labels (e.g. 'kg', '%', 'cm')

export default function LineGraph({ data, unit = '' }) {
  if (!data || data.length < 2) return null

  const W = 320
  const H = 180
  const PAD = { top: 20, right: 16, bottom: 38, left: 46 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const rawRange = rawMax - rawMin

  // For a flat line add artificial range so the line sits in the middle
  const pad = rawRange === 0 ? (rawMin * 0.1 || 1) : rawRange * 0.12
  const yMin = rawMin - pad
  const yMax = rawMax + pad
  const yRange = yMax - yMin

  const getX = (i) => PAD.left + (i / (data.length - 1)) * plotW
  const getY = (v) => PAD.top + plotH - ((v - yMin) / yRange) * plotH

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + plotH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`

  // 4 evenly spaced y-axis tick values
  const yTicks = [0, 1, 2, 3].map(i => yMin + (i / 3) * yRange)

  // Up to 5 x-axis labels
  const maxLabels = 5
  let labelIndices
  if (data.length <= maxLabels) {
    labelIndices = data.map((_, i) => i)
  } else {
    const step = (data.length - 1) / (maxLabels - 1)
    labelIndices = Array.from({ length: maxLabels }, (_, i) => Math.round(i * step))
  }

  function fmtDate(dateStr) {
    // Parse as local date to avoid timezone shift
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  function fmtTick(v) {
    const n = parseFloat(v.toFixed(1))
    return unit === '%' ? `${n}%` : `${n}`
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* Y-axis gridlines + labels */}
      {yTicks.map((v, i) => {
        const y = getY(v)
        return (
          <g key={i}>
            <line
              x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              style={{ stroke: 'var(--color-border)', strokeWidth: 0.6 }}
            />
            <text
              x={PAD.left - 5}
              y={y + 3.5}
              textAnchor="end"
              style={{
                fontSize: '9px',
                fill: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
              }}
            >
              {fmtTick(v)}
            </text>
          </g>
        )
      })}

      {/* Area fill under line */}
      <path d={areaPath} style={{ fill: 'rgba(255,59,48,0.07)', stroke: 'none' }} />

      {/* Line */}
      <path
        d={linePath}
        style={{
          fill: 'none',
          stroke: 'var(--color-accent)',
          strokeWidth: 2,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }}
      />

      {/* Data point dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          style={{
            fill: 'var(--color-accent)',
            stroke: 'var(--color-bg)',
            strokeWidth: 1.5,
          }}
        />
      ))}

      {/* X-axis date labels */}
      {labelIndices.map(i => (
        <text
          key={i}
          x={getX(i)}
          y={H - 4}
          textAnchor="middle"
          style={{
            fontSize: '8px',
            fill: 'var(--color-text-secondary)',
            fontFamily: 'var(--font)',
          }}
        >
          {fmtDate(data[i].date)}
        </text>
      ))}
    </svg>
  )
}
