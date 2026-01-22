
import { NextRequest, NextResponse } from 'next/server';
import { checkProfanity } from '@/lib/moderation';
import { redis } from '@/lib/redis';
import { AlienRegistry } from '@/lib/alien-registry';
import { MAX_MESSAGES_STORED } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Check Ban Status
    const isBanned = await redis.sismember('sanctum:banned_ips', ip);
    if (isBanned) {
        return NextResponse.json({ error: 'BANNED' }, { status: 403 });
    }

    // Fetch Messages (Last 50) - optimized parsing
    const rawMessages = await redis.lrange('sanctum:messages', 0, 49);
    const messages = rawMessages.map(m => JSON.parse(m as string));

    // Fetch Active Users (Admitted Candidates)
    const admitted = await AlienRegistry.getAdmittedCandidates();

    // Deduplicate by codename
    const uniqueUsers = Array.from(new Map(admitted.map(item => [item.codename, item])).values());

    return NextResponse.json({
        messages: messages.reverse(), // Redis stores newest first
        users: uniqueUsers.map(c => ({
            codename: c.codename,
            score: Number(c.score) || 0,
            skill: c.skill,
            role: (Number(c.score) || 0) > 90 ? 'ELİT' : (Number(c.score) || 0) > 70 ? 'AJAN' : 'GÖZCÜ'
        }))
    });
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Check Ban Status
    const isBanned = await redis.sismember('sanctum:banned_ips', ip);
    if (isBanned) {
        return NextResponse.json({ error: 'BANNED' }, { status: 403 });
    }

    const body = await req.json();
    const { text, author, type, fileData } = body;

    if (!text || !author) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const moderation = checkProfanity(text);

    const newMessage = {
        id: Date.now().toString(),
        text,
        author,
        timestamp: new Date().toISOString(),
        flagged: !moderation.isClean,
        flaggedWords: moderation.flaggedWords,
        ip,
        type: type || 'text',
        fileData: fileData || undefined
    };

    // Store in Redis
    await redis.lpush('sanctum:messages', JSON.stringify(newMessage));
    await redis.ltrim('sanctum:messages', 0, MAX_MESSAGES_STORED - 1); // Keep last 100

    if (!moderation.isClean) {
        // Log violation for Inquisition
        await redis.lpush('sanctum:violations', JSON.stringify({
            ...newMessage,
            reason: 'Profanity'
        }));

        return NextResponse.json({
            success: false,
            flagged: true,
            message: 'Mesajınız denetime takıldı ve Engizisyon\'a iletildi.'
        });
    }

    return NextResponse.json({ success: true, message: newMessage });
}
