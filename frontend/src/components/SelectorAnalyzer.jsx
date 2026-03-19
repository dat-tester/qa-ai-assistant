import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SelectorAnalyzer() {
  const [html, setHtml] = useState('')
  const [pageName, setPageName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!html.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const openaiKey = localStorage.getItem('openai_api_key') || ''
      const res = await fetch(`${API_URL}/analyze-selectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_content: html,
          page_name: pageName || 'Page',
          openai_key: openaiKey,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error: ${res.status}`)
      }
      const data = await res.json()
      setResult(data.selectors)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setHtml('')
    setPageName('')
    setResult(null)
    setError(null)
  }

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>QA SELECTOR ANALYZER</span>
          <h2 style={styles.title}>Extract Page Selectors</h2>
          <p style={styles.subtitle}>
            Paste HTML source code → AI extracts all usable selectors for automation
          </p>
        </div>
      </div>

      <div style={styles.divider} />

      {/* How to use */}
      <div style={styles.howto}>
        <span style={styles.howtoIcon}>💡</span>
        <div style={styles.howtoSteps}>
          <strong style={{ color: 'var(--amber)', fontFamily: 'var(--sans)', fontSize: '0.78rem' }}>
            Cách lấy HTML:
          </strong>
          <span style={styles.howtoText}>
            Mở trang web → bấm <kbd style={styles.kbd}>F12</kbd> → tab Elements →
            click phải vào thẻ &lt;body&gt; → Copy → Copy outerHTML → Paste vào đây
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div style={styles.inputSection}>
        {/* Page name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <span style={styles.labelDot} />
            PAGE / FEATURE NAME (tuỳ chọn)
          </label>
          <input
            type="text"
            value={pageName}
            onChange={e => setPageName(e.target.value)}
            placeholder="VD: Login Page, Dashboard, Checkout..."
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* HTML input */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>
              <span style={styles.labelDot} />
              HTML SOURCE CODE
            </label>
            <span style={styles.charCount}>{html.length} chars</span>
          </div>
          <div style={styles.textareaWrap}>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              placeholder={'Paste HTML source code here...\n\nVí dụ:\n<form id="login-form">\n  <input id="email" type="email" name="email" />\n  <input id="password" type="password" />\n  <button id="login-btn" type="submit">Login</button>\n</form>'}
              style={styles.textarea}
              disabled={loading}
              spellCheck={false}
            />
            <div style={styles.corner} />
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button
            style={{
              ...styles.analyzeBtn,
              ...(loading || !html.trim() ? styles.btnDisabled : {})
            }}
            onClick={handleAnalyze}
            disabled={loading || !html.trim()}
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                ANALYZING...
              </>
            ) : (
              <>
                <span>⚡</span>
                ANALYZE SELECTORS
              </>
            )}
          </button>
          {(html || result) && (
            <button style={styles.clearBtn} onClick={handleClear} disabled={loading}>
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          <span style={{ color: 'var(--red)', fontSize: '1.1rem' }}>⚠</span>
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--red)', marginBottom: 4 }}>
              Analysis Error
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text)' }}>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.loadingGrid} />
          <div style={styles.loadingInner}>
            <div style={styles.loadingSpinnerWrap}>
              <div style={styles.spinnerOuter} />
              <div style={styles.spinnerInner} />
              <span style={{ fontSize: '1.2rem', color: 'var(--cyan)' }}>⚡</span>
            </div>
            <p style={styles.loadingText}>Scanning HTML structure...</p>
            <p style={styles.loadingSubtext}>AI is extracting all selectors</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={styles.resultWrap}>
          <div style={styles.resultHeader}>
            <div style={styles.resultTitle}>
              <span style={{ color: 'var(--cyan)', fontSize: '1rem' }}>⚡</span>
              Selector Analysis Result
            </div>
            <button
              style={{
                ...styles.copyBtn,
                ...(copied ? styles.copyBtnSuccess : {})
              }}
              onClick={handleCopy}
            >
              {copied ? '✓ COPIED' : '⎘ COPY ALL'}
            </button>
          </div>
          <div style={styles.divider} />
          <pre style={styles.resultCode}>{result}</pre>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    animation: 'fadeUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tag: {
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.14em',
    color: 'var(--cyan)',
    display: 'block',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'var(--sans)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-head)',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, var(--cyan-dim), transparent)',
  },
  howto: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '12px 16px',
    background: 'rgba(61,214,245,0.05)',
    border: '1px solid var(--cyan-dim)',
    borderRadius: 6,
  },
  howtoIcon: {
    fontSize: '1rem',
    flexShrink: 0,
    marginTop: 1,
  },
  howtoSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  howtoText: {
    fontFamily: 'var(--mono)',
    fontSize: '0.74rem',
    color: 'var(--text)',
    lineHeight: 1.7,
  },
  kbd: {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    borderRadius: 3,
    padding: '1px 5px',
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    color: 'var(--amber)',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'var(--sans)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--cyan)',
    display: 'inline-block',
  },
  charCount: {
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
  },
  input: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '0.82rem',
    padding: '10px 14px',
    outline: 'none',
  },
  textareaWrap: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: 200,
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '0.78rem',
    lineHeight: 1.6,
    padding: '14px 18px',
    resize: 'vertical',
    outline: 'none',
    display: 'block',
  },
  corner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderBottom: '2px solid var(--cyan)',
    borderRight: '2px solid var(--cyan)',
    borderBottomRightRadius: 6,
    pointerEvents: 'none',
  },
  btnRow: {
    display: 'flex',
    gap: 10,
  },
  analyzeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--cyan)',
    color: '#0d0f14',
    border: 'none',
    borderRadius: 6,
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
  clearBtn: {
    background: 'none',
    border: '1px solid var(--border2)',
    color: 'var(--text-dim)',
    borderRadius: 6,
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    padding: '10px 18px',
    cursor: 'pointer',
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
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '16px 18px',
    background: 'rgba(255,77,106,0.08)',
    border: '1px solid rgba(255,77,106,0.3)',
    borderRadius: 6,
  },
  loadingBox: {
    position: 'relative',
    minHeight: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  loadingGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.5,
  },
  loadingInner: {
    position: 'relative',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinnerWrap: {
    position: 'relative',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOuter: {
    position: 'absolute',
    inset: 0,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--cyan)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    inset: 10,
    border: '1px solid var(--border)',
    borderBottomColor: 'var(--amber)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite reverse',
  },
  loadingText: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-head)',
  },
  loadingSubtext: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
  },
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    animation: 'fadeUp 0.3s ease-out',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-head)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  copyBtn: {
    background: 'none',
    border: '1px solid var(--border2)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  copyBtnSuccess: {
    borderColor: 'var(--green)',
    color: 'var(--green)',
    background: 'rgba(61,255,160,0.06)',
  },
  resultCode: {
    background: '#080a0f',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '20px',
    fontFamily: 'var(--mono)',
    fontSize: '0.78rem',
    lineHeight: 1.7,
    color: '#a8d8e8',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}
