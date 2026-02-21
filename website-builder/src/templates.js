// Base templates: structure and fields. Combined with color themes to form 1000 templates.
const BASE_TEMPLATES = [
  {
    id: 'landing',
    name: 'Landing page',
    description: 'Hero, features, CTA — ideal for products or apps',
    category: 'Business',
    fields: [
      { key: 'title', label: 'Headline', default: 'Build something great' },
      { key: 'tagline', label: 'Tagline', default: 'Create your site in minutes. No code.' },
      { key: 'heroImage', label: 'Hero image', default: '', type: 'image' },
      { key: 'cta', label: 'Button text', default: 'Get started' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'About, projects, contact — for creatives and devs',
    category: 'Creative',
    fields: [
      { key: 'name', label: 'Your name', default: 'Your Name' },
      { key: 'tagline', label: 'Short bio', default: 'Designer & developer' },
      { key: 'avatar', label: 'Your photo', default: '', type: 'image' },
      { key: 'project1', label: 'Project 1 title', default: 'Project One' },
      { key: 'project1Image', label: 'Project 1 image', default: '', type: 'image' },
      { key: 'project2', label: 'Project 2 title', default: 'Project Two' },
      { key: 'project2Image', label: 'Project 2 image', default: '', type: 'image' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'simple',
    name: 'Simple page',
    description: 'One section: title and paragraph',
    category: 'General',
    fields: [
      { key: 'title', label: 'Title', default: 'Welcome' },
      { key: 'body', label: 'Paragraph', default: 'Add your content here.', type: 'textarea' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'saas',
    name: 'SaaS landing',
    description: 'Product hero, features grid, pricing CTA',
    category: 'Business',
    fields: [
      { key: 'title', label: 'Headline', default: 'Ship faster with our platform' },
      { key: 'tagline', label: 'Subheadline', default: 'Everything you need to build and launch.' },
      { key: 'cta', label: 'CTA button', default: 'Start free trial' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Services, team, and contact for agencies',
    category: 'Business',
    fields: [
      { key: 'name', label: 'Agency name', default: 'Creative Agency' },
      { key: 'tagline', label: 'Tagline', default: 'We build brands that stand out.' },
      { key: 'service1', label: 'Service 1', default: 'Branding' },
      { key: 'service2', label: 'Service 2', default: 'Web design' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'blog',
    name: 'Blog / Magazine',
    description: 'Featured post and article list',
    category: 'Content',
    fields: [
      { key: 'siteName', label: 'Site name', default: 'My Blog' },
      { key: 'headline', label: 'Featured headline', default: 'Your best post yet' },
      { key: 'excerpt', label: 'Excerpt', default: 'A short preview of the article.', type: 'textarea' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Menu and contact for restaurants',
    category: 'Local',
    fields: [
      { key: 'name', label: 'Restaurant name', default: 'The Bistro' },
      { key: 'tagline', label: 'Tagline', default: 'Fresh food, daily.' },
      { key: 'dish1', label: 'Dish 1', default: 'Seasonal special' },
      { key: 'dish2', label: 'Dish 2', default: 'Chef\'s choice' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Event title, date, and signup CTA',
    category: 'Marketing',
    fields: [
      { key: 'title', label: 'Event name', default: 'Annual Conference 2025' },
      { key: 'date', label: 'Date', default: 'March 15, 2025' },
      { key: 'cta', label: 'Button text', default: 'Register now' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'resume',
    name: 'Resume / CV',
    description: 'Name, summary, and experience blocks',
    category: 'Personal',
    fields: [
      { key: 'name', label: 'Your name', default: 'Your Name' },
      { key: 'title', label: 'Professional title', default: 'Software Engineer' },
      { key: 'summary', label: 'Summary', default: 'Passionate about building great products.', type: 'textarea' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'product',
    name: 'Product page',
    description: 'Product name, benefits, and buy CTA',
    category: 'E-commerce',
    fields: [
      { key: 'title', label: 'Product name', default: 'Amazing Product' },
      { key: 'tagline', label: 'Short pitch', default: 'The best solution for your needs.' },
      { key: 'cta', label: 'Button text', default: 'Buy now' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'app',
    name: 'App landing',
    description: 'App name, value prop, and download CTA',
    category: 'Business',
    fields: [
      { key: 'title', label: 'App name', default: 'My App' },
      { key: 'tagline', label: 'Value proposition', default: 'The app that changes how you work.' },
      { key: 'cta', label: 'Button text', default: 'Download' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming soon',
    description: 'Title and email signup placeholder',
    category: 'Marketing',
    fields: [
      { key: 'title', label: 'Headline', default: 'Something great is coming' },
      { key: 'tagline', label: 'Subtext', default: 'Stay tuned for updates.' },
      { key: 'cta', label: 'Button text', default: 'Notify me' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean one-column layout',
    category: 'General',
    fields: [
      { key: 'title', label: 'Title', default: 'Hello' },
      { key: 'body', label: 'Content', default: 'Minimal and focused.', type: 'textarea' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Gallery-style portfolio for photographers',
    category: 'Creative',
    fields: [
      { key: 'name', label: 'Your name', default: 'Photographer' },
      { key: 'tagline', label: 'Tagline', default: 'Capturing moments.' },
      { key: 'project1', label: 'Project 1', default: 'Portraits' },
      { key: 'project2', label: 'Project 2', default: 'Landscapes' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'Bold hero and single CTA for startups',
    category: 'Business',
    fields: [
      { key: 'title', label: 'Headline', default: 'We\'re building the future' },
      { key: 'tagline', label: 'Tagline', default: 'Join us on the journey.' },
      { key: 'cta', label: 'Button text', default: 'Get early access' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'consulting',
    name: 'Consulting',
    description: 'Expertise and contact for consultants',
    category: 'Business',
    fields: [
      { key: 'name', label: 'Your name / firm', default: 'Consulting Co' },
      { key: 'tagline', label: 'Tagline', default: 'Strategy and execution.' },
      { key: 'offer1', label: 'Offer 1', default: 'Strategy' },
      { key: 'offer2', label: 'Offer 2', default: 'Workshops' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness / Gym',
    description: 'Gym or coach landing with CTA',
    category: 'Local',
    fields: [
      { key: 'name', label: 'Gym / Coach name', default: 'FitLife' },
      { key: 'tagline', label: 'Tagline', default: 'Get stronger every day.' },
      { key: 'cta', label: 'Button text', default: 'Book a session' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Wedding or event announcement',
    category: 'Personal',
    fields: [
      { key: 'title', label: 'Names / title', default: 'We\'re getting married' },
      { key: 'date', label: 'Date', default: 'June 2025' },
      { key: 'tagline', label: 'Short message', default: 'Save the date.' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit',
    description: 'Mission and donate CTA',
    category: 'Other',
    fields: [
      { key: 'title', label: 'Organization name', default: 'Our Cause' },
      { key: 'tagline', label: 'Mission', default: 'Making a difference together.' },
      { key: 'cta', label: 'Button text', default: 'Donate' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
  {
    id: 'card',
    name: 'Business card',
    description: 'Name, role, and links in a card',
    category: 'Personal',
    fields: [
      { key: 'name', label: 'Your name', default: 'Your Name' },
      { key: 'title', label: 'Role', default: 'Designer' },
      { key: 'tagline', label: 'One line', default: 'Let\'s connect.' },
      { key: 'primaryColor', label: 'Primary color', default: '', type: 'color' },
    ],
  },
]

// 50 color themes — combined with 20 base templates = 1000 templates
const COLOR_THEMES = [
  { id: 0, name: 'Indigo', hex: '#6366f1' },
  { id: 1, name: 'Sky', hex: '#0ea5e9' },
  { id: 2, name: 'Emerald', hex: '#10b981' },
  { id: 3, name: 'Rose', hex: '#f43f5e' },
  { id: 4, name: 'Amber', hex: '#f59e0b' },
  { id: 5, name: 'Violet', hex: '#8b5cf6' },
  { id: 6, name: 'Cyan', hex: '#06b6d4' },
  { id: 7, name: 'Pink', hex: '#ec4899' },
  { id: 8, name: 'Lime', hex: '#84cc16' },
  { id: 9, name: 'Orange', hex: '#f97316' },
  { id: 10, name: 'Teal', hex: '#14b8a6' },
  { id: 11, name: 'Fuchsia', hex: '#d946ef' },
  { id: 12, name: 'Blue', hex: '#3b82f6' },
  { id: 13, name: 'Red', hex: '#ef4444' },
  { id: 14, name: 'Slate', hex: '#64748b' },
  { id: 15, name: 'Stone', hex: '#78716c' },
  { id: 16, name: 'Zinc', hex: '#71717a' },
  { id: 17, name: 'Neutral', hex: '#737373' },
  { id: 18, name: 'Green', hex: '#22c55e' },
  { id: 19, name: 'Purple', hex: '#a855f7' },
  { id: 20, name: 'Coral', hex: '#fb7185' },
  { id: 21, name: 'Mint', hex: '#2dd4bf' },
  { id: 22, name: 'Gold', hex: '#eab308' },
  { id: 23, name: 'Navy', hex: '#1e3a8a' },
  { id: 24, name: 'Forest', hex: '#166534' },
  { id: 25, name: 'Plum', hex: '#7e22ce' },
  { id: 26, name: 'Crimson', hex: '#be123c' },
  { id: 27, name: 'Ocean', hex: '#0c4a6e' },
  { id: 28, name: 'Sand', hex: '#a16207' },
  { id: 29, name: 'Berry', hex: '#9f1239' },
  { id: 30, name: 'Peach', hex: '#ea580c' },
  { id: 31, name: 'Lavender', hex: '#7c3aed' },
  { id: 32, name: 'Jade', hex: '#059669' },
  { id: 33, name: 'Ruby', hex: '#b91c1c' },
  { id: 34, name: 'Steel', hex: '#475569' },
  { id: 35, name: 'Copper', hex: '#b45309' },
  { id: 36, name: 'Grape', hex: '#6b21a8' },
  { id: 37, name: 'Aqua', hex: '#0891b2' },
  { id: 38, name: 'Salmon', hex: '#f87171' },
  { id: 39, name: 'Sage', hex: '#65a30d' },
  { id: 40, name: 'Midnight', hex: '#312e81' },
  { id: 41, name: 'Sunset', hex: '#c2410c' },
  { id: 42, name: 'Iris', hex: '#5b21b6' },
  { id: 43, name: 'Moss', hex: '#4d7c0f' },
  { id: 44, name: 'Wine', hex: '#881337' },
  { id: 45, name: 'Arctic', hex: '#0e7490' },
  { id: 46, name: 'Honey', hex: '#d97706' },
  { id: 47, name: 'Orchid', hex: '#9333ea' },
  { id: 48, name: 'Pine', hex: '#14532d' },
  { id: 49, name: 'Blush', hex: '#be185d' },
]

// Build full template id: baseId__themeIndex (e.g. landing__0, portfolio__12)
function toTemplateId(baseId, themeIndex) {
  return `${baseId}__${themeIndex}`
}

// Parse template id into base id and theme index
export function parseTemplateId(fullId) {
  if (typeof fullId !== 'string') return { baseId: 'simple', themeIndex: 0 }
  const lastSep = fullId.lastIndexOf('__')
  if (lastSep === -1) {
    const base = BASE_TEMPLATES.find((t) => t.id === fullId)
    return { baseId: base ? base.id : 'simple', themeIndex: 0 }
  }
  const baseId = fullId.slice(0, lastSep)
  const themeIndex = parseInt(fullId.slice(lastSep + 2), 10) || 0
  return {
    baseId: BASE_TEMPLATES.some((t) => t.id === baseId) ? baseId : 'simple',
    themeIndex: Math.max(0, Math.min(themeIndex, COLOR_THEMES.length - 1)),
  }
}

// All 1000 templates: every base × every theme
export const templates = (() => {
  const list = []
  for (const base of BASE_TEMPLATES) {
    for (let i = 0; i < COLOR_THEMES.length; i++) {
      const theme = COLOR_THEMES[i]
      list.push({
        id: toTemplateId(base.id, i),
        baseId: base.id,
        themeIndex: i,
        themeName: theme.name,
        themeHex: theme.hex,
        name: `${base.name} — ${theme.name}`,
        description: base.description,
        category: base.category,
        fields: base.fields.map((f) =>
          f.key === 'primaryColor' ? { ...f, default: theme.hex } : { ...f }
        ),
      })
    }
  }
  return list
})()

export const baseTemplates = BASE_TEMPLATES
export const colorThemes = COLOR_THEMES

export function getTemplateById(id) {
  const parsed = parseTemplateId(id)
  const base = BASE_TEMPLATES.find((t) => t.id === parsed.baseId) ?? BASE_TEMPLATES[2]
  const theme = COLOR_THEMES[parsed.themeIndex] ?? COLOR_THEMES[0]
  return {
    id: toTemplateId(base.id, parsed.themeIndex),
    baseId: base.id,
    themeIndex: parsed.themeIndex,
    themeName: theme.name,
    themeHex: theme.hex,
    name: `${base.name} — ${theme.name}`,
    description: base.description,
    category: base.category,
    fields: base.fields.map((f) =>
      f.key === 'primaryColor' ? { ...f, default: theme.hex } : { ...f }
    ),
  }
}

export function getDefaultContent(template) {
  return (template.fields || []).reduce(
    (acc, f) => ({ ...acc, [f.key]: f.default ?? '' }),
    {}
  )
}

export function getThemesForBase(baseId) {
  return templates.filter((t) => t.baseId === baseId)
}

export function searchTemplates(query, category) {
  const q = (query || '').toLowerCase().trim()
  const cat = (category || '').toLowerCase().trim()
  return templates.filter((t) => {
    const matchQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.themeName.toLowerCase().includes(q)
    const matchCat = !cat || t.category.toLowerCase() === cat
    return matchQuery && matchCat
  })
}

export function getCategories() {
  const set = new Set(BASE_TEMPLATES.map((t) => t.category))
  return Array.from(set).sort()
}
