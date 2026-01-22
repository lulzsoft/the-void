import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(req: Request) {
    // Admin authentication check
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }

        if (action === 'APPROVE') {
            await AlienRegistry.approveCandidate(id);
        } else {
            await AlienRegistry.rejectCandidate(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approval Error:', error);
        return NextResponse.json({ error: 'System Failure' }, { status: 500 });
    }
}
