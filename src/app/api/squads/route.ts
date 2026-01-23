import { NextRequest, NextResponse } from 'next/server';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAuth } from '@/lib/auth-middleware';
import { squadCreationLimiter, checkRateLimit } from '@/lib/rate-limit';
import { createSquadSchema, validateBody } from '@/lib/validation';

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

        // Rate limiting: 5 squad creations per hour per user
        const rateLimitResult = await checkRateLimit(
            squadCreationLimiter,
            `user:${user.codename}`
        );
        if (!rateLimitResult.success) {
            return rateLimitResult.error!;
        }

        const body = await req.json();

        // Validate and sanitize input
        const validation = await validateBody(createSquadSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        const { name, description, maxMembers, skills, tags } = validation.data;

        // Create squad
        const squad = await SquadRegistry.createSquad({
            name,
            description,
            leader: user.codename,
            members: [],
            maxMembers,
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
