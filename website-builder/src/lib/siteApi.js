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
    const { data: existingSite, error: existingError } = await supabase
      .from('sites')
      .select('status')
      .eq('id', id)
      .single()

    if (existingError) throw new Error(existingError.message)

    // Enforce published-site limits only when moving draft -> published.
    if (existingSite?.status !== 'published') {
      await checkPublishLimit(id)
    }

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

  if (site.status !== 'published') {
    await checkPublishLimit(id)
  }

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

// ============================================
// USER SITES (for dashboard)
// ============================================

export async function getUserSites() {
  if (!supabase) {
    const sites = localGetAll()
    return Object.values(sites)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// ============================================
// SUBSCRIPTION & PLANS
// ============================================

export async function getPlans() {
  if (supabase) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('published', true)
      .order('display_order')
    if (error) throw new Error(error.message)
    return data || []
  }

  // Fallback plans for local mode
  return [
    { id: 'free', name: 'Free', description: 'Perfect for trying out', price_monthly: 0, price_yearly: 0, site_limit: 3, published_site_limit: 1 },
    { id: 'starter', name: 'Starter', description: 'For personal websites', price_monthly: 9, price_yearly: 90, site_limit: 10, published_site_limit: 5 },
    { id: 'pro', name: 'Pro', description: 'For small businesses', price_monthly: 29, price_yearly: 290, site_limit: 50, published_site_limit: 25 },
    { id: 'enterprise', name: 'Enterprise', description: 'For agencies', price_monthly: 99, price_yearly: 990, site_limit: -1, published_site_limit: -1 },
  ]
}

export async function getUserSubscription() {
  if (!supabase) {
    return { plan_id: 'free', status: 'active', billing_cycle: 'monthly' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function createSubscription(planId, billingCycle = 'monthly') {
  if (!supabase) {
    throw new Error('Subscriptions not available in local mode')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to subscribe.')

  // Check if subscription exists
  const existing = await getUserSubscription()
  if (existing) {
    // Update existing subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        billing_cycle: billingCycle,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('*, plans(*)')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // Create new subscription
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1))

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_id: planId,
      billing_cycle: billingCycle,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString()
    })
    .select('*, plans(*)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function cancelSubscription() {
  if (!supabase) {
    throw new Error('Subscriptions not available in local mode')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in.')

  const { error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  return true
}

// ============================================
// USAGE & LIMITS
// ============================================

export async function getUserLimits() {
  const subscription = await getUserSubscription()

  if (!subscription || !subscription.plans) {
    return {
      planId: 'free',
      planName: 'Free',
      siteLimit: 3,
      publishedSiteLimit: 1,
      storageMB: 100,
      bandwidthGB: 1,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
      teamMembers: 1
    }
  }

  const plan = subscription.plans
  return {
    planId: plan.id,
    planName: plan.name,
    siteLimit: plan.site_limit,
    publishedSiteLimit: plan.published_site_limit,
    storageMB: plan.storage_mb,
    bandwidthGB: plan.bandwidth_gb,
    customDomain: plan.custom_domain,
    analytics: plan.analytics,
    prioritySupport: plan.priority_support,
    teamMembers: plan.team_members
  }
}

export async function getUserUsage() {
  if (!supabase) {
    const sites = Object.values(localGetAll())
    return {
      totalSites: sites.length,
      publishedSites: sites.filter((site) => site.status === 'published').length,
      totalViews: sites.reduce((sum, site) => sum + (site.view_count || 0), 0),
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { totalSites: 0, publishedSites: 0, totalViews: 0 }

  const { data: sites } = await supabase
    .from('sites')
    .select('status, view_count')
    .eq('user_id', user.id)

  if (!sites) return { totalSites: 0, publishedSites: 0, totalViews: 0 }

  const totalSites = sites.length
  const publishedSites = sites.filter(s => s.status === 'published').length
  const totalViews = sites.reduce((sum, s) => sum + (s.view_count || 0), 0)

  return { totalSites, publishedSites, totalViews }
}

export async function trackUsage(userId, siteId, metricType, value) {
  if (!supabase) return

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  await supabase.from('usage_records').insert({
    user_id: userId,
    site_id: siteId,
    metric_type: metricType,
    metric_value: value,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString()
  })
}

export async function checkPublishLimit() {
  const limits = await getUserLimits()
  const usage = await getUserUsage()

  if (limits.publishedSiteLimit === -1) return true // Unlimited
  if (usage.publishedSites >= limits.publishedSiteLimit) {
    throw new Error(`You've reached your publish limit (${limits.publishedSiteLimit}). Upgrade to publish more sites.`)
  }
  return true
}

// ============================================
// CUSTOM DOMAINS
// ============================================

export async function getCustomDomains(siteId) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('site_id', siteId)

  if (error) throw new Error(error.message)
  return data || []
}

export async function addCustomDomain(siteId, domain) {
  if (!supabase) {
    throw new Error('Custom domains not available in local mode')
  }

  const limits = await getUserLimits()
  if (!limits.customDomain) {
    throw new Error('Custom domains require a Pro plan or higher.')
  }

  const { data, error } = await supabase
    .from('custom_domains')
    .insert({
      site_id: siteId,
      domain,
      status: 'pending',
      verification_token: generateId()
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function verifyCustomDomain(domainId) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('custom_domains')
    .update({ status: 'active', ssl_enabled: true })
    .eq('id', domainId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteCustomDomain(domainId) {
  if (!supabase) return

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)

  if (error) throw new Error(error.message)
}

// ============================================
// TEAM COLLABORATION
// ============================================

export async function getTeamMembers(siteId) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('team_members')
    .select('*, users(email)')
    .eq('site_id', siteId)

  if (error) throw new Error(error.message)
  return data || []
}

export async function inviteTeamMember(siteId, email, role = 'editor') {
  if (!supabase) {
    throw new Error('Team collaboration not available in local mode')
  }

  // Note: In production, you'd send an invitation email
  // For now, we'll just create the record
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in.')

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      site_id: siteId,
      user_id: user.id, // In production, lookup by email
      role,
      invited_by: user.id,
      invited_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function removeTeamMember(memberId) {
  if (!supabase) return

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (error) throw new Error(error.message)
}

// ============================================
// ANALYTICS
// ============================================

export async function getSiteAnalytics(siteId, days = 30) {
  if (!supabase) {
    return { views: [], totalViews: 0, topPages: [] }
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('site_analytics')
    .select('*')
    .eq('site_id', siteId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const views = data || []
  const totalViews = views.length

  // Get top pages
  const pageCounts = {}
  views.forEach(v => {
    pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1
  })
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))

  return { views, totalViews, topPages }
}

export async function trackPageView(siteId, pageData) {
  if (!supabase) return

  await supabase.from('site_analytics').insert({
    site_id: siteId,
    visitor_token: generateId(),
    page_path: pageData.path || '/',
    referrer: pageData.referrer,
    user_agent: pageData.userAgent,
    country: pageData.country,
    device_type: pageData.deviceType,
    browser: pageData.browser,
    operating_system: pageData.operatingSystem
  })
}

