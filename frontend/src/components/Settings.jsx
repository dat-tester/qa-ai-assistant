import { useState, useEffect } from 'react'

export default function Settings({ onClose }) {
  const [openaiKey, setOpenaiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const key = localStorage.getItem('openai_api_key') || ''
    setOpenaiKey(key)
  }, [])

  const handleSave = () => {
    localStorage.setItem('openai_api_key', openaiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('openai_api_key')
    setOpenaiKey('')
  }

  const maskedKey = openaiKey
    ? openaiKey.slice(0, 7) + '••••••••••••••••' + openaiKey.slice(-4)
    : ''

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.tag}>CONFIGURATION</span>
            <h2 style={styles.title}>API Settings</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.divider} />

        {/* OpenAI Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>◆</span>
            <div>
              <div style={styles.sectionTitle}>OpenAI API Key</div>
              <div style={styles.sectionDesc}>
                Dùng GPT-4o để generate kết quả thật. Nếu để trống sẽ dùng mock data.
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={styles.inputWrap}>
            <input
              type={show ? 'text' : 'password'}
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              style={styles.input}
              spellCheck={false}
            />
            <button
              style={styles.eyeBtn}
              onClick={() => setShow(!show)}
              title={show ? 'Ẩn' : 'Hiện'}
            >
              {show ? '🙈' : '👁'}
            </button>
          </div>

          {/* Status */}
          {openaiKey && (
            <div style={styles.keyStatus}>
              <span style={styles.keyDot} />
              <span style={styles.keyText}>{maskedKey}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={styles.btnRow}>
            <button
              style={{
                ...styles.saveBtn,
                ...(saved ? styles.saveBtnSuccess : {})
              }}
              onClick={handleSave}
            >
              {saved ? '✓ ĐÃ LƯU' : 'LƯU KEY'}
            </button>
            {openaiKey && (
              <button style={styles.clearBtn} onClick={handleClear}>
                XÓA KEY
              </button>
            )}
          </div>
        </div>

        <div style={styles.divider} />

        {/* Info */}
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>📋 Hướng dẫn lấy API Key</div>
          <ol style={styles.infoList}>
            <li>Vào <strong style={{color:'var(--amber)'}}>https://platform.openai.com/api-keys</strong></li>
            <li>Đăng nhập tài khoản OpenAI</li>
            <li>Bấm <strong style={{color:'var(--amber)'}}>Create new secret key</strong></li>
            <li>Copy key dạng <strong style={{color:'var(--amber)'}}>sk-...</strong> và dán vào ô trên</li>
          </ol>
          <div style={styles.costNote}>
            💰 Chi phí: GPT-4o ~$0.005/1000 tokens · Mỗi lần generate ~$0.02–0.05
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 520,
    animation: 'fadeUp 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 24px 20px',
  },
  tag: {
    fontFamily: 'var(--mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.14em',
    color: 'var(--amber)',
    display: 'block',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'var(--sans)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-head)',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '0.8rem',
    width: 32,
    height: 32,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '0 24px',
  },
  section: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionHeader: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  sectionIcon: {
    color: 'var(--amber)',
    fontSize: '1rem',
    marginTop: 2,
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-head)',
    marginBottom: 3,
  },
  sectionDesc: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    lineHeight: 1.6,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '0.82rem',
    padding: '10px 44px 10px 14px',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  },
  keyStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'rgba(61,255,160,0.06)',
    border: '1px solid rgba(61,255,160,0.2)',
    borderRadius: 6,
  },
  keyDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--green)',
    flexShrink: 0,
    animation: 'pulse 2s ease-in-out infinite',
  },
  keyText: {
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--green)',
    letterSpacing: '0.04em',
  },
  btnRow: {
    display: 'flex',
    gap: 10,
  },
  saveBtn: {
    background: 'var(--amber)',
    color: '#0d0f14',
    border: 'none',
    borderRadius: 6,
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    padding: '9px 20px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  saveBtnSuccess: {
    background: 'var(--green)',
  },
  clearBtn: {
    background: 'none',
    border: '1px solid rgba(255,77,106,0.4)',
    color: 'var(--red)',
    borderRadius: 6,
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    padding: '9px 20px',
    cursor: 'pointer',
  },
  infoBox: {
    margin: '0 24px 24px',
    padding: '16px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 6,
  },
  infoTitle: {
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    fontSize: '0.8rem',
    color: 'var(--text-head)',
    marginBottom: 10,
  },
  infoList: {
    fontFamily: 'var(--mono)',
    fontSize: '0.75rem',
    color: 'var(--text)',
    lineHeight: 1.8,
    paddingLeft: 18,
    marginBottom: 12,
  },
  costNote: {
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
    padding: '8px 12px',
    background: 'rgba(245,166,35,0.06)',
    border: '1px solid var(--amber-dim)',
    borderRadius: 4,
  },
}