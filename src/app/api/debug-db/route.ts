
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check Env Vars
        const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
        const hasToken = !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN);

        if (!url) return NextResponse.json({ error: 'Redis URL Missing' });
        if (!hasToken) return NextResponse.json({ error: 'Redis Token Missing' });

        // 2. Test Write
        const testId = crypto.randomUUID();
        await redis.set(`debug:${testId}`, 'Hello Void', { ex: 60 });

        // 3. Test Read
        const val = await redis.get(`debug:${testId}`);

        return NextResponse.json({
            success: true,
            read_value: val,
            details: 'Redis connection is working.'
        });

    } catch (error: any) {
        console.error('Debug DB Error:', error);
        return NextResponse.json({
            error: 'Connection Failed',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
