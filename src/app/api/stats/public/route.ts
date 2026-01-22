import { NextRequest, NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { MissionRegistry } from '@/lib/mission-registry';

/**
 * GET /api/stats/public - Public platform statistics
 */

export async function GET(req: NextRequest) {
    try {
        // Get all stats from registries
        const [
            allUsers,
            squadStats,
            missionStats,
        ] = await Promise.all([
            AlienRegistry.getAllProfiles(),
            SquadRegistry.getStats(),
            MissionRegistry.getStats(),
        ]);

        // Calculate user stats
        const totalMembers = allUsers.length;
        const acceptedMembers = allUsers.filter(u => u.status === 'ADMITTED').length;

        // Active users (accessed in last 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const activeMembers = allUsers.filter(u => {
            const lastActive = u.lastActive || u.updatedAt || 0;
            return lastActive > weekAgo;
        }).length;

        return NextResponse.json({
            members: {
                total: totalMembers,
                accepted: acceptedMembers,
                active: activeMembers,
            },
            squads: {
                total: squadStats.totalSquads,
                active: squadStats.activeSquads,
                avgSize: squadStats.averageSquadSize,
            },
            missions: {
                total: missionStats.totalMissions,
                open: missionStats.openMissions,
                inProgress: missionStats.inProgressMissions,
                applications: missionStats.totalApplications,
            },
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
