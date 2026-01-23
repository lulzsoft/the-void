import { NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
        }

        const body = await req.json();
        const { proofUrl, notes } = body;

        if (!proofUrl) {
            return NextResponse.json({ error: 'Kanıt linki (URL) zorunludur.' }, { status: 400 });
        }

        // Mock Submission Logic
        // Gerçekte: Application tablosunda status = 'submitted' ve proofUrl güncellenir
        console.log(`[SUBMISSION] Mission: ${id}, User: ${session.username}, Proof: ${proofUrl}`);

        // Başarılı simülasyonu
        await new Promise(r => setTimeout(r, 1000));

        return NextResponse.json({ success: true, message: 'Kanıt başarıyla sisteme yüklendi. İnceleme başlatıldı.' });

    } catch (error) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: 'Teslimat işlemi başarısız.' }, { status: 500 });
    }
}
