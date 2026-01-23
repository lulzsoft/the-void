import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HoloCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;
}

export default function HoloCard({
    children,
    className = '',
    hoverEffect = true,
    delay = 0
}: HoloCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={`
                relative overflow-hidden rounded-xl 
                bg-abyssal-blue/40 backdrop-blur-md 
                border border-white/5 shadow-2xl
                group
                ${hoverEffect ? 'hover:border-deep-crimson/50 hover:shadow-[0_0_30px_rgba(139,0,0,0.2)] hover:-translate-y-1 transition-all duration-500' : ''}
                ${className}
            `}
        >
            {/* Holographic noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-0" />

            {/* Shine effect on hover */}
            {hoverEffect && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
            )}

            {/* Content content */}
            <div className="relative z-20">
                {children}
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-white/20 rounded-tl-xl transition-colors duration-300 group-hover:border-deep-crimson/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-white/20 rounded-br-xl transition-colors duration-300 group-hover:border-deep-crimson/50" />
        </motion.div>
    );
}
