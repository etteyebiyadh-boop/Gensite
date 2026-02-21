// Site API: create, get, update, publish. Tries same-origin /api first; falls back to localStorage on 503 or error.

const EXPLICIT_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
const STORAGE_KEY = 'website-builder-sites'

function getBase() {
  if (EXPLICIT_BASE) return String(EXPLICIT_BASE).replace(/\/$/, '')
  if (typeof window !== 'undefined') return '' // same-origin /api
  return null
}

function localGetAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function localSetAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export async function createSite({ name, templateId, content }) {
  const base = getBase()
  const payload = { name: name || 'My site', template_id: templateId, content: content || {} }
  const url = base === '' ? '/api/sites/create' : `${base}/api/sites/create`

  if (base !== null) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) return res.json()
      if (res.status === 503) {
        // Backend not configured; fall through to localStorage
      } else {
        const err = await res.text()
        throw new Error(err || 'Failed to create site')
      }
    } catch (e) {
      if (e.message && e.message.includes('Failed to create')) throw e
      // Network error; fall through to localStorage
    }
  }

  const id = generateId()
  const sites = localGetAll()
  sites[id] = {
    id,
    name: payload.name,
    template_id: payload.template_id,
    content: payload.content,
    status: 'draft',
    published_html: null,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  localSetAll(sites)
  return { id, ...sites[id] }
}

export async function getSite(id) {
  const base = getBase()
  const url = base === '' ? `/api/sites/${id}` : base ? `${base}/api/sites/${id}` : null
  if (url) {
    try {
      const res = await fetch(url)
      if (res.ok) return res.json()
      if (res.status === 503) { /* fall through */ } else throw new Error('Site not found')
    } catch (e) {
      if (e.message === 'Site not found') throw e
    }
  }
  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  return site
}

export async function updateSite(id, { name, content }) {
  const base = getBase()
  const payload = {}
  if (name !== undefined) payload.name = name
  if (content !== undefined) payload.content = content

  const url = base === '' ? `/api/sites/${id}` : base ? `${base}/api/sites/${id}` : null
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) return res.json()
      if (res.status !== 503) throw new Error('Failed to update')
    } catch (e) {
      if (e.message === 'Failed to update') throw e
    }
  }

  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  if (payload.name !== undefined) site.name = payload.name
  if (payload.content !== undefined) site.content = payload.content
  site.updated_at = new Date().toISOString()
  localSetAll(sites)
  return site
}

export async function publishSite(id, html) {
  const base = getBase()
  const url = base === '' ? `/api/sites/${id}/publish` : base ? `${base}/api/sites/${id}/publish` : null
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      if (res.ok) return res.json()
      if (res.status !== 503) throw new Error(await res.text() || 'Publish failed')
    } catch (e) {
      if (e.message && e.message.includes('Publish')) throw e
    }
  }

  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  site.published_html = html
  site.status = 'published'
  site.published_at = new Date().toISOString()
  site.updated_at = site.published_at
  localSetAll(sites)
  return site
}

export async function unpublishSite(id) {
  const base = getBase()
  const url = base === '' ? `/api/sites/${id}/unpublish` : base ? `${base}/api/sites/${id}/unpublish` : null
  if (url) {
    try {
      const res = await fetch(url, { method: 'POST' })
      if (res.ok) return res.json()
      if (res.status !== 503) throw new Error('Failed to unpublish')
    } catch (e) {
      if (e.message === 'Failed to unpublish') throw e
    }
  }

  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  site.published_html = null
  site.status = 'draft'
  site.published_at = null
  site.updated_at = new Date().toISOString()
  localSetAll(sites)
  return site
}

export function getLiveSiteUrl(id) {
  if (getBase() === null) return null
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/api/s/${id}`
}

export function isBackendConnected() {
  return getBase() !== null
}
