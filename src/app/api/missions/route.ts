import { NextRequest, NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

/**
 * GET /api/missions - List missions
 * POST /api/missions - Create mission (admin only)
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let missions;
        if (status) {
            missions = await MissionRegistry.getMissionsByStatus(status as any);
        } else {
            missions = await MissionRegistry.getAllMissions();
        }

        return NextResponse.json({ missions });
    } catch (error) {
        console.error('Get missions error:', error);
        return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Admin check - only admins can create missions
        const adminCheck = await requireAdmin(req);
        if (adminCheck) {
            return adminCheck; // Return error response if not admin
        }

        const body = await req.json();
        const { title, description, requirements, duration, compensation, requiredSquadSize, tags, remote, deadline } = body;

        // Validation
        if (!title || title.length < 5) {
            return NextResponse.json({ error: 'Title must be at least 5 characters' }, { status: 400 });
        }

        if (!description || description.length < 20) {
            return NextResponse.json({ error: 'Description must be at least 20 characters' }, { status: 400 });
        }

        if (!duration) {
            return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
        }

        if (!compensation) {
            return NextResponse.json({ error: 'Compensation is required' }, { status: 400 });
        }

        // Create mission
        const mission = await MissionRegistry.createMission({
            title,
            description,
            requirements: requirements || [],
            duration,
            compensation,
            requiredSquadSize,
            status: 'open',
            tags,
            remote: remote ?? true,
            deadline: deadline ? new Date(deadline).getTime() : undefined,
        });

        return NextResponse.json({ mission }, { status: 201 });
    } catch (error) {
        console.error('Create mission error:', error);
        return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
    }
}
