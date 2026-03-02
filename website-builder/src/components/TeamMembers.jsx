import { useState, useEffect } from 'react'
import { getTeamMembers, inviteTeamMember, removeTeamMember } from '../lib/siteApi'

const ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer'
}

const ROLE_COLORS = {
    owner: '#f59e0b',
    admin: '#6366f1',
    editor: '#10b981',
    viewer: '#6b7280'
}

export default function TeamMembers({ siteId, isOwner = false, onClose }) {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [inviting, setInviting] = useState(false)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('editor')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        loadMembers()
    }, [siteId])

    async function loadMembers() {
        try {
            const data = await getTeamMembers(siteId)
            setMembers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleInvite(e) {
        e.preventDefault()
        if (!email.trim()) return

        setInviting(true)
        setError('')
        setSuccess('')

        try {
            await inviteTeamMember(siteId, email, role)
            setSuccess('Invitation sent successfully!')
            setEmail('')
            loadMembers()
        } catch (err) {
            setError(err.message)
        } finally {
            setInviting(false)
        }
    }

    async function handleRemove(memberId) {
        if (!confirm('Are you sure you want to remove this team member?')) return

        try {
            await removeTeamMember(memberId)
            setSuccess('Team member removed')
            loadMembers()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Team Members</h3>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                {loading ? (
                    <div style={styles.loading}>Loading...</div>
                ) : (
                    <>
                        <div style={styles.membersList}>
                            {members.map(member => (
                                <div key={member.id} style={styles.memberRow}>
                                    <div style={styles.memberInfo}>
                                        <div style={styles.memberAvatar}>
                                            {(member.users?.email || member.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div style={styles.memberDetails}>
                                            <span style={styles.memberEmail}>
                                                {member.users?.email || member.email || 'Unknown'}
                                            </span>
                                            <span style={{
                                                ...styles.roleBadge,
                                                background: ROLE_COLORS[member.role] + '20',
                                                color: ROLE_COLORS[member.role]
                                            }}>
                                                {ROLE_LABELS[member.role]}
                                            </span>
                                        </div>
                                    </div>
                                    {member.role !== 'owner' && isOwner && (
                                        <button
                                            style={styles.removeBtn}
                                            onClick={() => handleRemove(member.id)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            {members.length === 0 && (
                                <div style={styles.empty}>
                                    No team members yet. Invite someone to collaborate!
                                </div>
                            )}
                        </div>

                        {isOwner && (
                            <form onSubmit={handleInvite} style={styles.inviteForm}>
                                <h4 style={styles.inviteTitle}>Invite Team Member</h4>
                                <div style={styles.inviteFields}>
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={inviting || !email.trim()}
                                        style={styles.inviteBtn}
                                    >
                                        {inviting ? 'Sending...' : 'Invite'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
    },
    modal: {
        background: 'var(--surface, #121214)',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '450px',
        width: '100%'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--text, #f4f4f5)',
        margin: 0
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--muted, #a1a1aa)',
        fontSize: '1.25rem',
        cursor: 'pointer',
        padding: '0.25rem'
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        marginBottom: '1rem'
    },
    success: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        marginBottom: '1rem'
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--muted, #a1a1aa)'
    },
    membersList: {
        marginBottom: '1.5rem'
    },
    memberRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: 'var(--bg, #09090b)',
        borderRadius: '8px',
        marginBottom: '0.5rem'
    },
    memberInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    memberAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--accent, #6366f1)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '0.9rem'
    },
    memberDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    memberEmail: {
        fontSize: '0.9rem',
        color: 'var(--text, #f4f4f5)'
    },
    roleBadge: {
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '0.15rem 0.4rem',
        borderRadius: '4px',
        width: 'fit-content'
    },
    removeBtn: {
        background: 'transparent',
        border: '1px solid var(--border, #27272a)',
        color: 'var(--muted, #a1a1aa)',
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        cursor: 'pointer'
    },
    empty: {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--muted, #a1a1aa)',
        fontSize: '0.9rem'
    },
    inviteForm: {
        borderTop: '1px solid var(--border, #27272a)',
        paddingTop: '1rem'
    },
    inviteTitle: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text, #f4f4f5)',
        margin: '0 0 0.75rem'
    },
    inviteFields: {
        display: 'flex',
        gap: '0.5rem'
    },
    input: {
        flex: 1,
        padding: '0.5rem 0.75rem',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '8px',
        background: 'var(--bg, #09090b)',
        color: 'var(--text, #f4f4f5)',
        fontSize: '0.85rem'
    },
    select: {
        padding: '0.5rem',
        border: '1px solid var(--border, #27272a)',
        borderRadius: '8px',
        background: 'var(--bg, #09090b)',
        color: 'var(--text, #f4f4f5)',
        fontSize: '0.85rem'
    },
    inviteBtn: {
        background: 'var(--accent, #6366f1)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer'
    }
}
