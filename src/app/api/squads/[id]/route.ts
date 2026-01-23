import { NextRequest, NextResponse } from 'next/server';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * GET /api/squads/[id] - Get squad details
 * PATCH /api/squads/[id] - Update squad (leader only)
 * DELETE /api/squads/[id] - Disband squad (leader only)
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const squad = await SquadRegistry.getSquad(id);

        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        // Calculate Stats
        const { MissionRegistry } = await import('@/lib/mission-registry');
        const missions = await MissionRegistry.getMissionsBySquad(id);
        const completedMissions = missions.filter(m => m.status === 'completed');

        const totalEarnings = completedMissions.reduce((sum, m) => {
            const val = parseInt(m.compensation.replace(/[^0-9]/g, '')) || 0;
            return sum + val;
        }, 0);

        const stats = {
            totalMissions: missions.length,
            completedMissions: completedMissions.length,
            totalEarnings: totalEarnings > 0 ? `$${totalEarnings.toLocaleString()}` : '$0',
            successRate: missions.length > 0 ? Math.round((completedMissions.length / missions.length) * 100) : 0
        };

        return NextResponse.json({ squad, stats });
    } catch (error) {
        console.error('Get squad error:', error);
        return NextResponse.json({ error: 'Failed to fetch squad' }, { status: 500 });
    }
}

export async function PATCH(
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

        const squad = await SquadRegistry.getSquad(id);
        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        // Only leader can update
        if (squad.leader !== user.codename) {
            return NextResponse.json({ error: 'Only squad leader can update' }, { status: 403 });
        }

        const body = await req.json();
        const { description, maxMembers, skills, tags, status } = body;

        const updates: any = {};
        if (description) updates.description = description;
        if (maxMembers) updates.maxMembers = parseInt(maxMembers);
        if (skills) updates.skills = skills;
        if (tags) updates.tags = tags;
        if (status) updates.status = status;

        const updated = await SquadRegistry.updateSquad(id, updates);

        return NextResponse.json({ squad: updated });
    } catch (error) {
        console.error('Update squad error:', error);
        return NextResponse.json({ error: 'Failed to update squad' }, { status: 500 });
    }
}

export async function DELETE(
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

        const squad = await SquadRegistry.getSquad(id);
        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        // Only leader can disband
        if (squad.leader !== user.codename) {
            return NextResponse.json({ error: 'Only squad leader can disband' }, { status: 403 });
        }

        await SquadRegistry.disbandSquad(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete squad error:', error);
        return NextResponse.json({ error: 'Failed to disband squad' }, { status: 500 });
    }
}
