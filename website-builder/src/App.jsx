import { useState } from 'react'
import { templates, getTemplateById, getDefaultContent } from './templates'
import { generateHtml } from './generateHtml'
import { requestAiSite } from './aiDesigner'

function Landing({ onStart }) {
  return (
    <main style={styles.landing}>
      <div style={styles.landingInner}>
        <h1 style={styles.landingTitle}>Make websites easily</h1>
        <p style={styles.landingTagline}>
          Pick a template, edit text and colors, preview live — then download your site. No code.
        </p>
        <button onClick={onStart} style={styles.cta}>
          Start building
        </button>
      </div>
    </main>
  )
}

function Builder({ onBack }) {
  const [step, setStep] = useState('pick') // 'pick' | 'edit'
  const [templateId, setTemplateId] = useState(null)
  const [content, setContent] = useState({})
  const [aiMessages, setAiMessages] = useState([
    { from: 'ai', text: 'Describe how you want your site to look and feel.' },
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const template = templateId ? getTemplateById(templateId) : null

  function pickTemplate(id) {
    const t = getTemplateById(id)
    setTemplateId(id)
    setContent(getDefaultContent(t))
    setStep('edit')
  }

  function updateField(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  async function handleAiSend(e) {
    e.preventDefault()
    const text = aiInput.trim()
    if (!text) return

    setAiMessages((prev) => [...prev, { from: 'user', text }])
    setAiInput('')
    setAiLoading(true)

    try {
      const result = await requestAiSite(text)
      setTemplateId(result.templateId)
      setContent(result.content)
      setStep('edit')
      setAiMessages((prev) => [
        ...prev,
        {
          from: 'ai',
          text:
            'I generated a starting layout for you. You can fine‑tune text and colors on the left.',
        },
      ])
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        { from: 'ai', text: 'Sorry, something went wrong while generating the site.' },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  function exportHtml() {
    const html = generateHtml(templateId, content)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-site.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const previewHtml = templateId ? generateHtml(templateId, content) : ''

  return (
    <div style={styles.builder}>
      <header style={styles.builderHeader}>
        <button type="button" onClick={step === 'edit' ? () => setStep('pick') : onBack} style={styles.backBtn}>
          ← Back
        </button>
        <span style={styles.builderTitle}>
          {step === 'pick' ? 'Choose a template' : template?.name}
        </span>
      </header>

      {step === 'pick' && (
        <section style={styles.templateGrid}>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickTemplate(t.id)}
              style={styles.templateCard}
            >
              <strong>{t.name}</strong>
              <span style={styles.templateDesc}>{t.description}</span>
            </button>
          ))}
        </section>
      )}

      {step === 'edit' && template && (
        <div style={styles.editLayout}>
          <aside style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Edit content</h3>
            {template.fields.map((f) => (
              <label key={f.key} style={styles.field}>
                <span>{f.label}</span>
                {f.type === 'color' ? (
                  <input
                    type="color"
                    value={content[f.key] ?? f.default}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    style={styles.colorInput}
                  />
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={content[f.key] ?? ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    rows={3}
                    style={styles.input}
                  />
                ) : (
                  <input
                    type="text"
                    value={content[f.key] ?? ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    style={styles.input}
                  />
                )}
              </label>
            ))}
            <button onClick={exportHtml} style={styles.exportBtn}>
              Download HTML
            </button>
          </aside>
          <section style={styles.previewSection}>
            <h3 style={styles.previewTitle}>Preview</h3>
            <iframe
              title="Preview"
              srcDoc={previewHtml}
              style={styles.previewFrame}
              sandbox="allow-same-origin"
            />
            <div style={styles.chat}>
              <h3 style={styles.chatTitle}>AI site expert</h3>
              <div style={styles.chatMessages}>
                {aiMessages.map((m, index) => (
                  <div
                    key={index}
                    style={m.from === 'ai' ? styles.chatBubbleAi : styles.chatBubbleUser}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAiSend} style={styles.chatForm}>
                <textarea
                  rows={2}
                  placeholder="Describe your dream site (style, sections, colors)..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  style={styles.chatInput}
                  disabled={aiLoading}
                />
                <button type="submit" style={styles.chatBtn} disabled={aiLoading}>
                  {aiLoading ? 'Thinking...' : 'Generate layout'}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'builder'

  return (
    <>
      {screen === 'landing' && <Landing onStart={() => setScreen('builder')} />}
      {screen === 'builder' && <Builder onBack={() => setScreen('landing')} />}
    </>
  )
}

const styles = {
  landing: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--bg)',
  },
  landingInner: {
    textAlign: 'center',
    maxWidth: '28rem',
  },
  landingTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  landingTagline: {
    color: 'var(--muted)',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  cta: {
    background: 'var(--accent)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
  },
  builder: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  builderHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  backBtn: {
    background: 'transparent',
    color: 'var(--muted)',
    padding: '0.5rem',
  },
  builderTitle: {
    fontWeight: 600,
    fontSize: '1.125rem',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
    padding: '1.5rem',
    maxWidth: '56rem',
    margin: '0 auto',
    width: '100%',
  },
  templateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '1.25rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
  },
  templateDesc: {
    fontSize: '0.875rem',
    color: 'var(--muted)',
    marginTop: '0.25rem',
  },
  editLayout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 0,
    minHeight: 0,
  },
  sidebar: {
    padding: '1.5rem',
    borderRight: '1px solid var(--border)',
    background: 'var(--surface)',
    overflowY: 'auto',
  },
  sidebarTitle: {
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  input: {
    padding: '0.5rem 0.75rem',
    width: '100%',
  },
  colorInput: {
    width: '100%',
    height: '40px',
    padding: '2px',
    cursor: 'pointer',
  },
  exportBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    padding: '1rem',
  },
  previewTitle: {
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--muted)',
    fontWeight: 600,
  },
  previewFrame: {
    flex: 1,
    minHeight: 0,
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: '#fff',
  },
  chat: {
    marginTop: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  chatTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    color: 'var(--muted)',
  },
  chatMessages: {
    padding: '0.5rem 0.75rem',
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.85rem',
  },
  chatBubbleAi: {
    alignSelf: 'flex-start',
    background: '#15151b',
    borderRadius: '10px',
    padding: '0.35rem 0.55rem',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '10px',
    padding: '0.35rem 0.55rem',
  },
  chatForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    padding: '0.5rem 0.75rem 0.75rem',
  },
  chatInput: {
    width: '100%',
    resize: 'vertical',
    padding: '0.4rem 0.5rem',
    fontSize: '0.85rem',
  },
  chatBtn: {
    alignSelf: 'flex-end',
    padding: '0.4rem 0.9rem',
    borderRadius: '999px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
}
