import { AlienRegistry } from '@/lib/alien-registry';
import { MissionRegistry } from '@/lib/mission-registry';

export async function calculateUserStats(username: string) {
    // 1. Get User Profile
    const profile = await AlienRegistry.getProfileByUsername(username);
    if (!profile) return null;

    // 2. Mock Mission Stats (Until we have a real relation)
    // Gerçekte: MissionRegistry.getCompletedBy(username)
    // Simülasyon: XP üzerinden tahmin
    const completedMissions = Math.floor((profile.xp || 0) / 1000);
    const totalApplications = completedMissions + 2; // Mock
    const successRate = totalApplications > 0 ? Math.round((completedMissions / totalApplications) * 100) : 100;

    return {
        ...profile,
        stats: {
            missionsCompleted: completedMissions,
            successRate: successRate,
            reputation: profile.xp || 0,
            rank: 'UNKNOWN' // Will be calculated by frontend or shared lib
        }
    };
}
