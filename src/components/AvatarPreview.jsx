// Shared avatar SVG renderer — used by HomeScreen and AvatarSettingsScreen.

const HAIR_HEX = {
  black:  '#111111',
  brown:  '#6F4E37',
  blonde: '#DAA520',
  red:    '#C0392B',
  grey:   '#9E9E9E',
}

const BODY_DIMS = {
  slim:     { tw: 28, sw: 32, lw: 10, aw: 8  },
  athletic: { tw: 38, sw: 44, lw: 14, aw: 9  },
  muscular: { tw: 46, sw: 56, lw: 17, aw: 11 },
  large:    { tw: 52, sw: 52, lw: 18, aw: 13 },
}

/**
 * Renders the user's avatar as an inline SVG.
 * Accepts any AvatarConfig object; missing fields fall back to defaults silently.
 */
export default function AvatarPreview({ config = {} }) {
  const hc  = HAIR_HEX[config.hairColour] ?? '#111111'
  const sk  = config.skinTone    ?? '#C68642'
  const tc  = config.topColour   ?? '#FF3B30'
  const bc  = config.bottomColour ?? '#1C1C1E'
  const sc  = config.shoeColour  ?? '#FFFFFF'
  const acc = config.accessories  ?? []
  const acColor = config.accessoryColour ?? '#000000'

  const bd = BODY_DIMS[config.bodyType] ?? BODY_DIMS.athletic

  const cx       = 50
  const hcy      = 34
  const hr       = 20
  const torsoTop = hcy + hr + 4   // 58
  const torsoH   = 44
  const torsoBot = torsoTop + torsoH  // 102
  const legH     = 44
  const legBot   = torsoBot + legH    // 146
  const shoeH    = 10

  const lLegX = cx - bd.tw / 2
  const rLegX = cx + bd.tw / 2 - bd.lw

  const hairCap      = config.hairStyle !== 'none' && config.hairStyle !== 'buzz'
  const hasCap       = acc.includes('cap')
  const hasHeadband  = acc.includes('headband') && !hasCap
  const hasSunglasses = acc.includes('sunglasses')
  const hasWatch     = acc.includes('watch')

  return (
    <svg
      viewBox="0 0 100 165"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="User avatar"
      role="img"
      style={{ width: '100%', height: '100%' }}
    >

      {/* ── Shoes ── */}
      {config.shoes === 'barefoot' ? (
        <>
          <ellipse cx={lLegX + bd.lw / 2} cy={legBot + 4} rx={bd.lw / 2 + 1} ry={5} fill={sk} />
          <ellipse cx={rLegX + bd.lw / 2} cy={legBot + 4} rx={bd.lw / 2 + 1} ry={5} fill={sk} />
        </>
      ) : (
        <>
          <rect
            x={lLegX - 2}
            y={config.shoes === 'hightops' ? legBot - 6 : legBot}
            width={bd.lw + 3}
            height={config.shoes === 'hightops' ? shoeH + 6 : shoeH}
            rx="4" fill={sc}
          />
          <rect
            x={rLegX - 1}
            y={config.shoes === 'hightops' ? legBot - 6 : legBot}
            width={bd.lw + 3}
            height={config.shoes === 'hightops' ? shoeH + 6 : shoeH}
            rx="4" fill={sc}
          />
        </>
      )}

      {/* ── Legs / Bottom ── */}
      <rect x={lLegX} y={torsoBot - 2} width={bd.lw} height={legH + 2} rx="3" fill={bc} />
      <rect x={rLegX} y={torsoBot - 2} width={bd.lw} height={legH + 2} rx="3" fill={bc} />

      {/* ── Torso ── */}
      <rect x={cx - bd.sw / 2} y={torsoTop}     width={bd.sw} height={14}          rx="6" fill={tc} />
      <rect x={cx - bd.tw / 2} y={torsoTop + 8} width={bd.tw} height={torsoH - 8}  rx="4" fill={tc} />

      {/* ── Arms ── */}
      <rect x={cx - bd.sw / 2 - bd.aw} y={torsoTop + 12} width={bd.aw} height={torsoH - 16} rx="4" fill={tc} />
      <rect x={cx + bd.sw / 2}         y={torsoTop + 12} width={bd.aw} height={torsoH - 16} rx="4" fill={tc} />

      {/* ── Hands ── */}
      <ellipse cx={cx - bd.sw / 2 - bd.aw / 2} cy={torsoBot - 4} rx={bd.aw / 2 + 1} ry={4} fill={sk} />
      <ellipse cx={cx + bd.sw / 2 + bd.aw / 2} cy={torsoBot - 4} rx={bd.aw / 2 + 1} ry={4} fill={sk} />

      {/* ── Watch ── */}
      {hasWatch && (
        <rect
          x={cx - bd.sw / 2 - bd.aw + 1}
          y={torsoBot - 12}
          width={bd.aw - 2}
          height={4}
          rx="1"
          fill={acColor}
        />
      )}

      {/* ── Neck ── */}
      <rect x={cx - 5} y={hcy + hr - 4} width="10" height="12" fill={sk} />

      {/* ── Long / medium / braided hair behind head ── */}
      {(config.hairStyle === 'long' || config.hairStyle === 'braided') && (
        <>
          <rect x={cx - hr - 1} y={hcy}      width="8" height={config.hairStyle === 'long' ? hr * 2.6 : hr * 2.8} rx="4" fill={hc} />
          <rect x={cx + hr - 7} y={hcy}      width="8" height={config.hairStyle === 'long' ? hr * 2.6 : hr * 2.8} rx="4" fill={hc} />
        </>
      )}
      {config.hairStyle === 'medium' && (
        <>
          <rect x={cx - hr - 1} y={hcy} width="8" height={hr * 1.4} rx="4" fill={hc} />
          <rect x={cx + hr - 7} y={hcy} width="8" height={hr * 1.4} rx="4" fill={hc} />
        </>
      )}

      {/* ── Head ── */}
      <circle cx={cx} cy={hcy} r={hr} fill={sk} />

      {/* ── Hair cap (on top of head) ── */}
      {hairCap && !hasCap && config.hairStyle !== 'curly' && config.hairStyle !== 'braided' && (
        <>
          <ellipse cx={cx} cy={hcy - hr * 0.42} rx={hr * 0.93} ry={hr * 0.74} fill={hc} />
          <ellipse cx={cx} cy={hcy - hr * 0.88} rx={hr * 0.85} ry={hr * 0.48} fill={hc} />
        </>
      )}
      {config.hairStyle === 'buzz' && !hasCap && (
        <ellipse cx={cx} cy={hcy - hr * 0.35} rx={hr * 0.88} ry={hr * 0.62} fill={hc} />
      )}
      {config.hairStyle === 'curly' && !hasCap && (
        <>
          <circle cx={cx - 12} cy={hcy - hr + 1} r={9} fill={hc} />
          <circle cx={cx}      cy={hcy - hr - 4} r={9} fill={hc} />
          <circle cx={cx + 12} cy={hcy - hr + 1} r={9} fill={hc} />
          <circle cx={cx - 6}  cy={hcy - hr + 9} r={7} fill={hc} />
          <circle cx={cx + 6}  cy={hcy - hr + 9} r={7} fill={hc} />
        </>
      )}
      {config.hairStyle === 'braided' && !hasCap && (
        <>
          <ellipse cx={cx} cy={hcy - hr * 0.42} rx={hr * 0.90} ry={hr * 0.72} fill={hc} />
          <ellipse cx={cx} cy={hcy - hr * 0.88} rx={hr * 0.82} ry={hr * 0.48} fill={hc} />
          <rect x={cx - 2} y={hcy + hr * 0.5} width={4} height={hr * 2.4} rx="2" fill={hc} />
          <path
            d={`M ${cx} ${hcy + hr * 0.6} L ${cx + 3} ${hcy + hr * 1.0} L ${cx} ${hcy + hr * 1.4} L ${cx - 3} ${hcy + hr * 1.8} L ${cx} ${hcy + hr * 2.2}`}
            stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
        </>
      )}

      {/* ── Cap accessory ── */}
      {hasCap && (
        <>
          <ellipse cx={cx} cy={hcy - hr + 5} rx={hr * 0.95} ry={hr * 0.55} fill={acColor} />
          <rect x={cx - 4} y={hcy - hr + 5} width={hr * 1.1} height={5} rx="2" fill={acColor} />
        </>
      )}

      {/* ── Headband accessory ── */}
      {hasHeadband && (
        <rect x={cx - hr + 1} y={hcy - 5} width={(hr - 1) * 2} height={5} rx="2.5" fill={acColor} />
      )}

      {/* ── Eyes ── */}
      <circle cx={cx - 6} cy={hcy + 4} r={2.5} fill="rgba(0,0,0,0.75)" />
      <circle cx={cx + 6} cy={hcy + 4} r={2.5} fill="rgba(0,0,0,0.75)" />
      <circle cx={cx - 5} cy={hcy + 3} r={0.8}  fill="rgba(255,255,255,0.8)" />
      <circle cx={cx + 7} cy={hcy + 3} r={0.8}  fill="rgba(255,255,255,0.8)" />

      {/* ── Sunglasses accessory ── */}
      {hasSunglasses && (
        <>
          <rect x={cx - 12} y={hcy + 1} width="10" height="7" rx="3" fill={acColor} opacity="0.85" />
          <rect x={cx + 2}  y={hcy + 1} width="10" height="7" rx="3" fill={acColor} opacity="0.85" />
          <rect x={cx - 2}  y={hcy + 3} width="4"  height="2" rx="1" fill={acColor} opacity="0.85" />
        </>
      )}

      {/* ── Mouth ── */}
      <path
        d={`M ${cx - 6} ${hcy + 12} Q ${cx} ${hcy + 16} ${cx + 6} ${hcy + 12}`}
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
