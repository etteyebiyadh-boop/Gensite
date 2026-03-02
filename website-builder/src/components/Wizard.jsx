import { useState, useEffect } from 'react'

const TYPES = ['Portfolio', 'SaaS / Software', 'Restaurant', 'Store / E-commerce', 'Agency / Consulting', 'Local Business']
const VIBES = [
    { id: 'dark', label: 'Dark & Modern', color: '#18181b', ring: '#6366f1' },
    { id: 'light', label: 'Clean & Minimal', color: '#f4f4f5', ring: '#a1a1aa' },
    { id: 'vibrant', label: 'Vibrant & Colorful', color: 'linear-gradient(135deg, #a855f7, #ec4899)', ring: '#ec4899' },
    { id: 'professional', label: 'Professional & Elegant', color: '#1e293b', ring: '#3b82f6' }
]

export default function Wizard({ onComplete, onCancel }) {
    const [step, setStep] = useState(1)
    const [siteType, setSiteType] = useState('')
    const [siteName, setSiteName] = useState('')
    const [vibe, setVibe] = useState('')
    const [generating, setGenerating] = useState(false)
    const [loadingText, setLoadingText] = useState('Analyzing your profile...')

    const handleNext = () => setStep((s) => s + 1)
    const handleBack = () => setStep((s) => s - 1)

    const handleFinish = () => {
        setGenerating(true)
        setTimeout(() => setLoadingText('Choosing the perfect layout...'), 1200)
        setTimeout(() => setLoadingText('Applying themes and typography...'), 2400)
        setTimeout(() => setLoadingText('Drafting copy and assembling pieces...'), 3600)
        setTimeout(() => {
            onComplete({ siteType, siteName, vibe })
        }, 5000)
    }

    if (generating) {
        return (
            <div style={styles.container}>
                <div style={styles.glassCard}>
                    <div style={styles.spinnerWrap}>
                        <div style={styles.spinner}></div>
                        <div style={styles.spinnerInner}></div>
                    </div>
                    <h2 style={styles.title}>AI is building your site</h2>
                    <p style={styles.loadingText}>{loadingText}</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <button onClick={onCancel} style={styles.backGlobal}>← Cancel</button>

            <div style={styles.glassCard}>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${(step / 3) * 100}%` }}></div>
                </div>

                {step === 1 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.title}>What kind of website are you building?</h2>
                        <p style={styles.subtitle}>We will tailor the tools and templates to your niche.</p>
                        <div style={styles.grid}>
                            {TYPES.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setSiteType(t); handleNext() }}
                                    style={{
                                        ...styles.typeBtn,
                                        ...(siteType === t ? styles.typeBtnActive : {})
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div style={styles.actionsBox}>
                            <button onClick={handleNext} disabled={!siteType} style={styles.nextBtn}>Continue</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.title}>What's the name of your project?</h2>
                        <p style={styles.subtitle}>This will be used for your logo and main headline.</p>
                        <input
                            type="text"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="e.g. Acme Corp..."
                            style={styles.input}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && siteName.trim()) handleNext()
                            }}
                        />
                        <div style={styles.actionsBoxBetween}>
                            <button onClick={handleBack} style={styles.backBtn}>Back</button>
                            <button onClick={handleNext} disabled={!siteName.trim()} style={styles.nextBtn}>Continue</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={styles.stepContent}>
                        <h2 style={styles.title}>Pick a design vibe.</h2>
                        <p style={styles.subtitle}>Our AI will generate a custom theme matching your style.</p>
                        <div style={styles.vibesGrid}>
                            {VIBES.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setVibe(v.id)}
                                    style={{
                                        ...styles.vibeBtn,
                                        ...(vibe === v.id ? { borderColor: v.ring, boxShadow: `0 0 0 1px ${v.ring}` } : {})
                                    }}
                                >
                                    <div style={{ ...styles.vibeColor, background: v.color }}></div>
                                    <span>{v.label}</span>
                                </button>
                            ))}
                        </div>
                        <div style={styles.actionsBoxBetween}>
                            <button onClick={handleBack} style={styles.backBtn}>Back</button>
                            <button onClick={handleFinish} disabled={!vibe} style={styles.generateBtn}>✨ Generate My Site</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1a1a24, #09090b)',
        position: 'relative',
        padding: '2rem',
    },
    backGlobal: {
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--muted)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
    },
    glassCard: {
        background: 'rgba(18, 18, 20, 0.45)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '3rem',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 24px 40px -8px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(255,255,255,0.05)',
    },
    progressFill: {
        height: '100%',
        background: 'var(--accent)',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    stepContent: {
        animation: 'fade-in 0.4s ease forwards',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: '#fff',
        lineHeight: 1.2,
    },
    subtitle: {
        fontSize: '0.95rem',
        color: 'var(--muted)',
        marginBottom: '2rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
    },
    typeBtn: {
        padding: '1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--text)',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: 500,
        transition: 'all 0.2s',
    },
    typeBtnActive: {
        background: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'var(--accent)',
        color: '#fff',
    },
    input: {
        width: '100%',
        padding: '1rem 1.25rem',
        fontSize: '1.1rem',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '2rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    },
    vibesGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '2rem',
    },
    vibeBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        color: 'var(--text)',
        fontSize: '0.95rem',
        fontWeight: 500,
        transition: 'all 0.2s',
    },
    vibeColor: {
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    actionsBox: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    actionsBoxBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextBtn: {
        background: '#fff',
        color: '#000',
        padding: '0.75rem 2rem',
        borderRadius: '999px',
        fontWeight: 600,
        opacity: 1,
        transition: 'opacity 0.2s',
    },
    backBtn: {
        background: 'transparent',
        color: 'var(--muted)',
        border: 'none',
        padding: '0.75rem 1rem',
    },
    generateBtn: {
        background: 'linear-gradient(135deg, var(--accent), #a855f7)',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    },
    spinnerWrap: {
        position: 'relative',
        width: '64px',
        height: '64px',
        margin: '0 auto 2rem',
    },
    spinner: {
        position: 'absolute',
        inset: 0,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    spinnerInner: {
        position: 'absolute',
        inset: '8px',
        border: '3px solid transparent',
        borderLeftColor: '#a855f7',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite reverse',
    },
    loadingText: {
        color: 'var(--muted)',
        marginTop: '0.5rem',
        fontSize: '0.95rem',
        textAlign: 'center',
    }
}
