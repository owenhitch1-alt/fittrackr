import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Star, TrendingUp } from 'lucide-react'
import confetti from 'canvas-confetti'

// ─── Level-up overlay ─────────────────────────────────────────────────────────

function LevelUpOverlay({ levelBefore, levelAfter, onContinue }) {
  useEffect(() => {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#FF3B30', '#FF9500', '#FFD700', '#FFFFFF', '#FF6B6B'],
      zIndex: 500,
    })

    const t = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 110,
        origin: { y: 0.45, x: 0.25 },
        colors: ['#FF3B30', '#FFD700', '#FF9500'],
        zIndex: 500,
      })
      confetti({
        particleCount: 60,
        spread: 110,
        origin: { y: 0.45, x: 0.75 },
        colors: ['#FF3B30', '#FFD700', '#FF9500'],
        zIndex: 500,
      })
    }, 350)

    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,59,48,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Star size={40} color="var(--color-accent)" fill="var(--color-accent)" strokeWidth={0} />
        </div>

        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            fontFamily: 'var(--font)',
          }}
        >
          Level Up!
        </p>

        <p
          style={{
            fontSize: '42px',
            fontWeight: 900,
            color: 'var(--color-white)',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '10px',
            fontFamily: 'var(--font)',
          }}
        >
          Level {levelAfter}
        </p>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.6,
            fontFamily: 'var(--font)',
          }}
        >
          You've reached Level {levelAfter}.{'\n'}Keep training to level up again.
        </p>

        <button
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            letterSpacing: '0.3px',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function XpOverviewScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const xpResult = state?.xpResult
  const bd = xpResult?.xpBreakdown

  // Start bar at the before position; target is 100% for level-ups so bar visibly fills
  const startPercent = bd?.levelProgressBefore?.progressPercent ?? 0
  const endPercent = bd?.levelProgressAfter?.progressPercent ?? 0
  const targetPercent = bd?.didLevelUp ? 100 : endPercent

  const [barPercent, setBarPercent] = useState(startPercent)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const timersRef = useRef([])

  useEffect(() => {
    if (!bd) return

    // Brief delay then animate bar fill
    const t1 = setTimeout(() => setBarPercent(targetPercent), 400)

    // If levelled up, show overlay after bar completes
    let t2
    if (bd.didLevelUp) {
      t2 = setTimeout(() => setShowLevelUp(true), 1900) // 400 delay + 1000 transition + 500 pause
    }

    timersRef.current = [t1, t2].filter(Boolean)
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  // Guard after hooks — redirect if no valid XP result to show
  if (!xpResult || !bd || xpResult.xpEarned === 0) {
    return <Navigate to="/" replace />
  }

  const levelAfterInfo = bd.levelProgressAfter
  const exerciseLevelUps = (bd.exerciseXpAwards ?? []).filter(e => e.didLevelUp)

  const handleContinue = () => navigate('/', { replace: true })

  const breakdownRows = [
    { label: 'Base workout', xp: bd.baseWorkoutXp },
    { label: `Completed sets (${Math.round((bd.completedSetsXp ?? 0) / 5)})`, xp: bd.completedSetsXp },
    { label: 'New best weight', xp: bd.personalBestWeightXp, accent: true },
    { label: 'New best reps', xp: bd.personalBestRepsXp, accent: true },
    { label: '3+ exercises bonus', xp: bd.workoutExerciseBonusXp },
  ].filter(r => (r.xp ?? 0) > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {showLevelUp && (
        <LevelUpOverlay
          levelBefore={bd.levelBefore}
          levelAfter={bd.levelAfter}
          onContinue={handleContinue}
        />
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: 'var(--color-white)',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              fontFamily: 'var(--font)',
            }}
          >
            FitTrackr
          </p>
          <div
            style={{
              width: '32px',
              height: '3px',
              background: 'var(--color-accent)',
              borderRadius: '2px',
              margin: '5px auto 0',
            }}
          />
        </div>

        {/* Hero XP */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,59,48,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Star size={32} color="var(--color-accent)" fill="var(--color-accent)" strokeWidth={0} />
          </div>
          <p
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: 'var(--color-accent)',
              letterSpacing: '-1.5px',
              lineHeight: 1,
              fontFamily: 'var(--font)',
            }}
          >
            +{xpResult.xpEarned} XP
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              marginTop: '6px',
              fontFamily: 'var(--font)',
              letterSpacing: '0.3px',
            }}
          >
            XP Earned
          </p>
        </div>

        {/* Level progress card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-white)',
                fontFamily: 'var(--font)',
              }}
            >
              Level {levelAfterInfo?.level}
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                fontFamily: 'var(--font)',
              }}
            >
              {levelAfterInfo?.currentLevelXp} / {levelAfterInfo?.nextLevelXp} XP
            </p>
          </div>

          {/* Animated progress bar */}
          <div
            style={{
              height: '8px',
              background: 'var(--color-border)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${barPercent}%`,
                height: '100%',
                background: 'var(--color-accent)',
                borderRadius: '4px',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          <p
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              marginTop: '8px',
              fontFamily: 'var(--font)',
            }}
          >
            {(levelAfterInfo?.nextLevelXp ?? 0) - (levelAfterInfo?.currentLevelXp ?? 0)} XP to Level {(levelAfterInfo?.level ?? 1) + 1}
          </p>
        </div>

        {/* XP Breakdown */}
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'var(--font)',
            }}
          >
            XP Breakdown
          </p>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            {breakdownRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < breakdownRows.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    color: row.accent ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontWeight: row.accent ? 600 : 500,
                    fontFamily: 'var(--font)',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font)',
                  }}
                >
                  +{row.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise level-ups */}
        {exerciseLevelUps.length > 0 && (
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '10px',
                fontFamily: 'var(--font)',
              }}
            >
              Exercise Level Ups
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exerciseLevelUps.map(e => (
                <div
                  key={e.exerciseKey}
                  style={{
                    background: 'rgba(255,59,48,0.06)',
                    border: '1px solid rgba(255,59,48,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <TrendingUp size={14} color="var(--color-accent)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-white)',
                      fontWeight: 600,
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {e.exerciseName} reached Level {e.levelAfter}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
          <button
            onClick={handleContinue}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            Continue
          </button>
          <button
            onClick={() => navigate('/history', { replace: true })}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-white)',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
            }}
          >
            View History
          </button>
        </div>
      </div>
    </div>
  )
}
