import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Step configs ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'analyst',    num: '01', label: 'QA Analyst',    sub: 'Generating test cases',     color: 'var(--amber)', auto: true },
  { id: 'lead',       num: '02', label: 'QA Lead',        sub: 'Reviewing test cases',      color: 'var(--amber)', auto: true },
  { id: 'estimation', num: '03', label: 'QA Estimator',   sub: 'Effort estimation',         color: 'var(--amber)', auto: false },
  { id: 'selector',   num: '04', label: 'QA Selector',    sub: 'Analyzing HTML selectors',  color: 'var(--cyan)',  auto: false },
  { id: 'automation', num: '05', label: 'QA Engineer',    sub: 'Writing Selenium code',     color: 'var(--amber)', auto: false },
  { id: 'playwright', num: '06', label: 'QA Playwright',  sub: 'Writing Playwright code',   color: '#a78bfa',      auto: false },
]

// ── Code display ─────────────────────────────────────────────────────────────
function CodeBlock({ content, color }) {
  const [copied, setCopied] = useState(false)
  const code = (content || '').replace(/^```[\w]*\n?/, '').replace(/```$/, '').trim()
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleCopy} style={styles.copyBtn}>
        {copied ? '✓ COPIED' : '⎘ COPY'}
      </button>
      <pre style={{ ...styles.codeBlock, color: color || '#a8d8a8' }}>{code}</pre>
    </div>
  )
}

// ── Table display ─────────────────────────────────────────────────────────────
function TableView({ content }) {
  if (!content) return null
  const lines = content.split('\n').filter(l => l.trim().startsWith('|'))
  if (lines.length < 2) return <pre style={{ color: 'var(--text)', fontSize: '0.8rem', lineHeight: 1.7 }}>{content}</pre>
  const parseRow = l => l.split('|').slice(1, -1).map(c => c.trim())
  const headers  = parseRow(lines[0])
  const rows     = lines.slice(2).map(parseRow).filter(r => r.length === headers.length)
  const priCol   = headers.findIndex(h => h.toLowerCase() === 'priority')
  const priColor = v => v?.toLowerCase() === 'high' ? '#ff4d6a' : v?.toLowerCase() === 'medium' ? '#f5a623' : '#3dd6f5'

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={styles.tr}>
              {row.map((cell, ci) => (
                <td key={ci} style={styles.td}>
                  {ci === priCol ? (
                    <span style={{ ...styles.badge, color: priColor(cell), border: `1px solid ${priColor(cell)}`, background: `${priColor(cell)}18` }}>
                      {cell}
                    </span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Estimation display ────────────────────────────────────────────────────────
function EstimationView({ content }) {
  if (!content) return null
  const lines = content.split('\n')
  const els = []
  let tableLines = [], inTable = false

  const flushTable = key => {
    if (tableLines.length < 2) return
    const headers = tableLines[0].split('|').slice(1, -1).map(c => c.trim())
    const rows    = tableLines.slice(2).map(l => l.split('|').slice(1, -1).map(c => c.trim()))
    els.push(
      <div key={key} style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={styles.table}>
          <thead><tr>{headers.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri} style={styles.tr}>{r.map((c, ci) => <td key={ci} style={styles.td} dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />)}</tr>)}</tbody>
        </table>
      </div>
    )
    tableLines = []
  }

  lines.forEach((line, i) => {
    if (line.trim().startsWith('|')) { inTable = true; tableLines.push(line); return }
    if (inTable) { flushTable(`t${i}`); inTable = false }
    if (line.startsWith('### ')) els.push(<h3 key={i} style={styles.estH3}>{line.replace('### ', '')}</h3>)
    else if (line.startsWith('- ')) els.push(<div key={i} style={styles.estLi} dangerouslySetInnerHTML={{ __html: '▸ ' + line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--amber)">$1</strong>') }} />)
    else if (line.trim()) els.push(<p key={i} style={styles.estP} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--amber)">$1</strong>') }} />)
  })
  if (inTable) flushTable('tend')
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{els}</div>
}

// ── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ step, status, result, onStart, canStart, missingDeps }) {
  const isAuto    = step.auto
  const isDone    = status === 'done'
  const isRunning = status === 'running'
  const isIdle    = status === 'idle'

  const renderResult = () => {
    if (!result) return null
    if (step.id === 'analyst' || step.id === 'lead') return <TableView content={result} />
    if (step.id === 'estimation') return <EstimationView content={result} />
    if (step.id === 'selector')   return <CodeBlock content={result} color="#a8d8e8" />
    if (step.id === 'automation') return <CodeBlock content={result} color="#a8d8a8" />
    if (step.id === 'playwright') return <CodeBlock content={result} color="#c4b5fd" />
    return null
  }

  return (
    <div style={{
      ...styles.stepCard,
      borderColor: isDone ? `${step.color}60` : isRunning ? step.color : 'var(--border)',
      background:  isRunning ? `${step.color}06` : 'var(--bg2)',
    }}>
      {/* Header */}
      <div style={styles.stepHeader}>
        <div style={styles.stepLeft}>
          <div style={{
            ...styles.stepNumBadge,
            background: isDone ? `${step.color}20` : isRunning ? step.color : 'var(--bg3)',
            color:      isDone || isRunning ? (isRunning ? '#0d0f14' : step.color) : 'var(--text-dim)',
            border:     `1px solid ${isDone ? step.color + '60' : isRunning ? step.color : 'var(--border)'}`,
          }}>
            {isDone ? '✓' : step.num}
          </div>
          <div>
            <div style={{ ...styles.stepName, color: isDone || isRunning ? step.color : 'var(--text-dim)' }}>
              {step.label}
              {isAuto && <span style={styles.autoBadge}>AUTO</span>}
            </div>
            <div style={styles.stepSub}>{step.sub}</div>
          </div>
        </div>

        {/* Action */}
        <div style={styles.stepRight}>
          {isRunning && (
            <div style={styles.runningBadge}>
              <span style={{ ...styles.runningDot, background: step.color }} />
              <span style={{ color: step.color, fontSize: '0.7rem', fontFamily: 'var(--mono)' }}>RUNNING</span>
            </div>
          )}
          {isDone && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: step.color }}>
              ✓ DONE
            </span>
          )}
          {isIdle && !isAuto && (
            <button
              style={{
                ...styles.startBtn,
                background: canStart ? step.color : 'var(--bg3)',
                color:      canStart ? '#0d0f14' : 'var(--text-dim)',
                cursor:     canStart ? 'pointer' : 'not-allowed',
                opacity:    canStart ? 1 : 0.5,
                borderColor: canStart ? step.color : 'var(--border)',
              }}
              onClick={onStart}
              disabled={!canStart}
              title={missingDeps ? `Cần hoàn thành: ${missingDeps}` : ''}
            >
              ▶ START
            </button>
          )}
        </div>
      </div>

      {/* Missing deps warning */}
      {isIdle && !isAuto && !canStart && missingDeps && (
        <div style={styles.depWarning}>
          ⚠ Cần hoàn thành trước: <strong style={{ color: 'var(--amber)' }}>{missingDeps}</strong>
        </div>
      )}

      {/* Result */}
      {isDone && result && (
        <div style={styles.resultBox}>
          {renderResult()}
        </div>
      )}
    </div>
  )
}

// ── Main Pipeline UI ──────────────────────────────────────────────────────────
export default function Pipeline() {
  const [requirement, setRequirement] = useState('')
  const [url, setUrl]                 = useState('')
  const [html, setHtml]               = useState('')
  const [pageName, setPageName]       = useState('')
  const [started, setStarted]         = useState(false)

  // Per-step state
  const [statuses, setStatuses] = useState({
    analyst: 'idle', lead: 'idle', estimation: 'idle',
    selector: 'idle', automation: 'idle', playwright: 'idle',
  })
  const [results, setResults] = useState({
    analyst: null, lead: null, estimation: null,
    selector: null, automation: null, playwright: null,
  })
  const [error, setError] = useState(null)

  const openaiKey = () => localStorage.getItem('openai_api_key') || ''

  const setStatus = (id, s) => setStatuses(p => ({ ...p, [id]: s }))
  const setResult = (id, r) => setResults(p => ({ ...p, [id]: r }))

  // ── Auto-run Analyst + Lead ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!requirement.trim()) return
    setStarted(true)
    setError(null)
    setResults({ analyst: null, lead: null, estimation: null, selector: null, automation: null, playwright: null })
    setStatuses({ analyst: 'running', lead: 'idle', estimation: 'idle', selector: 'idle', automation: 'idle', playwright: 'idle' })

    try {
      const res = await fetch(`${API_URL}/step/analyst-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, url, openai_key: openaiKey() }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Error')
      const data = await res.json()
      setResult('analyst', data.analyst)
      setResult('lead', data.lead)
      setStatus('analyst', 'done')
      setStatus('lead', 'done')
    } catch (e) {
      setError(e.message)
      setStatus('analyst', 'idle')
    }
  }

  // ── Manual steps ────────────────────────────────────────────────────────────
  const startStep = async (stepId) => {
    setStatus(stepId, 'running')
    setError(null)
    try {
      let res, data

      if (stepId === 'estimation') {
        res = await fetch(`${API_URL}/step/estimator`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement, lead_output: results.lead, openai_key: openaiKey() }),
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Error')
        setResult('estimation', data.estimation)
      }

      else if (stepId === 'selector') {
        res = await fetch(`${API_URL}/step/selector`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html_content: html, url, page_name: pageName || 'Page', openai_key: openaiKey() }),
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Error')
        setResult('selector', data.selector)
      }

      else if (stepId === 'automation') {
        res = await fetch(`${API_URL}/step/engineer`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement, url, lead_output: results.lead, selector_output: results.selector, openai_key: openaiKey() }),
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Error')
        setResult('automation', data.automation)
      }

      else if (stepId === 'playwright') {
        res = await fetch(`${API_URL}/step/playwright`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirement, url, lead_output: results.lead, selector_output: results.selector, openai_key: openaiKey() }),
        })
        data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Error')
        setResult('playwright', data.playwright)
      }

      setStatus(stepId, 'done')
    } catch (e) {
      setError(e.message)
      setStatus(stepId, 'idle')
    }
  }

  // ── Can start checks ────────────────────────────────────────────────────────
  const canStart = {
    estimation: statuses.lead === 'done',
    selector:   html.trim().length > 0,
    automation: statuses.lead === 'done' && statuses.selector === 'done',
    playwright: statuses.lead === 'done' && statuses.selector === 'done',
  }

  const missingDeps = {
    estimation: statuses.lead !== 'done' ? 'QA Lead' : null,
    selector:   !html.trim() ? 'Page HTML input' : null,
    automation: statuses.lead !== 'done' ? 'QA Lead' : statuses.selector !== 'done' ? 'QA Selector' : null,
    playwright: statuses.lead !== 'done' ? 'QA Lead' : statuses.selector !== 'done' ? 'QA Selector' : null,
  }

  const canGenerate = requirement.trim().length > 0 && statuses.analyst === 'idle'
  const isAutoRunning = statuses.analyst === 'running'

  return (
    <div style={styles.wrap}>

      {/* ── Input Section ── */}
      <div style={styles.inputCard}>
        <div style={styles.inputHeader}>
          <span style={styles.inputTag}>PIPELINE INPUT</span>
          <button
            style={styles.exampleBtn}
            onClick={() => {
              setRequirement('User can login with email and password.\n- Show error if wrong password\n- Lock account after 5 failed attempts\n- Remember login session')
              setUrl('https://example.com/login')
              setPageName('Login Page')
              setHtml('<form id="login-form">\n  <input id="email" type="email" />\n  <input id="password" type="password" />\n  <input id="remember-me" type="checkbox" />\n  <button id="login-btn" type="submit">Login</button>\n  <div data-testid="error-message"></div>\n  <div data-testid="lock-message"></div>\n</form>')
            }}
          >
            load example
          </button>
        </div>

        <div style={styles.inputGrid}>
          {/* Requirement */}
          <div style={{ ...styles.inputField, gridColumn: '1 / -1' }}>
            <label style={styles.inputLabel}>
              <span style={styles.inputNum}>01</span> REQUIREMENT <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <textarea
              value={requirement}
              onChange={e => setRequirement(e.target.value)}
              placeholder="Mô tả tính năng cần test..."
              style={styles.textarea}
              rows={4}
              disabled={started}
            />
          </div>

          {/* URL */}
          <div style={styles.inputField}>
            <label style={styles.inputLabel}><span style={styles.inputNum}>02</span> TARGET URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/login"
              style={styles.input}
              disabled={started}
            />
          </div>

          {/* Page name */}
          <div style={styles.inputField}>
            <label style={styles.inputLabel}><span style={styles.inputNum}>03</span> PAGE NAME</label>
            <input
              type="text"
              value={pageName}
              onChange={e => setPageName(e.target.value)}
              placeholder="VD: Login Page"
              style={styles.input}
              disabled={started}
            />
          </div>

          {/* HTML */}
          <div style={{ ...styles.inputField, gridColumn: '1 / -1' }}>
            <label style={styles.inputLabel}>
              <span style={styles.inputNum}>04</span> PAGE HTML
              <span style={styles.inputHint}>· F12 → Elements → &lt;body&gt; → Copy outerHTML</span>
            </label>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              placeholder={'<form id="login-form">\n  <input id="email" />\n  <button id="login-btn">Login</button>\n</form>'}
              style={{ ...styles.textarea, color: '#a8d8e8', minHeight: 100 }}
              rows={4}
            />
            {html && <span style={styles.charCount}>{html.length} chars</span>}
          </div>
        </div>

        {/* Generate button */}
        {!started ? (
          <button
            style={{ ...styles.generateBtn, ...(canGenerate ? {} : styles.generateBtnDisabled) }}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            ▶ START QA PIPELINE
          </button>
        ) : (
          <button
            style={styles.resetBtn}
            onClick={() => {
              setStarted(false)
              setResults({ analyst: null, lead: null, estimation: null, selector: null, automation: null, playwright: null })
              setStatuses({ analyst: 'idle', lead: 'idle', estimation: 'idle', selector: 'idle', automation: 'idle', playwright: 'idle' })
              setError(null)
            }}
          >
            ↺ RESET PIPELINE
          </button>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={styles.errorBanner}>
          <span style={{ color: 'var(--red)', fontSize: '1.1rem' }}>⚠</span>
          <div>
            <div style={styles.errorTitle}>Error</div>
            <div style={styles.errorMsg}>{error}</div>
          </div>
        </div>
      )}

      {/* ── Steps ── */}
      {started && (
        <div style={styles.stepsWrap}>
          {STEPS.map(step => (
            <StepCard
              key={step.id}
              step={step}
              status={statuses[step.id]}
              result={results[step.id]}
              canStart={canStart[step.id]}
              missingDeps={missingDeps[step.id]}
              onStart={() => startStep(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },

  // Input card
  inputCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 },
  inputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  inputTag: { fontFamily: 'var(--mono)', fontSize: '0.62rem', letterSpacing: '0.14em', color: 'var(--amber)' },
  exampleBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.7rem', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 },
  inputField: { display: 'flex', flexDirection: 'column', gap: 6 },
  inputLabel: { fontFamily: 'var(--sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 },
  inputNum: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--amber)' },
  inputHint: { fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--cyan)', fontWeight: 400, opacity: 0.8 },
  textarea: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.78rem', lineHeight: 1.6, padding: '10px 14px', resize: 'vertical', outline: 'none', display: 'block' },
  input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.8rem', padding: '9px 14px', outline: 'none' },
  charCount: { fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-dim)', alignSelf: 'flex-end' },
  generateBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--amber)', color: '#0d0f14', border: 'none', borderRadius: 6, fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', padding: '12px', cursor: 'pointer' },
  generateBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  resetBtn: { width: '100%', background: 'none', border: '1px solid var(--border2)', color: 'var(--text-dim)', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: '0.75rem', padding: '10px', cursor: 'pointer' },

  // Error
  errorBanner: { display: 'flex', gap: 12, padding: '14px 18px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 6 },
  errorTitle: { fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--red)', marginBottom: 3 },
  errorMsg: { fontFamily: 'var(--mono)', fontSize: '0.74rem', color: 'var(--text)', lineHeight: 1.6 },

  // Steps
  stepsWrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  stepCard: { border: '1px solid', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s' },
  stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' },
  stepLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  stepNumBadge: { width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, transition: 'all 0.2s' },
  stepName: { fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' },
  autoBadge: { fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: '0.08em', padding: '1px 5px', background: 'rgba(245,166,35,0.15)', border: '1px solid var(--amber-dim)', borderRadius: 3, color: 'var(--amber)' },
  stepSub: { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 },
  stepRight: { display: 'flex', alignItems: 'center', gap: 10 },
  runningBadge: { display: 'flex', alignItems: 'center', gap: 6 },
  runningDot: { width: 7, height: 7, borderRadius: '50%', animation: 'pulse 0.8s ease-in-out infinite' },
  startBtn: { fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', padding: '7px 16px', border: '1px solid', borderRadius: 6, transition: 'all 0.15s' },
  depWarning: { padding: '8px 20px 10px', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', background: 'rgba(245,166,35,0.03)' },
  resultBox: { padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)', animation: 'fadeUp 0.3s ease-out' },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' },
  th: { background: 'var(--bg3)', color: 'var(--amber)', fontFamily: 'var(--sans)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid var(--amber-dim)', whiteSpace: 'nowrap' },
  td: { padding: '8px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', lineHeight: 1.6, fontFamily: 'var(--mono)', fontSize: '0.76rem', color: 'var(--text)' },
  tr: {},
  badge: { display: 'inline-block', padding: '2px 7px', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' },

  // Estimation
  estH3: { fontFamily: 'var(--sans)', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--amber)', margin: '16px 0 8px', paddingBottom: 6, borderBottom: '1px solid var(--border)' },
  estLi: { fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.7, paddingLeft: 12 },
  estP:  { fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.6 },

  // Code
  codeBlock: { background: '#080a0f', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: '0.76rem', lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre', margin: 0 },
  copyBtn: { position: 'absolute', top: 8, right: 8, background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.65rem', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', zIndex: 1 },
}
