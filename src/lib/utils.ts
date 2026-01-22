
import { NextRequest } from 'next/server';

export function getClientIp(req: Request | NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Handle comma-separated list and standard IPv6 mapping prefix
        return forwardedFor.split(',')[0].trim().replace('::ffff:', '');
    }
    return '127.0.0.1';
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
