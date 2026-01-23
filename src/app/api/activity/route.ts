import { NextResponse } from 'next/server';
import { ActivityRegistry } from '@/lib/activity-registry';

export const revalidate = 10; // Cache short term

export async function GET() {
    try {
        const activities = await ActivityRegistry.getRecent(10);
        return NextResponse.json({ activities });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
