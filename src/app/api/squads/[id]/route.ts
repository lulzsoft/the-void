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

        return NextResponse.json({ squad });
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
        if (!auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const squad = await SquadRegistry.getSquad(id);
        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        // Only leader can update
        if (squad.leader !== auth.user.codename) {
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
        if (!auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const squad = await SquadRegistry.getSquad(id);
        if (!squad) {
            return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
        }

        // Only leader can disband
        if (squad.leader !== auth.user.codename) {
            return NextResponse.json({ error: 'Only squad leader can disband' }, { status: 403 });
        }

        await SquadRegistry.disbandSquad(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete squad error:', error);
        return NextResponse.json({ error: 'Failed to disband squad' }, { status: 500 });
    }
}
