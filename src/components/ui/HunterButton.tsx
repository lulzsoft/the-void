'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface HunterButtonProps {
    onClick?: () => void;
    label?: string;
    loading?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export default function HunterButton({
    onClick,
    label = 'INITIATE HANDSHAKE',
    loading = false,
    className = '',
    type = 'button'
}: HunterButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            type={type}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading}
            className={`
                relative group w-full py-5 px-8 
                bg-void-black border border-white/10
                flex items-center justify-center
                overflow-hidden
                transition-all duration-300
                hover:border-tech-cyan/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {/* Background Scanline (Vertical) */}
            <motion.div
                className="absolute inset-x-0 top-0 h-[2px] bg-tech-cyan/30 z-0"
                animate={{
                    y: isHovered ? ['0%', '100%'] : '0%',
                    opacity: isHovered ? [0, 1, 0] : 0
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                }}
            />

            {/* Target Brackets (The "Hunter" Effect) */}
            {/* Top Left */}
            <motion.div
                className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-tech-cyan z-10"
                animate={{
                    x: isHovered ? 0 : -10,
                    y: isHovered ? 0 : -10,
                    opacity: isHovered ? 1 : 0
                }}
            />
            {/* Top Right */}
            <motion.div
                className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-tech-cyan z-10"
                animate={{
                    x: isHovered ? 0 : 10,
                    y: isHovered ? 0 : -10,
                    opacity: isHovered ? 1 : 0
                }}
            />
            {/* Bottom Left */}
            <motion.div
                className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-tech-cyan z-10"
                animate={{
                    x: isHovered ? 0 : -10,
                    y: isHovered ? 0 : 10,
                    opacity: isHovered ? 1 : 0
                }}
            />
            {/* Bottom Right */}
            <motion.div
                className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-tech-cyan z-10"
                animate={{
                    x: isHovered ? 0 : 10,
                    y: isHovered ? 0 : 10,
                    opacity: isHovered ? 1 : 0
                }}
            />

            {/* Label Content */}
            <div className="relative z-20 flex flex-col items-center">
                <span className={`
                    font-mono text-sm tracking-[0.3em] font-bold uppercase
                    transition-colors duration-300
                    ${isHovered ? 'text-tech-cyan' : 'text-stark-white'}
                `}>
                    {loading ? 'AUTHENTICATING...' : label}
                </span>

                {/* Sub-label (Micro-typography) */}
                {!loading && (
                    <span className="text-[9px] text-white/30 tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        CONFIRM IDENTITY
                    </span>
                )}
            </div>

            {/* Hover Glow Background */}
            <div className={`
                absolute inset-0 bg-tech-cyan/5 
                transition-opacity duration-300
                ${isHovered ? 'opacity-100' : 'opacity-0'}
            `} />
        </button>
    );
}
