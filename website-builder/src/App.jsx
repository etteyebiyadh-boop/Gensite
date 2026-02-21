import { useState, useMemo } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { templates, getTemplateById, getDefaultContent, searchTemplates, getCategories } from './templates'
import { generateHtml } from './generateHtml'
import { requestAiSite, getQuickSuggestions } from './aiDesigner'
import { createSite } from './lib/siteApi'
import Dashboard from './pages/Dashboard'

const TEMPLATES_PER_PAGE = 24

function PermissionModal({ show, siteName, onSiteNameChange, onConfirm, onCancel, loading }) {
  if (!show) return null
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Save to your dashboard</h3>
        <p style={styles.modalText}>
          We&apos;ll save your site and any photos you add so you can publish and manage your live site. You can edit everything in the dashboard and publish when ready.
        </p>
        <label style={styles.modalLabel}>
          Site name
          <input
            type="text"
            value={siteName}
            onChange={(e) => onSiteNameChange(e.target.value)}
            placeholder="My site"
            style={styles.modalInput}
          />
        </label>
        <div style={styles.modalActions}>
          <button type="button" onClick={onCancel} style={styles.modalBtnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} style={styles.modalBtnPrimary}>
            {loading ? 'Creating…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

const categories = getCategories()
const quickSuggestions = getQuickSuggestions()

function Builder({ onBack }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('pick') // 'pick' | 'edit'
  const [templateId, setTemplateId] = useState(null)
  const [content, setContent] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [aiMessages, setAiMessages] = useState([
    { from: 'ai', text: 'Describe how you want your site to look and feel, or pick one of the suggestions below. We have 1,000 templates across 20 types and 50 color themes.' },
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [siteName, setSiteName] = useState('My site')
  const [dashboardCreating, setDashboardCreating] = useState(false)

  const template = templateId ? getTemplateById(templateId) : null

  const filteredTemplates = useMemo(() => {
    return searchTemplates(searchQuery, categoryFilter)
  }, [searchQuery, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * TEMPLATES_PER_PAGE
    return filteredTemplates.slice(start, start + TEMPLATES_PER_PAGE)
  }, [filteredTemplates, currentPage])

  function pickTemplate(id) {
    const t = getTemplateById(id)
    setTemplateId(id)
    setContent(getDefaultContent(t))
    setStep('edit')
    setSiteName(t?.name?.split(' — ')[0] || 'My site')
    setShowPermissionModal(true)
  }

  async function handleOpenDashboard() {
    if (!templateId || !template) return
    setDashboardCreating(true)
    try {
      const data = await createSite({ name: siteName, templateId, content })
      navigate(`/site/${data.id}`)
    } catch (err) {
      setAiMessages((prev) => [...prev, { from: 'ai', text: 'Could not create dashboard. Try again.' }])
    } finally {
      setDashboardCreating(false)
    }
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
          text: result.suggestion || 'I generated a starting layout. Fine‑tune text and colors on the left.',
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
        <section style={styles.pickSection}>
          <div style={styles.toolbar}>
            <input
              type="search"
              placeholder="Search 1,000 templates..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              style={styles.searchInput}
            />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              style={styles.select}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <p style={styles.resultCount}>
            Showing {paginatedTemplates.length} of {filteredTemplates.length} templates
          </p>
          <div style={styles.templateGrid}>
            {paginatedTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTemplate(t.id)}
                style={{ ...styles.templateCard, borderLeft: `3px solid ${t.themeHex}` }}
              >
                <span style={styles.templateName}>{t.name}</span>
                <span style={styles.templateDesc}>{t.description}</span>
                <span style={styles.templateCategory}>{t.category}</span>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                style={styles.pageBtn}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
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
            <button onClick={() => setShowPermissionModal(true)} style={styles.dashboardBtn}>
              Open in dashboard
            </button>
            <p style={styles.dashboardHint}>Save to dashboard to add photos, publish, and manage your live site.</p>
            <button onClick={exportHtml} style={styles.exportBtn}>
              Download HTML
            </button>
          </aside>
          <PermissionModal
            show={showPermissionModal}
            siteName={siteName}
            onSiteNameChange={setSiteName}
            onConfirm={handleOpenDashboard}
            onCancel={() => setShowPermissionModal(false)}
            loading={dashboardCreating}
          />
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
              <div style={styles.quickSuggestions}>
                {quickSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    style={styles.quickChip}
                    onClick={() => setAiInput(s)}
                  >
                    {s}
                  </button>
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
    <Routes>
      <Route path="/site/:id" element={<Dashboard />} />
      <Route
        path="/*"
        element={
          <>
            {screen === 'landing' && <Landing onStart={() => setScreen('builder')} />}
            {screen === 'builder' && <Builder onBack={() => setScreen('landing')} />}
          </>
        }
      />
    </Routes>
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
  pickSection: {
    flex: 1,
    overflow: 'auto',
    padding: '0 1.5rem 1.5rem',
    maxWidth: '64rem',
    margin: '0 auto',
    width: '100%',
  },
  toolbar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 200px',
    minWidth: '180px',
    padding: '0.5rem 0.75rem',
  },
  select: {
    padding: '0.5rem 0.75rem',
    minWidth: '140px',
  },
  resultCount: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '0.5rem',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  templateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '1rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
  },
  templateName: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  templateDesc: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginTop: '0.25rem',
  },
  templateCategory: {
    fontSize: '0.7rem',
    color: 'var(--muted)',
    marginTop: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '0.4rem 0.75rem',
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: 'var(--muted)',
  },
  quickSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    padding: '0.35rem 0.75rem 0',
  },
  quickChip: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--muted)',
    borderRadius: '999px',
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
  dashboardBtn: {
    marginTop: '0.5rem',
    width: '100%',
    padding: '0.6rem',
    background: 'var(--surface)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  dashboardHint: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
    marginTop: '0.25rem',
    marginBottom: '0.5rem',
  },
  exportBtn: {
    marginTop: '0.5rem',
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.5rem',
    maxWidth: '400px',
    width: '100%',
  },
  modalTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  modalText: {
    fontSize: '0.9rem',
    color: 'var(--muted)',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  modalLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  modalInput: {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  modalActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  modalBtnSecondary: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalBtnPrimary: {
    padding: '0.5rem 1rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
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
