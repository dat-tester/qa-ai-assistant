const TABS = [
  { id: 'analyst',    label: 'Test Cases',        icon: '◈', sub: 'QA Analyst' },
  { id: 'lead',       label: 'Final Test Cases',   icon: '◉', sub: 'QA Lead' },
  { id: 'estimation', label: 'Estimation',         icon: '◆', sub: 'QA Estimator' },
  { id: 'automation', label: 'Selenium Code',      icon: '◀', sub: 'QA Engineer' },
  { id: 'playwright', label: 'Playwright Code',    icon: '▶', sub: 'QA Playwright' },
  { id: 'selector',   label: 'Selector Analyzer',  icon: '⚡', sub: 'QA Selector' },
]

export default function Tabs({ active, onChange, hasData }) {
  return (
    <div style={styles.wrap}>
      {TABS.map((tab, i) => {
        const isActive   = active === tab.id
        const isSelector = tab.id === 'selector'
        const isPlay     = tab.id === 'playwright'
        const disabled   = !hasData && !isSelector

        let accentColor = 'var(--amber)'
        if (isSelector) accentColor = 'var(--cyan)'
        if (isPlay)     accentColor = '#a78bfa'

        return (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(isActive ? { ...styles.tabActive, borderBottomColor: accentColor, background: `${accentColor}0a` } : {}),
              ...(disabled ? styles.tabDisabled : {}),
            }}
            onClick={() => !disabled && onChange(tab.id)}
            disabled={disabled}
          >
            <span style={{
              ...styles.tabIcon,
              ...(isActive ? { color: accentColor } : {}),
            }}>
              {tab.icon}
            </span>
            <span style={styles.tabInner}>
              <span style={styles.tabLabel}>{tab.label}</span>
              <span style={styles.tabSub}>{tab.sub}</span>
            </span>
            {isActive && <span style={{ ...styles.activeBar, background: accentColor }} />}
            <span style={{
              ...styles.tabNum,
              ...(isActive ? { opacity: 0.7, color: accentColor } : {}),
            }}>
              0{i + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    gap: '2px',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '14px 20px',
    cursor: 'pointer',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.78rem',
    transition: 'all 0.15s',
    position: 'relative',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tabActive: {
    color: 'var(--text-head)',
  },
  tabDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  tabIcon: {
    fontSize: '0.9rem',
    color: 'var(--text-dim)',
    transition: 'color 0.15s',
  },
  tabInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px',
  },
  tabLabel: {
    fontFamily: 'var(--sans)',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  tabSub: {
    fontSize: '0.65rem',
    letterSpacing: '0.06em',
    opacity: 0.6,
  },
  activeBar: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  tabNum: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: '0.6rem',
    opacity: 0.3,
    letterSpacing: '0.05em',
  },
}
