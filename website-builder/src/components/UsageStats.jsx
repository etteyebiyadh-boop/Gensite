import { useState, useEffect } from 'react'
import { getUserUsage, getUserLimits, getUserSubscription } from '../lib/siteApi'

export default function UsageStats({ compact = false, onUpgrade }) {
    const [usage, setUsage] = useState(null)
    const [limits, setLimits] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [usageData, limitsData, subData] = await Promise.all([
                getUserUsage(),
                getUserLimits(),
                getUserSubscription()
            ])
            setUsage(usageData)
            setLimits(limitsData)
            setSubscription(subData)
        } catch (err) {
            console.error('Failed to load usage:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !usage || !limits) {
        return (
            <div style={compact ? styles.compactLoading : styles.loading}>
                Loading usage...
            </div>
        )
    }

    const getPercentage = (used, limit) => {
        if (limit === -1) return 0
        return Math.min(100, (used / limit) * 100)
    }

    const stats = [
        {
            label: 'Total Sites',
            used: usage.totalSites,
            limit: limits.siteLimit,
            icon: '🌐',
            color: '#6366f1'
        },
        {
            label: 'Published',
            used: usage.publishedSites,
            limit: limits.publishedSiteLimit,
            icon: '🚀',
            color: '#10b981'
        },
        {
            label: 'Storage',
            used: Math.round(usage.totalViews * 0.1),
            limit: limits.storageMB,
            icon: '💾',
            color: '#f59e0b'
        },
        {
            label: 'Views',
            used: usage.totalViews,
            limit: limits.bandwidthGB * 1000,
            icon: '👁',
            color: '#ec4899'
        }
    ]

    if (compact) {
        return (
            <div style={styles.compact}>
                <div style={styles.compactHeader}>
                    <span style={styles.planBadge}>{limits.planName}</span>
                    <span style={styles.planBadgeInfo}>
                        {usage.totalSites}/{limits.siteLimit === -1 ? '∞' : limits.siteLimit} sites
                    </span>
                </div>
                <div style={styles.compactBar}>
                    <div style={{
                        ...styles.compactBarFill,
                        width: `${getPercentage(usage.totalSites, limits.siteLimit)}%`,
                        background: getPercentage(usage.totalSites, limits.siteLimit) > 80 ? '#ef4444' : '#6366f1'
                    }} />
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>Usage & Limits</h3>
                    <p style={styles.plan}>
                        {limits.planName} Plan
                        {subscription?.billing_cycle === 'yearly' && ' (Yearly)'}
                    </p>
                </div>
                {onUpgrade && limits.planId !== 'enterprise' && (
                    <button style={styles.upgradeBtn} onClick={onUpgrade}>
                        Upgrade →
                    </button>
                )}
            </div>

            <div style={styles.grid}>
                {stats.map((stat, i) => {
                    const percentage = getPercentage(stat.used, stat.limit)
                    const isUnlimited = stat.limit === -1
                    const isNearLimit = percentage > 80 && !isUnlimited

                    return (
                        <div key={i} style={styles.statCard}>
                            <div style={styles.statHeader}>
                                <span style={styles.statIcon}>{stat.icon}</span>
                                <span style={styles.statLabel}>{stat.label}</span>
                            </div>
                            <div style={styles.statValue}>
                                <span style={{ color: stat.color, fontWeight: 700, fontSize: '1.5rem' }}>
                                    {stat.used}
                                </span>
                                <span style={styles.statLimit}>
                                    / {isUnlimited ? '∞' : stat.limit}
                                </span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: isUnlimited ? '30%' : `${percentage}%`,
                                    background: isNearLimit ? '#ef4444' : stat.color
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={styles.features}>
                <h4 style={styles.featuresTitle}>Plan Features</h4>
                <div style={styles.featuresGrid}>
                    <Feature flag={limits.customDomain} label="Custom Domain" />
                    <Feature flag={limits.analytics} label="Analytics" />
                    <Feature flag={limits.prioritySupport} label="Priority Support" />
                    <Feature flag={limits.teamMembers > 1} label={`${limits.teamMembers} Team Members`} />
                </div>
            </div>
        </div>
    )
}

function Feature({ flag, label }) {
    return (
        <div style={styles.feature}>
            <span style={{
                ...styles.featureIcon,
                color: flag ? '#10b981' : 'var(--muted, #a1a1aa)'
            }}>
                {flag ? '✓' : '×'}
            </span>
            <span style={{
                ...styles.featureLabel,
                color: flag ? 'var(--text, #f4f4f5)' : 'var(--muted, #a1a1aa)'
            }}>
                {label}
            </span>
        </div>
    )
}

const styles = {
    container: {
        background: 'var(--surface, #121214)',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '16px',
        padding: '1.5rem'
    },
    loading: {
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--muted, #a1a1aa)'
    },
    compactLoading: {
        padding: '0.5rem',
        textAlign: 'center',
        color: 'var(--muted, #a1a1aa)',
        fontSize: '0.75rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem'
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--text, #f4f4f5)',
        margin: '0 0 0.25rem'
    },
    plan: {
        fontSize: '0.85rem',
        color: 'var(--muted, #a1a1aa)',
        margin: 0
    },
    upgradeBtn: {
        background: 'var(--accent, #6366f1)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    statCard: {
        background: 'var(--bg, #09090b)',
        borderRadius: '12px',
        padding: '1rem'
    },
    statHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
    },
    statIcon: {
        fontSize: '1rem'
    },
    statLabel: {
        fontSize: '0.8rem',
        color: 'var(--muted, #a1a1aa)'
    },
    statValue: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.25rem',
        marginBottom: '0.5rem'
    },
    statLimit: {
        fontSize: '0.9rem',
        color: 'var(--muted, #a1a1aa)'
    },
    progressBar: {
        height: '4px',
        background: 'var(--border, #27272a)',
        borderRadius: '2px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    },
    features: {
        borderTop: '1px solid var(--border, #27272a)',
        paddingTop: '1rem'
    },
    featuresTitle: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text, #f4f4f5)',
        margin: '0 0 0.75rem'
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.5rem'
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    featureIcon: {
        fontSize: '0.9rem',
        fontWeight: 700
    },
    featureLabel: {
        fontSize: '0.8rem'
    },
    compact: {
        padding: '0.75rem',
        background: 'var(--bg, #09090b)',
        borderRadius: '8px'
    },
    compactHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
    },
    planBadge: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--accent, #6366f1)',
        background: 'rgba(99, 102, 241, 0.1)',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px'
    },
    planBadgeInfo: {
        fontSize: '0.7rem',
        color: 'var(--muted, #a1a1aa)'
    },
    compactBar: {
        height: '4px',
        background: 'var(--border, #27272a)',
        borderRadius: '2px',
        overflow: 'hidden'
    },
    compactBarFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    }
}
