import { useState, useEffect } from 'react'
import { getPlans, getUserSubscription, createSubscription, getUserUsage, getUserLimits } from '../lib/siteApi'

const FEATURES = {
    sites: { label: 'Sites', icon: '🌐' },
    published: { label: 'Published Sites', icon: '🚀' },
    storage: { label: 'Storage (MB)', icon: '💾' },
    bandwidth: { label: 'Bandwidth (GB)', icon: '📡' },
    customDomain: { label: 'Custom Domain', icon: '🔗' },
    analytics: { label: 'Analytics', icon: '📊' },
    support: { label: 'Priority Support', icon: '🎧' },
    team: { label: 'Team Members', icon: '👥' }
}

export default function Pricing({ show, onClose, onSuccess }) {
    const [plans, setPlans] = useState([])
    const [currentSubscription, setCurrentSubscription] = useState(null)
    const [usage, setUsage] = useState(null)
    const [limits, setLimits] = useState(null)
    const [loading, setLoading] = useState(true)
    const [billingCycle, setBillingCycle] = useState('monthly')
    const [subscribing, setSubscribing] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        if (show) {
            loadData()
        }
    }, [show])

    async function loadData() {
        setLoading(true)
        setError('')
        try {
            const [plansData, subscriptionData, usageData, limitsData] = await Promise.all([
                getPlans(),
                getUserSubscription(),
                getUserUsage(),
                getUserLimits()
            ])
            setPlans(plansData)
            setCurrentSubscription(subscriptionData)
            setUsage(usageData)
            setLimits(limitsData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubscribe(planId) {
        setSubscribing(planId)
        setError('')
        try {
            await createSubscription(planId, billingCycle)
            await loadData()
            onSuccess && onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubscribing(null)
        }
    }

    if (!show) return null

    const getFeatureValue = (plan, feature) => {
        switch (feature) {
            case 'sites': return plan.site_limit === -1 ? 'Unlimited' : plan.site_limit
            case 'published': return plan.published_site_limit === -1 ? 'Unlimited' : plan.published_site_limit
            case 'storage': return plan.storage_mb
            case 'bandwidth': return plan.bandwidth_gb
            case 'customDomain': return plan.custom_domain ? '✓' : '—'
            case 'analytics': return plan.analytics ? '✓' : '—'
            case 'support': return plan.priority_support ? '✓' : '—'
            case 'team': return plan.team_members === -1 ? 'Unlimited' : plan.team_members
            default: return '—'
        }
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={onClose}>×</button>

                <div style={styles.header}>
                    <h2 style={styles.title}>Choose Your Plan</h2>
                    <p style={styles.subtitle}>
                        Start free, upgrade when you need more
                    </p>

                    {usage && limits && (
                        <div style={styles.usageBanner}>
                            <span>📊 You have {usage.totalSites} of {limits.siteLimit} sites</span>
                            {usage.publishedSites > 0 && (
                                <span>• {usage.publishedSites} published</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Billing toggle */}
                <div style={styles.toggle}>
                    <button
                        style={billingCycle === 'monthly' ? styles.toggleBtnActive : styles.toggleBtn}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        style={billingCycle === 'yearly' ? styles.toggleBtnActive : styles.toggleBtn}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly
                        <span style={styles.saveBadge}>Save 20%</span>
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {loading ? (
                    <div style={styles.loading}>Loading plans...</div>
                ) : (
                    <div style={styles.plansGrid}>
                        {plans.map(plan => {
                            const isCurrent = currentSubscription?.plan_id === plan.id
                            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly

                            return (
                                <div
                                    key={plan.id}
                                    style={{
                                        ...styles.planCard,
                                        border: isCurrent ? '2px solid var(--accent, #6366f1)' : '1px solid var(--border, #27272a)'
                                    }}
                                >
                                    {isCurrent && (
                                        <div style={styles.currentBadge}>Current Plan</div>
                                    )}
                                    {plan.id === 'pro' && (
                                        <div style={styles.popularBadge}>Most Popular</div>
                                    )}

                                    <h3 style={styles.planName}>{plan.name}</h3>
                                    <p style={styles.planDesc}>{plan.description}</p>

                                    <div style={styles.price}>
                                        <span style={styles.currency}>$</span>
                                        <span style={styles.amount}>{price === 0 ? '0' : price}</span>
                                        <span style={styles.period}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>

                                    <button
                                        style={{
                                            ...styles.subscribeBtn,
                                            background: isCurrent
                                                ? 'var(--muted, #a1a1aa)'
                                                : 'var(--accent, #6366f1)',
                                            opacity: subscribing === plan.id ? 0.7 : 1
                                        }}
                                        onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                        disabled={isCurrent || subscribing === plan.id}
                                    >
                                        {subscribing === plan.id
                                            ? 'Processing...'
                                            : isCurrent
                                                ? 'Current Plan'
                                                : price === 0
                                                    ? 'Get Started'
                                                    : 'Subscribe'}
                                    </button>

                                    <div style={styles.features}>
                                        {Object.entries(FEATURES).map(([key, { label, icon }]) => (
                                            <div key={key} style={styles.featureRow}>
                                                <span style={styles.featureIcon}>{icon}</span>
                                                <span style={styles.featureLabel}>{label}</span>
                                                <span style={{
                                                    ...styles.featureValue,
                                                    color: getFeatureValue(plan, key) === '✓' ? '#10b981' :
                                                        getFeatureValue(plan, key) === '—' ? 'var(--muted, #a1a1aa)' : 'inherit'
                                                }}>
                                                    {getFeatureValue(plan, key)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div style={styles.footer}>
                    All plans include 99.9% uptime and standard security features.<br />
                    Need a custom enterprise solution? <a href="#" style={{ color: 'var(--accent, #6366f1)', textDecoration: 'none' }}>Contact Sales</a>
                </div>
            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
    },
    modal: {
        background: 'var(--surface, #121214)',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
    },
    closeBtn: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'none',
        border: 'none',
        color: 'var(--muted, #a1a1aa)',
        fontSize: '2rem',
        cursor: 'pointer',
        lineHeight: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
        color: '#fff',
        fontWeight: 700,
    },
    subtitle: {
        fontSize: '1.1rem',
        color: 'var(--muted, #a1a1aa)',
    },
    usageBanner: {
        marginTop: '1.5rem',
        display: 'inline-flex',
        gap: '0.75rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '999px',
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 500,
    },
    toggle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '3rem',
        background: 'var(--bg, #09090b)',
        padding: '0.5rem',
        borderRadius: '999px',
        width: 'fit-content',
        margin: '0 auto 3rem',
        border: '1px solid var(--border, #27272a)',
    },
    toggleBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        border: 'none',
        background: 'transparent',
        color: 'var(--muted, #a1a1aa)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    toggleBtnActive: {
        padding: '0.75rem 1.5rem',
        borderRadius: '999px',
        border: 'none',
        background: 'var(--surface, #18181b)',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    saveBadge: {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    error: {
        textAlign: 'center',
        color: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
    },
    loading: {
        textAlign: 'center',
        color: 'var(--muted, #a1a1aa)',
        padding: '4rem 0',
        fontSize: '1.1rem',
    },
    plansGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    planCard: {
        background: 'var(--bg, #09090b)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
    },
    currentBadge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--surface, #18181b)',
        border: '1px solid var(--accent, #6366f1)',
        color: '#fff',
        padding: '0.25rem 1rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
    },
    popularBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
        color: '#fff',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    planName: {
        fontSize: '1.5rem',
        color: '#fff',
        marginBottom: '0.5rem',
        fontWeight: 700,
    },
    planDesc: {
        color: 'var(--muted, #a1a1aa)',
        fontSize: '0.95rem',
        marginBottom: '2rem',
        minHeight: '2.5rem',
    },
    price: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '2rem',
    },
    currency: {
        fontSize: '1.5rem',
        color: '#fff',
        marginTop: '0.2rem',
        fontWeight: 600,
    },
    amount: {
        fontSize: '3.5rem',
        color: '#fff',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-1px',
    },
    period: {
        fontSize: '1rem',
        color: 'var(--muted, #a1a1aa)',
        marginTop: 'auto',
        marginBottom: '0.5rem',
        marginLeft: '0.25rem',
    },
    subscribeBtn: {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        color: '#fff',
        border: 'none',
        fontWeight: 600,
        fontSize: '1.05rem',
        cursor: 'pointer',
        marginBottom: '2.5rem',
        transition: 'all 0.2s',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: 'auto',
    },
    featureRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    featureIcon: {
        fontSize: '1.1rem',
        opacity: 0.8,
    },
    featureLabel: {
        color: '#fff',
        fontSize: '0.95rem',
        flex: 1,
    },
    featureValue: {
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 600,
    },
    footer: {
        textAlign: 'center',
        color: 'var(--muted, #a1a1aa)',
        fontSize: '0.95rem',
        lineHeight: 1.6,
    }
}
