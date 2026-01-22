'use client';

import { useState, useEffect } from 'react';

export interface PublicStats {
    members: {
        total: number;
        accepted: number;
        active: number;
    };
    squads: {
        total: number;
        active: number;
        avgSize: number;
    };
    missions: {
        total: number;
        open: number;
        inProgress: number;
        applications: number;
    };
    timestamp: number;
}

export function usePublicStats() {
    const [stats, setStats] = useState<PublicStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();

        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats/public');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setError(null);
            } else {
                setError('Failed to load stats');
            }
        } catch (e) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, refresh: fetchStats };
}
