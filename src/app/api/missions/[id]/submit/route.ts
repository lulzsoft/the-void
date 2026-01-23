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

        // Log Activity (Local/User Only? Or Global? Submissions are usually private until approved)
        // Let's log it as a notification to admins later, but here just log internally or skip.
        // Actually, let's log "Mission Report Filed"
        const { ActivityRegistry } = await import('@/lib/activity-registry');
        await ActivityRegistry.log({
            type: 'mission_completed', // Using this type for now as 'submission' or generic
            message: `${session.username} filed a report for Mission ${id.substring(0, 6)}...`,
            meta: { missionId: id, user: session.username }
        });

        return NextResponse.json({ success: true, message: 'Kanıt başarıyla sisteme yüklendi. İnceleme başlatıldı.' });

    } catch (error) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: 'Teslimat işlemi başarısız.' }, { status: 500 });
    }
}
