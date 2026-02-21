// GET /api/sites/[id] — get site | PATCH /api/sites/[id] — update site

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

export const config = { api: { bodyParser: true } }

function getId(req) {
  const match = req.url && req.url.match(/\/api\/sites\/([^/?#]+)/)
  return match ? match[1] : req.query.id
}

export default async function handler(req, res) {
  const id = getId(req)
  if (!id) return res.status(400).json({ error: 'Missing site id' })

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      error: 'Server not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return res.status(404).json({ error: 'Site not found' })
    return res.json(data)
  }

  if (req.method === 'PATCH') {
    const { name, content } = req.body || {}
    const updates = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (content !== undefined) updates.content = content

    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(400).json({ error: error.message })
    return res.json(data)
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).end()
}
