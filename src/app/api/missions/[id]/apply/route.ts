import { NextRequest, NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * POST /api/missions/[id]/apply - Apply to mission with a squad
 */

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await requireAuth(req);
        if (!auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { squadId, message } = body;

        if (!squadId) {
            return NextResponse.json({ error: 'Squad ID is required' }, { status: 400 });
        }

        // Verify squad exists and user is a member
        const squad = await SquadRegistry.getSquad(squadId);
        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        if (!squad.members.includes(auth.user.codename)) {
            return NextResponse.json({ error: 'You must be a member of this squad to apply' }, { status: 403 });
        }

        // Apply to mission
        const mission = await MissionRegistry.applyToMission(
            params.id,
            squadId,
            squad.name,
            message
        );

        if (!mission) {
            return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
        }

        return NextResponse.json({ mission, message: 'Application submitted successfully' });
    } catch (error: any) {
        console.error('Apply to mission error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to apply to mission' },
            { status: 400 }
        );
    }
}
