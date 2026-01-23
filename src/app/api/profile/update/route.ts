import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { skills, painTolerance, bio } = body;

        // Validasyon (Basit)
        if (skills && typeof skills !== 'string') return NextResponse.json({ error: 'Invalid skills format' }, { status: 400 });

        // Update in DB
        const payload = session as any;
        await AlienRegistry.updateProfile(payload.id, {
            skills,
            painTolerance: painTolerance || 'UNKNOWN',
            biography: bio
        });

        console.log(`[PROFILE UPDATE] User: ${payload.username} updated profile.`);

        return NextResponse.json({ success: true, message: 'Profil başarıyla güncellendi.' });

    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
