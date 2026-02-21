// Template configs: default content and structure for generated sites
export const templates = [
  {
    id: 'landing',
    name: 'Landing page',
    description: 'Hero, features, CTA — ideal for products or apps',
    fields: [
      { key: 'title', label: 'Headline', default: 'Build something great' },
      { key: 'tagline', label: 'Tagline', default: 'Create your site in minutes. No code.' },
      { key: 'cta', label: 'Button text', default: 'Get started' },
      { key: 'primaryColor', label: 'Primary color', default: '#6366f1', type: 'color' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'About, projects, contact — for creatives and devs',
    fields: [
      { key: 'name', label: 'Your name', default: 'Your Name' },
      { key: 'tagline', label: 'Short bio', default: 'Designer & developer' },
      { key: 'project1', label: 'Project 1 title', default: 'Project One' },
      { key: 'project2', label: 'Project 2 title', default: 'Project Two' },
      { key: 'primaryColor', label: 'Primary color', default: '#0ea5e9', type: 'color' },
    ],
  },
  {
    id: 'simple',
    name: 'Simple page',
    description: 'One section: title and paragraph',
    fields: [
      { key: 'title', label: 'Title', default: 'Welcome' },
      { key: 'body', label: 'Paragraph', default: 'Add your content here.', type: 'textarea' },
      { key: 'primaryColor', label: 'Primary color', default: '#10b981', type: 'color' },
    ],
  },
]

export function getTemplateById(id) {
  return templates.find((t) => t.id === id) ?? templates[0]
}

export function getDefaultContent(template) {
  return template.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
}
