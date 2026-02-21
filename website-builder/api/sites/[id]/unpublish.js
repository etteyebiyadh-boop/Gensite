// POST /api/sites/[id]/unpublish — set status = draft, clear published_html

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

function getId(req) {
  const match = req.url && req.url.match(/\/api\/sites\/([^/]+)\/unpublish/)
  return match ? match[1] : req.query.id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const id = getId(req)
  if (!id) return res.status(400).json({ error: 'Missing site id' })

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: 'Server not configured.' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('sites')
    .update({
      published_html: null,
      status: 'draft',
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
