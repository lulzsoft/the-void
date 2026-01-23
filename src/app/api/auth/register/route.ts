
import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { hashPassword, createSession } from '@/lib/auth';
import { encryptEmail } from '@/lib/crypto-utils';
import { getClientIp } from '@/lib/utils';
import { cookies } from 'next/headers';
import { SESSION_DURATION } from '@/lib/constants';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, email, skills, painTolerance, answers, deviceHash } = body;

        // DB Connectivity Check
        if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
            console.error('CRITICAL: Redis URL is MISSING!');
            return NextResponse.json({ error: 'Veritabanı bağlantı hatası (ENV eksik).' }, { status: 500 });
        }

        if (!username || !password) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Şifre en az 8 karakter olmalı.' }, { status: 400 });
        }

        const ip = getClientIp(req);
        const hashedPassword = await hashPassword(password);

        // Encrypt email if provided
        const encryptedEmail = email ? encryptEmail(email) : undefined;

        try {
            const { id, accessKey } = await AlienRegistry.registerCandidate({
                codename: username, // Use username as codename
                username,
                password: hashedPassword,
                email: encryptedEmail,
                ip,
                skills: skills || 'BİLİNMİYOR',
                painTolerance: painTolerance || 0,
                answers: answers || [],
                deviceHash
            });

            // Create Session
            const token = await createSession({ id, username, role: 'candidate' });

            (await cookies()).set('void_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: SESSION_DURATION // 7 days
            });

            return NextResponse.json({ success: true, id, accessKey });

        } catch (e: any) {
            if (e.message === 'USERNAME_TAKEN') {
                return NextResponse.json({ error: 'Bu mahlas zaten alınmış.' }, { status: 409 });
            }
            throw e;
        }

    } catch (error: any) {
        console.error('Registration Error:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json({ error: `Sistem hatası: ${error.message || 'Bilinmeyen'}` }, { status: 500 });
    }
}
