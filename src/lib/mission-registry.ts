import { redis } from './redis';
import { Mission, MissionStatus, MissionApplication } from '@/types/mission';

/**
 * Mission Registry - Manage missions in Redis
 */

export class MissionRegistry {
    private static MISSION_KEY_PREFIX = 'mission:';
    private static MISSIONS_SET = 'missions:all';

    /**
     * Create a new mission (admin only)
     */
    static async createMission(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt' | 'applications'>): Promise<Mission> {
        const id = `ms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        const newMission: Mission = {
            ...mission,
            id,
            applications: [],
            createdAt: now,
            updatedAt: now,
        };

        await redis.set(
            `${this.MISSION_KEY_PREFIX}${id}`,
            JSON.stringify(newMission)
        );

        await redis.sadd(this.MISSIONS_SET, id);

        return newMission;
    }

    /**
     * Get mission by ID
     */
    static async getMission(id: string): Promise<Mission | null> {
        const data = await redis.get(`${this.MISSION_KEY_PREFIX}${id}`);
        if (!data) return null;
        return JSON.parse(data as string);
    }

    /**
     * Get all missions
     */
    static async getAllMissions(): Promise<Mission[]> {
        const missionIds = await redis.smembers(this.MISSIONS_SET);
        const missions: Mission[] = [];

        for (const id of missionIds) {
            const mission = await this.getMission(id);
            if (mission) missions.push(mission);
        }

        return missions.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Get missions with filters
     */
    static async getMissionsWithFilters(filters: {
        status?: string;
        search?: string;
        minReward?: number;
        difficulty?: string;
    }): Promise<Mission[]> {
        let missions = await this.getAllMissions();

        // 1. Status Filter
        if (filters.status && filters.status !== 'all') {
            missions = missions.filter(m => m.status === filters.status);
        }

        // 2. Search (Title, Desc, Tags)
        if (filters.search) {
            const query = filters.search.toLowerCase();
            missions = missions.filter(m =>
                m.title.toLowerCase().includes(query) ||
                m.description.toLowerCase().includes(query) ||
                (m.tags && m.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        // 3. Difficulty
        if (filters.difficulty && filters.difficulty !== 'all') {
            missions = missions.filter(m => m.difficulty === filters.difficulty);
        }

        // 4. Min Reward
        if (filters.minReward) {
            missions = missions.filter(m => {
                // "$10,000" -> 10000, "5%" -> 0 (ignore), "Equity" -> 0
                // Only works for numeric rewards
                const reward = parseInt(m.compensation.replace(/[^0-9]/g, '')) || 0;
                return reward >= (filters.minReward as number);
            });
        }

        return missions;
    }

    /**
     * Get missions by status
     */
    static async getMissionsByStatus(status: MissionStatus): Promise<Mission[]> {
        const allMissions = await this.getAllMissions();
        return allMissions.filter(m => m.status === status);
    }

    /**
     * Get missions assigned to a squad
     */
    static async getMissionsBySquad(squadId: string): Promise<Mission[]> {
        const allMissions = await this.getAllMissions();
        return allMissions.filter(m => m.assignedSquad === squadId);
    }

    /**
     * Apply to mission
     */
    static async applyToMission(
        missionId: string,
        squadId: string,
        squadName: string,
        message?: string
    ): Promise<Mission | null> {
        const mission = await this.getMission(missionId);
        if (!mission) return null;

        // Check if squad already applied
        const existing = mission.applications.find(a => a.squadId === squadId);
        if (existing) {
            throw new Error('Squad already applied to this mission');
        }

        // Add application
        const application: MissionApplication = {
            squadId,
            squadName,
            appliedAt: Date.now(),
            status: 'pending',
            message,
        };

        mission.applications.push(application);
        mission.updatedAt = Date.now();

        await redis.set(
            `${this.MISSION_KEY_PREFIX}${missionId}`,
            JSON.stringify(mission)
        );

        return mission;
    }

    /**
     * Update application status (admin only)
     */
    static async updateApplicationStatus(
        missionId: string,
        squadId: string,
        status: 'pending' | 'accepted' | 'rejected'
    ): Promise<Mission | null> {
        const mission = await this.getMission(missionId);
        if (!mission) return null;

        const application = mission.applications.find(a => a.squadId === squadId);
        if (!application) {
            throw new Error('Application not found');
        }

        application.status = status;

        // If accepted, assign squad and update mission status
        if (status === 'accepted') {
            mission.assignedSquad = squadId;
            mission.status = 'in-progress';
        }

        mission.updatedAt = Date.now();

        await redis.set(
            `${this.MISSION_KEY_PREFIX}${missionId}`,
            JSON.stringify(mission)
        );

        return mission;
    }

    /**
     * Update mission
     */
    static async updateMission(missionId: string, updates: Partial<Mission>): Promise<Mission | null> {
        const mission = await this.getMission(missionId);
        if (!mission) return null;

        const updated = {
            ...mission,
            ...updates,
            updatedAt: Date.now(),
            // Prevent changing immutable fields
            id: mission.id,
            createdAt: mission.createdAt,
            applications: mission.applications,
        };

        await redis.set(
            `${this.MISSION_KEY_PREFIX}${missionId}`,
            JSON.stringify(updated)
        );

        return updated;
    }

    /**
     * Delete mission
     */
    static async deleteMission(missionId: string): Promise<boolean> {
        await redis.del(`${this.MISSION_KEY_PREFIX}${missionId}`);
        await redis.srem(this.MISSIONS_SET, missionId);
        return true;
    }

    /**
     * Get stats
     */
    static async getStats() {
        const allMissions = await this.getAllMissions();
        const totalMissions = allMissions.length;
        const openMissions = allMissions.filter(m => m.status === 'open').length;
        const inProgressMissions = allMissions.filter(m => m.status === 'in-progress').length;
        const totalApplications = allMissions.reduce((sum, m) => sum + m.applications.length, 0);

        return {
            totalMissions,
            openMissions,
            inProgressMissions,
            totalApplications,
        };
    }
}
