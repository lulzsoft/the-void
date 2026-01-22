import { NextRequest, NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Username validation
    if (username.length < 3) {
        return NextResponse.json({ available: false, reason: 'too_short' }, { status: 200 });
    }

    if (username.length > 20) {
        return NextResponse.json({ available: false, reason: 'too_long' }, { status: 200 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ available: false, reason: 'invalid_chars' }, { status: 200 });
    }

    // Check if username exists
    const existingUser = await AlienRegistry.getProfileByUsername(username);

    if (existingUser) {
        return NextResponse.json({ available: false, reason: 'taken' }, { status: 200 });
    }

    return NextResponse.json({ available: true }, { status: 200 });
}
