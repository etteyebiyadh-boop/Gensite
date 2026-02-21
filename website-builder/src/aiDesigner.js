import { getTemplateById, getDefaultContent } from './templates'

// Simple local \"AI\" stub.
// You can later replace this with a real model/API call
// and keep the same return shape.
export async function requestAiSite(prompt) {
  const text = (prompt || '').toLowerCase()

  let templateId = 'simple'
  if (text.includes('portfolio') || text.includes('projects')) {
    templateId = 'portfolio'
  } else if (text.includes('landing') || text.includes('product') || text.includes('saas')) {
    templateId = 'landing'
  }

  const template = getTemplateById(templateId)
  const base = getDefaultContent(template)

  const trimmed = prompt.trim()

  const content = { ...base }
  if (templateId === 'landing') {
    if (trimmed) {
      content.title = `Launch ${trimmed}`
      content.tagline = 'A clean, modern landing page generated from your idea.'
    }
  } else if (templateId === 'portfolio') {
    if (trimmed) {
      content.name = trimmed
      content.tagline = 'Portfolio generated from your description.'
    }
  } else if (templateId === 'simple') {
    if (trimmed) {
      content.body = trimmed
    }
  }

  return {
    templateId,
    content,
  }
}

