
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { AlienRegistry } from '@/lib/alien-registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Fetch all data in parallel
        const [
            pendingCandidates,
            admittedCandidates,
            messages,
            bannedIPs,
            totalCount,
            admittedCount,
            rejectedCount
        ] = await Promise.all([
            AlienRegistry.getPendingCandidates(),
            AlienRegistry.getAdmittedCandidates(),
            redis.lrange('sanctum:messages', 0, -1),
            redis.smembers('sanctum:banned_ips'),
            redis.scard('aliens:all'),
            redis.scard('aliens:admitted'),
            redis.scard('aliens:rejected')
        ]);

        return NextResponse.json({
            messages: messages || [],
            candidates: [...pendingCandidates, ...admittedCandidates], // Combine for list view
            bannedIPs: bannedIPs || [],
            analytics: {
                totalCandidates: totalCount || 0,
                accepted: admittedCount || 0,
                rejected: rejectedCount || 0,
                // visits removed in favor of explicit rejected count
            }
        });
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Actions: BAN_IP, DELETE_MESSAGE, UNBAN_IP
    try {
        const body = await req.json();
        const { action, id, ip } = body;

        if (action === 'BAN_IP') {
            if (ip) await redis.sadd('sanctum:banned_ips', ip);
            return NextResponse.json({ success: true, banned: ip });
        }

        if (action === 'DELETE_MESSAGE') {
            // Redis list delete is tricky without unique ID in element.
            // Our messages are JSON strings. simpler to just LREM if we have exact content
            // or filter and replace list.
            // For now, let's assume this feature is debatable in V1 or we implement strict ID removal
            // BUT, since we store messages as objects in a list, we need to match.
            // Simplified: Not implementing DELETE for list in this pass.
            return NextResponse.json({ success: false, message: 'Delete not implemented for Redis List yet' });
        }

        if (action === 'UNBAN_IP') {
            if (ip) await redis.srem('sanctum:banned_ips', ip);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Action Error:', error);
        return NextResponse.json({ error: 'Action Failed' }, { status: 500 });
    }
}
