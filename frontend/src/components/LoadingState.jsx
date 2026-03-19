const STEPS = [
  { id: 'analyst',    label: 'QA Analyst',    task: 'Generating test cases...' },
  { id: 'lead',       label: 'QA Lead',        task: 'Reviewing and improving...' },
  { id: 'estimation', label: 'QA Estimator',   task: 'Estimating effort...' },
  { id: 'automation', label: 'QA Automation',  task: 'Writing Selenium code...' },
]

export default function LoadingState({ currentStep }) {
  const stepIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div style={styles.wrap}>
      {/* Animated grid background */}
      <div style={styles.grid} />

      <div style={styles.inner}>
        {/* Big spinner */}
        <div style={styles.spinnerWrap}>
          <div style={styles.spinnerOuter} />
          <div style={styles.spinnerInner} />
          <span style={styles.spinnerIcon}>◈</span>
        </div>

        <h3 style={styles.headline}>Running QA Pipeline</h3>
        <p style={styles.subline}>Processing your requirement through 4 specialist agents</p>

        {/* Steps */}
        <div style={styles.steps}>
          {STEPS.map((step, i) => {
            const done = stepIndex === -1 ? true : i < stepIndex
            const active = i === stepIndex
            const pending = stepIndex !== -1 && i > stepIndex

            return (
              <div key={step.id} style={{
                ...styles.step,
                ...(active ? styles.stepActive : {}),
                ...(done ? styles.stepDone : {}),
                ...(pending ? styles.stepPending : {}),
              }}>
                <div style={{
                  ...styles.stepDot,
                  ...(active ? styles.stepDotActive : {}),
                  ...(done ? styles.stepDotDone : {}),
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={styles.stepText}>
                  <span style={styles.stepLabel}>{step.label}</span>
                  {active && <span style={styles.stepTask}>{step.task}</span>}
                </div>
                {active && <span style={styles.pulseDot} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'relative',
    minHeight: 360,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.5,
  },
  inner: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '40px',
    textAlign: 'center',
  },
  spinnerWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOuter: {
    position: 'absolute',
    inset: 0,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--amber)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    inset: 10,
    border: '1px solid var(--border)',
    borderBottomColor: 'var(--cyan)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite reverse',
  },
  spinnerIcon: {
    fontSize: '1.4rem',
    color: 'var(--amber)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  headline: {
    fontFamily: 'var(--sans)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-head)',
  },
  subline: {
    fontFamily: 'var(--mono)',
    fontSize: '0.75rem',
    color: 'var(--text-dim)',
    letterSpacing: '0.04em',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'left',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg2)',
    transition: 'all 0.2s',
  },
  stepActive: {
    border: '1px solid var(--amber-dim)',
    background: 'rgba(245,166,35,0.06)',
  },
  stepDone: {
    border: '1px solid var(--border)',
    opacity: 0.6,
  },
  stepPending: {
    opacity: 0.3,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--sans)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-dim)',
    flexShrink: 0,
  },
  stepDotActive: {
    background: 'var(--amber)',
    border: 'none',
    color: '#0d0f14',
    animation: 'pulse 1s ease-in-out infinite',
  },
  stepDotDone: {
    background: 'rgba(61,255,160,0.15)',
    border: '1px solid var(--green)',
    color: 'var(--green)',
  },
  stepText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
  },
  stepLabel: {
    fontFamily: 'var(--sans)',
    fontWeight: 600,
    fontSize: '0.8rem',
    color: 'var(--text-head)',
  },
  stepTask: {
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    color: 'var(--amber)',
    letterSpacing: '0.03em',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--amber)',
    animation: 'pulse 0.8s ease-in-out infinite',
    flexShrink: 0,
  },
}
