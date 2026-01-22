
import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Admin authentication check
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const [admitted, rejected] = await Promise.all([
            AlienRegistry.getAdmittedCandidates(),
            AlienRegistry.getRejectedCandidates()
        ]);

        const members = [...admitted, ...rejected].map(m => ({
            ...m,
            // Ensure status is correctly reflected
            status: admitted.find(a => a.id === m.id) ? 'ADMITTED' : 'BANNED'
        }));

        return NextResponse.json({ members });
    } catch (error) {
        console.error('Members fetch error:', error);
        return NextResponse.json({ members: [] }, { status: 500 });
    }
}
