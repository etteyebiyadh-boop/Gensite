// API endpoint for site custom domains
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

// Only initialize if both are provided
const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

export default async function handler(req, res) {
    const { id } = req.query

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (!id) {
        return res.status(400).json({ error: 'Site ID required' })
    }

    try {
        // Get site to verify ownership
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('user_id, custom_domain')
            .eq('id', id)
            .single()

        if (siteError || !site) {
            return res.status(404).json({ error: 'Site not found' })
        }

        // GET: List custom domains
        if (req.method === 'GET') {
            const { data: domains, error } = await supabase
                .from('custom_domains')
                .select('*')
                .eq('site_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return res.status(200).json(domains || [])
        }

        // POST: Add custom domain
        if (req.method === 'POST') {
            const { domain } = req.body

            if (!domain) {
                return res.status(400).json({ error: 'Domain required' })
            }

            // Check if domain is already taken
            const { data: existing } = await supabase
                .from('custom_domains')
                .select('id')
                .eq('domain', domain)
                .single()

            if (existing) {
                return res.status(409).json({ error: 'Domain already in use' })
            }

            const { data, error } = await supabase
                .from('custom_domains')
                .insert({
                    site_id: id,
                    domain,
                    status: 'pending',
                    verification_token: crypto.randomUUID()
                })
                .select()
                .single()

            if (error) throw error

            // Update site's custom_domain field
            await supabase
                .from('sites')
                .update({ custom_domain: domain })
                .eq('id', id)

            return res.status(201).json(data)
        }

        // DELETE: Remove custom domain
        if (req.method === 'DELETE') {
            const { domainId } = req.body

            if (!domainId) {
                return res.status(400).json({ error: 'Domain ID required' })
            }

            const { error } = await supabase
                .from('custom_domains')
                .delete()
                .eq('id', domainId)
                .eq('site_id', id)

            if (error) throw error

            // Clear custom_domain from site if it matches
            if (site.custom_domain) {
                await supabase
                    .from('sites')
                    .update({ custom_domain: null })
                    .eq('id', id)
            }

            return res.status(200).json({ success: true })
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('Custom domain error:', error)
        return res.status(500).json({ error: error.message })
    }
}
