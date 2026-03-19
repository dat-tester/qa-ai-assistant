const TABS = [
  { id: 'analyst',    label: 'Test Cases',       icon: '◈', sub: 'QA Analyst' },
  { id: 'lead',       label: 'Final Test Cases',  icon: '◉', sub: 'QA Lead' },
  { id: 'estimation', label: 'Estimation',         icon: '◆', sub: 'QA Estimator' },
  { id: 'automation', label: 'Automation Code',    icon: '◀', sub: 'QA Engineer' },
]

export default function Tabs({ active, onChange, hasData }) {
  return (
    <div style={styles.wrap}>
      {TABS.map((tab, i) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(isActive ? styles.tabActive : {}),
              ...(!hasData ? styles.tabDisabled : {}),
            }}
            onClick={() => hasData && onChange(tab.id)}
            disabled={!hasData}
          >
            <span style={{
              ...styles.tabIcon,
              ...(isActive ? styles.tabIconActive : {}),
            }}>
              {tab.icon}
            </span>
            <span style={styles.tabInner}>
              <span style={styles.tabLabel}>{tab.label}</span>
              <span style={styles.tabSub}>{tab.sub}</span>
            </span>
            {isActive && <span style={styles.activeBar} />}
            <span style={{
              ...styles.tabNum,
              ...(isActive ? styles.tabNumActive : {}),
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
    borderBottomColor: 'var(--amber)',
    background: 'rgba(245,166,35,0.04)',
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
  tabIconActive: {
    color: 'var(--amber)',
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
    background: 'var(--amber)',
  },
  tabNum: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: '0.6rem',
    opacity: 0.3,
    letterSpacing: '0.05em',
  },
  tabNumActive: {
    opacity: 0.7,
    color: 'var(--amber)',
  },
}
