import { NextRequest, NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

/**
 * GET /api/missions/[id] - Get mission details
 * PATCH /api/missions/[id] - Update mission (admin only)
 * DELETE /api/missions/[id] - Delete mission (admin only)
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const mission = await MissionRegistry.getMission(id);

        if (!mission) {
            return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
        }

        return NextResponse.json({ mission });
    } catch (error) {
        console.error('Get mission error:', error);
        return NextResponse.json({ error: 'Failed to fetch mission' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Admin check - only admins can update missions
        const adminCheck = await requireAdmin(req);
        if (adminCheck) {
            return adminCheck; // Return error response if not admin
        }

        const body = await req.json();
        const updated = await MissionRegistry.updateMission(id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
        }

        return NextResponse.json({ mission: updated });
    } catch (error) {
        console.error('Update mission error:', error);
        return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Admin check - only admins can delete missions
        const adminCheck = await requireAdmin(req);
        if (adminCheck) {
            return adminCheck; // Return error response if not admin
        }

        await MissionRegistry.deleteMission(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete mission error:', error);
        return NextResponse.json({ error: 'Failed to delete mission' }, { status: 500 });
    }
}
