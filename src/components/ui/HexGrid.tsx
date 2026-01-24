'use client';

import { ReactNode } from 'react';

export function HexGrid({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto p-8">
            {children}
        </div>
    );
}

export function HexItem({ children, onClick, className = '' }: { children: ReactNode, onClick?: () => void, className?: string }) {
    return (
        <div
            onClick={onClick}
            className={`
                relative w-[280px] h-[300px] 
                bg-void-panel 
                clip-hex flex items-center justify-center 
                group cursor-pointer transition-transform hover:scale-105 hover:z-10
                ${className}
            `}
        >
            {/* Border (Simulated via parent or pseudo) - This is hard with clip-path. 
                Alternative: SVG overlay or background gradient. 
            */}
            <div className="absolute inset-[1px] bg-void-black clip-hex flex flex-col items-center justify-center p-6 text-center z-10">
                {children}
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:bg-tech-cyan group-hover:opacity-100 transition-colors" />
        </div>
    );
}
