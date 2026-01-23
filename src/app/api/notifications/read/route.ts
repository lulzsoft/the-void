import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { NotificationRegistry } from '@/lib/notification-registry';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, all } = body;

        if (all) {
            await NotificationRegistry.markAllRead(session.id as string);
        } else if (notificationId) {
            await NotificationRegistry.markAsRead(session.id as string, notificationId);
        } else {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Notification Update Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
