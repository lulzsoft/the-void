import { NextRequest, NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';
import { createMissionSchema, validateBody } from '@/lib/validation';

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

        // Validate and sanitize input
        const validation = await validateBody(createMissionSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        const { title, description, requirements, duration, compensation, requiredSquadSize, tags, remote, deadline } = validation.data;

        // Create mission
        const mission = await MissionRegistry.createMission({
            title,
            description,
            requirements: requirements || [],
            duration,
            compensation,
            requiredSquadSize,
            status: 'open',
            tags: tags || [],
            remote: remote ?? true,
            deadline: deadline ? new Date(deadline).getTime() : undefined,
        });

        return NextResponse.json({ mission }, { status: 201 });
    } catch (error) {
        console.error('Create mission error:', error);
        return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
    }
}
