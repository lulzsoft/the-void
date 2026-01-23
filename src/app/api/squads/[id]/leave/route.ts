import { NextRequest, NextResponse } from 'next/server';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * POST /api/squads/[id]/leave - Leave a squad
 */

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await requireAuth(req);
        if (auth instanceof NextResponse) {
            return auth;
        }
        if (!auth || !auth.session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.session;

        const squad = await SquadRegistry.leaveSquad(id, user.codename);

        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        return NextResponse.json({ squad, message: 'Left squad successfully' });
    } catch (error: any) {
        console.error('Leave squad error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to leave squad' },
            { status: 400 }
        );
    }
}
