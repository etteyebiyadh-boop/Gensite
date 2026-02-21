// GET /api/s/[id] — serve published site as HTML (public live URL)

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

function getId(req) {
  const match = req.url && req.url.match(/\/api\/s\/([^/?#]+)/)
  return match ? match[1] : req.query.id
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }

  const id = getId(req)
  if (!id) return res.status(400).send('Missing site id')

  if (!supabaseUrl || !supabaseKey) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(503).send('<h1>Site not configured</h1><p>Backend not set up.</p>')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('sites')
    .select('published_html, status')
    .eq('id', id)
    .single()

  if (error || !data) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(404).send('<h1>Site not found</h1>')
  }

  if (data.status !== 'published' || !data.published_html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(404).send('<h1>Not published</h1><p>This site is not live yet.</p>')
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=60')
  res.status(200).send(data.published_html)
}
