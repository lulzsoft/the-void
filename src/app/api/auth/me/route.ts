
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redis } from '@/lib/redis';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('void_session')?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await verifySession(token);

    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get fresh user data
    const user = await redis.hgetall(`alien:${session.id}`);

    if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            codename: user.codename,
            username: user.username,
            role: user.status === 'ADMITTED' ? 'MEMBER' : 'CANDIDATE',
            id: user.id
        }
    });
}
