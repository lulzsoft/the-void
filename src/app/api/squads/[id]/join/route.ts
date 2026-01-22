import { NextRequest, NextResponse } from 'next/server';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * POST /api/squads/[id]/join - Join a squad
 */

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await requireAuth(req);
        if (!auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const squad = await SquadRegistry.joinSquad(id, auth.user.codename);

        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        return NextResponse.json({ squad, message: 'Joined squad successfully' });
    } catch (error: any) {
        console.error('Join squad error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to join squad' },
            { status: 400 }
        );
    }
}
