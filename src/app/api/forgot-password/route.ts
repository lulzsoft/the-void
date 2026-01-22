import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { decryptEmail, generateVerificationCode } from '@/lib/crypto-utils';
import { redis } from '@/lib/redis';
import { Resend } from 'resend';
import { rateLimiters } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/utils';
import { RESET_CODE_TTL } from '@/lib/constants';
import { getPasswordResetEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

// E-posta gönderme fonksiyonu (Resend ile)
async function sendEmail(to: string, code: string, username: string) {
    try {
        const emailContent = getPasswordResetEmail(code, username);

        await resend.emails.send({
            from: 'BOŞLUK <noreply@bosluk.vercel.app>',
            to: [to],
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text, // Plain text fallback
        });
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);

        // Rate limiting: 3 requests per 10 minutes
        const rateLimit = await rateLimiters.passwordReset(ip);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Mahlas gerekli.' }, { status: 400 });
        }

        // Kullanıcıyı bul
        const profile = await AlienRegistry.getProfileByUsername(username);

        if (!profile) {
            // Güvenlik: Kullanıcı yoksa bile hata verme (timing attack önleme)
            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return NextResponse.json({ success: true });
        }

        if (!profile.email) {
            return NextResponse.json({ error: 'Bu hesaba kayıtlı e-posta yok.' }, { status: 400 });
        }

        // E-postayı çöz
        const email = decryptEmail(profile.email);

        // 6 haneli kod üret
        const code = generateVerificationCode();

        // Kodu Redis'te sakla (10 dakika TTL)
        await redis.setex(`reset_code:${username}`, RESET_CODE_TTL, code);

        // Reset attempt counter'ı sıfırla
        await redis.del(`reset_attempts:${username}`);

        // E-posta gönder
        const emailSent = await sendEmail(email, code, username);

        if (!emailSent) {
            // Email gönderemediyse kodu sil
            await redis.del(`reset_code:${username}`);
            return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
    }
}
