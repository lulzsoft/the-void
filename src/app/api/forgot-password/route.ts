import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { decryptEmail, generateVerificationCode } from '@/lib/crypto-utils';
import { redis } from '@/lib/redis';
import { rateLimiters } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/utils';
import { RESET_CODE_TTL } from '@/lib/constants';

import { EmailService } from '@/lib/email';
import { getPasswordResetEmail } from '@/lib/email-templates';

// Email gönder (EmailService kullanarak)
async function sendEmail(to: string, code: string, username: string) {
    const emailContent = getPasswordResetEmail(code, username);

    const result = await EmailService.send({
        to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });

    return result.success;
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

        const { input } = await req.json(); // Changed 'username' to 'input'

        if (!input) {
            return NextResponse.json({ error: 'Mahlas veya E-posta gerekli.' }, { status: 400 });
        }

        // Kullanıcıyı bulma (Mahlas veya Email)
        let profile = await AlienRegistry.getProfileByUsername(input);

        // Eğer username ile bulunamadıysa, tüm profilleri tara ve email eşleşmesine bak
        // NOT: Bu performanslı değil ama MVP için decrypt edip bakmaktan başka çare yok (encryption deterministic değilse)
        // Eğer encryption deterministic ise direkt hash ile arayabilirdik. CryptoUtils'e bakmak lazım.
        // Şimdilik getAllProfiles ile array'den bulalım.
        if (!profile) {
            const allProfiles = await AlienRegistry.getAllProfiles();
            profile = allProfiles.find(p => {
                if (!p.email) return false;
                try {
                    return decryptEmail(p.email) === input;
                } catch { return false; }
            }) || null;
        }

        if (!profile) {
            // Güvenlik: Kullanıcı yoksa bile hata verme (timing attack önleme)
            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return NextResponse.json({ success: true });
        }

        if (!profile.email) {
            return NextResponse.json({ error: 'Bu hesaba kayıtlı e-posta yok.' }, { status: 400 });
        }

        const username = profile.username || profile.codename;
        const email = decryptEmail(profile.email);

        // 6 haneli kod üret
        const code = generateVerificationCode();

        // Kodu Redis'te sakla (10 dakika TTL)
        await redis.setex(`reset_code:${username}`, RESET_CODE_TTL, code);

        // Reset attempt counter'ı sıfırla
        await redis.del(`reset_attempts:${username}`);

        // E-posta gönder
        console.log(`[RESET_PASSWORD] Sending email to decrypted: ${email} for user: ${username}`);
        const emailSent = await sendEmail(email, code, username);

        // DEV FALLBACK: Always log the code in development or if email fails
        if (process.env.NODE_ENV !== 'production' || !emailSent) {
            console.log(`==========================================`);
            console.log(`[DEV/FALLBACK] Password Reset Code for ${username}:`);
            console.log(`CODE: ${code}`);
            console.log(`==========================================`);
        }

        if (!emailSent) {
            console.error(`[RESET_PASSWORD] Email send failed for ${username}`);
            // In dev mode, return success anyway so they can use the console code
            if (process.env.NODE_ENV === 'production') {
                await redis.del(`reset_code:${username}`);
                return NextResponse.json({ error: 'E-posta gönderilemedi. Sistem loglarını kontrol edin.' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, debug: process.env.NODE_ENV !== 'production' ? 'Code logged to console' : undefined });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
    }
}
