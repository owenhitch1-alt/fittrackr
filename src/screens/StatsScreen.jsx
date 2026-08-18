import { useNavigate } from 'react-router-dom'
import { Dumbbell, Zap, Trophy, Clock, Calendar, Target, TrendingUp, Activity } from 'lucide-react'
import Header from '../components/Header.jsx'
import { getUserProgress, getWorkoutSessions, getWeightUnit } from '../data/storage.js'
import { calculateLevelFromXp } from '../utils/xp.js'
import { calculateUserStats, displayWeightValue, getLevelTitle } from '../utils/stats.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n) { return Math.round(n).toLocaleString() }

// ── Layout primitives ──────────────────────────────────────────────────────────

function SectionLabel({ text }) {
  return (
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
      {text}
    </p>
  )
}

function StatsCard({ children, style }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Level overview ─────────────────────────────────────────────────────────────

function LevelOverviewCard({ levelInfo }) {
  const title       = getLevelTitle(levelInfo.level)
  const toNextLevel = levelInfo.nextLevelXp - levelInfo.currentLevelXp

  return (
    <StatsCard>
      <div style={{ padding: '20px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '4px',
                fontFamily: 'var(--font)',
              }}
            >
              Current Level
            </p>
            <p
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: 'var(--color-accent)',
                letterSpacing: '-2px',
                lineHeight: 1,
                marginBottom: '6px',
                fontFamily: 'var(--font)',
              }}
            >
              {levelInfo.level}
            </p>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font)',
              }}
            >
              {title}
            </p>
          </div>

          {/* XP badge */}
          <div
            style={{
              background: 'rgba(255,59,48,0.10)',
              border: '1px solid rgba(255,59,48,0.22)',
              borderRadius: '12px',
              padding: '10px 14px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={16} color="var(--color-accent)" strokeWidth={2.2} />
            <p
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: 'var(--color-accent)',
                marginTop: '4px',
                letterSpacing: '-0.5px',
                fontFamily: 'var(--font)',
              }}
            >
              {levelInfo.currentLevelXp.toLocaleString()}
            </p>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.3px',
                fontFamily: 'var(--font)',
              }}
            >
              / {levelInfo.nextLevelXp} XP
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '8px',
            background: 'var(--color-border)',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '18px 0 8px',
          }}
        >
          <div
            style={{
              width: `${levelInfo.progressPercent}%`,
              height: '100%',
              background: 'var(--color-accent)',
              borderRadius: '4px',
            }}
          />
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)' }}>
          {toNextLevel.toLocaleString()} XP to Level {levelInfo.level + 1}
        </p>
      </div>
    </StatsCard>
  )
}

// ── Summary grid cell ──────────────────────────────────────────────────────────

function StatCell({ value, label, accent = false, borderRight = false, borderBottom = false }) {
  return (
    <div
      style={{
        padding: '18px 10px',
        textAlign: 'center',
        borderRight:  borderRight  ? '1px solid var(--color-border)' : 'none',
        borderBottom: borderBottom ? '1px solid var(--color-border)' : 'none',
      }}
    >
      <p
        style={{
          fontSize: '24px',
          fontWeight: 900,
          color: accent ? 'var(--color-accent)' : 'var(--color-white)',
          letterSpacing: '-0.5px',
          lineHeight: 1,
          marginBottom: '5px',
          fontFamily: 'var(--font)',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.2px',
          lineHeight: 1.3,
          fontFamily: 'var(--font)',
        }}
      >
        {label}
      </p>
    </div>
  )
}

// ── Record row ─────────────────────────────────────────────────────────────────

function RecordRow({ icon: Icon, label, primary, secondary, last = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(255,59,48,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="var(--color-accent)" strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '3px', fontFamily: 'var(--font)' }}>
          {label}
        </p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-white)', fontFamily: 'var(--font)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {primary}
        </p>
        {secondary && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginTop: '1px' }}>
            {secondary}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const navigate  = useNavigate()
  const levelInfo = calculateLevelFromXp(getUserProgress().totalXp)
  const weightUnit = getWeightUnit()
  const sessions   = getWorkoutSessions()
  const stats      = calculateUserStats(sessions)

  const fmtWeight = (kg) => {
    if (kg == null || kg <= 0) return '—'
    const val = displayWeightValue(kg, weightUnit)
    return `${val.toLocaleString()}${weightUnit}`
  }

  const hasRecords =
    stats &&
    (stats.heaviestSet || stats.mostRepsSet || (stats.highestVolumeSession?.volumeKg ?? 0) > 0)

  const hasInsights =
    stats && (stats.favouriteDay || stats.favouriteBodyArea)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Stats" onBack={() => navigate(-1)} />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >

        {/* ── Level Overview ── */}
        <LevelOverviewCard levelInfo={levelInfo} />

        {/* ── Empty state ── */}
        {!stats && (
          <StatsCard>
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: 'rgba(255,59,48,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <Dumbbell size={26} color="var(--color-accent)" strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-white)', marginBottom: '8px', fontFamily: 'var(--font)' }}>
                No Training Data Yet
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: '240px', margin: '0 auto', fontFamily: 'var(--font)' }}>
                Complete your first workout to start building your stats.
              </p>
            </div>
          </StatsCard>
        )}

        {/* ── Training Summary ── */}
        {stats && (
          <section>
            <SectionLabel text="Training Summary" />
            <StatsCard>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <StatCell value={fmt(stats.totalWorkouts)}  label="Workouts"    borderRight borderBottom />
                <StatCell value={fmt(stats.totalExercises)} label="Exercises"                borderBottom />
                <StatCell value={fmt(stats.totalSets)}      label="Total Sets"  borderRight borderBottom />
                <StatCell value={fmt(stats.totalReps)}      label="Total Reps"              borderBottom />
                <StatCell
                  value={fmtWeight(stats.totalVolumeKg)}
                  label={`Volume (${weightUnit})`}
                  accent
                  borderRight={stats.totalTrainingHours != null}
                />
                {stats.totalTrainingHours != null && (
                  <StatCell value={`${stats.totalTrainingHours}h`} label="Training Time" />
                )}
              </div>
            </StatsCard>
          </section>
        )}

        {/* ── Top Exercise ── */}
        {stats?.mostPerformedExercise && (
          <section>
            <SectionLabel text="Top Exercise" />
            <StatsCard>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      background: 'rgba(255,59,48,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Trophy size={20} color="var(--color-accent)" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: 'var(--color-white)',
                        fontFamily: 'var(--font)',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stats.mostPerformedExercise.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font)', marginBottom: '3px' }}>
                      Completed {stats.mostPerformedExercise.count} {stats.mostPerformedExercise.count === 1 ? 'time' : 'times'}
                    </p>
                    {stats.mostPerformedExercise.volumeKg > 0 && (
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font)' }}>
                        {fmtWeight(stats.mostPerformedExercise.volumeKg)} total volume
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </StatsCard>
          </section>
        )}

        {/* ── Exercise Mastery ── */}
        {stats?.exerciseMastery?.length > 0 && (
          <section>
            <SectionLabel text="Exercise Mastery" />
            <StatsCard>
              {stats.exerciseMastery.map((e, i) => (
                <div
                  key={e.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '13px 16px',
                    borderBottom: i < stats.exerciseMastery.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font)',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginRight: '12px',
                    }}
                  >
                    {e.name}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font)', flexShrink: 0 }}>
                    {e.count} {e.count === 1 ? 'workout' : 'workouts'}
                  </p>
                </div>
              ))}
            </StatsCard>
          </section>
        )}

        {/* ── Personal Records ── */}
        {hasRecords && (
          <section>
            <SectionLabel text="Personal Records" />
            <StatsCard>
              {stats.heaviestSet && (
                <RecordRow
                  icon={TrendingUp}
                  label="Heaviest Lift"
                  primary={stats.heaviestSet.exerciseName}
                  secondary={fmtWeight(stats.heaviestSet.weightKg)}
                  last={!stats.mostRepsSet && !(stats.highestVolumeSession?.volumeKg > 0)}
                />
              )}
              {stats.mostRepsSet && (
                <RecordRow
                  icon={Activity}
                  label="Most Reps — Single Set"
                  primary={stats.mostRepsSet.exerciseName}
                  secondary={`${stats.mostRepsSet.reps} reps`}
                  last={!(stats.highestVolumeSession?.volumeKg > 0)}
                />
              )}
              {(stats.highestVolumeSession?.volumeKg ?? 0) > 0 && (
                <RecordRow
                  icon={Target}
                  label="Highest Volume Session"
                  primary={stats.highestVolumeSession.name}
                  secondary={fmtWeight(stats.highestVolumeSession.volumeKg)}
                  last
                />
              )}
            </StatsCard>
          </section>
        )}

        {/* ── Training Insights ── */}
        {hasInsights && (
          <section>
            <SectionLabel text="Training Insights" />
            <StatsCard>
              {stats.favouriteDay && (
                <RecordRow
                  icon={Calendar}
                  label="Favourite Training Day"
                  primary={stats.favouriteDay}
                  last={!stats.favouriteBodyArea}
                />
              )}
              {stats.favouriteBodyArea && (
                <RecordRow
                  icon={Dumbbell}
                  label="Most Trained Area"
                  primary={stats.favouriteBodyArea}
                  last
                />
              )}
            </StatsCard>
          </section>
        )}

        <div style={{ height: '12px' }} />
      </div>
    </div>
  )
}
