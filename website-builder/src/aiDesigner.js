import {
  getTemplateById,
  getDefaultContent,
  baseTemplates,
  colorThemes,
  templates,
  searchTemplates,
  getCategories,
} from './templates'

// Keyword → base template id (order matters: more specific first)
const KEYWORD_TO_BASE = [
  ['real estate', 'realestate'],
  ['realestate', 'realestate'],
  ['property', 'realestate'],
  ['medical', 'medical'],
  ['clinic', 'medical'],
  ['doctor', 'medical'],
  ['health', 'medical'],
  ['legal', 'legal'],
  ['lawyer', 'legal'],
  ['law firm', 'legal'],
  ['education', 'education'],
  ['course', 'education'],
  ['school', 'education'],
  ['beauty', 'beauty'],
  ['salon', 'beauty'],
  ['hair', 'beauty'],
  ['hotel', 'hotel'],
  ['accommodation', 'hotel'],
  ['travel', 'travel'],
  ['tour', 'travel'],
  ['pet', 'petcare'],
  ['vet', 'petcare'],
  ['pet care', 'petcare'],
  ['cleaning', 'cleaning'],
  ['handyman', 'handyman'],
  ['plumber', 'handyman'],
  ['repair', 'handyman'],
  ['moving', 'moving'],
  ['movers', 'moving'],
  ['insurance', 'insurance'],
  ['podcast', 'podcast'],
  ['cafe', 'cafe'],
  ['coffee', 'cafe'],
  ['bakery', 'bakery'],
  ['spa', 'spa'],
  ['wellness', 'spa'],
  ['dental', 'dental'],
  ['dentist', 'dental'],
  ['childcare', 'childcare'],
  ['kindergarten', 'childcare'],
  ['coaching', 'coaching'],
  ['life coach', 'coaching'],
  ['store', 'localstore'],
  ['shop', 'localstore'],
  ['pricing', 'pricing'],
  ['contact', 'contact'],
  ['team', 'team'],
  ['about us', 'team'],
  ['wedding', 'wedding'],
  ['restaurant', 'restaurant'],
  ['menu', 'restaurant'],
  ['food', 'restaurant'],
  ['gym', 'fitness'],
  ['fitness', 'fitness'],
  ['workout', 'fitness'],
  ['coach', 'fitness'],
  ['nonprofit', 'nonprofit'],
  ['donate', 'nonprofit'],
  ['charity', 'nonprofit'],
  ['cause', 'nonprofit'],
  ['event', 'event'],
  ['conference', 'event'],
  ['register', 'event'],
  ['rsvp', 'wedding'],
  ['resume', 'resume'],
  ['cv', 'resume'],
  ['curriculum', 'resume'],
  ['job', 'resume'],
  ['blog', 'blog'],
  ['magazine', 'blog'],
  ['article', 'blog'],
  ['post', 'blog'],
  ['agency', 'agency'],
  ['consulting', 'consulting'],
  ['consultant', 'consulting'],
  ['strategy', 'consulting'],
  ['workshop', 'consulting'],
  ['saas', 'saas'],
  ['software', 'saas'],
  ['platform', 'saas'],
  ['trial', 'saas'],
  ['startup', 'startup'],
  ['launch', 'startup'],
  ['early access', 'startup'],
  ['app', 'app'],
  ['mobile', 'app'],
  ['download', 'app'],
  ['product', 'product'],
  ['buy', 'product'],
  ['ecommerce', 'product'],
  ['coming soon', 'coming-soon'],
  ['notify', 'coming-soon'],
  ['photography', 'photography'],
  ['photo', 'photography'],
  ['gallery', 'photography'],
  ['portfolio', 'portfolio'],
  ['projects', 'portfolio'],
  ['creative', 'portfolio'],
  ['designer', 'portfolio'],
  ['developer', 'portfolio'],
  ['landing', 'landing'],
  ['hero', 'landing'],
  ['cta', 'landing'],
  ['minimal', 'minimal'],
  ['simple', 'simple'],
  ['card', 'card'],
  ['business card', 'card'],
  ['link in bio', 'card'],
]

// Color words → theme index (match by theme name or common words)
const COLOR_WORDS = [
  ['indigo', 'violet', 'purple', 0],
  ['sky', 'blue', 1],
  ['emerald', 'green', 2],
  ['rose', 'pink', 'red', 3],
  ['amber', 'orange', 'warm', 4],
  ['violet', 'purple', 5],
  ['cyan', 'teal', 6],
  ['pink', 7],
  ['lime', 8],
  ['orange', 9],
  ['teal', 10],
  ['fuchsia', 11],
  ['blue', 12],
  ['red', 13],
  ['dark', 'slate', 'grey', 14],
  ['lavender', 31],
  ['jade', 32],
  ['mint', 21],
  ['gold', 22],
  ['navy', 23],
  ['forest', 24],
]

function pickBaseId(text) {
  const lower = text.toLowerCase()
  for (const [keywords, baseId] of KEYWORD_TO_BASE) {
    const k = typeof keywords === 'string' ? keywords : keywords
    const list = Array.isArray(k) ? k : [k]
    if (list.some((kw) => lower.includes(kw))) return baseId
  }
  return 'landing' // default for marketing-style prompts
}

function pickThemeIndex(text) {
  const lower = text.toLowerCase()
  for (const row of COLOR_WORDS) {
    const themeIndex = row[row.length - 1]
    const words = row.slice(0, -1)
    if (words.some((w) => lower.includes(w))) return themeIndex
  }
  // Hash prompt to pick a theme so same prompt gets same theme
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash << 5) - hash + text.charCodeAt(i)
  return Math.abs(hash) % colorThemes.length
}

function fillContentFromPrompt(baseId, content, trimmed) {
  const c = { ...content }
  if (!trimmed) return c

  switch (baseId) {
    case 'landing':
    case 'saas':
    case 'app':
    case 'startup':
    case 'product':
    case 'coming-soon':
    case 'nonprofit':
    case 'fitness':
      c.title = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed
      c.tagline = c.tagline || 'Generated from your idea. Customize below.'
      break
    case 'portfolio':
    case 'photography':
    case 'agency':
    case 'consulting':
      c.name = trimmed.length > 40 ? trimmed.slice(0, 37) + '...' : trimmed
      c.tagline = c.tagline || 'Generated from your description.'
      break
    case 'simple':
    case 'minimal':
      c.body = trimmed
      break
    case 'blog':
      c.headline = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed
      c.siteName = c.siteName || 'My Blog'
      break
    case 'restaurant':
      c.name = trimmed.length > 30 ? trimmed.slice(0, 27) + '...' : trimmed
      c.tagline = c.tagline || 'Fresh and simple.'
      break
    case 'event':
    case 'wedding':
      c.title = trimmed.length > 50 ? trimmed.slice(0, 47) + '...' : trimmed
      break
    case 'resume':
      c.name = trimmed.length > 30 ? trimmed.slice(0, 27) + '...' : trimmed
      c.title = c.title || 'Professional'
      break
    case 'card':
      c.name = trimmed.length > 25 ? trimmed.slice(0, 22) + '...' : trimmed
      c.tagline = c.tagline || 'Let\'s connect.'
      break
    case 'realestate':
    case 'hotel':
    case 'travel':
    case 'petcare':
    case 'cleaning':
    case 'handyman':
    case 'moving':
    case 'insurance':
    case 'cafe':
    case 'dental':
    case 'childcare':
    case 'coaching':
    case 'localstore':
    case 'contact':
      c.name = trimmed.length > 40 ? trimmed.slice(0, 37) + '...' : trimmed
      c.tagline = c.tagline || 'Just add your details.'
      break
    case 'education':
    case 'podcast':
    case 'pricing':
      c.title = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed
      c.tagline = c.tagline || 'Customize below.'
      break
    case 'medical':
    case 'legal':
    case 'beauty':
    case 'spa':
      c.name = trimmed.length > 40 ? trimmed.slice(0, 37) + '...' : trimmed
      c.tagline = c.tagline || 'List your services in the form.'
      break
    case 'bakery':
      c.name = trimmed.length > 30 ? trimmed.slice(0, 27) + '...' : trimmed
      break
    case 'team':
      c.name = trimmed.length > 40 ? trimmed.slice(0, 37) + '...' : trimmed
      break
    default:
      c.title = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed
  }
  return c
}

/**
 * Get a short AI suggestion message based on the chosen template and prompt.
 */
export function getSuggestion(baseId, prompt) {
  const lower = (prompt || '').toLowerCase()
  const tips = {
    landing: 'Edit the headline and CTA to match your product. You can change the accent color in the sidebar.',
    portfolio: 'Add your project names and bio. Use the color picker to match your brand.',
    simple: 'Replace the title and paragraph with your content. Keep it short or paste longer text.',
    saas: 'Great for apps and tools. Customize the headline and trial CTA.',
    agency: 'List your services and tagline. Perfect for creative agencies.',
    blog: 'Set your blog name and featured headline. You can add more sections later.',
    restaurant: 'Update the restaurant name and dish names. Add more items in the editor if needed.',
    event: 'Set the event name and date. Use the button for registration or RSVP.',
    resume: 'Fill in your name, title, and summary. Export as HTML to share.',
    product: 'Highlight your product name and benefits. CTA can link to checkout.',
    app: 'Ideal for mobile or web app launch. Customize the download CTA.',
    'coming-soon': 'Use for pre-launch pages. Add an email signup later if you need.',
    minimal: 'Minimal layout. Focus on one message.',
    photography: 'Showcase your projects. Add more project titles in the form.',
    startup: 'Bold hero for startups. Change the CTA to your waitlist or signup.',
    consulting: 'List your offers and expertise. Edit the tagline to stand out.',
    fitness: 'Gym or coach page. Set your name and book/session CTA.',
    wedding: 'Save-the-date style. Update names and date.',
    nonprofit: 'Mission and donate CTA. Customize the message.',
    card: 'Link-in-bio or business card. Name, role, and one line.',
    realestate: 'Ready-made — just add your agency name and contact.',
    medical: 'Ready-made — add your clinic name and services.',
    legal: 'Ready-made — add your firm name and practice areas.',
    education: 'Ready-made — add your course or school name.',
    beauty: 'Ready-made — add your salon name and services.',
    hotel: 'Ready-made — add your hotel name and book CTA.',
    travel: 'Ready-made — add your agency name.',
    petcare: 'Ready-made — add your business name.',
    cleaning: 'Ready-made — add your company name.',
    handyman: 'Ready-made — add your business name.',
    moving: 'Ready-made — add your company name.',
    insurance: 'Ready-made — add your agency name.',
    podcast: 'Ready-made — add your show name.',
    cafe: 'Ready-made — add your cafe name.',
    bakery: 'Ready-made — add your bakery and specialties.',
    spa: 'Ready-made — add your spa name and services.',
    dental: 'Ready-made — add your clinic name.',
    childcare: 'Ready-made — add your centre name.',
    coaching: 'Ready-made — add your name and offer.',
    localstore: 'Ready-made — add your store name.',
    pricing: 'Ready-made — add your product and price.',
    contact: 'Ready-made — add your business name.',
    team: 'Ready-made — add your company and team members.',
  }
  const tip = tips[baseId] || 'Ready-made template — just replace with your details.'
  if (lower.includes('color') || lower.includes('theme')) {
    return `${tip} Try picking another template from the grid to get a different color theme — we have 50 themes.`
  }
  return tip
}

/**
 * Request a site layout from the "AI" (smart template + content from prompt).
 * Returns { templateId, content, suggestion }.
 */
export async function requestAiSite(prompt) {
  const trimmed = (prompt || '').trim()
  const baseId = pickBaseId(trimmed || 'landing')
  const themeIndex = pickThemeIndex(trimmed)

  const templateId = `${baseId}__${themeIndex}`
  const template = getTemplateById(templateId)
  let content = getDefaultContent(template)
  content = fillContentFromPrompt(baseId, content, trimmed)

  const suggestion = getSuggestion(baseId, prompt)

  return {
    templateId,
    content,
    suggestion,
  }
}

/**
 * Get quick-reply suggestions for the chat (e.g. "I need a portfolio", "Restaurant menu").
 */
export function getQuickSuggestions() {
  return [
    'Landing page for my SaaS product',
    'Portfolio for a designer',
    'Restaurant menu and contact',
    'Event registration page',
    'Resume / CV one-pager',
    'Blog or magazine style',
    'Coming soon / notify me',
    'App download page',
    'Wedding save the date',
    'Minimal single page',
    'Agency services page',
    'Fitness coach or gym',
  ]
}

/**
 * Get template suggestions based on a short query (for "show me X" style).
 */
export function suggestTemplates(query, limit = 6) {
  const q = (query || '').trim().toLowerCase()
  if (!q) {
    return templates.slice(0, limit).map((t) => ({ id: t.id, name: t.name, category: t.category }))
  }
  const results = searchTemplates(query)
  return results.slice(0, limit).map((t) => ({ id: t.id, name: t.name, category: t.category }))
}

export { baseTemplates, colorThemes, getCategories }
