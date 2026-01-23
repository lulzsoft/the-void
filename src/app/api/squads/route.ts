import { NextRequest, NextResponse } from 'next/server';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * GET /api/squads - List all squads
 * POST /api/squads - Create new squad
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let squads;
        if (status) {
            squads = await SquadRegistry.getSquadsByStatus(status as any);
        } else {
            squads = await SquadRegistry.getAllSquads();
        }

        return NextResponse.json({ squads });
    } catch (error) {
        console.error('Get squads error:', error);
        return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth(req);
        if (auth instanceof NextResponse) {
            return auth;
        }
        if (!auth || !auth.session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.session;

        const body = await req.json();
        const { name, description, maxMembers, skills, tags } = body;

        // Validation
        if (!name || name.length < 3) {
            return NextResponse.json({ error: 'Squad name must be at least 3 characters' }, { status: 400 });
        }

        if (!description || description.length < 10) {
            return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
        }

        if (!maxMembers || maxMembers < 2 || maxMembers > 8) {
            return NextResponse.json({ error: 'Max members must be between 2 and 8' }, { status: 400 });
        }

        // Create squad
        const squad = await SquadRegistry.createSquad({
            name,
            description,
            leader: user.codename,
            members: [], // Will be set by createSquad
            maxMembers: parseInt(maxMembers),
            skills: skills || [],
            tags: tags || [],
            status: 'recruiting',
        });

        return NextResponse.json({ squad }, { status: 201 });
    } catch (error) {
        console.error('Create squad error:', error);
        return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
    }
}
