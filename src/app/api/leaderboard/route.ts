import { NextResponse } from 'next/server';
import { LeaderboardRegistry } from '@/lib/leaderboard-registry';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const [agents, squads] = await Promise.all([
            LeaderboardRegistry.getTopAgents(),
            LeaderboardRegistry.getTopSquads()
        ]);

        return NextResponse.json({
            agents,
            squads
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
