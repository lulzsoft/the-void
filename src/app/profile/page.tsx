'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        // In a real app, check auth context for username.
        // For now, redirect to a "me" or "operative" placeholder.
        router.replace('/profile/operative');
    }, [router]);

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center">
            <span className="font-mono text-xs text-silver/50 animate-pulse">REDIRECTING TO PERSONNEL FILE...</span>
        </div>
    );
}
