import { useState } from 'react'
import RequirementInput from './components/RequirementInput'
import Tabs from './components/Tabs'
import ResultViewer from './components/ResultViewer'
import LoadingState from './components/LoadingState'
import Settings from './components/Settings'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PIPELINE_STEPS = ['analyst', 'lead', 'estimation', 'automation']

export default function App() {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('analyst')
  const [showSettings, setShowSettings] = useState(false)

  const handleGenerate = async (requirement) => {
    setLoading(true)
    setError(null)
    setData(null)
    setCurrentStep('analyst')

    let stepIdx = 0
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, PIPELINE_STEPS.length - 1)
      setCurrentStep(PIPELINE_STEPS[stepIdx])
    }, 2200)

    try {
      const openaiKey = localStorage.getItem('openai_api_key') || ''
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, openai_key: openaiKey }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error: ${res.status}`)
      }

      const result = await res.json()
      clearInterval(stepTimer)
      setCurrentStep(null)
      setData(result)
      setActiveTab('analyst')
    } catch (e) {
      clearInterval(stepTimer)
      setCurrentStep(null)
      setError(e.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const hasApiKey = !!localStorage.getItem('openai_api_key')

  return (
    <div style={styles.root}>
      <div style={styles.scanline} />

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>◈</span>
            <div>
              <div style={styles.logoTitle}>QA AI ASSISTANT</div>
              <div style={styles.logoSub}>Powered by AI · v1.0.0</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={{
              ...styles.keyBadge,
              ...(hasApiKey ? styles.keyBadgeActive : {})
            }}>
              <span style={{
                ...styles.keyBadgeDot,
                background: hasApiKey ? 'var(--green)' : 'var(--text-dim)'
              }} />
              {hasApiKey ? 'GPT-4o ACTIVE' : 'MOCK MODE'}
            </div>
            <button
              style={styles.settingsBtn}
              onClick={() => setShowSettings(true)}
            >
              ⚙ SETTINGS
            </button>
            <div style={styles.headerMeta}>
              <span style={styles.statusDot} />
              <span style={styles.statusText}>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTag}>STEP 01</span>
                <h2 style={styles.cardTitle}>Define Requirement</h2>
              </div>
              <RequirementInput onSubmit={handleGenerate} loading={loading} />
            </div>
            <div style={styles.infoPanel}>
              <div style={styles.infoPanelTitle}>PIPELINE STAGES</div>
              {[
                ['◈', 'QA Analyst',   'Generates raw test cases'],
                ['◉', 'QA Lead',      'Reviews and improves cases'],
                ['◆', 'QA Estimator', 'Estimates effort and risks'],
                ['◀', 'QA Engineer',  'Writes Selenium automation'],
              ].map(([icon, name, desc]) => (
                <div key={name} style={styles.infoRow}>
                  <span style={styles.infoIcon}>{icon}</span>
                  <div>
                    <div style={styles.infoName}>{name}</div>
                    <div style={styles.infoDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightCol}>
            <div style={styles.card}>
              {error && (
                <div style={styles.errorBanner}>
                  <span style={styles.errorIcon}>⚠</span>
                  <div>
                    <div style={styles.errorTitle}>Pipeline Error</div>
                    <div style={styles.errorMsg}>{error}</div>
                  </div>
                </div>
              )}
              {loading && <LoadingState currentStep={currentStep} />}
              {!loading && data && (
                <div style={styles.resultWrap}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTag}>OUTPUT</span>
                    <h2 style={styles.cardTitle}>QA Pipeline Results</h2>
                  </div>
                  <Tabs active={activeTab} onChange={setActiveTab} hasData={!!data} />
                  <div style={styles.tabContent}>
                    <ResultViewer activeTab={activeTab} data={data} />
                  </div>
                </div>
              )}
              {!loading && !data && !error && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyGrid} />
                  <div style={styles.emptyInner}>
                    <span style={styles.emptyIcon}>◈</span>
                    <p style={styles.emptyText}>Results will appear here</p>
                    <p style={styles.emptySubtext}>Paste a requirement and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <span>QA AI ASSISTANT · FastAPI + React</span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span>{hasApiKey ? 'OpenAI GPT-4o' : 'Mock Mode — Add API key in Settings'}</span>
      </footer>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  scanline: {
    position: 'fixed',
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(transparent, rgba(245,166,35,0.08), transparent)',
    animation: 'scanline 8s linear infinite',
    pointerEvents: 'none',
    zIndex: 999,
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  headerInner: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 24px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoIcon: {
    fontSize: '1.6rem',
    color: 'var(--amber)',
  },
  logoTitle: {
    fontFamily: 'var(--sans)',
    fontWeight: 800,
    fontSize: '0.95rem',
    letterSpacing: '0.12em',
    color: 'var(--text-head)',
  },
  logoSub: {
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    color: 'var(--text-dim)',
    letterSpacing: '0.06em',
    marginTop: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  keyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 4,
    border: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.08em',
    color: 'var(--text-dim)',
  },
  keyBadgeActive: {
    border: '1px solid rgba(61,255,160,0.3)',
    color: 'var(--green)',
    background: 'rgba(61,255,160,0.06)',
  },
  keyBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite',
  },
  settingsBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite',
  },
  statusText: {
    fontFamily: 'var(--mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: 'var(--green)',
  },
  main: {
    flex: 1,
    padding: '28px 24px',
  },
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: 20,
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'sticky',
    top: 88,
  },
  rightCol: {
    minHeight: 500,
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTag: {
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.14em',
    color: 'var(--amber)',
    display: 'block',
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'var(--sans)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-head)',
  },
  infoPanel: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  infoPanelTitle: {
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.12em',
    color: 'var(--text-dim)',
    marginBottom: 4,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIcon: {
    color: 'var(--amber)',
    fontSize: '0.8rem',
    marginTop: 2,
    flexShrink: 0,
  },
  infoName: {
    fontFamily: 'var(--sans)',
    fontWeight: 600,
    fontSize: '0.78rem',
    color: 'var(--text-head)',
  },
  infoDesc: {
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    color: 'var(--text-dim)',
    marginTop: 1,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '16px 18px',
    background: 'rgba(255,77,106,0.08)',
    border: '1px solid rgba(255,77,106,0.3)',
    borderRadius: 'var(--radius)',
    marginBottom: 20,
  },
  errorIcon: {
    color: 'var(--red)',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  errorTitle: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: 'var(--red)',
    marginBottom: 4,
  },
  errorMsg: {
    fontFamily: 'var(--mono)',
    fontSize: '0.75rem',
    color: 'var(--text)',
    lineHeight: 1.6,
  },
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  tabContent: {
    paddingTop: 4,
  },
  emptyState: {
    position: 'relative',
    minHeight: 360,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
  },
  emptyGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    opacity: 0.4,
  },
  emptyInner: {
    position: 'relative',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: '2.5rem',
    color: 'var(--border2)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  emptyText: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-dim)',
  },
  emptySubtext: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    opacity: 0.6,
  },
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'var(--mono)',
    fontSize: '0.65rem',
    color: 'var(--text-dim)',
    letterSpacing: '0.06em',
  },
}
