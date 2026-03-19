import { useState } from 'react'

const EXAMPLE_REQ = `User can login with email and password.
- Show error if wrong password
- Lock account after 5 failed attempts
- Remember login session`

const EXAMPLE_URL = 'https://example.com/login'

const EXAMPLE_HTML = `<form id="login-form">
  <input id="email" type="email" name="email" placeholder="Email" />
  <input id="password" type="password" name="password" placeholder="Password" />
  <input id="remember-me" type="checkbox" name="remember" />
  <button id="login-btn" type="submit">Login</button>
  <a class="forgot" href="/forgot">Forgot password?</a>
  <div data-testid="error-message" class="error hidden"></div>
  <div data-testid="lock-message" class="lock hidden"></div>
</form>`

export default function RequirementInput({ onSubmit, loading }) {
  const [requirement, setRequirement] = useState('')
  const [url, setUrl]                 = useState('')
  const [html, setHtml]               = useState('')
  const [pageName, setPageName]       = useState('')

  const handleSubmit = () => {
    if (requirement.trim()) {
      onSubmit({ requirement, url, html_content: html, page_name: pageName || 'Page' })
    }
  }

  const handleExample = () => {
    setRequirement(EXAMPLE_REQ)
    setUrl(EXAMPLE_URL)
    setHtml(EXAMPLE_HTML)
    setPageName('Login Page')
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.labelRow}>
        <span style={styles.sectionLabel}>
          <span style={styles.labelDot} />
          PIPELINE INPUT
        </span>
        <button style={styles.exBtn} onClick={handleExample} disabled={loading}>
          load example
        </button>
      </div>

      {/* 01 Requirement */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>
          <span style={styles.fieldNum}>01</span>
          REQUIREMENT <span style={styles.required}>*</span>
        </label>
        <div style={styles.textareaWrap}>
          <textarea
            value={requirement}
            onChange={e => setRequirement(e.target.value)}
            placeholder={'Mô tả tính năng cần test...\n\nVD: User can login with email and password.\n- Show error if wrong password\n- Lock after 5 failed attempts'}
            disabled={loading}
            style={styles.textarea}
            spellCheck={false}
            rows={5}
          />
          <div style={{ ...styles.corner, borderColor: 'var(--amber)' }} />
        </div>
      </div>

      {/* 02 URL */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>
          <span style={styles.fieldNum}>02</span>
          TARGET URL <span style={styles.optional}>(tuỳ chọn)</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/login"
          disabled={loading}
          style={styles.input}
        />
      </div>

      {/* 03 Page Name */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>
          <span style={styles.fieldNum}>03</span>
          PAGE NAME <span style={styles.optional}>(tuỳ chọn)</span>
        </label>
        <input
          type="text"
          value={pageName}
          onChange={e => setPageName(e.target.value)}
          placeholder="VD: Login Page, Dashboard..."
          disabled={loading}
          style={styles.input}
        />
      </div>

      {/* 04 HTML */}
      <div style={styles.field}>
        <label style={styles.fieldLabel}>
          <span style={styles.fieldNum}>04</span>
          PAGE HTML <span style={styles.optional}>(để QA Selector phân tích)</span>
        </label>
        <div style={styles.howto}>
          <span>💡</span>
          <span style={styles.howtoText}>F12 → Elements → click phải &lt;body&gt; → Copy → Copy outerHTML</span>
        </div>
        <div style={styles.textareaWrap}>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder={'Paste HTML source code here...\n\nVD:\n<form id="login-form">\n  <input id="email" type="email" />\n  <button id="login-btn">Login</button>\n</form>'}
            disabled={loading}
            style={{ ...styles.textarea, minHeight: 120, color: '#a8d8e8' }}
            spellCheck={false}
            rows={4}
          />
          <div style={{ ...styles.corner, borderColor: 'var(--cyan)' }} />
        </div>
        {html && <span style={styles.charCount}>{html.length} chars</span>}
      </div>

      {/* Submit */}
      <button
        style={{ ...styles.btn, ...(loading || !requirement.trim() ? styles.btnDisabled : {}) }}
        onClick={handleSubmit}
        disabled={loading || !requirement.trim()}
      >
        {loading ? (
          <><span style={styles.spinner} />RUNNING PIPELINE...</>
        ) : (
          <><span>▶</span>GENERATE QA OUTPUT</>
        )}
      </button>

      {/* Flow */}
      <div style={styles.flow}>
        {[
          { label: 'Analyst',   color: 'var(--amber)' },
          { label: 'Lead',      color: 'var(--amber)' },
          { label: 'Estimator', color: 'var(--amber)' },
          { label: 'Selector',  color: 'var(--cyan)' },
          { label: 'Engineer',  color: 'var(--amber)' },
          { label: 'Playwright',color: '#a78bfa' },
        ].map((s, i, arr) => (
          <div key={s.label} style={styles.flowItem}>
            <div style={{ ...styles.flowDot, background: s.color }} />
            <span style={{ ...styles.flowLabel, color: s.color }}>{s.label}</span>
            {i < arr.length - 1 && <span style={styles.flowArrow}>→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontFamily: 'var(--sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 },
  labelDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', animation: 'pulse 2s ease-in-out infinite' },
  exBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.7rem', padding: '4px 10px', borderRadius: 'var(--radius)', cursor: 'pointer' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' },
  fieldNum: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--amber)' },
  required: { color: 'var(--red)', marginLeft: 2 },
  optional: { fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 400, opacity: 0.7, marginLeft: 4 },
  input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.8rem', padding: '9px 14px', outline: 'none' },
  textareaWrap: { position: 'relative' },
  textarea: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.78rem', lineHeight: 1.65, padding: '12px 16px', resize: 'vertical', outline: 'none', display: 'block' },
  corner: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderBottom: '2px solid', borderRight: '2px solid', borderBottomRightRadius: 6, pointerEvents: 'none' },
  howto: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(61,214,245,0.05)', border: '1px solid var(--cyan-dim)', borderRadius: 4 },
  howtoText: { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--cyan)' },
  charCount: { fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-dim)', alignSelf: 'flex-end' },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--amber)', color: '#0d0f14', border: 'none', borderRadius: 6, fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', padding: '11px 22px', cursor: 'pointer', width: '100%' },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  spinner: { width: 12, height: 12, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0d0f14', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  flow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6 },
  flowItem: { display: 'flex', alignItems: 'center', gap: 4 },
  flowDot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0 },
  flowLabel: { fontFamily: 'var(--mono)', fontSize: '0.62rem', fontWeight: 600 },
  flowArrow: { color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: 4 },
}
