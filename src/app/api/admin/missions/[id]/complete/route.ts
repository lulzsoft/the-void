import { NextResponse } from 'next/server';
import { MissionRegistry } from '@/lib/mission-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { requireAdmin } from '@/lib/auth-middleware';
import { NotificationRegistry } from '@/lib/notification-registry';
import { ActivityRegistry } from '@/lib/activity-registry';

/**
 * POST /api/admin/missions/[id]/complete
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const { id } = await params;

        // Mark as completed
        const mission = await MissionRegistry.updateMission(id, { status: 'completed' });

        if (!mission) {
            return NextResponse.json({ error: 'Mission not found or update failed' }, { status: 404 });
        }

        // Notify Squad Leader
        if (mission.assignedSquad) {
            const squad = await SquadRegistry.getSquad(mission.assignedSquad);
            if (squad) {
                // System Notification
                await NotificationRegistry.create({
                    userId: squad.leader,
                    title: 'GÖREV TAMAMLANDI',
                    message: `"${mission.title}" operasyonu başarıyla sonuçlandı. Ödeme hesabınıza aktarıldı.`,
                    type: 'success',
                    link: `/missions/${id}`
                });

                // Global Activity Log
                await ActivityRegistry.log({
                    type: 'mission_completed',
                    message: `Squad ${squad.name} successfully completed Operation ${mission.title}`,
                    meta: { missionId: id, squadId: squad.id }
                });
            }
        }

        return NextResponse.json({ success: true, mission });

    } catch (error) {
        console.error('Completion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
