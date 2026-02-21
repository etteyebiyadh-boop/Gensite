// POST /api/sites/[id]/publish — set published_html and status = published
// Body: { html }

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } }

function getId(req) {
  const match = req.url && req.url.match(/\/api\/sites\/([^/]+)\/publish/)
  return match ? match[1] : req.query.id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const id = getId(req)
  if (!id) return res.status(400).json({ error: 'Missing site id' })

  try {
    const { html } = req.body || {}
    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: 'Server not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('sites')
      .update({
        published_html: html || '',
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(error)
      return res.status(400).json({ error: error.message })
    }
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Publish failed' })
  }
}
