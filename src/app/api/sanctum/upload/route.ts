import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth } from '@/lib/auth-middleware';
import { rateLimiters } from '@/lib/ratelimit';
import { getClientIp } from '@/lib/utils';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants';

export async function POST(req: NextRequest) {
    try {
        // Authentication check
        const authResult = await requireAuth(req);
        if (authResult instanceof NextResponse) {
            return authResult; // Return error response
        }

        const ip = getClientIp(req);

        // Rate limiting: 10 uploads per hour
        const rateLimit = await rateLimiters.upload(ip);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Çok fazla dosya yükleme. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
        }

        // File size check
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Dosya boyutu ${MAX_FILE_SIZE / 1024 / 1024}MB'ı aşamaz.` },
                { status: 413 }
            );
        }

        // File type validation
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Desteklenmeyen dosya tipi. İzin verilenler: JPEG, PNG, GIF, WEBP, PDF.' },
                { status: 400 }
            );
        }

        // Sanitize filename (remove special chars, keep only alphanumeric, dots, dashes)
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Upload to Vercel Blob
        const blob = await put(sanitizedName, file, {
            access: 'public',
            addRandomSuffix: true, // Prevent filename collisions
        });

        return NextResponse.json({ url: blob.url });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Yükleme hatası.' }, { status: 500 });
    }
}
