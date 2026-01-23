import { AlienRegistry, AlienProfile } from './alien-registry';
import { SquadRegistry } from './squad-registry';
import { redis } from './redis';

export interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    rank: number;
    avatar?: string;
    secondary?: string; // Squad name or Role
}

export class LeaderboardRegistry {
    /**
     * Get Top Agents by XP/Reputation
     */
    static async getTopAgents(limit = 50): Promise<LeaderboardEntry[]> {
        // Optimization: Use Redis ZSET 'leaderboard:xp' in production.
        // For MVP: Fetch all and sort.
        const profiles = await AlienRegistry.getAllProfiles();

        const sorted = profiles
            .map(p => ({
                id: p.id,
                name: p.username || p.codename,
                score: parseInt(p.xp as any || '0'),
                role: p.role,
                avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${p.username}`
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return sorted.map((p, index) => ({
            id: p.id,
            name: p.name,
            score: p.score,
            rank: index + 1,
            avatar: p.avatar,
            secondary: p.role.toUpperCase()
        }));
    }

    /**
     * Get Top Squads by Earnings
     */
    static async getTopSquads(limit = 20): Promise<LeaderboardEntry[]> {
        const squads = await SquadRegistry.getAllSquads();
        const { MissionRegistry } = await import('./mission-registry');
        const missions = await MissionRegistry.getAllMissions();

        // Calculate earnings for each squad
        const squadEarnings = squads.map(s => {
            const squadMissions = missions.filter(m => m.assignedSquad === s.id && m.status === 'completed');
            const total = squadMissions.reduce((acc, m) => {
                const val = parseInt(m.compensation.replace(/[^0-9]/g, '')) || 0;
                return acc + val;
            }, 0);

            return {
                id: s.id,
                name: s.name,
                score: total,
                members: s.members.length
            };
        });

        const sorted = squadEarnings
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return sorted.map((s, index) => ({
            id: s.id,
            name: s.name,
            score: s.score,
            rank: index + 1,
            secondary: `${s.members} OPERATIVES`
        }));
    }
}
