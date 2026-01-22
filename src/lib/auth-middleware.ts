import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './auth';
import { cookies } from 'next/headers';

/**
 * Admin authentication middleware
 * Verifies JWT session and checks for admin role
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('void_session')?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. Authentication required.' },
            { status: 401 }
        );
    }

    const session = await verifySession(token);

    if (!session) {
        return NextResponse.json(
            { error: 'Invalid or expired session.' },
            { status: 401 }
        );
    }

    // Check admin role (admins have specific username or flag)
    const isAdmin = session.role === 'admin' || session.username === 'architect';

    if (!isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden. Admin access required.' },
            { status: 403 }
        );
    }

    // Return null if authorized (no error response)
    return null;
}

/**
 * Authenticated user check (any logged-in user)
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | { session: any } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('void_session')?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. Please login.' },
            { status: 401 }
        );
    }

    const session = await verifySession(token);

    if (!session) {
        return NextResponse.json(
            { error: 'Invalid session.' },
            { status: 401 }
        );
    }

    return { session };
}
