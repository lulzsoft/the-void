import { NextRequest, NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';
import { rateLimiters } from '@/lib/ratelimit';

/**
 * POST /api/missions/[id]/apply - Apply to mission with a squad
 */

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const auth = await requireAuth(req);
        if (auth instanceof NextResponse) {
            return auth; // Return error response
        }
        if (!auth || !auth.session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.session;

        // Rate limiting: Mission applications
        const rateLimit = await rateLimiters.api(`mission:apply:${user.codename}`);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Çok fazla deneme. Lütfen biraz bekleyip tekrar deneyin.' },
                { status: 429 }
            );
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

        if (!squad.members.includes(user.codename)) {
            return NextResponse.json({ error: 'You must be a member of this squad to apply' }, { status: 403 });
        }

        // Apply to mission
        const mission = await MissionRegistry.applyToMission(
            id,
            squadId,
            squad.name,
            message
        );


        if (!mission) {
            return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
        }

        // Notify Squad Leader if applicant is not the leader
        if (squad.leader !== user.username) {
            const { NotificationRegistry } = await import('@/lib/notification-registry');
            await NotificationRegistry.create({
                userId: squad.leader,
                title: 'MISSION APPLICATION',
                message: `Operative ${user.username} applied squad ${squad.name} to mission ${mission.title || mission.id}.`,
                type: 'info'
            });
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
