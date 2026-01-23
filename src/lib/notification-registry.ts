import { redis } from './redis';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    timestamp: number;
    read: boolean;
    link?: string;
}

export class NotificationRegistry {
    /**
     * Creates a new notification for a user
     */
    static async create(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
            id,
            timestamp: Date.now(),
            read: false,
            ...notification
        };

        // Add to the head of the list
        await redis.lpush(`notifications:${notification.userId}`, JSON.stringify(newNotification));

        // Keep only the last 50 notifications
        await redis.ltrim(`notifications:${notification.userId}`, 0, 49);

        return newNotification;
    }

    /**
     * Retrieves all notifications for a user
     */
    static async getAll(userId: string): Promise<Notification[]> {
        const list = await redis.lrange(`notifications:${userId}`, 0, -1);
        if (!list || list.length === 0) return [];

        // Handle potential parsing errors if invalid data is somehow injected
        return list.map((item: any) => {
            if (typeof item === 'string') return JSON.parse(item);
            return item; // @upstash/redis might return object if configured, but usually string for Lists
        });
    }

    /**
     * Marks a specific notification as read
     */
    static async markAsRead(userId: string, notificationId: string) {
        // Since we store as a simple list of JSONs, we need to rewrite the list to update one item.
        // For a max size of 50, this is performant enough.

        const notifications = await this.getAll(userId);
        let updated = false;

        const newNotifications = notifications.map(n => {
            if (n.id === notificationId && !n.read) {
                updated = true;
                return { ...n, read: true };
            }
            return n;
        });

        if (updated) {
            await redis.del(`notifications:${userId}`);
            // RPUSH to preserve order (getAll returns newest first if we used LPUSH?)
            // Wait: LPUSH adds to Head. 
            // LPUSH A, LPUSH B -> List: [B, A]
            // LRANGE 0 -1 -> [B, A]
            // If we want to restore [B, A], we must RPUSH B then RPUSH A? 
            // NO. RPUSH adds to Tail.
            // Empty List. RPUSH B -> [B]. RPUSH A -> [B, A]. Correct.
            // So we can map strings and RPUSH all at once.

            if (newNotifications.length > 0) {
                const strings = newNotifications.map(n => JSON.stringify(n));
                await redis.rpush(`notifications:${userId}`, ...strings);
            }
        }
    }

    /**
     * Marks all notifications as read
     */
    static async markAllRead(userId: string) {
        const notifications = await this.getAll(userId);
        const neededUpdate = notifications.some(n => !n.read);

        if (neededUpdate) {
            const updated = notifications.map(n => ({ ...n, read: true }));
            await redis.del(`notifications:${userId}`);
            if (updated.length > 0) {
                const strings = updated.map(n => JSON.stringify(n));
                await redis.rpush(`notifications:${userId}`, ...strings);
            }
        }
    }
}
