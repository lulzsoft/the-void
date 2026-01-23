import { redis } from './redis';

export interface ActivityEvent {
    id: string;
    type: 'mission_completed' | 'squad_created' | 'member_joined' | 'rank_up';
    message: string;
    timestamp: number;
    meta?: any;
}

export class ActivityRegistry {
    private static KEY = 'activity:global';

    /**
     * Log a new activity
     */
    static async log(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
        const newEvent: ActivityEvent = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            ...event
        };

        // LPUSH to add to start
        await redis.lpush(this.KEY, JSON.stringify(newEvent));

        // Keep last 50 events
        await redis.ltrim(this.KEY, 0, 49);

        return newEvent;
    }

    /**
     * Get recent activities
     */
    static async getRecent(limit = 20): Promise<ActivityEvent[]> {
        const list = await redis.lrange(this.KEY, 0, limit - 1);
        if (!list) return [];

        return list.map((item: any) => {
            if (typeof item === 'string') return JSON.parse(item);
            return item;
        });
    }
}
