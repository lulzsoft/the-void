import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { getClientIp } from '@/lib/utils';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { codename, skills, painTolerance, answers } = body;

        if (!codename || !skills || !painTolerance) {
            return NextResponse.json({ error: 'Incomplete data' }, { status: 400 });
        }

        // IP adresini al (Header veya socket)
        // IP adresini al (Header veya socket)
        const ip = getClientIp(req);

        // ENV KONTROLÜ
        if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
            console.error('CRITICAL: Vercel KV/Upstash URL is MISSING in environment variables!');
            return NextResponse.json({ error: 'Database Configuration Missing' }, { status: 500 });
        }

        console.log('Registering Candidate:', { codename, ip });

        // Kayıt işlemini başlat
        const { id, accessKey } = await AlienRegistry.registerCandidate({
            codename,
            skills,
            painTolerance,
            answers,
            ip
        });

        console.log('Registration Success:', id);

        return NextResponse.json({ success: true, id, accessKey });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'System Failure' }, { status: 500 });
    }
}
