import { useState } from 'react'
import Pipeline from './components/Pipeline'
import Settings from './components/Settings'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const hasApiKey = !!localStorage.getItem('openai_api_key')

  return (
    <div style={styles.root}>
      <div style={styles.scanline} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>◈</span>
            <div>
              <div style={styles.logoTitle}>QA AI ASSISTANT</div>
              <div style={styles.logoSub}>Collaborative Pipeline · v3.0</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={{ ...styles.badge, ...(hasApiKey ? styles.badgeActive : {}) }}>
              <span style={{ ...styles.badgeDot, background: hasApiKey ? 'var(--green)' : 'var(--text-dim)' }} />
              {hasApiKey ? 'GPT-4o ACTIVE' : 'MOCK MODE'}
            </div>
            <button style={styles.settingsBtn} onClick={() => setShowSettings(true)}>
              ⚙ SETTINGS
            </button>
            <div style={styles.online}>
              <span style={styles.onlineDot} />
              <span style={styles.onlineText}>ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.container}>
          <Pipeline />
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>QA AI ASSISTANT v3.0</span>
        <span style={{ color: 'var(--border2)' }}>·</span>
        <span style={styles.flowText}>
          Analyst <span style={{ color: 'var(--amber)' }}>→</span> Lead <span style={{ color: 'var(--amber)' }}>→</span> Estimator <span style={{ color: 'var(--amber)' }}>→</span> Selector <span style={{ color: 'var(--cyan)' }}>→</span> Engineer <span style={{ color: 'var(--amber)' }}>→</span> <span style={{ color: '#a78bfa' }}>Playwright</span>
        </span>
      </footer>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' },
  scanline: { position: 'fixed', left: 0, right: 0, height: '2px', background: 'linear-gradient(transparent, rgba(245,166,35,0.08), transparent)', animation: 'scanline 8s linear infinite', pointerEvents: 'none', zIndex: 999 },
  header: { borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 14 },
  logoIcon: { fontSize: '1.6rem', color: 'var(--amber)' },
  logoTitle: { fontFamily: 'var(--sans)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.12em', color: 'var(--text-head)' },
  logoSub: { fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.05em', marginTop: 1 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  badge: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--text-dim)' },
  badgeActive: { border: '1px solid rgba(61,255,160,0.3)', color: 'var(--green)', background: 'rgba(61,255,160,0.06)' },
  badgeDot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' },
  settingsBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: 'var(--radius)', cursor: 'pointer' },
  online: { display: 'flex', alignItems: 'center', gap: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s ease-in-out infinite' },
  onlineText: { fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--green)' },
  main: { flex: 1, padding: '28px 24px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  footer: { borderTop: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.06em', flexWrap: 'wrap' },
  flowText: { color: 'var(--text-dim)' },
}
