import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { hashPassword } from '@/lib/auth';
import { redis } from '@/lib/redis';
import crypto from 'crypto';
import { MAX_RESET_ATTEMPTS, TIMING_ATTACK_DELAY } from '@/lib/constants';

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(a),
        Buffer.from(b)
    );
}

export async function POST(req: Request) {
    try {
        const { username, code, newPassword } = await req.json();

        if (!username || !code || !newPassword) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Şifre en az 8 karakter olmalı.' }, { status: 400 });
        }

        // Brute-force protection: Check attempts
        const attempts = await redis.incr(`reset_attempts:${username}`);
        await redis.expire(`reset_attempts:${username}`, 600); // 10 min TTL

        if (attempts > MAX_RESET_ATTEMPTS) {
            return NextResponse.json(
                { error: 'Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        // Kodu doğrula (timing-safe)
        const storedCode = await redis.get(`reset_code:${username}`);

        if (!storedCode || !timingSafeEqual(storedCode as string, code)) {
            // Add delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, TIMING_ATTACK_DELAY));
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kod.' }, { status: 400 });
        }

        // Kullanıcıyı bul
        const profile = await AlienRegistry.getProfileByUsername(username);

        if (!profile) {
            await new Promise(resolve => setTimeout(resolve, TIMING_ATTACK_DELAY));
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        // Şifreyi hashle
        const hashedPassword = await hashPassword(newPassword);

        // Şifreyi güncelle
        await redis.hset(`alien:${profile.id}`, { password: hashedPassword });

        // Kullanılan kodu sil
        await redis.del(`reset_code:${username}`);

        // Attempt counter'ı sil
        await redis.del(`reset_attempts:${username}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
    }
}
