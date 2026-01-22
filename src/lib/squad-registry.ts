import redis from './redis';
import { Squad, SquadStatus } from '@/types/squad';

/**
 * Squad Registry - Manage squads in Redis
 */

export class SquadRegistry {
    private static SQUAD_KEY_PREFIX = 'squad:';
    private static SQUADS_SET = 'squads:all';
    private static USER_SQUADS_PREFIX = 'user_squads:';

    /**
     * Create a new squad
     */
    static async createSquad(squad: Omit<Squad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Squad> {
        const id = `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        const newSquad: Squad = {
            ...squad,
            id,
            createdAt: now,
            updatedAt: now,
            members: [squad.leader], // Leader is first member
        };

        // Save squad
        await redis.set(
            `${this.SQUAD_KEY_PREFIX}${id}`,
            JSON.stringify(newSquad)
        );

        // Add to squads set
        await redis.sadd(this.SQUADS_SET, id);

        // Add to user's squads
        await redis.sadd(`${this.USER_SQUADS_PREFIX}${squad.leader}`, id);

        return newSquad;
    }

    /**
     * Get squad by ID
     */
    static async getSquad(id: string): Promise<Squad | null> {
        const data = await redis.get(`${this.SQUAD_KEY_PREFIX}${id}`);
        if (!data) return null;
        return JSON.parse(data as string);
    }

    /**
     * Get all squads
     */
    static async getAllSquads(): Promise<Squad[]> {
        const squadIds = await redis.smembers(this.SQUADS_SET);
        const squads: Squad[] = [];

        for (const id of squadIds) {
            const squad = await this.getSquad(id);
            if (squad) squads.push(squad);
        }

        return squads.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Get squads by status
     */
    static async getSquadsByStatus(status: SquadStatus): Promise<Squad[]> {
        const allSquads = await this.getAllSquads();
        return allSquads.filter(s => s.status === status);
    }

    /**
     * Get user's squads
     */
    static async getUserSquads(username: string): Promise<Squad[]> {
        const squadIds = await redis.smembers(`${this.USER_SQUADS_PREFIX}${username}`);
        const squads: Squad[] = [];

        for (const id of squadIds) {
            const squad = await this.getSquad(id);
            if (squad) squads.push(squad);
        }

        return squads;
    }

    /**
     * Join a squad
     */
    static async joinSquad(squadId: string, username: string): Promise<Squad | null> {
        const squad = await this.getSquad(squadId);
        if (!squad) return null;

        // Check if already member
        if (squad.members.includes(username)) {
            return squad; // Already a member
        }

        // Check if full
        if (squad.members.length >= squad.maxMembers) {
            throw new Error('Squad is full');
        }

        // Add member
        squad.members.push(username);
        squad.updatedAt = Date.now();

        // Update status if full
        if (squad.members.length >= squad.maxMembers) {
            squad.status = 'full';
        }

        // Save updated squad
        await redis.set(
            `${this.SQUAD_KEY_PREFIX}${squadId}`,
            JSON.stringify(squad)
        );

        // Add to user's squads
        await redis.sadd(`${this.USER_SQUADS_PREFIX}${username}`, squadId);

        return squad;
    }

    /**
     * Leave a squad
     */
    static async leaveSquad(squadId: string, username: string): Promise<Squad | null> {
        const squad = await this.getSquad(squadId);
        if (!squad) return null;

        // Can't leave if leader (must disband or transfer leadership)
        if (squad.leader === username) {
            throw new Error('Leader cannot leave. Disband squad or transfer leadership.');
        }

        // Remove member
        squad.members = squad.members.filter(m => m !== username);
        squad.updatedAt = Date.now();

        // Update status
        if (squad.status === 'full' && squad.members.length < squad.maxMembers) {
            squad.status = 'recruiting';
        }

        // Save
        await redis.set(
            `${this.SQUAD_KEY_PREFIX}${squadId}`,
            JSON.stringify(squad)
        );

        // Remove from user's squads
        await redis.srem(`${this.USER_SQUADS_PREFIX}${username}`, squadId);

        return squad;
    }

    /**
     * Update squad
     */
    static async updateSquad(squadId: string, updates: Partial<Squad>): Promise<Squad | null> {
        const squad = await this.getSquad(squadId);
        if (!squad) return null;

        const updated = {
            ...squad,
            ...updates,
            updatedAt: Date.now(),
            // Prevent changing immutable fields
            id: squad.id,
            createdAt: squad.createdAt,
            leader: squad.leader,
        };

        await redis.set(
            `${this.SQUAD_KEY_PREFIX}${squadId}`,
            JSON.stringify(updated)
        );

        return updated;
    }

    /**
     * Delete/disband squad
     */
    static async disbandSquad(squadId: string): Promise<boolean> {
        const squad = await this.getSquad(squadId);
        if (!squad) return false;

        // Remove from all members' squads
        for (const member of squad.members) {
            await redis.srem(`${this.USER_SQUADS_PREFIX}${member}`, squadId);
        }

        // Remove squad
        await redis.del(`${this.SQUAD_KEY_PREFIX}${squadId}`);
        await redis.srem(this.SQUADS_SET, squadId);

        return true;
    }

    /**
     * Get squad stats
     */
    static async getStats() {
        const allSquads = await this.getAllSquads();
        const totalSquads = allSquads.length;
        const activeSquads = allSquads.filter(s => s.status !== 'disbanded').length;
        const totalMembers = allSquads.reduce((sum, s) => sum + s.members.length, 0);
        const averageSquadSize = totalSquads > 0 ? totalMembers / totalSquads : 0;

        return {
            totalSquads,
            activeSquads,
            totalMembers,
            averageSquadSize: Math.round(averageSquadSize * 10) / 10,
        };
    }
}
