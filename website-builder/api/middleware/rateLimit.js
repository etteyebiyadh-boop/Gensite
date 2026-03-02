// Simple in-memory rate limiter
// In production, use Redis or similar for distributed rate limiting

const rateLimitStore = new Map()

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now - value.windowStart > value.windowMs) {
            rateLimitStore.delete(key)
        }
    }
}, 60000) // Clean every minute

export function rateLimit(options = {}) {
    const {
        windowMs = 60000, // 1 minute default
        maxRequests = 100, // 100 requests per window
        keyGenerator = (req) => {
            // Use IP + user ID if available
            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
            const userId = req.headers['authorization'] ? 'auth' : 'anon'
            return `${ip}:${userId}`
        },
        handler = (req, res) => {
            res.status(429).json({
                error: 'Too many requests',
                message: 'Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            })
        }
    } = options

    return (req, res, next) => {
        const key = keyGenerator(req)
        const now = Date.now()

        let record = rateLimitStore.get(key)

        if (!record || now - record.windowStart > windowMs) {
            // New window
            record = {
                windowStart: now,
                windowMs,
                count: 1
            }
            rateLimitStore.set(key, record)

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests)
            res.setHeader('X-RateLimit-Remaining', maxRequests - 1)
            res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000))

            return next()
        }

        // Increment count
        record.count++
        rateLimitStore.set(key, record)

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests)
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
        res.setHeader('X-RateLimit-Reset', Math.ceil((record.windowStart + windowMs) / 1000))

        if (record.count > maxRequests) {
            return handler(req, res)
        }

        next()
    }
}

// Different rate limits for different endpoints
export const apiRateLimit = rateLimit({
    windowMs: 60000,
    maxRequests: 100
})

export const authRateLimit = rateLimit({
    windowMs: 900000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many attempts',
            message: 'Please try again in 15 minutes.',
            retryAfter: 900
        })
    }
})

export const publishRateLimit = rateLimit({
    windowMs: 60000,
    maxRequests: 10, // 10 publishes per minute
    handler: (req, res) => {
        res.status(429).json({
            error: 'Publishing too frequently',
            message: 'Please wait before publishing again.',
            retryAfter: 60
        })
    }
})

export const analyticsRateLimit = rateLimit({
    windowMs: 60000,
    maxRequests: 200
})
