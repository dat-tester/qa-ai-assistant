import { useState } from 'react'
import SelectorAnalyzer from './SelectorAnalyzer'

// ── Markdown Table Parser ──────────────────────────────────────────────────────
function parseMarkdownTable(md) {
  if (!md) return null
  const lines = md.split('\n').filter(l => l.trim().startsWith('|'))
  if (lines.length < 2) return null
  const parseRow = line =>
    line.split('|').slice(1, -1).map(cell => cell.trim())
  const headers = parseRow(lines[0])
  const rows = lines.slice(2).map(parseRow).filter(r => r.length === headers.length)
  return { headers, rows }
}

// ── Priority Badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ value }) {
  const v = (value || '').toLowerCase()
  const color = v === 'high' ? '#ff4d6a' : v === 'medium' ? '#f5a623' : '#3dd6f5'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: '0.68rem',
      fontFamily: 'var(--sans)',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color,
      border: `1px solid ${color}`,
      background: `${color}18`,
    }}>
      {value}
    </span>
  )
}

// ── Table View ─────────────────────────────────────────────────────────────────
function TableView({ content }) {
  const table = parseMarkdownTable(content)
  if (!table) {
    return <pre style={{ color: 'var(--text)', fontSize: '0.82rem', lineHeight: 1.7 }}>{content}</pre>
  }
  const { headers, rows } = table
  const priorityCol = headers.findIndex(h => h.toLowerCase() === 'priority')
  return (
    <div className="md-table-wrap">
      <table>
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>
                  {ci === priorityCol
                    ? <PriorityBadge value={cell} />
                    : <span style={{ whiteSpace: ci === 0 ? 'nowrap' : 'normal' }}>{cell}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Estimation View ────────────────────────────────────────────────────────────
function EstimationView({ content }) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let inTable = false
  let tableLines = []

  const flushTable = (key) => {
    if (tableLines.length < 2) return
    const headers = tableLines[0].split('|').slice(1, -1).map(c => c.trim())
    const rows = tableLines.slice(2).map(l => l.split('|').slice(1, -1).map(c => c.trim()))
    elements.push(
      <div className="md-table-wrap" key={key}>
        <table>
          <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    <span dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableLines = []
  }

  lines.forEach((line, i) => {
    if (line.trim().startsWith('|')) {
      inTable = true
      tableLines.push(line)
      return
    } else if (inTable) {
      flushTable(`table-${i}`)
      inTable = false
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i}>{line.replace('### ', '')}</h3>)
    } else if (line.startsWith('- ')) {
      const text = line.replace('- ', '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      elements.push(
        <ul key={i} style={{ marginBottom: 4 }}>
          <li dangerouslySetInnerHTML={{ __html: text }} />
        </ul>
      )
    } else if (line.trim()) {
      const text = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: text }} />)
    }
  })
  if (inTable) flushTable('table-end')
  return (
    <div className="estimation-content" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {elements}
    </div>
  )
}

// ── Code View ──────────────────────────────────────────────────────────────────
function CodeView({ content }) {
  const code = content
    .replace(/^```[\w]*\n?/, '')
    .replace(/```$/, '')
    .trim()
  return <pre className="code-block">{code}</pre>
}

// ── Copy Button ────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      style={{
        ...styles.copyBtn,
        ...(copied ? styles.copyBtnSuccess : {}),
      }}
      onClick={handleCopy}
    >
      {copied ? '✓ COPIED' : '⎘ COPY'}
    </button>
  )
}

// ── Result Viewer ──────────────────────────────────────────────────────────────
export default function ResultViewer({ activeTab, data }) {
  // Selector tab — always available
  if (activeTab === 'selector') {
    return <SelectorAnalyzer />
  }

  if (!data) return null

  const tabConfig = {
    analyst: {
      title: 'QA Analyst Output',
      subtitle: 'Raw test cases generated from the requirement',
      render: <TableView content={data.analyst} />,
      content: data.analyst,
    },
    lead: {
      title: 'QA Lead — Final Test Cases',
      subtitle: 'Reviewed, deduplicated, and improved test suite',
      render: <TableView content={data.lead} />,
      content: data.lead,
    },
    estimation: {
      title: 'QA Estimator — Effort Report',
      subtitle: 'Complexity, time breakdown, risks and assumptions',
      render: <EstimationView content={data.estimation} />,
      content: data.estimation,
    },
    automation: {
      title: 'QA Automation Engineer',
      subtitle: 'Python · Pytest · Selenium · Page Object Model',
      render: <CodeView content={data.automation} />,
      content: data.automation,
    },
  }

  const tab = tabConfig[activeTab]
  if (!tab) return null

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{tab.title}</h2>
          <p style={styles.subtitle}>{tab.subtitle}</p>
        </div>
        <CopyButton text={tab.content} />
      </div>
      <div style={styles.divider} />
      <div style={styles.content}>{tab.render}</div>
    </div>
  )
}

const styles = {
  wrap: {
    animation: 'fadeUp 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'var(--sans)',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-head)',
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    letterSpacing: '0.04em',
  },
  copyBtn: {
    background: 'none',
    border: '1px solid var(--border2)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  copyBtnSuccess: {
    borderColor: 'var(--green)',
    color: 'var(--green)',
    background: 'rgba(61,255,160,0.06)',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, var(--amber-dim), transparent)',
  },
  content: {
    minHeight: 200,
  },
}
