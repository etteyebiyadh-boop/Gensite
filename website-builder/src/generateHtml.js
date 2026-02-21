// Generate full HTML for export/preview from template id + content
export function generateHtml(templateId, content) {
  const c = { ...content }
  const color = c.primaryColor || '#6366f1'

  switch (templateId) {
    case 'landing': {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.title || 'My site')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .hero { text-align: center; max-width: 36rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    p { color: #8888a0; margin-bottom: 1.5rem; }
    a { display: inline-block; background: ${color}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 600; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>${escapeHtml(c.title || 'Build something great')}</h1>
    <p>${escapeHtml(c.tagline || 'Create your site in minutes.')}</p>
    <a href="#">${escapeHtml(c.cta || 'Get started')}</a>
  </section>
</body>
</html>`
    }
    case 'portfolio': {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.name || 'Portfolio')}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui,sans-serif; background: #0f0f12; color: #e8e8ed; padding: 2rem; }
    .container { max-width: 42rem; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .tagline { color: #8888a0; margin-bottom: 2rem; }
    .project { background: #1a1a20; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 0.75rem; border-left: 4px solid ${color}; }
    .project strong { color: ${color}; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(c.name || 'Your Name')}</h1>
    <p class="tagline">${escapeHtml(c.tagline || 'Designer & developer')}</p>
    <div class="project"><strong>${escapeHtml(c.project1 || 'Project One')}</strong></div>
    <div class="project"><strong>${escapeHtml(c.project2 || 'Project Two')}</strong></div>
  </div>
</body>
</html>`
    }
    case 'simple':
    default: {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.title || 'Welcome')}</title>
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
    <h1>${escapeHtml(c.title || 'Welcome')}</h1>
    <p>${escapeHtml((c.body || '').replace(/\n/g, '<br>'))}</p>
  </div>
</body>
</html>`
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
