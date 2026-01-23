import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { NotificationRegistry } from '@/lib/notification-registry';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await NotificationRegistry.getAll(session.id as string);
        return NextResponse.json({ notifications });

    } catch (error) {
        console.error('Notification Fetch Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
