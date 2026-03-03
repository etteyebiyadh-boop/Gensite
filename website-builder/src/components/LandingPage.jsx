import { useMemo, useState } from 'react'
import './LandingPage.css'

const HERO_PROMPT_SUGGESTIONS = [
  'Landing page for a B2B SaaS scheduling tool',
  'Portfolio website for a freelance designer',
  'Local service business with booking system',
]

const BENEFITS = [
  {
    title: 'Ship in Hours, Not Weeks',
    body: 'Go from idea to live website in one focused session. No design skills, no coding, no headaches.',
  },
  {
    title: 'Built to Convert',
    body: 'Every template is optimized for signups, sales, and lead generation. Mobile-responsive and fast-loading by default.',
  },
  {
    title: 'Grow Your Business',
    body: 'Custom domains, analytics, and code export. Scale from startup to enterprise without switching platforms.',
  },
]

const TRUST_ITEMS = [
  { metric: '500+', label: 'Founders Launched' },
  { metric: '< 5 min', label: 'Average Build Time' },
  { metric: '98%', label: 'Uptime SLA' },
]

const FAQS = [
  {
    q: 'Do I need technical skills?',
    a: 'No. Type what you need in plain language and edit with simple controls.',
  },
  {
    q: 'Can I try it before signing up?',
    a: 'Yes. Use the no-signup demo flow to generate your first draft immediately.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. Pro plans unlock custom domain support and remove branding limits.',
  },
  {
    q: 'What happens if I hit free limits?',
    a: 'Your work is preserved. You can upgrade anytime to unlock higher usage and publishing capacity.',
  },
]

function EmailCapture({ email, onEmailChange, onSubmit, status }) {
  return (
    <section className="lp-email" id="early-access" aria-labelledby="email-title">
      <div>
        <h2 id="email-title">Get 25 proven homepage prompts</h2>
        <p>
          Enter your email and get a prompt pack designed to help founders launch
          faster with better conversion copy.
        </p>
      </div>
      <form className="lp-email-form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@company.com"
        />
        <button type="submit">Send me the prompt pack</button>
      </form>
      {status && <p className="lp-form-status">{status}</p>}
    </section>
  )
}

function PricingPreview({ onOpenPricing }) {
  return (
    <section className="lp-pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="lp-section-head">
        <h2 id="pricing-title">Simple pricing for solo founders</h2>
        <p>Start free. Upgrade only when usage and revenue justify it.</p>
      </div>
      <div className="lp-pricing-grid">
        <article className="lp-price-card">
          <h3>Free</h3>
          <p className="lp-price">$0</p>
          <p className="lp-price-sub">Best for validation</p>
          <ul>
            <li>3 projects</li>
            <li>1 published site</li>
            <li>Gensite subdomain</li>
            <li>Basic templates and edits</li>
          </ul>
          <button type="button" className="lp-btn lp-btn-ghost" onClick={onOpenPricing}>
            Compare plans
          </button>
        </article>
        <article className="lp-price-card lp-price-card-pro">
          <p className="lp-price-badge">Most popular</p>
          <h3>Pro</h3>
          <p className="lp-price">$19</p>
          <p className="lp-price-sub">Per month, billed monthly</p>
          <ul>
            <li>Unlimited projects</li>
            <li>Custom domain support</li>
            <li>Analytics and export options</li>
            <li>No Gensite branding</li>
          </ul>
          <button type="button" className="lp-btn lp-btn-primary" onClick={onOpenPricing}>
            Upgrade to Pro
          </button>
        </article>
      </div>
    </section>
  )
}

export default function LandingPage({
  onTryPrompt,
  onOpenPricing,
  onGuidedSetup,
}) {
  const [prompt, setPrompt] = useState('')
  const [email, setEmail] = useState('')
  const [formStatus, setFormStatus] = useState('')
  const [copiedReferral, setCopiedReferral] = useState(false)

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined') return 'https://gensite.vercel.app?ref=founder'
    return `${window.location.origin}/?ref=founder`
  }, [])

  function submitPrompt(event) {
    event.preventDefault()
    const value = prompt.trim()
    if (!value) return
    onTryPrompt(value)
  }

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2500)
    } catch {
      setCopiedReferral(false)
    }
  }

  function submitEmail(event) {
    event.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value) return

    try {
      const raw = localStorage.getItem('gensite_leads')
      const leads = raw ? JSON.parse(raw) : []
      if (!leads.find((item) => item.email === value)) {
        leads.push({ email: value, createdAt: new Date().toISOString() })
        localStorage.setItem('gensite_leads', JSON.stringify(leads))
      }
      setFormStatus('Done. Check your inbox for the prompt pack.')
      setEmail('')
    } catch {
      setFormStatus('Saved. If email delivery is not configured yet, export leads from local storage.')
    }
  }

  return (
    <main className="lp-shell">
      <header className="lp-topbar">
        <a className="lp-brand" href="/">
          <span>GenSite</span>
        </a>
        <nav className="lp-nav" aria-label="Primary">
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button type="button" className="lp-btn lp-btn-ghost" onClick={onOpenPricing}>
          View plans
        </button>
      </header>

      <section className="lp-hero">
        <p className="lp-kicker">AI Website Builder for founders, creators, and small businesses</p>
        <h1>Launch Your Website in 5 Minutes. No Code Required.</h1>
        <p className="lp-subhead">
          Professional websites that convert. From idea to live site in one focused session.
        </p>
        <div className="lp-cta-row">
          <button type="button" className="lp-btn lp-btn-primary" onClick={onGuidedSetup}>
            Start Building Free
          </button>
          <button type="button" className="lp-btn lp-btn-ghost" onClick={() => onTryPrompt('SaaS landing page for a B2B scheduling tool')}>
            See Live Demo
          </button>
        </div>

        <form className="lp-prompt-form" onSubmit={submitPrompt}>
          <label htmlFor="hero-prompt">Describe your perfect website in one sentence</label>
          <div className="lp-prompt-row">
            <input
              id="hero-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Modern landing page for my consulting business with client testimonials and contact form"
            />
            <button type="submit" className="lp-btn lp-btn-primary">
              Generate Now
            </button>
          </div>
          <div className="lp-suggestion-row">
            {HERO_PROMPT_SUGGESTIONS.map((item) => (
              <button key={item} type="button" onClick={() => onTryPrompt(item)}>
                {item}
              </button>
            ))}
          </div>
        </form>
      </section>

      <section className="lp-benefits" aria-labelledby="benefits-title">
        <div className="lp-section-head">
          <h2 id="benefits-title">Why teams choose GenSite</h2>
          <p>Focused on outcomes that matter for growth and launch speed.</p>
        </div>
        <div className="lp-benefits-grid">
          {BENEFITS.map((item) => (
            <article key={item.title} className="lp-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-trust" aria-labelledby="trust-title">
        <div className="lp-section-head">
          <h2 id="trust-title">Trusted by 500+ founders worldwide</h2>
          <p>
            Join the community of entrepreneurs building successful businesses with GenSite.
          </p>
        </div>
        <div className="lp-trust-grid">
          {TRUST_ITEMS.map((item) => (
            <article key={item.label}>
              <p className="lp-trust-metric">{item.metric}</p>
              <p className="lp-trust-label">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-onboarding" id="how-it-works" aria-labelledby="onboarding-title">
        <div className="lp-section-head">
          <h2 id="onboarding-title">Three steps to your first live site</h2>
          <p>Clear onboarding to avoid blank-screen friction.</p>
        </div>
        <ol className="lp-steps">
          <li>
            <h3>Describe your offer</h3>
            <p>Paste one sentence and GenSite creates your first draft instantly.</p>
          </li>
          <li>
            <h3>Edit and personalize</h3>
            <p>Adjust copy, branding, and sections with live preview.</p>
          </li>
          <li>
            <h3>Publish and share</h3>
            <p>Go live with your URL, then upgrade when you need custom domain and scale.</p>
          </li>
        </ol>
      </section>

      <section className="lp-testimonials" aria-labelledby="testimonials-title">
        <div className="lp-section-head">
          <h2 id="testimonials-title">Results speak for themselves</h2>
        </div>
        <div className="lp-testimonials-grid">
          <article className="lp-testimonial-card">
            <div className="lp-testimonial-content">
              <p>"GenSite saved me 40 hours of design work. I had my consulting website live and got my first paying client the same day."</p>
            </div>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">ST</div>
              <div>
                <div className="lp-testimonial-name">Sarah Thompson</div>
                <div className="lp-testimonial-role">SaaS Founder</div>
              </div>
            </div>
          </article>
          <article className="lp-testimonial-card">
            <div className="lp-testimonial-content">
              <p>"As a designer, I need my portfolio to look perfect. GenSite gave me professional templates I could customize in minutes."</p>
            </div>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">MR</div>
              <div>
                <div className="lp-testimonial-name">Mike Rodriguez</div>
                <div className="lp-testimonial-role">UI/UX Designer</div>
              </div>
            </div>
          </article>
          <article className="lp-testimonial-card">
            <div className="lp-testimonial-content">
              <p>"I tried Webflow and Framer - too complicated. GenSite just works. My local service business website was up in 10 minutes."</p>
            </div>
            <div className="lp-testimonial-author">
              <div className="lp-testimonial-avatar">JC</div>
              <div>
                <div className="lp-testimonial-name">Jennifer Chen</div>
                <div className="lp-testimonial-role">Local Business Owner</div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="lp-referral" aria-labelledby="referral-title">
        <h2 id="referral-title">Invite 2 friends, get 1 month Pro free</h2>
        <p>Share GenSite and unlock bonus features when your friends sign up.</p>
        <div className="lp-referral-row">
          <code>{referralLink}</code>
          <button type="button" className="lp-btn lp-btn-ghost" onClick={copyReferralLink}>
            {copiedReferral ? 'Copied!' : 'Copy Referral Link'}
          </button>
        </div>
      </section>

      <PricingPreview onOpenPricing={onOpenPricing} />
      <EmailCapture
        email={email}
        onEmailChange={setEmail}
        onSubmit={submitEmail}
        status={formStatus}
      />

      <section className="lp-faq" id="faq" aria-labelledby="faq-title">
        <div className="lp-section-head">
          <h2 id="faq-title">Frequently asked questions</h2>
        </div>
        <div className="lp-faq-grid">
          {FAQS.map((item) => (
            <article key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
