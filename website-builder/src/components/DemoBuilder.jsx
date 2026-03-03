import { useState, useEffect, useMemo } from 'react'
import { requestAiSite } from '../aiDesigner'
import { getTemplateById } from '../templates'
import { generateHtml } from '../generateHtml'
import { filterAndGroupFields } from '../lib/editorFields'
import './DemoBuilder.css'

export default function DemoBuilder({ show, initialPrompt, onClose, onUpgrade }) {
  const [step, setStep] = useState('generating') // generating | editing | success
  const [templateId, setTemplateId] = useState(null)
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [fieldSearch, setFieldSearch] = useState('')
  const [error, setError] = useState('')

  const template = templateId ? getTemplateById(templateId) : null
  const groupedFields = useMemo(
    () => filterAndGroupFields(template?.fields || [], fieldSearch),
    [template?.fields, fieldSearch]
  )

  const visibleFieldCount = useMemo(
    () => groupedFields.reduce((sum, group) => sum + group.fields.length, 0),
    [groupedFields]
  )

  const customizedFieldCount = useMemo(() => {
    if (!template?.fields?.length) return 0
    return template.fields.filter((field) => {
      const value = content[field.key]
      if (value === undefined || value === null || value === '') return false
      if (field.default === undefined) return true
      return value !== field.default
    }).length
  }, [template?.fields, content])

  useEffect(() => {
    if (show && initialPrompt) {
      generateDemoSite(initialPrompt)
    }
  }, [show, initialPrompt])

  if (!show) return null

  async function generateDemoSite(prompt) {
    setLoading(true)
    setError('')
    try {
      const result = await requestAiSite(prompt)
      setTemplateId(result.templateId)
      setContent(result.content)
      setFieldSearch('')
      setStep('editing')
    } catch (generateError) {
      setError('We could not generate this demo right now. Please try a shorter prompt.')
    } finally {
      setLoading(false)
    }
  }

  function updateField(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  function resetField(field) {
    updateField(field.key, field.default ?? '')
  }

  function resetGroup(fields) {
    setContent((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        next[field.key] = field.default ?? ''
      })
      return next
    })
  }

  async function handleSaveWork() {
    if (!email) return

    try {
      const demoData = {
        email,
        templateId,
        content,
        createdAt: new Date().toISOString(),
      }

      const existingDemos = JSON.parse(localStorage.getItem('gensite_demos') || '[]')
      existingDemos.push(demoData)
      localStorage.setItem('gensite_demos', JSON.stringify(existingDemos))

      setEmailSubmitted(true)
      setStep('success')
    } catch {
      setError('Could not save your demo data locally.')
    }
  }

  const previewHtml = templateId ? generateHtml(templateId, content) : ''

  if (step === 'generating') {
    return (
      <div className="demo-overlay">
        <div className="demo-modal">
          <button className="demo-close" onClick={onClose}>x</button>
          <div className="demo-generating">
            <div className="demo-spinner" />
            <h2>Creating your website...</h2>
            <p>Our AI is building a professional website based on your prompt.</p>
            {error && <p className="demo-error">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="demo-overlay">
        <div className="demo-modal">
          <button className="demo-close" onClick={onClose}>x</button>
          <div className="demo-success">
            <div className="demo-success-icon">OK</div>
            <h2>Your work is saved</h2>
            <p>We saved your demo draft. Create a free account to keep editing and publish.</p>
            <div className="demo-success-actions">
              <button className="demo-btn demo-btn-primary" onClick={onUpgrade}>
                Create Free Account
              </button>
              <button className="demo-btn demo-btn-ghost" onClick={onClose}>
                Close Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-overlay">
      <div className="demo-modal demo-modal-large">
        <button className="demo-close" onClick={onClose}>x</button>

        <div className="demo-header">
          <div className="demo-header-left">
            <h2>Website Preview</h2>
            <span className="demo-badge">Demo Mode</span>
          </div>
          <div className="demo-header-right">
            <button className="demo-btn demo-btn-primary" onClick={onUpgrade}>
              Save and Continue
            </button>
          </div>
        </div>

        <div className="demo-content">
          <aside className="demo-editor">
            <div className="demo-editor-header">
              <h3>Content Studio</h3>
              <p>Search and tune each section before publishing.</p>
            </div>

            <div className="demo-editor-toolbar">
              <input
                type="search"
                value={fieldSearch}
                onChange={(event) => setFieldSearch(event.target.value)}
                className="demo-input"
                placeholder="Search fields..."
              />
              <div className="demo-editor-stats">
                <span>{visibleFieldCount}/{template?.fields?.length || 0} shown</span>
                <span>{customizedFieldCount} customized</span>
                {fieldSearch && (
                  <button
                    type="button"
                    className="demo-btn demo-btn-ghost demo-clear-btn"
                    onClick={() => setFieldSearch('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="demo-fields">
              {groupedFields.length === 0 && (
                <div className="demo-empty-state">
                  No fields found for "{fieldSearch}".
                </div>
              )}

              {groupedFields.map(({ group, fields }) => (
                <section key={group} className="demo-group">
                  <div className="demo-group-header">
                    <h4>
                      {group}
                      <span>{fields.length}</span>
                    </h4>
                    <button type="button" className="demo-group-reset" onClick={() => resetGroup(fields)}>
                      Reset section
                    </button>
                  </div>

                  {fields.map((field) => (
                    <div key={field.key} className="demo-field">
                      <div className="demo-field-row">
                        <label className="demo-field-label">{field.label}</label>
                        <div className="demo-field-actions">
                          <span className="demo-field-meta">{field.type || 'text'}</span>
                          <button
                            type="button"
                            className="demo-field-reset"
                            onClick={() => resetField(field)}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      {field.type === 'color' ? (
                        <div className="demo-color-row">
                          <input
                            type="color"
                            value={content[field.key] || field.default}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            className="demo-color-input"
                          />
                          <input
                            type="text"
                            value={content[field.key] || field.default || ''}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            className="demo-input"
                          />
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={content[field.key] || ''}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="demo-textarea"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          value={content[field.key] || ''}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="demo-input"
                        />
                      )}
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <div className="demo-save-section">
              <h4>Save your work</h4>
              <p>Enter your email to save this draft and continue later.</p>
              <div className="demo-email-form">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  className="demo-email-input"
                />
                <button
                  className="demo-btn demo-btn-primary"
                  onClick={handleSaveWork}
                  disabled={!email || emailSubmitted}
                >
                  {emailSubmitted ? 'Saved' : 'Save Draft'}
                </button>
              </div>
              {error && <p className="demo-error">{error}</p>}
            </div>
          </aside>

          <section className="demo-preview">
            <div className="demo-preview-header">
              <h3>Live Preview</h3>
            </div>
            <div className="demo-preview-frame">
              <iframe
                title="Website Preview"
                srcDoc={previewHtml}
                className="demo-iframe"
                sandbox="allow-same-origin"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
