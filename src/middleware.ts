import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basit In-Memory Rate Limit (Node.js ortamında serverless için ideal değildir ama demo için çalışır)
// Gerçek prodüksiyonda Redis kullanılmalıdır.
const rateLimit = new Map();

export async function middleware(request: NextRequest) {
    const ip = request.ip || '127.0.0.1';
    const path = request.nextUrl.pathname;

    // 1. Global Rate Limiting
    if (path.startsWith('/api/')) {
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 dakika
        const limit = 100; // Dakikada 100 istek

        const userHistory = rateLimit.get(ip) || [];
        const cleanHistory = userHistory.filter((timestamp: number) => now - timestamp < windowSize);

        if (cleanHistory.length >= limit) {
            return NextResponse.json(
                { error: 'Too Man Requests - Sistem Koruması Aktif' },
                { status: 429 }
            );
        }

        cleanHistory.push(now);
        rateLimit.set(ip, cleanHistory);
    }

    // 2. Admin Route Protection
    if (path.startsWith('/shadow-panel') || path.startsWith('/api/admin')) {
        // Basit cookie veya header kontrolü (Mock Auth)
        // Gerçekte burada JWT doğrulaması yapılır
        const authHeader = request.headers.get('Authorization');
        const adminCookie = request.cookies.get('admin_session');

        // Not: Gerçek auth sistemi entegre edilene kadar geçici bypass
        // if (!adminCookie && !authHeader) {
        //     return NextResponse.redirect(new URL('/login', request.url));
        // }
    }

    // 3. Secure Headers Injection
    const response = NextResponse.next();

    // X-DNS-Prefetch-Control
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    // Strict-Transport-Security
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        '/api/:path*',
        '/shadow-panel/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
