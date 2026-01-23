'use client';

import { ButtonHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'active';
}

export default function GlitchButton({
    children,
    className = '',
    variant = 'primary',
    ...props
}: GlitchButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = "relative px-8 py-4 font-mono text-sm tracking-[0.2em] font-bold uppercase transition-all duration-300 overflow-hidden group";

    const variants = {
        primary: "bg-transparent border border-white/20 text-stark-white hover:border-deep-crimson hover:text-deep-crimson hover:shadow-[0_0_20px_rgba(139,0,0,0.4)]",
        secondary: "bg-white/5 border border-white/10 text-silver hover:bg-white/10 hover:text-white",
        active: "bg-deep-crimson/20 border border-deep-crimson/50 text-stark-white hover:bg-deep-crimson/40",
        ghost: "bg-transparent text-silver/50 hover:text-stark-white decoration-none hover:underline underline-offset-4"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Glitch Overlay Layers (visible on hover) */}
            {variant === 'primary' && (
                <>
                    <div className="absolute inset-0 bg-deep-crimson/10 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />

                    {/* Random glitch lines that appear on hover */}
                    {isHovered && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, top: "10%" }}
                                animate={{ opacity: [0, 1, 0], top: ["10%", "80%", "20%"] }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                                className="absolute left-0 w-full h-[1px] bg-red-500/50 z-20"
                            />
                            <motion.div
                                initial={{ opacity: 0, top: "50%" }}
                                animate={{ opacity: [0, 1, 0], top: ["50%", "10%", "90%"] }}
                                transition={{ duration: 0.3, repeat: Infinity, repeatType: "mirror", delay: 0.1 }}
                                className="absolute left-0 w-full h-[2px] bg-white/50 z-20"
                            />
                        </>
                    )}
                </>
            )}
        </button>
    );
}
