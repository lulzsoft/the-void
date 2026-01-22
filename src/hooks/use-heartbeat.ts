
import { useEffect } from 'react';

export function useHeartbeat() {
    useEffect(() => {
        // Initial beat
        const beat = () => {
            fetch('/api/heartbeat').catch(() => { });
        };
        beat();

        // Repeat every 30s
        const interval = setInterval(beat, 30000);
        return () => clearInterval(interval);
    }, []);
}
