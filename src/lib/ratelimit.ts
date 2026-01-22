import { redis } from './redis';

interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

/**
 * Rate limiting using Redis
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Max requests
 * @param window - Time window in seconds
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    window: number = 60
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;

    try {
        const current = await redis.incr(key);

        if (current === 1) {
            // First request, set expiry
            await redis.expire(key, window);
        }

        const ttl = await redis.ttl(key);
        const reset = Date.now() + (ttl * 1000);

        return {
            success: current <= limit,
            remaining: Math.max(0, limit - current),
            reset
        };
    } catch (error) {
        console.error('[RATE LIMIT ERROR]', error);
        // Fail open (allow request) on error
        return {
            success: true,
            remaining: limit,
            reset: Date.now() + (window * 1000)
        };
    }
}

/**
 * Preset rate limiters
 */
export const rateLimiters = {
    /** Strict: 5 requests per minute */
    strict: (identifier: string) => rateLimit(identifier, 5, 60),

    /** API: 20 requests per minute */
    api: (identifier: string) => rateLimit(identifier, 20, 60),

    /** Auth: 5 login attempts per 5 minutes */
    auth: (identifier: string) => rateLimit(`auth:${identifier}`, 5, 300),

    /** Password reset: 3 attempts per 10 minutes */
    passwordReset: (identifier: string) => rateLimit(`reset:${identifier}`, 3, 600),

    /** Upload: 10 files per hour */
    upload: (identifier: string) => rateLimit(`upload:${identifier}`, 10, 3600),
};
