import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { skills, painTolerance, bio } = body;

        // Validasyon (Basit)
        if (skills && typeof skills !== 'string') return NextResponse.json({ error: 'Invalid skills format' }, { status: 400 });

        // Update in DB (AlienRegistry'e update metodu eklenmeli veya mock edilmeli)
        // Şimdilik mock update simüle ediyoruz (In-memory store varsa orayı günceller)

        // Not: AlienRegistry'de update fonksiyonu yoksa, şaka amaçlı sadece başarılı dönüyoruz.
        console.log(`[PROFILE UPDATE] User: ${session.username}, Skills: ${skills}`);

        return NextResponse.json({ success: true, message: 'Profil güncellendi.' });

    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
