import { useState, useMemo, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { requestAiSite, getQuickSuggestions } from './aiDesigner'
import { getTemplateById, getDefaultContent, getTemplatesByCategory } from './templates'
import { generateHtml } from './generateHtml'
import { createSite, supabase } from './lib/siteApi'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/AuthModal'
import Wizard from './components/Wizard'
import Pricing from './components/Pricing'

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

const LANDING_HEADLINE = 'Professional Websites, Made Easy'
const LANDING_TAGLINE = 'AI-powered website builder with custom domains, analytics, and team collaboration. Create stunning sites in minutes.'

function Landing({ onStart, onPricing }) {
  const [phase, setPhase] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if (showFinal) return
    const timers = []
    timers.push(setTimeout(() => setPhase(1), 400))
    timers.push(setTimeout(() => setPhase(2), 900))
    timers.push(setTimeout(() => setPhase(3), 1400))
    return () => timers.forEach(clearTimeout)
  }, [showFinal])

  useEffect(() => {
    if (phase !== 3) return
    if (charIndex >= LANDING_HEADLINE.length) {
      const t = setTimeout(() => setPhase(4), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCharIndex((i) => i + 1), 80)
    return () => clearTimeout(t)
  }, [phase, charIndex])

  useEffect(() => {
    if (phase < 4) return
    const timers = []
    if (phase === 4) timers.push(setTimeout(() => setPhase(5), 600))
    if (phase === 5) timers.push(setTimeout(() => setPhase(6), 700))
    if (phase === 6) timers.push(setTimeout(() => setShowFinal(true), 400))
    return () => timers.forEach(clearTimeout)
  }, [phase])

  if (showFinal) {
    return (
      <main style={styles.landing}>
        <div style={{ ...styles.landingInner, animation: 'landing-reveal-final 0.5s ease forwards' }}>
          <h1 style={styles.landingTitle}>{LANDING_HEADLINE}</h1>
          <p style={styles.landingTagline}>{LANDING_TAGLINE}</p>
          <div style={styles.ctaRow}>
            <button onClick={onStart} style={styles.cta}>
              Start building — Free
            </button>
            <button onClick={onPricing} style={styles.ctaSecondary}>
              View Pricing
            </button>
          </div>
          <div style={styles.features}>
            <div style={styles.feature}><span>🎨</span> 50+ Templates</div>
            <div style={styles.feature}><span>🤖</span> AI Design</div>
            <div style={styles.feature}><span>🚀</span> Instant Publish</div>
            <div style={styles.feature}><span>📊</span> Analytics</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.landing}>
      <div style={styles.landingBuildWrap}>
        <p style={styles.landingBuildLabel}>Building your site...</p>
        <div style={styles.landingBrowser}>
          <div style={styles.landingBrowserBar}>
            <span style={styles.landingBrowserDots}>● ● ●</span>
            <span style={styles.landingBrowserUrl}>mysite.com</span>
          </div>
          <div style={styles.landingBrowserContent}>
            {phase >= 1 && (
              <header
                style={{
                  ...styles.landingMockNav,
                  animation: 'landing-slide-down 0.4s ease forwards',
                }}
              >
                <span style={styles.landingMockNavLogo}>Logo</span>
                <span style={styles.landingMockNavLink}>Home</span>
                <span style={styles.landingMockNavLink}>About</span>
              </header>
            )}
            {phase >= 2 && (
              <section
                style={{
                  ...styles.landingMockHero,
                  animation: 'landing-block-in 0.5s ease forwards',
                }}
              >
                {phase >= 3 && (
                  <h2 style={styles.landingMockTitle}>
                    {LANDING_HEADLINE.slice(0, charIndex)}
                    {phase === 3 && charIndex < LANDING_HEADLINE.length && (
                      <span style={styles.landingCursor}>|</span>
                    )}
                  </h2>
                )}
                {phase >= 4 && (
                  <p style={{ ...styles.landingMockTagline, animation: 'landing-fade-in 0.5s ease forwards' }}>
                    {LANDING_TAGLINE}
                  </p>
                )}
                {phase >= 5 && (
                  <div style={{ ...styles.landingMockCta, animation: 'landing-cta-pop 0.35s ease forwards' }}>
                    Get started
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
        {phase >= 6 && (
          <p style={styles.landingBuildDone}>Ready. Your turn.</p>
        )}
      </div>
    </main>
  )
}

const quickSuggestions = getQuickSuggestions()

function Builder({ onBack, initialSetup }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(initialSetup ? 'edit' : 'pick') // 'pick' | 'edit'
  const [templateId, setTemplateId] = useState(null)
  const [content, setContent] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMessages, setAiMessages] = useState([
    { from: 'ai', text: 'Describe how you want your site to look and feel, or pick one of the suggestions below. We have 1,000 templates across 20 types and 50 color themes.' },
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [siteName, setSiteName] = useState('My site')
  const [dashboardCreating, setDashboardCreating] = useState(false)
  const [aiEditInput, setAiEditInput] = useState('')
  const [aiEditLoading, setAiEditLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const [expandedCategories, setExpandedCategories] = useState(() => new Set()) // which categories show all templates
  const categoryRefs = useRef({})

  const template = templateId ? getTemplateById(templateId) : null

  const TEMPLATES_SHOWN_INITIAL = 8

  const templatesByCategory = useMemo(
    () => getTemplatesByCategory(searchQuery),
    [searchQuery]
  )

  useEffect(() => {
    if (initialSetup && !templateId && step === 'edit') {
      const runAi = async () => {
        setAiLoading(true)
        const prompt = `A ${initialSetup.vibe?.replace('-', ' ')} website for a ${initialSetup.siteType} named ${initialSetup.siteName}`
        try {
          const result = await requestAiSite(prompt)
          setTemplateId(result.templateId)
          setContent(result.content)
          setSiteName(initialSetup.siteName || result.templateId?.split('__')[0] || 'My site')
          setAiMessages([
            { from: 'ai', text: 'Describe how you want your site to look and feel...' },
            { from: 'user', text: `Build me a ${initialSetup.vibe} site for a ${initialSetup.siteType} called ${initialSetup.siteName}.` },
            { from: 'ai', text: result.suggestion || 'I generated a custom layout based on your answers! You can edit any section on the left.' }
          ])
        } catch (e) {
          setAiMessages([{ from: 'ai', text: 'Oops! Something went wrong loading your setup. Please try searching or describing what you need.' }])
          setStep('pick')
        } finally {
          setAiLoading(false)
        }
      }
      runAi()
    }
  }, [initialSetup, templateId, step])

  function scrollToCategory(cat) {
    const el = categoryRefs.current[cat]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setShowPermissionModal(false)
        setShowAuthModal(true)
        return
      }
    }
    setDashboardCreating(true)
    try {
      const data = await createSite({ name: siteName, templateId, content })
      navigate(`/site/${data.id}`)
    } catch (err) {
      setAiMessages((prev) => [...prev, { from: 'ai', text: err.message || 'Could not create dashboard. Try again.' }])
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
      setSiteName(result.templateId?.split('__')[0] || 'My site')
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

  async function handleAiEditApply() {
    const text = aiEditInput.trim()
    if (!text || !templateId) return
    setAiEditLoading(true)
    try {
      const result = await requestAiSite(text)
      setTemplateId(result.templateId)
      setContent(result.content)
      setAiEditInput('')
    } catch (err) {
      // silent or toast
    } finally {
      setAiEditLoading(false)
    }
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

      {step === 'pick' && !aiLoading && (
        <section style={styles.pickSection}>
          <div style={styles.pickLayout}>
            <div style={styles.pickTemplates}>
              <div style={styles.categoryNavSticky}>
                <span style={styles.categoryNavLabel}>Jump to:</span>
                <div style={styles.categoryNavPills}>
                  {templatesByCategory.map(({ category }) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => scrollToCategory(category)}
                      style={styles.categoryPill}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              {templatesByCategory.map(({ category, templates: list }) => {
                const showAll = expandedCategories.has(category) || list.length <= TEMPLATES_SHOWN_INITIAL
                const visible = showAll ? list : list.slice(0, TEMPLATES_SHOWN_INITIAL)
                const hiddenCount = list.length - TEMPLATES_SHOWN_INITIAL
                return (
                  <div
                    key={category}
                    ref={(el) => { categoryRefs.current[category] = el }}
                    style={styles.categoryBlock}
                  >
                    <h2 style={styles.categoryTitle}>{category}</h2>
                    <p style={styles.categoryDetail}>
                      {list.length} template{list.length !== 1 ? 's' : ''} — just add your details
                    </p>
                    <div style={styles.templateGrid}>
                      {visible.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => pickTemplate(t.id)}
                          style={{ ...styles.templateCard, borderLeft: `3px solid ${t.themeHex}` }}
                        >
                          <span style={styles.templateName}>{t.name}</span>
                          <span style={styles.templateDesc}>{t.description}</span>
                          <span style={styles.templateCategory}>{t.themeName}</span>
                        </button>
                      ))}
                    </div>
                    {!showAll && hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedCategories((prev) => new Set(prev).add(category))}
                        style={styles.seeMoreBtn}
                      >
                        See {hiddenCount} more in {category} ↓
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <aside style={styles.pickChat}>
              <h3 style={styles.chatTitle}>AI site expert</h3>
              <p style={styles.chatSubtitle}>Describe your site or pick a template below.</p>
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
                  placeholder="e.g. Landing page for my SaaS, blue theme..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  style={styles.chatInput}
                  disabled={aiLoading}
                />
                <button type="submit" style={styles.chatBtn} disabled={aiLoading}>
                  {aiLoading ? 'Thinking...' : 'Generate layout'}
                </button>
              </form>
            </aside>
          </div>
        </section>
      )}

      {step === 'edit' && !aiLoading && template && (
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
            <div style={styles.aiGeneratorBlock}>
              <h3 style={styles.aiGeneratorTitle}>AI content generator</h3>
              <p style={styles.aiGeneratorHint}>Refine or regenerate content for this page.</p>
              <textarea
                rows={2}
                placeholder="e.g. Make it more professional, add a startup vibe..."
                value={aiEditInput}
                onChange={(e) => setAiEditInput(e.target.value)}
                style={styles.aiGeneratorInput}
                disabled={aiEditLoading}
              />
              <button
                type="button"
                onClick={handleAiEditApply}
                disabled={aiEditLoading || !aiEditInput.trim()}
                style={styles.aiGeneratorBtn}
              >
                {aiEditLoading ? 'Applying...' : 'Apply to this page'}
              </button>
            </div>
            <button onClick={() => setShowPermissionModal(true)} style={styles.dashboardBtn}>
              Open in dashboard
            </button>
            <p style={styles.dashboardHint}>Save to dashboard to add photos, publish, and manage your live site.</p>
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
            <div style={styles.previewHeader}>
              <h3 style={styles.previewTitle}>Live Preview</h3>
              <div style={styles.deviceToggles}>
                <button
                  type="button"
                  title="Desktop"
                  onClick={() => setPreviewMode('desktop')}
                  style={{ ...styles.toggleBtn, ...(previewMode === 'desktop' ? styles.toggleBtnActive : {}) }}>
                  💻 Desktop
                </button>
                <button
                  type="button"
                  title="Tablet"
                  onClick={() => setPreviewMode('tablet')}
                  style={{ ...styles.toggleBtn, ...(previewMode === 'tablet' ? styles.toggleBtnActive : {}) }}>
                  📱 Tablet
                </button>
                <button
                  type="button"
                  title="Mobile"
                  onClick={() => setPreviewMode('mobile')}
                  style={{ ...styles.toggleBtn, ...(previewMode === 'mobile' ? styles.toggleBtnActive : {}) }}>
                  📱 Mobile
                </button>
              </div>
            </div>
            <div style={styles.previewContainer}>
              <iframe
                title="Preview"
                srcDoc={previewHtml}
                style={{
                  ...styles.previewFrame,
                  width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
                }}
                sandbox="allow-same-origin"
              />
            </div>
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

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false)
          handleOpenDashboard()
        }}
      />
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'wizard' | 'builder'
  const [wizardData, setWizardData] = useState(null)
  const [showPricing, setShowPricing] = useState(false)

  return (
    <>
      <Routes>
        <Route path="/site/:id" element={<Dashboard />} />
        <Route
          path="/*"
          element={
            <>
              {screen === 'landing' && <Landing onStart={() => setScreen('wizard')} onPricing={() => setShowPricing(true)} />}
              {screen === 'wizard' && (
                <Wizard
                  onCancel={() => setScreen('landing')}
                  onComplete={(data) => {
                    setWizardData(data)
                    setScreen('builder')
                  }}
                />
              )}
              {screen === 'builder' && <Builder onBack={() => setScreen('landing')} initialSetup={wizardData} />}
            </>
          }
        />
      </Routes>
      <Pricing show={showPricing} onClose={() => setShowPricing(false)} />
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
  landingBuildWrap: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '420px',
  },
  landingBuildLabel: {
    fontSize: '0.85rem',
    color: 'var(--muted)',
    marginBottom: '1rem',
  },
  landingBrowser: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-xl)',
  },
  landingBrowserBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 1rem',
    background: 'rgba(24, 24, 27, 0.8)',
    borderBottom: '1px solid var(--glass-border)',
  },
  landingBrowserDots: {
    fontSize: '0.6rem',
    color: 'var(--muted)',
    letterSpacing: '0.2em',
  },
  landingBrowserUrl: {
    flex: 1,
    fontSize: '0.7rem',
    color: 'var(--muted)',
    textAlign: 'center',
  },
  landingBrowserContent: {
    minHeight: '220px',
    padding: '1.25rem',
    background: 'var(--surface)',
  },
  landingMockNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border)',
  },
  landingMockNavLogo: {
    fontWeight: 700,
    color: 'var(--accent)',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  landingMockNavLogo: {
    fontWeight: 700,
    color: 'var(--text)',
    fontSize: '0.9rem',
  },
  landingMockNavLink: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
  },
  landingMockHero: {
    textAlign: 'center',
  },
  landingMockTitle: {
    fontSize: '1.35rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: 'var(--text)',
  },
  landingCursor: {
    display: 'inline-block',
    marginLeft: '2px',
    color: 'var(--accent)',
    animation: 'landing-blink 0.8s step-end infinite',
  },
  landingMockTagline: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '0.75rem',
    lineHeight: 1.5,
  },
  landingMockCta: {
    display: 'inline-block',
    padding: '0.4rem 0.9rem',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  landingBuildDone: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: 'var(--muted)',
    animation: 'landing-fade-in 0.5s ease forwards',
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
    padding: '0.875rem 1.75rem',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '1rem',
    boxShadow: '0 0 20px rgba(99,102,241,0.2)',
    border: 'none',
    cursor: 'pointer',
  },
  ctaRow: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  ctaSecondary: {
    background: 'transparent',
    color: 'var(--text)',
    padding: '0.875rem 1.75rem',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '1rem',
    border: '1px solid var(--border)',
    cursor: 'pointer',
  },
  features: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  feature: {
    fontSize: '0.85rem',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
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
    padding: '1rem 1.75rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-sm)',
    zIndex: 20,
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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  pickLayout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  pickTemplates: {
    overflowY: 'auto',
    padding: '1rem 1.5rem 1.5rem',
  },
  categoryNavSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'var(--bg)',
    paddingBottom: '0.75rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid var(--border)',
  },
  categoryNavLabel: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginRight: '0.5rem',
    verticalAlign: 'middle',
  },
  categoryNavPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.5rem',
  },
  categoryPill: {
    padding: '0.35rem 0.65rem',
    fontSize: '0.8rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  seeMoreBtn: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  pickChat: {
    borderLeft: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    padding: '1rem',
  },
  categoryBlock: {
    marginBottom: '2rem',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: 'var(--text)',
  },
  categoryDetail: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '0.75rem',
  },
  toolbar: {
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    maxWidth: '320px',
    padding: '0.5rem 0.75rem',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  templateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '1.25rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderLeft: '4px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-sm)',
  },
  templateCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-md)',
    borderColor: 'var(--accent)',
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
  chatSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '0.5rem',
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
    padding: '0.75rem',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s',
  },
  dashboardHint: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
    marginTop: '0.25rem',
  },
  aiGeneratorBlock: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
  },
  aiGeneratorTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  aiGeneratorHint: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
    marginBottom: '0.5rem',
  },
  aiGeneratorInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.5rem',
    resize: 'vertical',
    minHeight: '60px',
  },
  aiGeneratorBtn: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.9rem',
    background: 'var(--surface)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '8px',
    cursor: 'pointer',
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
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '420px',
    width: '100%',
    boxShadow: 'var(--shadow-xl)',
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
    padding: '1.5rem',
    background: 'var(--bg)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  previewTitle: {
    fontSize: '1rem',
    color: 'var(--text)',
    fontWeight: 600,
    margin: 0,
  },
  deviceToggles: {
    display: 'flex',
    gap: '0.5rem',
    background: 'var(--surface)',
    padding: '0.25rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  toggleBtn: {
    background: 'transparent',
    color: 'var(--muted)',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '6px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  toggleBtnActive: {
    background: 'var(--border)',
    color: 'var(--text)',
    boxShadow: 'var(--shadow-sm)',
  },
  previewContainer: {
    flex: 1,
    minHeight: 0,
    background: 'var(--surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0',
  },
  previewFrame: {
    flex: 1,
    border: 'none',
    background: '#fff',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
