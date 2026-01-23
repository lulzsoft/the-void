import { NextResponse } from 'next/server';
import { MissionGenerator } from '@/lib/mission-generator';
import { MissionRegistry } from '@/lib/mission-registry';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic } = body;

        // Generate content
        const missionData = await MissionGenerator.generate(topic);

        // Register to database (mock)
        const newMission = await MissionRegistry.create({
            title: missionData.title,
            description: missionData.description,
            type: 'contract',
            status: 'open',
            priority: 'high',
            difficulty: missionData.difficulty,
            compensation: missionData.compensation,
            duration: missionData.duration,
            requirements: missionData.requirements,
            maxParticipants: 1
        });

        return NextResponse.json({ success: true, mission: newMission });
    } catch (error) {
        console.error('Generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate mission' }, { status: 500 });
    }
}
