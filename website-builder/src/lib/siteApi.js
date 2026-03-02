// Site API: create, get, update, publish. Tries Supabase directly if configured, else falls back to localStorage.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

const STORAGE_KEY = 'website-builder-sites'

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

// ============================================
// SITE MANAGEMENT
// ============================================

export async function createSite({ name, templateId, content }) {
  // Check usage limits before creating
  const limits = await getUserLimits()
  const currentSites = await getUserSites()

  if (currentSites.length >= limits.siteLimit && limits.siteLimit !== -1) {
    throw new Error(`You've reached your site limit (${limits.siteLimit}). Upgrade your plan to create more sites.`)
  }

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be logged in to create a site.')

    const { data, error } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        name: name || 'My site',
        template_id: templateId || 'simple__0',
        content: content || {},
        status: 'draft',
      })
      .select('id, name, template_id, content, status, published_at, created_at, updated_at')
      .single()

    if (error) throw new Error(error.message)

    // Track usage
    await trackUsage(user.id, data.id, 'sites_created', 1)
    return data
  }

  // Fallback local storage
  const id = generateId()
  const sites = localGetAll()
  sites[id] = {
    id,
    name: name || 'My site',
    template_id: templateId,
    content: content || {},
    status: 'draft',
    published_html: null,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  localSetAll(sites)
  return sites[id]
}

export async function getSite(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error('Site not found')
    return data
  }

  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  return site
}

export async function updateSite(id, { name, content }) {
  if (supabase) {
    const updates = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (content !== undefined) updates.content = content

    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  const sites = localGetAll()
  const site = sites[id]
  if (!site) throw new Error('Site not found')
  if (name !== undefined) site.name = name
  if (content !== undefined) site.content = content
  site.updated_at = new Date().toISOString()
  localSetAll(sites)
  return site
}

export async function publishSite(id, html) {
  if (supabase) {
    const { data, error } = await supabase
      .from('sites')
      .update({
        published_html: html,
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
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
  if (supabase) {
    const { data, error } = await supabase
      .from('sites')
      .update({
        published_html: null,
        status: 'draft',
        published_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
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
  if (!isBackendConnected()) return null
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/api/s/${id}`
}

export function isBackendConnected() {
  return !!supabase
}

