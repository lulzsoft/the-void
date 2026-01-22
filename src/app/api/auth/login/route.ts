
import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { verifyPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { TIMING_ATTACK_DELAY, SESSION_DURATION } from '@/lib/constants';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, deviceHash } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        const user = await AlienRegistry.getProfileByUsername(username);

        if (!user || !user.password) {
            // Fake delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, TIMING_ATTACK_DELAY));
            return NextResponse.json({ error: 'Geçersiz kimlik bilgileri.' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Geçersiz kimlik bilgileri.' }, { status: 401 });
        }

        if (user.status === 'REJECTED' || user.status === 'BANNED') {
            return NextResponse.json({ error: 'Erişiminiz Engizisyon tarafından engellendi.' }, { status: 403 });
        }

        // Create Session
        const token = await createSession({ id: user.id, username: user.username, role: user.status === 'ADMITTED' ? 'member' : 'candidate' });

        (await cookies()).set('void_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_DURATION // 7 days
        });

        return NextResponse.json({ success: true, redirect: '/sanctum' });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
    }
}
