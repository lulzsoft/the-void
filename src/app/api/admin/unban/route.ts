
import { NextResponse } from 'next/server';
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
                // Unban IP
                await redis.srem('sanctum:banned_ips', ip);
            }
        }

        // Unban device hash if provided
        if (deviceHash) {
            await redis.srem('sanctum:banned_devices', deviceHash);
        }

        // Remove from rejected/banned
        await redis.srem('aliens:rejected', id);

        // Add back to admitted
        await redis.sadd('aliens:admitted', id);

        // Update status in hash
        await redis.hset(`alien:${id}`, { status: 'ADMITTED', approvedAt: Date.now() });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unban Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
