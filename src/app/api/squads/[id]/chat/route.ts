import { NextResponse } from 'next/server';

// Geçici In-Memory Chat Store (Serverless ortamda process restart ile silinir)
// Gerçekte Redis veya Postgres kullanılmalı
const CHAT_STORE: Record<string, { id: string; user: string; text: string; timestamp: number }[]> = {};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const messages = CHAT_STORE[id] || [];
    // Son 50 mesajı döndür
    return NextResponse.json({ messages: messages.slice(-50) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const { user, text } = body;

    if (!CHAT_STORE[id]) {
        CHAT_STORE[id] = [];
    }

    const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        user: user || 'Unknown',
        text: text || '',
        timestamp: Date.now()
    };

    CHAT_STORE[id].push(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
}
