// API endpoint for site analytics tracking
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

// Parse user agent for device info
function parseUserAgent(userAgent) {
    const deviceType = /mobile/i.test(userAgent) ? 'mobile' : 'desktop'
    let browser = 'Unknown'
    let os = 'Unknown'

    if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/safari/i.test(userAgent)) browser = 'Safari'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/edge/i.test(userAgent)) browser = 'Edge'

    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS'

    return { deviceType, browser, os }
}

export default async function handler(req, res) {
    const { id } = req.query

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (!id) {
        return res.status(400).json({ error: 'Site ID required' })
    }

    try {
        // Verify site exists and is published
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('id, status')
            .eq('id', id)
            .single()

        if (siteError || !site) {
            return res.status(404).json({ error: 'Site not found' })
        }

        if (site.status !== 'published') {
            return res.status(400).json({ error: 'Site not published' })
        }

        // GET: Retrieve analytics
        if (req.method === 'GET') {
            const { days = 30, limit = 100 } = req.query

            const startDate = new Date()
            startDate.setDate(startDate.getDate() - parseInt(days))

            const { data, error } = await supabase
                .from('site_analytics')
                .select('*')
                .eq('site_id', id)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false })
                .limit(parseInt(limit))

            if (error) throw error

            // Aggregate stats
            const stats = {
                totalViews: data?.length || 0,
                uniqueVisitors: new Set(data?.map(d => d.visitor_token)).size,
                topPages: {},
                devices: {},
                browsers: {},
                countries: {}
            }

            data?.forEach(record => {
                // Top pages
                stats.topPages[record.page_path] = (stats.topPages[record.page_path] || 0) + 1
                // Devices
                stats.devices[record.device_type] = (stats.devices[record.device_type] || 0) + 1
                // Browsers
                stats.browsers[record.browser] = (stats.browsers[record.browser] || 0) + 1
                // Countries
                if (record.country) {
                    stats.countries[record.country] = (stats.countries[record.country] || 0) + 1
                }
            })

            // Convert topPages to array
            stats.topPages = Object.entries(stats.topPages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([path, count]) => ({ path, count }))

            return res.status(200).json(stats)
        }

        // POST: Track page view
        if (req.method === 'POST') {
            const {
                page_path = '/',
                referrer,
                country,
                visitor_token
            } = req.body

            const userAgent = req.headers['user-agent'] || ''
            const { deviceType, browser, os } = parseUserAgent(userAgent)

            // Get or create visitor token
            const token = visitor_token || crypto.randomUUID()

            const { error } = await supabase
                .from('site_analytics')
                .insert({
                    site_id: id,
                    visitor_token: token,
                    page_path,
                    referrer,
                    user_agent: userAgent,
                    country,
                    device_type: deviceType,
                    browser,
                    operating_system: os
                })

            if (error) {
                console.error('Analytics tracking error:', error)
            }

            // Increment view count on site
            await supabase
                .from('sites')
                .update({
                    view_count: (site.view_count || 0) + 1
                })
                .eq('id', id)

            return res.status(201).json({
                success: true,
                visitor_token: token
            })
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('Analytics error:', error)
        return res.status(500).json({ error: error.message })
    }
}
