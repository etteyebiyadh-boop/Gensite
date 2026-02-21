import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTemplateById, getDefaultContent } from '../templates'
import { generateHtml } from '../generateHtml'
import {
  getSite,
  updateSite,
  publishSite,
  unpublishSite,
  getLiveSiteUrl,
  isBackendConnected,
} from '../lib/siteApi'

const DEBOUNCE_MS = 800

export default function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState({})

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
        })
        .catch(() => {})
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
      .then((updated) => setSite(updated))
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
      .catch((e) => setError(e.message))
      .finally(() => setPublishLoading(false))
  }

  const handleUnpublish = () => {
    if (!site) return
    setPublishLoading(true)
    unpublishSite(id)
      .then((updated) => setSite(updated))
      .finally(() => setPublishLoading(false))
  }

  const liveUrl = site?.status === 'published' ? getLiveSiteUrl(id) : null

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loading}>Loading your site…</div>
      </div>
    )
  }

  if (error && !site) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.error}>{error}</div>
        <button type="button" onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back home
        </button>
      </div>
    )
  }

  if (!site || !template) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.error}>Site not found</div>
        <button type="button" onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back home
        </button>
      </div>
    )
  }

  const previewHtml = generateHtml(site.template_id, content)

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <button type="button" onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back
        </button>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          style={styles.siteNameInput}
          placeholder="Site name"
        />
        {saving && <span style={styles.saving}>Saving…</span>}
      </header>

      {!isBackendConnected() && (
        <div style={styles.banner}>
          Using local storage. Set up Supabase and deploy to get a live URL and sync across devices.
        </div>
      )}

      <div style={styles.statusBar}>
        <span style={styles.statusLabel}>Status:</span>
        <span
          style={{
            ...styles.badge,
            ...(site.status === 'published' ? styles.badgePublished : styles.badgeDraft),
          }}
        >
          {site.status === 'published' ? 'Published' : 'Draft'}
        </span>
        {liveUrl && (
          <>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={styles.liveLink}>
              Open live site →
            </a>
            <button
              type="button"
              onClick={() => window.open(liveUrl)}
              style={styles.smallBtn}
            >
              Open in new tab
            </button>
          </>
        )}
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Content & media</h3>
          <p style={styles.sidebarHint}>Edit below; changes are saved automatically.</p>
          {template.fields.map((f) => (
            <label key={f.key} style={styles.field}>
              <span>{f.label}</span>
              {f.type === 'color' ? (
                <input
                  type="color"
                  value={content[f.key] ?? f.default ?? ''}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  style={styles.colorInput}
                />
              ) : f.type === 'image' ? (
                <div style={styles.imageField}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(f.key, e.target.files?.[0])}
                    style={styles.fileInput}
                  />
                  {(content[f.key] ?? f.default) && (
                    <img
                      src={content[f.key] || f.default}
                      alt=""
                      style={styles.imagePreview}
                    />
                  )}
                </div>
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

          <div style={styles.publishBlock}>
            {site.status === 'published' ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={publishLoading}
                style={styles.unpublishBtn}
              >
                {publishLoading ? '…' : 'Unpublish'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishLoading}
                style={styles.publishBtn}
              >
                {publishLoading ? 'Publishing…' : 'Publish'}
              </button>
            )}
            <p style={styles.publishHint}>
              {site.status === 'published'
                ? 'Your site is live. Unpublish to hide it.'
                : 'Publish to make your site live at a public URL.'}
            </p>
          </div>
        </aside>

        <section style={styles.previewSection}>
          <h3 style={styles.previewTitle}>Preview</h3>
          <iframe
            title="Preview"
            srcDoc={previewHtml}
            style={styles.previewFrame}
            sandbox="allow-same-origin"
          />
        </section>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--muted)',
  },
  error: {
    padding: '1rem',
    color: '#f87171',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  backBtn: {
    background: 'transparent',
    color: 'var(--muted)',
    padding: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    font: 'inherit',
  },
  siteNameInput: {
    flex: 1,
    maxWidth: '280px',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '1rem',
  },
  saving: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
  },
  banner: {
    padding: '0.5rem 1rem',
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    fontSize: '0.85rem',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: '0.85rem',
    color: 'var(--muted)',
  },
  badge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  badgeDraft: {
    background: 'var(--border)',
    color: 'var(--muted)',
  },
  badgePublished: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
  },
  liveLink: {
    marginLeft: '0.5rem',
    fontSize: '0.9rem',
  },
  smallBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  layout: {
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
    marginBottom: '0.25rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
  sidebarHint: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginBottom: '1rem',
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
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  colorInput: {
    width: '100%',
    height: '40px',
    padding: '2px',
    cursor: 'pointer',
  },
  imageField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  fileInput: {
    fontSize: '0.8rem',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  publishBlock: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
  },
  publishBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  unpublishBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--surface)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  publishHint: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginTop: '0.5rem',
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
}
