import { parseTemplateId } from './templates'

function escapeHtml(text) {
  if (text == null || text === '') return ''
  const div = document.createElement('div')
  div.textContent = String(text)
  return div.innerHTML
}

// Generate full HTML for export/preview from template id + content
export function generateHtml(templateId, content) {
  const { baseId } = parseTemplateId(templateId)
  const c = { ...content }
  const color = c.primaryColor || '#6366f1'

  // Shared hero-style layout (title, tagline, cta, optional heroImage)
  const heroLayout = (title, tagline, ctaText, heroImage) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || 'My site')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .hero { text-align: center; max-width: 36rem; }
    .hero img { max-width: 100%; height: auto; border-radius: 12px; margin-bottom: 1rem; max-height: 240px; object-fit: cover; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    p { color: #8888a0; margin-bottom: 1.5rem; }
    a { display: inline-block; background: ${color}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <section class="hero">
    ${heroImage ? `<img src="${escapeHtml(heroImage)}" alt="" />` : ''}
    <h1>${escapeHtml(title || 'Build something great')}</h1>
    <p>${escapeHtml(tagline || '')}</p>
    <a href="#">${escapeHtml(ctaText || 'Get started')}</a>
  </section>
</body>
</html>`

  // Portfolio / list style (name, tagline, items with optional images)
  const portfolioLayout = (name, tagline, item1, item2, avatar, img1, img2) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(name || 'Portfolio')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 0.5rem; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .tagline { color: #8888a0; margin-bottom: 2rem; }
    .item { background: #1a1a20; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 0.75rem; border-left: 4px solid ${color}; }
    .item img { width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; margin-top: 0.5rem; }
    .item strong { color: ${color}; }
  </style>
</head>
<body>
  <div class="container">
    ${avatar ? `<img class="avatar" src="${escapeHtml(avatar)}" alt="" />` : ''}
    <h1>${escapeHtml(name || 'Your Name')}</h1>
    <p class="tagline">${escapeHtml(tagline || '')}</p>
    <div class="item"><strong>${escapeHtml(item1 || 'Item One')}</strong>${img1 ? `<img src="${escapeHtml(img1)}" alt="" />` : ''}</div>
    <div class="item"><strong>${escapeHtml(item2 || 'Item Two')}</strong>${img2 ? `<img src="${escapeHtml(img2)}" alt="" />` : ''}</div>
  </div>
</body>
</html>`

  // Services list + CTA (medical, legal, beauty, spa)
  const servicesWithCtaLayout = (name, tagline, item1, item2, ctaText) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(name || 'Services')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; text-align: center; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .tagline { color: #8888a0; margin-bottom: 1.5rem; }
    .item { background: #1a1a20; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 0.75rem; border-left: 4px solid ${color}; text-align: left; }
    .item strong { color: ${color}; }
    a { display: inline-block; margin-top: 1rem; background: ${color}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(name || '')}</h1>
    <p class="tagline">${escapeHtml(tagline || '')}</p>
    <div class="item"><strong>${escapeHtml(item1 || '')}</strong></div>
    <div class="item"><strong>${escapeHtml(item2 || '')}</strong></div>
    <a href="#">${escapeHtml(ctaText || 'Book now')}</a>
  </div>
</body>
</html>`

  // Simple: title + body
  const simpleLayout = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || 'Welcome')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { max-width: 32rem; }
    h1 { color: ${color}; margin-bottom: 1rem; }
    p { color: #a0a0b0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title || 'Welcome')}</h1>
    <p>${escapeHtml((body || '').replace(/\n/g, '<br>'))}</p>
  </div>
</body>
</html>`

  // Event: title, date, tagline, cta
  const eventLayout = (title, date, tagline, ctaText) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || 'Event')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .block { text-align: center; max-width: 32rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .date { color: ${color}; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #8888a0; margin-bottom: 1.5rem; }
    a { display: inline-block; background: ${color}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="block">
    <h1>${escapeHtml(title || 'Event')}</h1>
    <p class="date">${escapeHtml(date || '')}</p>
    <p>${escapeHtml(tagline || '')}</p>
    <a href="#">${escapeHtml(ctaText || 'Register')}</a>
  </div>
</body>
</html>`

  // Blog: siteName, headline, excerpt
  const blogLayout = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.siteName || 'Blog')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; }
    .site-name { color: ${color}; font-weight: 600; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .excerpt { color: #8888a0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <p class="site-name">${escapeHtml(c.siteName || 'My Blog')}</p>
    <h1>${escapeHtml(c.headline || 'Featured post')}</h1>
    <p class="excerpt">${escapeHtml((c.excerpt || '').replace(/\n/g, '<br>'))}</p>
  </div>
</body>
</html>`

  // Restaurant: name, tagline, dish1, dish2
  const restaurantLayout = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.name || 'Restaurant')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .tagline { color: #8888a0; margin-bottom: 1.5rem; }
    .dish { background: #1a1a20; border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid ${color}; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(c.name || 'The Bistro')}</h1>
    <p class="tagline">${escapeHtml(c.tagline || '')}</p>
    <div class="dish">${escapeHtml(c.dish1 || 'Dish one')}</div>
    <div class="dish">${escapeHtml(c.dish2 || 'Dish two')}</div>
  </div>
</body>
</html>`

  // Resume: name, title, summary
  const resumeLayout = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.name || 'Resume')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .title { color: ${color}; font-weight: 600; margin-bottom: 1rem; }
    .summary { color: #a0a0b0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(c.name || 'Your Name')}</h1>
    <p class="title">${escapeHtml(c.title || 'Professional title')}</p>
    <p class="summary">${escapeHtml((c.summary || '').replace(/\n/g, '<br>'))}</p>
  </div>
</body>
</html>`

  // Card: name, title, tagline
  const cardLayout = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.name || 'Card')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { max-width: 20rem; padding: 2rem; background: #1a1a20; border-radius: 16px; border-top: 4px solid ${color}; text-align: center; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .role { color: ${color}; font-size: 0.9rem; margin-bottom: 0.5rem; }
    p { color: #8888a0; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(c.name || 'Your Name')}</h1>
    <p class="role">${escapeHtml(c.title || 'Role')}</p>
    <p>${escapeHtml(c.tagline || '')}</p>
  </div>
</body>
</html>`

  switch (baseId) {
    case 'landing':
      return heroLayout(c.title, c.tagline, c.cta, c.heroImage)
    case 'portfolio':
      return portfolioLayout(c.name, c.tagline, c.project1, c.project2, c.avatar, c.project1Image, c.project2Image)
    case 'simple':
      return simpleLayout(c.title, c.body)
    case 'saas':
    case 'app':
    case 'startup':
    case 'product':
    case 'nonprofit':
    case 'fitness':
    case 'coming-soon':
      return heroLayout(c.title, c.tagline, c.cta)
    case 'agency':
    case 'consulting':
    case 'photography':
      return portfolioLayout(c.name, c.tagline, c.service1 || c.offer1 || c.project1, c.service2 || c.offer2 || c.project2)
    case 'minimal':
      return simpleLayout(c.title, c.body)
    case 'event':
    case 'wedding':
      return eventLayout(c.title, c.date, c.tagline, c.cta)
    case 'blog':
      return blogLayout()
    case 'restaurant':
      return restaurantLayout()
    case 'resume':
      return resumeLayout()
    case 'card':
      return cardLayout()
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
      return heroLayout(c.name || c.title, c.tagline, c.cta)
    case 'education':
    case 'podcast':
    case 'pricing':
      return heroLayout(c.title, c.tagline, c.cta)
    case 'medical':
    case 'legal':
    case 'beauty':
    case 'spa':
      return servicesWithCtaLayout(c.name, c.tagline, c.service1, c.service2, c.cta)
    case 'bakery':
      return restaurantLayout()
    case 'team':
      return portfolioLayout(c.name, c.tagline, c.service1, c.service2)
    default:
      return simpleLayout(c.title, c.body)
  }
}
