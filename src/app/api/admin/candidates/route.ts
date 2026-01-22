import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { requireAdmin } from '@/lib/auth-middleware';

// Veriyi her zaman taze çek (cache yok)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Admin authentication check
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const candidates = await AlienRegistry.getPendingCandidates();
        return NextResponse.json({ candidates });
    } catch (error) {
        console.error('Fetch Candidates Error:', error);
        return NextResponse.json({ error: 'System Failure' }, { status: 500 });
    }
}
