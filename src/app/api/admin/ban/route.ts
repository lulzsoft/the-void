
import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { redis } from '@/lib/redis';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(req: Request) {
    // Admin authentication check
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { id, deviceHash } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Get profile to find IP
        const profile = await redis.hgetall(`alien:${id}`);
        if (profile) {
            const { ip } = profile as any;
            if (ip) {
                // Ban IP
                await redis.sadd('sanctum:banned_ips', ip);
            }
        }

        // Ban device hash if provided
        if (deviceHash) {
            await redis.sadd('sanctum:banned_devices', deviceHash);
        }

        // Remove from admitted
        await redis.srem('aliens:admitted', id);

        // Add to rejected/banned set
        await redis.sadd('aliens:rejected', id);

        // Update status in hash
        await redis.hset(`alien:${id}`, { status: 'BANNED' });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ban Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
