// Security middleware for API routes

export function securityHeaders(req, res, next) {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self'; " +
        "connect-src 'self' https://*.supabase.co;"
    )

    next()
}

export function validateInput(req, res, next) {
    // Validate content length
    const contentLength = JSON.stringify(req.body || {}).length
    const maxBodySize = 1024 * 1024 // 1MB

    if (contentLength > maxBodySize) {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request body exceeds maximum size of 1MB'
        })
    }

    next()
}

export function sanitizeInput(input) {
    if (typeof input === 'string') {
        // Remove potential XSS vectors
        return input
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/\"/g, '"')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput)
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized = {}
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key])
        }
        return sanitized
    }

    return input
}
