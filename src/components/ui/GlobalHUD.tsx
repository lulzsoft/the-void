'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GlobalHUD({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login' || pathname === '/initiation';
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
        };
        const interval = setInterval(updateTime, 1000);
        updateTime();
        return () => clearInterval(interval);
    }, []);

    // Don't show HUD on login pages to keep them clean "terminals"
    // OR show a simplified version. For now, let's keep it consistent but maybe minimal on login.
    // Actually, design masterplan says "Login -> Biometric Gate", so maybe HUD is for "logged in" state?
    // Let's hide it on login for drama.
    if (isLoginPage) return <>{children}</>;

    return (
        <div className="relative min-h-screen bg-void-black text-stark-white overflow-hidden">
            {/* Top Bar (Header) */}
            <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-6 border-b border-white/10 bg-void-black/80 backdrop-blur-md">
                {/* Left: Brand / System Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-tech-cyan rounded-full animate-pulse" />
                        <span className="font-mono text-[10px] tracking-widest text-tech-cyan">SYS.ONLINE</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <span className="font-display font-bold text-lg tracking-tighter">BOŞLUK</span>
                </div>

                {/* Center: Current Page Context (Optional) */}
                <div className="hidden md:block">
                    <div className="px-4 py-1 border border-white/5 rounded-full bg-white/5">
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50">
                            {pathname === '/' ? 'COMMAND_DECK' : pathname.replace('/', '').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Right: Time / Connection */}
                <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-white/60">{time}</span>
                    <div className="flex gap-0.5 items-end h-3">
                        <motion.div disable={true} animate={{ height: ['40%', '80%', '40%'] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-1 bg-tech-cyan/50" />
                        <motion.div disable={true} animate={{ height: ['60%', '100%', '30%'] }} transition={{ duration: 0.7, repeat: Infinity }} className="w-1 bg-tech-cyan/70" />
                        <motion.div disable={true} animate={{ height: ['80%', '50%', '90%'] }} transition={{ duration: 0.4, repeat: Infinity }} className="w-1 bg-tech-cyan" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-16 pb-12 min-h-screen relative z-10">
                {children}
            </main>

            {/* Bottom Bar (Footer) */}
            <footer className="fixed bottom-0 left-0 right-0 h-8 z-50 bg-void-black/90 border-t border-white/10 flex items-center px-4">
                <div className="w-full overflow-hidden whitespace-nowrap mask-linear-fade">
                    <motion.div
                        className="inline-block"
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                        <span className="font-mono text-[9px] tracking-widest text-white/40">
                            /// NOTICE: SYSTEM MAINTENANCE SCHEDULED FOR 0400 UTC /// NEW CONTRACTS AVAILABLE IN SECTOR 7 /// PROTOCOL_VOID ACTIVE /// WELCOME OPERATIVE ///
                        </span>
                    </motion.div>
                </div>
            </footer>

            {/* Global Overlay Effects */}
            <div className="fixed inset-0 pointer-events-none z-40">
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                {/* Scanline (Very subtle) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_1px] opacity-20 pointer-events-none" />
            </div>
        </div>
    );
}
