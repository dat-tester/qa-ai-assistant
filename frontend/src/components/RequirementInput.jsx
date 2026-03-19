import { useState } from 'react'

const EXAMPLE = `User can login with email and password.
- Show error if wrong password
- Lock account after 5 failed attempts
- Remember login session`

export default function RequirementInput({ onSubmit, loading }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) onSubmit(value.trim())
  }

  const handleExample = () => setValue(EXAMPLE)

  return (
    <div style={styles.wrap}>
      {/* Label row */}
      <div style={styles.labelRow}>
        <span style={styles.label}>
          <span style={styles.labelDot} />
          REQUIREMENT INPUT
        </span>
        <button style={styles.exBtn} onClick={handleExample} disabled={loading}>
          load example
        </button>
      </div>

      {/* Textarea */}
      <div style={styles.textareaWrap}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={'Paste your feature requirement here...\n\nExample:\n  User can register with email and password.\n  - Email must be unique\n  - Password min 8 characters'}
          disabled={loading}
          style={styles.textarea}
          spellCheck={false}
        />
        <div style={styles.corner} />
      </div>

      {/* Footer row */}
      <div style={styles.footerRow}>
        <span style={styles.charCount}>
          {value.length > 0 ? `${value.length} chars` : '0 chars'}
        </span>
        <button
          style={{
            ...styles.btn,
            ...(loading || !value.trim() ? styles.btnDisabled : {}),
          }}
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <span style={styles.spinner} />
              GENERATING...
            </>
          ) : (
            <>
              <span style={styles.btnIcon}>▶</span>
              GENERATE QA OUTPUT
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: 'var(--sans)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--amber)',
    display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite',
  },
  exBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    padding: '4px 10px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  textareaWrap: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '180px',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '0.83rem',
    lineHeight: 1.7,
    padding: '16px 20px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s',
    display: 'block',
  },
  corner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderBottom: '2px solid var(--amber)',
    borderRight: '2px solid var(--amber)',
    borderBottomRightRadius: 'var(--radius)',
    pointerEvents: 'none',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--amber)',
    color: '#0d0f14',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    padding: '10px 22px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  btnIcon: {
    fontSize: '0.7rem',
  },
  spinner: {
    width: 12,
    height: 12,
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#0d0f14',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
}
