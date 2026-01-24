'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HUDFrameProps {
    children: ReactNode;
    className?: string;
    cornerLabel?: string;
    status?: 'neutral' | 'active' | 'critical' | 'warning';
}

export default function HUDFrame({
    children,
    className = '',
    cornerLabel = 'SYS.RDY',
    status = 'neutral'
}: HUDFrameProps) {

    // Status color mapping
    const borderColor = {
        neutral: 'border-white/10',
        active: 'border-tech-cyan/50',
        critical: 'border-critical-red/50',
        warning: 'border-alert-amber/50'
    }[status];

    const glowColor = {
        neutral: 'shadow-none',
        active: 'shadow-[0_0_20px_rgba(0,240,255,0.1)]',
        critical: 'shadow-[0_0_20px_rgba(255,42,42,0.15)]',
        warning: 'shadow-[0_0_20px_rgba(255,174,0,0.15)]'
    }[status];

    const accentColor = {
        neutral: 'bg-white/20',
        active: 'bg-tech-cyan',
        critical: 'bg-critical-red',
        warning: 'bg-alert-amber'
    }[status];

    return (
        <div className={`relative ${className}`}>
            {/* Main Frame Border */}
            <div className={`
                absolute inset-0 
                border ${borderColor} 
                bg-void-panel/80 backdrop-blur-sm
                ${glowColor}
                transition-all duration-500
            `} />

            {/* Corner Brackets (The "Military" Look) */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/40" />

            {/* Technical Markings (Micro-Typography) */}
            <div className="absolute -top-3 left-4 bg-void-black px-2">
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase">
                    [{cornerLabel}]
                </span>
            </div>

            <div className="absolute -bottom-3 right-4 bg-void-black px-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${accentColor} animate-pulse`} />
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase">
                    V.3.1
                </span>
            </div>

            {/* Decorative Grid Lines (Subtle) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 p-1">
                {children}
            </div>
        </div>
    );
}
