import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

/**
 * Rate Limiting Service
 * Uses Upstash Redis for distributed rate limiting
 */

// Squad creation: 5 per hour per user
export const squadCreationLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:squad:create',
});

// Mission application: 10 per hour per user
export const missionApplicationLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'ratelimit:mission:apply',
});

// Auth endpoints: 10 per minute per IP
export const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
});

// General API: 60 per minute per user (generous limit for normal usage)
export const apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
});

/**
 * Rate limit helper for Next.js API routes
 * Returns error response if limit exceeded
 */
export async function checkRateLimit(
    limiter: Ratelimit,
    identifier: string
): Promise<{ success: boolean; error?: Response }> {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    if (!success) {
        const now = Date.now();
        const retryAfter = Math.floor((reset - now) / 1000);

        return {
            success: false,
            error: new Response(
                JSON.stringify({
                    error: 'Too many requests',
                    retryAfter,
                    limit,
                    remaining: 0,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': retryAfter.toString(),
                    },
                }
            ),
        };
    }

    return { success: true };
}
