import { NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAdmin } from '@/lib/auth-middleware';
import { NotificationRegistry } from '@/lib/notification-registry';

/**
 * PATCH /api/admin/missions/[id]/applications
 * Body: { squadId, status: 'accepted' | 'rejected' }
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const { id } = await params;
        const body = await req.json();
        const { squadId, status } = body;

        if (!squadId || !['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const mission = await MissionRegistry.updateApplicationStatus(id, squadId, status);

        if (!mission) {
            return NextResponse.json({ error: 'Update failed' }, { status: 404 });
        }

        // Notify Squad Leader
        const squad = await SquadRegistry.getSquad(squadId);
        if (squad) {
            const title = status === 'accepted' ? 'GÖREV ONAYLANDI' : 'GÖREV REDDEDİLDİ';
            const type = status === 'accepted' ? 'success' : 'alert';
            const message = status === 'accepted'
                ? `Ekibiniz "${mission.title}" operasyonu için seçildi. Hazırlıklara başlayın.`
                : `"${mission.title}" operasyonu başvurunuz reddedildi.`;

            await NotificationRegistry.create({
                userId: squad.leader,
                title,
                message,
                type,
                link: `/missions/${id}`
            });
        }

        return NextResponse.json({ success: true, mission });

    } catch (error) {
        console.error('Application Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
