import { Component } from 'react'

/**
 * Catches render errors so a single bad screen cannot blank the whole app.
 * Retry re-mounts the subtree; Go Home also resets the route.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('FitTrackr: render error', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  handleGoHome = () => {
    this.setState({ hasError: false })
    window.location.hash = '#/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const btnBase = {
      padding: '14px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'var(--font)',
      cursor: 'pointer',
      letterSpacing: '0.3px',
      width: '100%',
      maxWidth: '260px',
    }

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px 32px',
          gap: '12px',
          background: 'var(--color-bg)',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-white)', fontFamily: 'var(--font)' }}>
          Something went wrong.
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font)',
            lineHeight: 1.6,
            maxWidth: '260px',
            marginBottom: '8px',
          }}
        >
          Please try again. Your saved data has not been affected.
        </p>
        <button
          onClick={this.handleRetry}
          style={{ ...btnBase, background: 'var(--color-accent)', border: 'none', color: 'var(--color-on-accent)' }}
        >
          Try Again
        </button>
        <button
          onClick={this.handleGoHome}
          style={{ ...btnBase, background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-white)', fontWeight: 600 }}
        >
          Go Home
        </button>
      </div>
    )
  }
}
