
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getClientIp } from '@/lib/utils';

export async function GET(req: Request) {
    try {
        const ip = getClientIp(req);
        const timestamp = Date.now();

        // Use a Sorted Set to store active users: Score = Timestamp, Member = IP
        // Expire entries older than 45 seconds to keep count "live"
        await redis.zadd('visitors:active', { score: timestamp, member: ip });

        const thirtySecondsAgo = timestamp - 45000;
        await redis.zremrangebyscore('visitors:active', 0, thirtySecondsAgo);

        return NextResponse.json({ status: 'beat' });
    } catch {
        return NextResponse.json({ status: 'dead' }, { status: 500 });
    }
}
