import { useState, useMemo, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { requestAiSite, getQuickSuggestions } from './aiDesigner'
import { getTemplateById, getDefaultContent, getTemplatesByCategory } from './templates'
import { generateHtml } from './generateHtml'
import { createSite, supabase } from './lib/siteApi'
import { filterAndGroupFields } from './lib/editorFields'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/AuthModal'
import Wizard from './components/Wizard'
import Pricing from './components/Pricing'
import LandingPage from './components/LandingPage'
import DemoBuilder from './components/DemoBuilder'

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

const LANDING_HEADLINE = 'Launch Your Website Faster Than You Can Brew Coffee.'
const LANDING_TAGLINE = 'Gensite translates your vision into a stunning, fully-functional website instantly using AI. No coding, no clunky templates. Perfect for founders, creators, and small businesses.'

function Landing({ onStart, onPricing }) {
  const [phase, setPhase] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showFinal, setShowFinal] = useState(false)
  const [promptInput, setPromptInput] = useState('')

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

  const handleGenerate = (e) => {
    e.preventDefault()
    if (promptInput.trim()) {
      onStart({ prompt: promptInput.trim() })
    }
  }

  const handleSuggestion = (text) => {
    onStart({ prompt: text })
  }

  if (showFinal) {
    return (
      <main style={styles.landingFull}>
        <div style={styles.landingHero}>
          <div style={{ ...styles.landingInner, animation: 'landing-reveal-final 0.5s ease forwards' }}>
            <h1 style={styles.landingTitle}>{LANDING_HEADLINE}</h1>
            <p style={styles.landingTagline}>{LANDING_TAGLINE}</p>

            <form onSubmit={handleGenerate} style={styles.promptForm}>
              <div style={styles.promptInputWrapper}>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="What are we building today? e.g. landing page for my dog walking app"
                  style={styles.heroPromptInput}
                />
                <button type="submit" style={styles.promptBtn}>Generate</button>
              </div>
            </form>

            <div style={styles.heroSuggestions}>
              <button type="button" onClick={() => handleSuggestion("Landing page for a dog walking app")} style={styles.heroPill}>
                Landing page for a dog walking app
              </button>
              <button type="button" onClick={() => handleSuggestion("Waitlist for my new SaaS")} style={styles.heroPill}>
                Waitlist for my new SaaS
              </button>
              <button type="button" onClick={() => handleSuggestion("Portfolio for a UI designer")} style={styles.heroPill}>
                Portfolio for a UI designer
              </button>
            </div>

            <div style={styles.ctaRow}>
              <button onClick={onPricing} style={styles.ctaSecondary}>
                See How It Works
              </button>
            </div>

            <div style={styles.features}>
              <div style={styles.feature}><span>⚡</span> Skip the Blank Canvas</div>
              <div style={styles.feature}><span>🎯</span> Designed to Convert</div>
              <div style={styles.feature}><span>🔓</span> Always Yours</div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <section style={styles.socialProofSection}>
          <h2 style={styles.sectionTitle}>Loved by Founders</h2>
          <div style={styles.testimonial}>
            <p style={styles.quote}>"Gensite saved me two weeks of design work. I typed in my idea and had a landing page live the same afternoon."</p>
            <div style={styles.quoteAuthor}>— Sarah T., Solo Founder</div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section style={styles.pricingSection}>
          <h2 style={styles.sectionTitle}>Simple, Transparent Pricing</h2>
          <div style={styles.pricingCards}>
            <div style={styles.pricingCard}>
              <h3 style={styles.planName}>Starter</h3>
              <div style={styles.planPrice}>Free</div>
              <ul style={styles.planList}>
                <li><span style={styles.planCheck}>✓</span> 3 AI generations / month</li>
                <li><span style={styles.planCheck}>✓</span> Gensite Subdomain</li>
                <li><span style={styles.planCheck}>✓</span> "Made with Gensite" Badge</li>
              </ul>
            </div>
            <div style={{ ...styles.pricingCard, ...styles.proCard }}>
              <div style={styles.popularBadge}>Most Popular</div>
              <h3 style={styles.planName}>Pro</h3>
              <div style={styles.planPrice}>$12<span style={styles.planMo}>/mo</span></div>
              <ul style={styles.planList}>
                <li><span style={styles.planCheck}>✓</span> Unlimited generations</li>
                <li><span style={styles.planCheck}>✓</span> Custom Domain</li>
                <li><span style={styles.planCheck}>✓</span> No Watermark</li>
                <li><span style={styles.planCheck}>✓</span> Export Code</li>
              </ul>
              <button onClick={onPricing} style={styles.planUpgradeBtn}>Upgrade to Pro</button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={styles.faqSection}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>Do I need to know how to code?</h4>
              <p style={styles.faqA}>Not at all. Just type what you want in plain English.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>Can I host it on my own domain?</h4>
              <p style={styles.faqA}>Yes! Upgrading to Pro lets you seamlessly map your custom domain.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>Can I edit the site after generating it?</h4>
              <p style={styles.faqA}>Absolutely. Our intuitive editor lets you tweak colors, text, and layouts effortlessly.</p>
            </div>
          </div>
        </section>
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

function Builder({ onBack, initialSetup, onPricing }) {
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
  const [fieldSearch, setFieldSearch] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const [expandedCategories, setExpandedCategories] = useState(() => new Set()) // which categories show all templates
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 960
  )
  const categoryRefs = useRef({})

  const template = templateId ? getTemplateById(templateId) : null

  const TEMPLATES_SHOWN_INITIAL = 8

  const templatesByCategory = useMemo(
    () => getTemplatesByCategory(searchQuery),
    [searchQuery]
  )

  const groupedEditFields = useMemo(
    () => filterAndGroupFields(template?.fields || [], fieldSearch),
    [template?.fields, fieldSearch]
  )

  const visibleEditFieldCount = useMemo(
    () => groupedEditFields.reduce((sum, group) => sum + group.fields.length, 0),
    [groupedEditFields]
  )

  useEffect(() => {
    if (initialSetup && !templateId && step === 'edit') {
      const runAi = async () => {
        setAiLoading(true)
        const prompt = initialSetup.prompt || `A ${initialSetup.vibe?.replace('-', ' ')} website for a ${initialSetup.siteType} named ${initialSetup.siteName}`
        try {
          const result = await requestAiSite(prompt)
          setTemplateId(result.templateId)
          setContent(result.content)
          setSiteName(initialSetup.siteName || result.templateId?.split('__')[0] || 'My site')
          setAiMessages([
            { from: 'ai', text: 'Describe how you want your site to look and feel...' },
            { from: 'user', text: prompt },
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const onResize = () => setIsMobile(window.innerWidth < 960)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
      if ((err.message || '').toLowerCase().includes('upgrade') && onPricing) {
        onPricing()
      }
    } finally {
      setDashboardCreating(false)
    }
  }

  function updateField(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  function resetField(field) {
    updateField(field.key, field.default ?? '')
  }

  function resetGroup(fields) {
    setContent((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        next[field.key] = field.default ?? ''
      })
      return next
    })
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
          <div
            style={{
              ...styles.pickLayout,
              gridTemplateColumns: isMobile ? '1fr' : styles.pickLayout.gridTemplateColumns,
            }}
          >
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
              {templatesByCategory.length === 0 && (
                <div style={styles.emptyStateCard}>
                  <h2 style={styles.emptyStateTitle}>No templates match this search</h2>
                  <p style={styles.emptyStateText}>
                    Try a broader keyword like "SaaS", "agency", or "portfolio", or ask the AI assistant to generate from a prompt.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={styles.emptyStateAction}
                  >
                    Clear search
                  </button>
                </div>
              )}
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
            <aside
              style={{
                ...styles.pickChat,
                borderLeft: isMobile ? 'none' : styles.pickChat.borderLeft,
                borderTop: isMobile ? '1px solid var(--border)' : 'none',
              }}
            >
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
        <div
          style={{
            ...styles.editLayout,
            gridTemplateColumns: isMobile ? '1fr' : styles.editLayout.gridTemplateColumns,
          }}
        >
          <aside style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Content studio</h3>
            <div style={styles.editorToolbar}>
              <input
                type="search"
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                placeholder="Search fields..."
                style={styles.editorSearchInput}
              />
              <div style={styles.editorStatsRow}>
                <span style={styles.editorStatPill}>
                  {visibleEditFieldCount}/{template.fields.length} shown
                </span>
                {fieldSearch && (
                  <button
                    type="button"
                    style={styles.editorClearBtn}
                    onClick={() => setFieldSearch('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {groupedEditFields.length === 0 && (
              <div style={styles.editorEmptyState}>
                No fields found for "{fieldSearch}".
              </div>
            )}
            {groupedEditFields.map(({ group, fields }) => (
              <div key={group} style={styles.editorGroup}>
                <div style={styles.editorGroupHead}>
                  <h4 style={styles.editorGroupTitle}>
                    {group}
                    <span style={styles.editorGroupCount}>{fields.length}</span>
                  </h4>
                  <button
                    type="button"
                    style={styles.editorGroupReset}
                    onClick={() => resetGroup(fields)}
                  >
                    Reset section
                  </button>
                </div>
                {fields.map((f) => (
                  <div key={f.key} style={styles.fieldCard}>
                    <div style={styles.fieldHead}>
                      <label style={styles.fieldLabel}>{f.label}</label>
                      <button
                        type="button"
                        style={styles.fieldResetBtn}
                        onClick={() => resetField(f)}
                      >
                        Reset
                      </button>
                    </div>
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
                  </div>
                ))}
              </div>
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
  const [showDemo, setShowDemo] = useState(false)
  const [demoPrompt, setDemoPrompt] = useState('')

  const handleTryDemo = (prompt) => {
    setDemoPrompt(prompt)
    setShowDemo(true)
  }

  const handleDemoUpgrade = () => {
    setShowDemo(false)
    setShowPricing(true)
  }

  return (
    <>
      <Routes>
        <Route path="/site/:id" element={<Dashboard />} />
        <Route
          path="/*"
          element={
            <>
              {screen === 'landing' && (
                <LandingPage
                  onTryPrompt={handleTryDemo}
                  onOpenPricing={() => setShowPricing(true)}
                  onGuidedSetup={() => setScreen('wizard')}
                />
              )}
              {screen === 'wizard' && (
                <Wizard
                  onCancel={() => setScreen('landing')}
                  onComplete={(data) => {
                    setWizardData(data)
                    setScreen('builder')
                  }}
                />
              )}
              {screen === 'builder' && (
                <Builder
                  onBack={() => setScreen('landing')}
                  initialSetup={wizardData}
                  onPricing={() => setShowPricing(true)}
                />
              )}
            </>
          }
        />
      </Routes>
      <Pricing show={showPricing} onClose={() => setShowPricing(false)} />
      <DemoBuilder 
        show={showDemo}
        initialPrompt={demoPrompt}
        onClose={() => setShowDemo(false)}
        onUpgrade={handleDemoUpgrade}
      />
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
    maxWidth: '42rem',
  },
  promptForm: {
    marginBottom: '1rem',
    width: '100%',
  },
  promptInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '0.4rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  heroPromptInput: {
    flex: 1,
    padding: '1rem 1.25rem',
    fontSize: '1.1rem',
    color: 'var(--text)',
    background: 'transparent',
    border: 'none',
    outline: 'none',
  },
  promptBtn: {
    padding: '0.875rem 1.75rem',
    marginRight: '0.2rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  heroSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  heroPill: {
    padding: '0.4rem 0.8rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: 'var(--muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  emptyStateCard: {
    marginBottom: '1rem',
    padding: '1.25rem',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'var(--surface)',
  },
  emptyStateTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
  },
  emptyStateText: {
    marginTop: '0.45rem',
    color: 'var(--muted)',
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  emptyStateAction: {
    marginTop: '0.75rem',
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    fontSize: '0.85rem',
    fontWeight: 600,
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
  editorToolbar: {
    marginBottom: '0.9rem',
    padding: '0.75rem',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  editorSearchInput: {
    width: '100%',
    padding: '0.5rem 0.65rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '0.84rem',
  },
  editorStatsRow: {
    marginTop: '0.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap',
  },
  editorStatPill: {
    padding: '0.2rem 0.45rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--accent)',
    background: 'rgba(99, 102, 241, 0.14)',
  },
  editorClearBtn: {
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--muted)',
    borderRadius: '999px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.72rem',
  },
  editorEmptyState: {
    marginBottom: '0.9rem',
    border: '1px dashed var(--border)',
    borderRadius: '10px',
    padding: '0.75rem',
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: '0.82rem',
  },
  editorGroup: {
    marginBottom: '0.9rem',
  },
  editorGroupHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.45rem',
  },
  editorGroupTitle: {
    margin: 0,
    fontSize: '0.76rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  editorGroupCount: {
    minWidth: '1.2rem',
    height: '1.2rem',
    borderRadius: '999px',
    background: 'var(--border)',
    color: 'var(--text)',
    fontSize: '0.68rem',
    padding: '0 0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorGroupReset: {
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'transparent',
    color: 'var(--muted)',
    padding: '0.2rem 0.5rem',
    fontSize: '0.68rem',
    fontWeight: 600,
  },
  fieldCard: {
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.65rem',
    marginBottom: '0.6rem',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  fieldHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem',
  },
  fieldLabel: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: 'var(--text)',
  },
  fieldResetBtn: {
    border: '1px solid var(--border)',
    borderRadius: '999px',
    background: 'transparent',
    color: 'var(--muted)',
    padding: '0.15rem 0.45rem',
    fontSize: '0.65rem',
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

  // New Landing Layout Styles
  landingFull: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--bg)',
    paddingTop: '6rem',
    overflowY: 'auto',
  },
  landingHero: {
    padding: '2rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '6rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '2rem',
    textAlign: 'center',
    color: 'var(--text)',
  },
  socialProofSection: {
    width: '100%',
    maxWidth: '800px',
    padding: '4rem 2rem',
    textAlign: 'center',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  testimonial: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  quote: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    color: 'var(--text)',
    maxWidth: '600px',
    lineHeight: 1.6,
  },
  quoteAuthor: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--muted)',
  },
  pricingSection: {
    width: '100%',
    maxWidth: '1000px',
    padding: '6rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pricingCards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    marginTop: '1rem',
    width: '100%',
  },
  pricingCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: 'var(--shadow-md)',
  },
  proCard: {
    border: '2px solid var(--accent)',
    transform: 'scale(1.05)',
    boxShadow: '0 0 30px rgba(99,102,241,0.15)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--accent)',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  planName: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  planPrice: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  planMo: {
    fontSize: '1rem',
    color: 'var(--muted)',
    fontWeight: 400,
  },
  planList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 2rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },
  planCheck: {
    color: 'var(--accent)',
    fontWeight: 'bold',
    marginRight: '0.5rem',
  },
  planUpgradeBtn: {
    width: '100%',
    padding: '0.875rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: 'auto',
  },
  faqSection: {
    width: '100%',
    maxWidth: '800px',
    padding: '2rem 2rem 6rem',
  },
  faqGrid: {
    display: 'grid',
    gap: '2rem',
  },
  faqItem: {
    padding: '1.5rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  },
  faqQ: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  faqA: {
    color: 'var(--muted)',
    lineHeight: 1.6,
  },
}
