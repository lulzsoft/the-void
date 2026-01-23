import { redis } from './redis';
import crypto from 'crypto';

export type AlienStatus = 'PENDING' | 'ADMITTED' | 'REJECTED' | 'BANNED';
export type UserRole = 'user' | 'admin';

export interface AlienProfile {
    id: string; // UUID or generated ID
    codename: string;
    ip: string; // For identification
    skills: string;
    painTolerance: string;
    status: AlienStatus;
    role: UserRole; // User role for permissions
    createdAt: number;
    approvedAt?: number;
    accessKey?: string; // For stealth login
    answers?: any[]; // Chat history
    username?: string; // Unique username (mahlas)
    password?: string; // Hashed password
    deviceHash?: string; // Browser fingerprint
    email?: string; // Encrypted email (opsiyonel, şifre sıfırlama için)
    [key: string]: any; // Redis compatibility
}

export class AlienRegistry {

    /**
     * Yeni bir aday kaydeder (Sınavı geçenler)
     * IP adresine göre mükerrer kaydı önler.
     */
    static async registerCandidate(data: Omit<AlienProfile, 'status' | 'createdAt' | 'id'>): Promise<{ id: string, accessKey: string }> {
        // Mükerrer Kontrolü (IP)
        const existingId = await redis.get<string>(`ip:${data.ip}`);
        if (existingId) {
            const existingProfile = await redis.hgetall<AlienProfile>(`alien:${existingId}`);
            if (existingProfile) {
                // Return existing key if found, or generate new if missing (restore)
                let key = existingProfile.accessKey;
                if (!key) {
                    key = Math.random().toString(36).substring(2, 5).toUpperCase() + '-' +
                        Math.random().toString(36).substring(2, 5).toUpperCase();
                    await redis.hset(`alien:${existingId}`, { accessKey: key });
                    await redis.set(`key:${key}`, existingId);
                }
                return { id: existingId, accessKey: key };
            }
        }

        // Username Uniqueness Check
        if (data.username) {
            const existingUser = await redis.get(`username:${data.username}`);
            if (existingUser) {
                throw new Error('USERNAME_TAKEN');
            }
        }

        const id = crypto.randomUUID();

        // Generate secure access key with collision check
        let accessKey: string;
        let attempts = 0;
        do {
            // Cryptographically secure: 8 hex chars (16^8 = 4.2B combinations)
            const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
            const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
            accessKey = `${part1}-${part2}`; // Format: A3F2-9B7E

            // Check for collision
            const existing = await redis.get(`key:${accessKey}`);
            if (!existing) break;

            attempts++;
        } while (attempts < 10);

        if (attempts >= 10) {
            throw new Error('Failed to generate unique access key');
        }

        const profile = {
            id,
            accessKey,
            ...data,
            status: 'PENDING',
            role: 'user',
            createdAt: Date.now()
        } as AlienProfile;

        // 1. Profil Verisini hash olarak sakla
        await redis.hset(`alien:${id}`, profile as any);

        // 2. IP adresini ID ile eşleştir (Girişte tanımak için)
        await redis.set(`ip:${data.ip}`, id);

        // 2.5 Username ile ID eşleştir
        if (data.username) {
            await redis.set(`username:${data.username}`, id);
        }

        // 3. Erişim Anahtarı ile ID eşleştir (Farklı cihazdan giriş için)
        await redis.set(`key:${accessKey}`, id);

        // 4. Admin onayı için 'pending' listesine ekle
        await redis.sadd('aliens:pending', id);

        // 5. Tüm adaylar listesine ekle
        await redis.sadd('aliens:all', id);

        return { id, accessKey };
    }

    /**
     * Adayı kabul eder (Admin işlemi)
     */
    static async approveCandidate(id: string): Promise<void> {
        await redis.hset(`alien:${id}`, { status: 'ADMITTED', approvedAt: Date.now() });
        await redis.srem('aliens:pending', id);
        await redis.sadd('aliens:admitted', id);
    }

    /**
     * Adayı reddeder (Admin işlemi)
     */
    static async rejectCandidate(id: string): Promise<void> {
        await redis.hset(`alien:${id}`, { status: 'REJECTED' });
        await redis.srem('aliens:pending', id);
        await redis.sadd('aliens:rejected', id);
    }

    /**
     * IP adresine göre kullanıcının durumunu sorgular
     */
    static async getStatusByIP(ip: string): Promise<AlienProfile | null> {
        // IP -> ID eşleşmesini bul
        const id = await redis.get<string>(`ip:${ip}`);
        if (!id) return null;

        // ID varsa profil detayını çek
        const profile = await redis.hgetall<AlienProfile>(`alien:${id}`);
        return profile;
    }

    /**
     * Kullanıcı adı ile profil sorgular
     */
    static async getProfileByUsername(username: string): Promise<AlienProfile | null> {
        const id = await redis.get<string>(`username:${username}`);
        if (!id) return null;

        return await redis.hgetall<AlienProfile>(`alien:${id}`);
    }

    /**
     * Erişim anahtarı ile profil sorgular (Stealth Login)
     */
    static async getProfileByAccessKey(key: string): Promise<AlienProfile | null> {
        const id = await redis.get<string>(`key:${key}`);
        if (!id) return null;

        const profile = await redis.hgetall<AlienProfile>(`alien:${id}`);
        return profile;
    }

    /**
     * Admin paneli için tüm bekleyenleri çeker
     */
    static async getPendingCandidates(): Promise<AlienProfile[]> {
        const ids = await redis.smembers('aliens:pending');
        if (ids.length === 0) return [];

        const pipeline = redis.pipeline();
        ids.forEach(id => pipeline.hgetall(`alien:${id}`));
        const results = await pipeline.exec();

        return results as AlienProfile[];
    }

    /**
     * Sanctum için onaylı üyeleri çeker
     */
    static async getAdmittedCandidates(): Promise<AlienProfile[]> {
        const ids = await redis.smembers('aliens:admitted');
        if (ids.length === 0) return [];

        const pipeline = redis.pipeline();
        ids.forEach(id => pipeline.hgetall(`alien:${id}`));
        const results = await pipeline.exec();

        return results as AlienProfile[];
    }

    /**
     * Yasaklı/Reddedilmiş üyeleri çeker
     */
    static async getRejectedCandidates(): Promise<AlienProfile[]> {
        const ids = await redis.smembers('aliens:rejected');
        if (ids.length === 0) return [];

        const pipeline = redis.pipeline();
        ids.forEach(id => pipeline.hgetall(`alien:${id}`));
        const results = await pipeline.exec();

        return results as AlienProfile[];
    }

    /**
     * Tüm profilleri çeker (Stats API için)
     */
    static async getAllProfiles(): Promise<AlienProfile[]> {
        const ids = await redis.smembers('aliens:all');
        if (ids.length === 0) return [];

        const pipeline = redis.pipeline();
        ids.forEach(id => pipeline.hgetall(`alien:${id}`));
        const results = await pipeline.exec();

        return results as AlienProfile[];
    }

    /**
     * Profil bilgilerini günceller
     */
    static async updateProfile(id: string, updates: Partial<AlienProfile>): Promise<void> {
        const allowedUpdates = ['skills', 'painTolerance', 'email', 'answers', 'biography'];
        const filteredUpdates: any = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = (updates as any)[key];
            }
        });

        if (Object.keys(filteredUpdates).length > 0) {
            await redis.hset(`alien:${id}`, filteredUpdates);
        }
    }

    /**
     * Aktif ziyaretçi sayısını döner (Son 45sn)
     */
    static async getActiveVisitorCount(): Promise<number> {

        return await redis.zcard('visitors:active');
    }
}
