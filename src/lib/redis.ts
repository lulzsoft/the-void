import { Redis } from '@upstash/redis'

// KV_REST_API_URL and KV_REST_API_TOKEN are automatically set by Vercel
// when you run `npx vercel env pull` or deploy.

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    // Fallback check for alternate env names (sometimes UPSTASH_REDIS_REST_URL)
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("REDIS CREDENTIALS MISSING. Check .env.local");
    }
}

export const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
})
