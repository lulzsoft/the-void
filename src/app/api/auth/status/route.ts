
import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { getClientIp } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // IP Adresini al
        // IP Adresini al
        const ip = getClientIp(req);

        // Durumu sorgula
        const profile = await AlienRegistry.getStatusByIP(ip);

        // Eğer kayıt yoksa veya reddedilmişse
        if (!profile) {
            return NextResponse.json({ status: 'UNKNOWN' });
        }

        return NextResponse.json({
            status: profile.status,
            codename: profile.codename
        });

    } catch (error) {
        console.error('Status Check Error:', error);
        return NextResponse.json({ error: 'System Failure' }, { status: 500 });
    }
}
