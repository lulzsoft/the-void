import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { AlienRegistry } from '@/lib/alien-registry';
import { SquadRegistry } from '@/lib/squad-registry';
import { MissionRegistry } from '@/lib/mission-registry';
import { redis } from '@/lib/redis';

/**
 * GET /api/admin/analytics
 * Admin-only analytics endpoint
 * Query params: range=7d|30d|90d|all (default: 30d)
 */
export async function GET(req: NextRequest) {
    try {
        // Admin check
        const adminCheck = await requireAdmin(req);
        if (adminCheck) {
            return adminCheck;
        }

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '30d';

        // Calculate date range
        const now = Date.now();
        let startTime = now;
        switch (range) {
            case '7d':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = now - (30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startTime = now - (90 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
                startTime = 0;
                break;
        }

        // Fetch all data
        const allProfiles = await AlienRegistry.getAllProfiles();
        const allSquads = await SquadRegistry.getAllSquads();
        const allMissions = await MissionRegistry.getAllMissions();

        // Filter by date range
        const profiles = allProfiles.filter(p => p.createdAt >= startTime);
        const squads = allSquads.filter(s => s.createdAt >= startTime);
        const missions = allMissions.filter(m => m.createdAt >= startTime);

        // Calculate metrics
        const totalMembers = allProfiles.length;
        const newMembers = profiles.length;
        const acceptedMembers = allProfiles.filter(p => p.status === 'ADMITTED').length;
        const activeMembers = acceptedMembers; // Currently admitted members are considered the active base

        const totalSquads = allSquads.length;
        const newSquads = squads.length;
        const activeSquads = allSquads.filter(s => s.status === 'active' || s.status === 'recruiting').length;
        const avgSquadSize = totalSquads > 0
            ? allSquads.reduce((sum, s) => sum + s.members.length, 0) / totalSquads
            : 0;

        const totalMissions = allMissions.length;
        const newMissions = missions.length;
        const openMissions = allMissions.filter(m => m.status === 'open').length;
        const inProgressMissions = allMissions.filter(m => m.status === 'in-progress').length;
        const completedMissions = allMissions.filter(m => m.status === 'completed').length;

        // Calculate daily/weekly growth
        const dailyGrowth = calculateGrowth(allProfiles, 7);
        const weeklyGrowth = calculateGrowth(allProfiles, 30);

        // Top skills
        const skillCounts: Record<string, number> = {};
        allSquads.forEach(squad => {
            squad.skills.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });
        const topSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        return NextResponse.json({
            range,
            timestamp: now,
            members: {
                total: totalMembers,
                new: newMembers,
                accepted: acceptedMembers,
                active: activeMembers,
                dailyGrowth,
                weeklyGrowth,
            },
            squads: {
                total: totalSquads,
                new: newSquads,
                active: activeSquads,
                avgSize: Math.round(avgSquadSize * 10) / 10,
            },
            missions: {
                total: totalMissions,
                new: newMissions,
                open: openMissions,
                inProgress: inProgressMissions,
                completed: completedMissions,
            },
            topSkills,
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

/**
 * Calculate growth data points for charts
 */
function calculateGrowth(profiles: any[], days: number) {
    const dataPoints: { date: string; count: number }[] = [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = days - 1; i >= 0; i--) {
        const dayStart = now - (i * oneDayMs);
        const dayEnd = dayStart + oneDayMs;
        const count = profiles.filter(p => p.createdAt >= dayStart && p.createdAt < dayEnd).length;

        const date = new Date(dayStart).toISOString().split('T')[0];
        dataPoints.push({ date, count });
    }

    return dataPoints;
}
