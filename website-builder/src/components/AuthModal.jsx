import { useState } from 'react'
import { supabase } from '../lib/siteApi'

export default function AuthModal({ show, onClose, onAuthSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    if (!show || !supabase) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                onAuthSuccess && onAuthSuccess()
            } else {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                setSuccessMsg('Check your email for the confirmation link.')
            }
        } catch (err) {
            setErrorMsg(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modal}>
                <h3 style={styles.modalTitle}>{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
                <p style={styles.modalText}>
                    {isLogin
                        ? 'Sign in to access your dashboard and manage your sites.'
                        : 'Sign up to publish and manage your professional websites.'}
                </p>

                {errorMsg && <div style={styles.error}>{errorMsg}</div>}
                {successMsg && <div style={styles.success}>{successMsg}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>
                        Email address
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="you@company.com"
                        />
                    </label>
                    <label style={styles.label}>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </label>
                    <div style={styles.actions}>
                        <button type="button" onClick={onClose} style={styles.btnSecondary} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" style={styles.btnPrimary} disabled={loading}>
                            {loading ? 'Submitting...' : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div style={styles.footer}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={() => setIsLogin(!isLogin)} style={styles.linkBtn}>
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const styles = {
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
    },
    modal: {
        background: 'var(--surface, #121214)',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.4))',
    },
    modalTitle: {
        margin: '0 0 0.5rem',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text, #f4f4f5)',
    },
    modalText: {
        margin: '0 0 1.5rem',
        fontSize: '0.875rem',
        color: 'var(--muted, #a1a1aa)',
        lineHeight: 1.5,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        fontSize: '0.85rem',
        color: 'var(--text, #f4f4f5)',
        fontWeight: 500,
    },
    input: {
        padding: '0.6rem 0.75rem',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '8px',
        background: 'var(--bg, #09090b)',
        color: 'var(--text, #f4f4f5)',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    btnPrimary: {
        background: 'var(--accent, #6366f1)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontWeight: 600,
    },
    btnSecondary: {
        background: 'transparent',
        color: 'var(--muted, #a1a1aa)',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontWeight: 500,
    },
    error: {
        fontSize: '0.85rem',
        color: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '0.5rem',
        borderRadius: '6px',
        marginBottom: '1rem',
    },
    success: {
        fontSize: '0.85rem',
        color: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '0.5rem',
        borderRadius: '6px',
        marginBottom: '1rem',
    },
    footer: {
        marginTop: '1.5rem',
        fontSize: '0.85rem',
        color: 'var(--muted, #a1a1aa)',
        textAlign: 'center',
    },
    linkBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--accent, #6366f1)',
        padding: 0,
        cursor: 'pointer',
        fontWeight: 600,
    }
}
