// POST /api/sites/create — create a new site (draft)
// Body: { name, template_id, content }

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

export const config = { api: { bodyParser: true } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  try {
    const { name, template_id, content } = req.body || {}
    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: 'Server not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('sites')
      .insert({
        name: name || 'My site',
        template_id: template_id || 'simple__0',
        content: content || {},
        status: 'draft',
      })
      .select('id, name, template_id, content, status, published_at, created_at, updated_at')
      .single()

    if (error) {
      console.error(error)
      return res.status(400).json({ error: error.message })
    }
    res.status(201).json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to create site' })
  }
}
