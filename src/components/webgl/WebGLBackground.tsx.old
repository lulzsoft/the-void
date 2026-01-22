'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load WebGL component only on desktop
const WebGLBackground = dynamic(() => import('./WebGLBackground'), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-void-black" />,
});

/**
 * Optimized Liquid Background wrapper
 * - Disables WebGL on mobile devices for performance
 * - Uses simple gradient fallback on mobile
 */
export default function LiquidBackground() {
    const [isMobile, setIsMobile] = useState(false);
    const [isLowPerformance, setIsLowPerformance] = useState(false);

    useEffect(() => {
        // Detect mobile devices
        const checkMobile = () => {
            const ua = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

            // Detect low-end devices (< 4GB RAM, < 4 CPU cores)
            const memory = (navigator as any).deviceMemory; // GB
            const cores = navigator.hardwareConcurrency;
            const isLowEnd = (memory && memory < 4) || (cores && cores < 4);

            setIsMobile(isMobileDevice);
            setIsLowPerformance(isMobileDevice || isLowEnd);
        };

        checkMobile();
    }, []);

    // Fallback: Simple CSS gradient for mobile/low-end devices
    if (isLowPerformance) {
        return (
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000000 100%)',
                }}
            />
        );
    }

    // WebGL for desktop/high-end devices
    return <WebGLBackground />;
}
