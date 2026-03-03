import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTemplateById } from '../templates'
import { generateHtml } from '../generateHtml'
import { filterAndGroupFields } from '../lib/editorFields'
import {
  getSite,
  updateSite,
  publishSite,
  unpublishSite,
  getLiveSiteUrl,
  isBackendConnected,
  supabase,
} from '../lib/siteApi'
import './Dashboard.css'
import Pricing from '../components/Pricing'
import UsageStats from '../components/UsageStats'

const DEBOUNCE_MS = 800
const DEVICE_MODES = ['desktop', 'tablet', 'mobile']

function getFieldIcon(type) {
  if (type === 'image') return 'IMG'
  if (type === 'color') return 'CLR'
  if (type === 'textarea') return 'TXT'
  return 'FLD'
}

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
  const [fieldSearch, setFieldSearch] = useState('')

  const template = site ? getTemplateById(site.template_id) : null
  const groupedFields = useMemo(
    () => filterAndGroupFields(template?.fields || [], fieldSearch),
    [template?.fields, fieldSearch]
  )

  const visibleFieldCount = useMemo(
    () => groupedFields.reduce((sum, group) => sum + group.fields.length, 0),
    [groupedFields]
  )

  const customizedFieldCount = useMemo(() => {
    if (!template?.fields?.length) return 0
    return template.fields.filter((field) => {
      const value = content[field.key]
      if (value === undefined || value === null || value === '') return false
      if (field.default === undefined) return true
      return value !== field.default
    }).length
  }, [template?.fields, content])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getSite(id)
      .then((data) => {
        if (cancelled) return
        setSite(data)
        setName(data.name || '')
        setContent(data.content || {})
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load site')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
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
        .catch(() => {})
        .finally(() => setSaving(false))
    },
    [id, site]
  )

  useEffect(() => {
    if (!site || !id) return
    const timer = setTimeout(() => persistContent(content), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [content, id, site, persistContent])

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

  const resetField = (field) => {
    updateField(field.key, field.default ?? '')
  }

  const resetGroup = (fields) => {
    setContent((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        next[field.key] = field.default ?? ''
      })
      return next
    })
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
      .then((updated) => {
        setSite(updated)
        setError(null)
      })
      .catch((publishError) => {
        const message = publishError.message || 'Publish failed'
        setError(message)
        if (message.toLowerCase().includes('upgrade')) {
          setShowPricing(true)
        }
      })
      .finally(() => setPublishLoading(false))
  }

  const handleUnpublish = () => {
    if (!site) return
    setPublishLoading(true)
    unpublishSite(id)
      .then((updated) => {
        setSite(updated)
        setError(null)
      })
      .finally(() => setPublishLoading(false))
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/')
  }

  const getSaveStatusText = () => {
    if (saving) return 'Saving...'
    if (lastSaved) return 'Saved'
    return ''
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <span className="dashboard-loading-text">Loading your site...</span>
      </div>
    )
  }

  if (error && !site) {
    return (
      <div className="dashboard-error">
        <p className="dashboard-error-text">{error}</p>
        <button type="button" onClick={() => navigate('/')} className="dashboard-error-btn">
          Back home
        </button>
      </div>
    )
  }

  if (!site || !template) {
    return (
      <div className="dashboard-error">
        <p className="dashboard-error-text">Site not found</p>
        <button type="button" onClick={() => navigate('/')} className="dashboard-error-btn">
          Back home
        </button>
      </div>
    )
  }

  const liveUrl = site.status === 'published' ? getLiveSiteUrl(id) : null
  const previewHtml = generateHtml(site.template_id, content)

  return (
    <div className="dashboard">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.25rem',
              cursor: 'pointer',
              color: 'var(--dash-muted)',
              fontSize: '1.1rem',
            }}
            title="Back to templates"
          >
            {'<-'}
          </button>
          <a href="/" className="dashboard-logo">
            <div className="dashboard-logo-icon" />
            <span>Site Builder</span>
          </a>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
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
              {mode === 'desktop' ? 'D' : mode === 'tablet' ? 'T' : 'M'}
            </button>
          ))}
        </div>

        <div className="dashboard-topbar-right">
          <span className={`dashboard-status-badge ${site.status === 'published' ? 'published' : 'draft'}`}>
            {site.status === 'published' ? 'Live' : 'Draft'}
          </span>
          {site.status === 'published' ? (
            <>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="dashboard-btn-view">
                View site
              </a>
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={publishLoading}
                className="dashboard-btn-unpublish"
              >
                {publishLoading ? '...' : 'Unpublish'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishLoading}
              className="dashboard-btn-publish"
            >
              {publishLoading ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {isBackendConnected() && (
            <>
              <button
                type="button"
                onClick={() => setShowPricing(true)}
                className="dashboard-btn-unpublish"
                style={{
                  marginLeft: '0.5rem',
                  background: 'var(--accent, #6366f1)',
                  color: '#fff',
                  border: 'none',
                }}
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
        <aside className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Content Studio</h2>
            <p className="dashboard-panel-subtitle">Search, group, and tune fields like a pro editor.</p>
          </div>
          <div className="dashboard-panel-content">
            <div style={{ marginBottom: '1rem' }}>
              <UsageStats compact onUpgrade={() => setShowPricing(true)} />
            </div>

            {error && <div className="dashboard-inline-error">{error}</div>}

            <div className="dashboard-editor-toolbar">
              <input
                type="search"
                value={fieldSearch}
                onChange={(event) => setFieldSearch(event.target.value)}
                className="dashboard-editor-search"
                placeholder="Search fields by label, key, or type..."
              />
              <div className="dashboard-editor-stats">
                <span>{visibleFieldCount}/{template.fields.length} shown</span>
                <span>{customizedFieldCount} customized</span>
                {fieldSearch && (
                  <button
                    type="button"
                    className="dashboard-editor-clear"
                    onClick={() => setFieldSearch('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            {groupedFields.length === 0 && (
              <div className="dashboard-no-fields">
                No fields found for "{fieldSearch}". Try another keyword.
              </div>
            )}

            {groupedFields.map(({ group, fields }) => (
              <section key={group} className="dashboard-editor-group">
                <div className="dashboard-editor-group-header">
                  <h3 className="dashboard-editor-group-title">
                    {group}
                    <span className="dashboard-editor-group-count">{fields.length}</span>
                  </h3>
                  <button
                    type="button"
                    className="dashboard-group-reset"
                    onClick={() => resetGroup(fields)}
                  >
                    Reset section
                  </button>
                </div>

                {fields.map((field) => (
                  <div key={field.key} className="dashboard-field-group dashboard-field-card">
                    <div className="dashboard-field-row">
                      <label className="dashboard-field-label">
                        <span style={{ marginRight: '0.35rem' }}>{getFieldIcon(field.type)}</span>
                        {field.label}
                      </label>
                      <div className="dashboard-field-actions">
                        <span className="dashboard-field-meta">{field.type || 'text'}</span>
                        <button
                          type="button"
                          className="dashboard-field-reset"
                          onClick={() => resetField(field)}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {field.type === 'color' ? (
                      <div className="dashboard-color-wrap">
                        <input
                          type="color"
                          value={content[field.key] ?? field.default ?? '#6366f1'}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="dashboard-color-input"
                        />
                        <input
                          type="text"
                          value={content[field.key] ?? field.default ?? ''}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="dashboard-field-input dashboard-color-hex"
                          placeholder="#6366f1"
                        />
                      </div>
                    ) : field.type === 'image' ? (
                      <label className="dashboard-image-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleImageChange(field.key, event.target.files?.[0])}
                        />
                        <div className="dashboard-image-upload-icon">IMG</div>
                        <div className="dashboard-image-upload-text">
                          {(content[field.key] ?? field.default) ? 'Change image' : 'Click to upload'}
                        </div>
                        {(content[field.key] ?? field.default) && (
                          <img
                            src={content[field.key] || field.default}
                            alt=""
                            className="dashboard-image-preview"
                          />
                        )}
                      </label>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={content[field.key] ?? ''}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        className="dashboard-field-input dashboard-field-textarea"
                        placeholder={field.default || ''}
                        rows={4}
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[field.key] ?? ''}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        className="dashboard-field-input"
                        placeholder={field.default || ''}
                      />
                    )}
                  </div>
                ))}
              </section>
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
                    {publishLoading ? '...' : 'Unpublish site'}
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
                    {publishLoading ? 'Publishing...' : 'Publish site'}
                  </button>
                  <p className="dashboard-publish-hint">
                    Make your site live at a public URL. Anyone with the link can view it.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>

        <section className="dashboard-preview-wrap">
          <div className="dashboard-preview-frame">
            <div className={`dashboard-device-frame ${deviceMode}`}>
              <iframe
                title="Site Preview"
                srcDoc={previewHtml}
                className="dashboard-preview-iframe"
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
