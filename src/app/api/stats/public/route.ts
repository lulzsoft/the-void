
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { AlienRegistry } from '@/lib/alien-registry';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No cache for real-time stats

export async function GET() {
    try {
        // Get count of admitted members (aliens:admitted is a Set)
        const admittedCount = await redis.scard('aliens:admitted');

        // Get active visitors (heartbeat)
        const activeCount = await AlienRegistry.getActiveVisitorCount();

        // Return 0 if null/undefined, ensuring a number
        const count = admittedCount || 0;

        return NextResponse.json({
            observers: count,
            active: activeCount || 1, // Minimum 1 (the requester)
            status: 'ONLINE'
        });
    } catch (error) {
        console.error('Stats Error:', error);
        // Fallback gracefully
        return NextResponse.json({ observers: '...', active: 1, status: 'OFFLINE' });
    }
}
