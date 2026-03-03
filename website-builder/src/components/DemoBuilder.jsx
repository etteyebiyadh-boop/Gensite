import { useState, useEffect } from 'react'
import { requestAiSite } from '../aiDesigner'
import { getTemplateById, getDefaultContent } from '../templates'
import { generateHtml } from '../generateHtml'
import './DemoBuilder.css'

export default function DemoBuilder({ show, initialPrompt, onClose, onUpgrade }) {
  const [step, setStep] = useState('generating') // 'generating' | 'editing' | 'success'
  const [templateId, setTemplateId] = useState(null)
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const template = templateId ? getTemplateById(templateId) : null

  useEffect(() => {
    if (show && initialPrompt) {
      generateDemoSite(initialPrompt)
    }
  }, [show, initialPrompt])

  if (!show) return null

  async function generateDemoSite(prompt) {
    setLoading(true)
    try {
      const result = await requestAiSite(prompt)
      setTemplateId(result.templateId)
      setContent(result.content)
      setStep('editing')
    } catch (err) {
      console.error('Failed to generate demo site:', err)
    } finally {
      setLoading(false)
    }
  }

  function updateField(key, value) {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  async function handleSaveWork() {
    if (!email) return
    
    try {
      // Save to local storage for demo
      const demoData = {
        email,
        templateId,
        content,
        createdAt: new Date().toISOString()
      }
      
      const existingDemos = JSON.parse(localStorage.getItem('gensite_demos') || '[]')
      existingDemos.push(demoData)
      localStorage.setItem('gensite_demos', JSON.stringify(existingDemos))
      
      setEmailSubmitted(true)
      setStep('success')
    } catch (err) {
      console.error('Failed to save demo:', err)
    }
  }

  const previewHtml = templateId ? generateHtml(templateId, content) : ''

  if (step === 'generating') {
    return (
      <div className="demo-overlay">
        <div className="demo-modal">
          <button className="demo-close" onClick={onClose}>×</button>
          
          <div className="demo-generating">
            <div className="demo-spinner"></div>
            <h2>Creating your website...</h2>
            <p>Our AI is building a professional website based on your requirements.</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="demo-overlay">
        <div className="demo-modal">
          <button className="demo-close" onClick={onClose}>×</button>
          
          <div className="demo-success">
            <div className="demo-success-icon">✓</div>
            <h2>Your work is saved!</h2>
            <p>We've sent your website draft to your email. Create a free account to continue editing and publish.</p>
            
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
        <button className="demo-close" onClick={onClose}>×</button>
        
        <div className="demo-header">
          <div className="demo-header-left">
            <h2>Your Website Preview</h2>
            <span className="demo-badge">Demo Mode</span>
          </div>
          <div className="demo-header-right">
            <button className="demo-btn demo-btn-primary" onClick={onUpgrade}>
              Save & Continue
            </button>
          </div>
        </div>

        <div className="demo-content">
          {/* Left panel - Editor */}
          <aside className="demo-editor">
            <div className="demo-editor-header">
              <h3>Edit your content</h3>
              <p>Make changes below to personalize your website</p>
            </div>
            
            <div className="demo-fields">
              {template?.fields?.map((field) => (
                <div key={field.key} className="demo-field">
                  <label className="demo-field-label">
                    {field.label}
                  </label>
                  {field.type === 'color' ? (
                    <input
                      type="color"
                      value={content[field.key] || field.default}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="demo-color-input"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={content[field.key] || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="demo-textarea"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[field.key] || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="demo-input"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="demo-save-section">
              <h4>Save your work</h4>
              <p>Enter your email to save this demo and get a copy sent to you:</p>
              <div className="demo-email-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="demo-email-input"
                />
                <button 
                  className="demo-btn demo-btn-primary" 
                  onClick={handleSaveWork}
                  disabled={!email || emailSubmitted}
                >
                  {emailSubmitted ? 'Saved!' : 'Save My Work'}
                </button>
              </div>
            </div>
          </aside>

          {/* Right panel - Preview */}
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
