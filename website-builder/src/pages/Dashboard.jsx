import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTemplateById } from '../templates'
import { generateHtml } from '../generateHtml'
import {
  getSite,
  updateSite,
  publishSite,
  unpublishSite,
  getLiveSiteUrl,
  isBackendConnected,
  supabase
} from '../lib/siteApi'
import './Dashboard.css'
import Pricing from '../components/Pricing'
import UsageStats from '../components/UsageStats'

const DEBOUNCE_MS = 800
const DEVICE_MODES = ['desktop', 'tablet', 'mobile']

export default function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState({})
  const [deviceMode, setDeviceMode] = useState('desktop')

  const template = site ? getTemplateById(site.template_id) : null

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getSite(id)
      .then((data) => {
        if (!cancelled) {
          setSite(data)
          setName(data.name || '')
          setContent(data.content || {})
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load site')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const persistContent = useCallback(
    (nextContent) => {
      if (!site || !id) return
      setSaving(true)
      updateSite(id, { content: nextContent })
        .then((updated) => {
          setSite(updated)
          setLastSaved(Date.now())
        })
        .catch(() => { })
        .finally(() => setSaving(false))
    },
    [id, site]
  )

  useEffect(() => {
    if (!site || !id) return
    const t = setTimeout(() => {
      persistContent(content)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, id])

  const handleNameBlur = () => {
    if (!id || name === (site?.name ?? '')) return
    setSaving(true)
    updateSite(id, { name })
      .then((updated) => {
        setSite(updated)
        setLastSaved(Date.now())
      })
      .finally(() => setSaving(false))
  }

  const updateField = (key, value) => {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateField(key, reader.result)
    reader.readAsDataURL(file)
  }

  const handlePublish = () => {
    if (!site || !template) return
    setPublishLoading(true)
    const html = generateHtml(site.template_id, content)
    publishSite(id, html)
      .then((updated) => setSite(updated))
      .catch((e) => {
        setError(e.message)
        if ((e.message || '').toLowerCase().includes('upgrade')) {
          setShowPricing(true)
        }
      })
      .finally(() => setPublishLoading(false))
  }

  const handleUnpublish = () => {
    if (!site) return
    setPublishLoading(true)
    unpublishSite(id)
      .then((updated) => setSite(updated))
      .finally(() => setPublishLoading(false))
  }

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      navigate('/')
    }
  }

  const liveUrl = site?.status === 'published' ? getLiveSiteUrl(id) : null

  const getFieldIcon = (type) => {
    if (type === 'image') return '🖼'
    if (type === 'color') return '🎨'
    if (type === 'textarea') return '📝'
    return '✏'
  }

  const getSaveStatusText = () => {
    if (saving) return 'Saving…'
    if (lastSaved) return 'Saved'
    return ''
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <span className="dashboard-loading-text">Loading your site…</span>
      </div>
    )
  }

  if (error && !site) {
    return (
      <div className="dashboard-error">
        <p className="dashboard-error-text">{error}</p>
        <button type="button" onClick={() => navigate('/')} className="dashboard-error-btn">
          ← Back home
        </button>
      </div>
    )
  }

  if (!site || !template) {
    return (
      <div className="dashboard-error">
        <p className="dashboard-error-text">Site not found</p>
        <button type="button" onClick={() => navigate('/')} className="dashboard-error-btn">
          ← Back home
        </button>
      </div>
    )
  }

  const previewHtml = generateHtml(site.template_id, content)

  return (
    <div className="dashboard">
      {/* Top bar — Wix/Squarespace style */}
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: 'var(--dash-muted)', fontSize: '1.25rem' }}
            title="Back to templates"
          >
            ←
          </button>
          <a href="/" className="dashboard-logo">
            <div className="dashboard-logo-icon" />
            <span>Site Builder</span>
          </a>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="dashboard-site-name"
            placeholder="Site name"
          />
          <span className={`dashboard-save-status ${saving ? 'saving' : lastSaved ? 'saved' : ''}`}>
            {getSaveStatusText()}
          </span>
        </div>

        <div className="dashboard-device-toggle">
          {DEVICE_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`dashboard-device-btn ${deviceMode === mode ? 'active' : ''}`}
              onClick={() => setDeviceMode(mode)}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              {mode === 'desktop' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ) : mode === 'tablet' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="dashboard-topbar-right">
          <span className={`dashboard-status-badge ${site.status === 'published' ? 'published' : 'draft'}`}>
            {site.status === 'published' ? '● Live' : '○ Draft'}
          </span>
          {site.status === 'published' ? (
            <>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="dashboard-btn-view">
                View site ↗
              </a>
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={publishLoading}
                className="dashboard-btn-unpublish"
              >
                {publishLoading ? '…' : 'Unpublish'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishLoading}
              className="dashboard-btn-publish"
            >
              {publishLoading ? 'Publishing…' : 'Publish'}
            </button>
          )}
          {isBackendConnected() && (
            <>
              <button
                type="button"
                onClick={() => setShowPricing(true)}
                className="dashboard-btn-unpublish"
                style={{ marginLeft: '0.5rem', background: 'var(--accent, #6366f1)', color: '#fff', border: 'none' }}
                title="View Plans"
              >
                Upgrade
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="dashboard-btn-unpublish"
                style={{ marginLeft: '0.5rem' }}
                title="Sign out"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </header>

      {!isBackendConnected() && (
        <div className="dashboard-banner">
          Using local storage. Set up Supabase and deploy to get a live URL and sync across devices.
        </div>
      )}

      <div className="dashboard-main">
        {/* Left panel — content editor */}
        <aside className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Content & media</h2>
            <p className="dashboard-panel-subtitle">Edit below — changes save automatically</p>
          </div>
          <div className="dashboard-panel-content">
            <div style={{ marginBottom: '1rem' }}>
              <UsageStats compact onUpgrade={() => setShowPricing(true)} />
            </div>
            {template.fields.map((f) => (
              <div key={f.key} className="dashboard-field-group">
                <label className="dashboard-field-label">
                  <span style={{ marginRight: '0.35rem' }}>{getFieldIcon(f.type)}</span>
                  {f.label}
                </label>
                {f.type === 'color' ? (
                  <div className="dashboard-color-wrap">
                    <input
                      type="color"
                      value={content[f.key] ?? f.default ?? '#6366f1'}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="dashboard-color-input"
                    />
                    <input
                      type="text"
                      value={content[f.key] ?? f.default ?? ''}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="dashboard-field-input dashboard-color-hex"
                      placeholder="#6366f1"
                    />
                  </div>
                ) : f.type === 'image' ? (
                  <label className="dashboard-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(f.key, e.target.files?.[0])}
                    />
                    <div className="dashboard-image-upload-icon">📷</div>
                    <div className="dashboard-image-upload-text">
                      {(content[f.key] ?? f.default) ? 'Change image' : 'Click to upload'}
                    </div>
                    {(content[f.key] ?? f.default) && (
                      <img
                        src={content[f.key] || f.default}
                        alt=""
                        className="dashboard-image-preview"
                      />
                    )}
                  </label>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={content[f.key] ?? ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="dashboard-field-input dashboard-field-textarea"
                    placeholder={f.default || ''}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={content[f.key] ?? ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="dashboard-field-input"
                    placeholder={f.default || ''}
                  />
                )}
              </div>
            ))}

            <div className="dashboard-publish-section">
              {site.status === 'published' ? (
                <>
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={publishLoading}
                    className="dashboard-publish-btn secondary"
                  >
                    {publishLoading ? '…' : 'Unpublish site'}
                  </button>
                  <p className="dashboard-publish-hint">Your site is live. Unpublish to hide it from the public.</p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishLoading}
                    className="dashboard-publish-btn primary"
                  >
                    {publishLoading ? 'Publishing…' : 'Publish site'}
                  </button>
                  <p className="dashboard-publish-hint">Make your site live at a public URL. Anyone with the link can view it.</p>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Preview area with device frame */}
        <section className="dashboard-preview-wrap">
          <div className="dashboard-preview-frame">
            <div className="dashboard-content-iframe">
              <iframe
                title="Site Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </section>
      </div>

      <Pricing show={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
