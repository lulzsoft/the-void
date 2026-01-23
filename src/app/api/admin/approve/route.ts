import { NextResponse } from 'next/server';
import { AlienRegistry } from '@/lib/alien-registry';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(req: Request) {
    // Admin authentication check
    const authError = await requireAdmin(req as any);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }


        if (action === 'APPROVE') {
            await AlienRegistry.approveCandidate(id);

            // Fetch user profile to get email
            const profile = await AlienRegistry.getStatusByIP(id) || await (await import('@/lib/alien-registry')).AlienRegistry.getAllProfiles().then(p => p.find(u => u.id === id));

            // Send Welcome Email
            if (profile?.email) {
                const { EmailService, EmailTemplates } = await import('@/lib/email');
                await EmailService.send({
                    to: profile.email,
                    subject: 'The Void: Başvurunuz Onaylandı',
                    html: EmailTemplates.welcome(profile.username || 'Ajan')
                });
            }

            // Notify User (System Notification)
            const { NotificationRegistry } = await import('@/lib/notification-registry');
            await NotificationRegistry.create({
                userId: id,
                title: 'ACCESS GRANTED',
                message: 'Engizisyon başvurunuzu onayladı. The Void\'a hoş geldiniz.',
                type: 'success'
            });
        } else {
            await AlienRegistry.rejectCandidate(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approval Error:', error);
        return NextResponse.json({ error: 'System Failure' }, { status: 500 });
    }
}
