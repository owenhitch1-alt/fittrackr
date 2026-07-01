import { useEffect, useState } from 'react'

// How long the splash stays fully visible after all elements have faded in
const SPLASH_HOLD_DURATION_MS = 2400

// Fade-in animations complete at ~900 ms (tagline starts at 500 ms, transition is 400 ms)
const FADE_IN_DONE_MS    = 900
const FADE_OUT_DURATION  = 400
const FADE_OUT_START_MS  = FADE_IN_DONE_MS + SPLASH_HOLD_DURATION_MS          // 3 700 ms
const COMPLETE_MS        = FADE_OUT_START_MS + FADE_OUT_DURATION + 50          // 4 150 ms

/**
 * Branded splash animation — staggered element fade-in, hold, then whole-screen fade-out.
 *
 * Timeline (total ~4.15 s):
 *   0 ms        logo starts fading in + scaling up   (450 ms)
 *   300 ms      wordmark starts fading in             (400 ms)
 *   500 ms      tagline starts fading in              (400 ms)
 *   ~900 ms     all elements fully visible — hold for SPLASH_HOLD_DURATION_MS
 *   3 700 ms    screen starts fading out              (400 ms)
 *   4 150 ms    onComplete fires — next screen mounts
 */
export default function SplashScreen({ onComplete }) {
  const [logoIn, setLogoIn]   = useState(false)
  const [wordIn, setWordIn]   = useState(false)
  const [tagIn, setTagIn]     = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLogoIn(true))
    const t1  = setTimeout(() => setWordIn(true),   300)
    const t2  = setTimeout(() => setTagIn(true),    500)
    const t3  = setTimeout(() => setLeaving(true),  FADE_OUT_START_MS)
    const t4  = setTimeout(onComplete,              COMPLETE_MS)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        zIndex: 9999,
        // Screen-level fade-out only — inner elements handle their own fade-in
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* Logo — fade in + scale up */}
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="FitTrackr"
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '22px',
          objectFit: 'cover',
          boxShadow: '0 8px 32px rgba(255,59,48,0.28)',
          opacity: logoIn ? 1 : 0,
          transform: `scale(${logoIn ? 1 : 0.88})`,
          transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.2, 0, 0, 1)',
        }}
      />

      {/* Wordmark — fade in after logo */}
      <p
        style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.6px',
          fontFamily: 'var(--font)',
          lineHeight: 1,
          opacity: wordIn ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        FitTrackr
      </p>

      {/* Tagline — fade in last */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#FF3B30',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font)',
          opacity: tagIn ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        Train. Track. Progress.
      </p>
    </div>
  )
}
