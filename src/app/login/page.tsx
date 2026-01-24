'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HUDFrame from '@/components/ui/HUDFrame';
import HunterButton from '@/components/ui/HunterButton';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const deviceHash = btoa(navigator.userAgent + screen.width + screen.height).substring(0, 16);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, deviceHash })
            });

            const data = await res.json();

            if (res.ok) {
                // Success Sequence
                setAccessGranted(true);
                // Play sound here contextually if sound system was ready
                setTimeout(() => {
                    router.push('/sanctum');
                }, 2000); // Wait for animation
            } else {
                setError(data.error || 'IDENTIFICATION FAILURE');
                setLoading(false);
            }
        } catch (err) {
            setError('NETWORK HANDSHAKE FAILED');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Texture - subtle diagonal lines */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_11px)]" />

            {/* Scanner Line (Atmosphere) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="w-full h-[2px] bg-tech-cyan/10 blur-sm"
                    animate={{ y: ['0vh', '100vh'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <AnimatePresence>
                {!accessGranted ? (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        className="w-full max-w-md relative z-10"
                    >
                        <HUDFrame
                            status={error ? 'critical' : 'neutral'}
                            cornerLabel="BIOMETRIC GATE"
                            className="bg-black/80"
                        >
                            <div className="p-8 space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <div className="inline-block px-2 py-0.5 border border-white/20 text-[10px] tracking-[0.2em] text-white/40 mb-2">
                                        SECURE TERMINAL
                                    </div>
                                    <h1 className="font-display text-3xl text-stark-white tracking-tight">IDENTITY VERIFICATION</h1>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleLogin} className="space-y-8">
                                    {/* Username Field */}
                                    <div className="group relative">
                                        <label className="block text-[10px] font-mono text-tech-cyan/70 tracking-widest mb-2 group-focus-within:text-tech-cyan transition-colors">
                                            // USERNAME_ID
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="text-white/30 font-mono mr-2">{'>'}</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-transparent border-b border-white/10 py-2 text-stark-white font-mono text-sm focus:border-tech-cyan focus:outline-none transition-all placeholder-white/10"
                                                placeholder="ENTER CALLSIGN..."
                                                required
                                            />
                                            {/* Blinking Cursor Decoration (only visible when focusing? simplified for now as static decoration) */}
                                            <motion.div
                                                className="absolute right-0 w-2 h-4 bg-tech-cyan/50"
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="group relative">
                                        <label className="block text-[10px] font-mono text-tech-cyan/70 tracking-widest mb-2 group-focus-within:text-tech-cyan transition-colors">
                                            // ACCESS_KEY
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="text-white/30 font-mono mr-2">{'>'}</span>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-transparent border-b border-white/10 py-2 text-stark-white font-mono text-sm focus:border-tech-cyan focus:outline-none transition-all placeholder-white/10"
                                                placeholder="••••••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-critical-red/10 border-l-2 border-critical-red p-3"
                                            >
                                                <p className="font-mono text-[10px] text-critical-red tracking-wider flex items-center">
                                                    <span className="mr-2">⚠</span> {error}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Action */}
                                    <div className="pt-4">
                                        <HunterButton
                                            type="submit"
                                            loading={loading}
                                            label="INITIATE HANDSHAKE"
                                        />
                                    </div>
                                </form>

                                {/* Footer Links */}
                                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-wider pt-4 border-t border-white/5">
                                    <Link href="/initiation" className="hover:text-tech-cyan transition-colors">
                                        [ NEW AGENT ]
                                    </Link>
                                    <Link href="/forgot-password" className="hover:text-alert-amber transition-colors">
                                        [ LOST KEY? ]
                                    </Link>
                                </div>
                            </div>
                        </HUDFrame>
                    </motion.div>
                ) : (
                    <motion.div
                        key="access-granted"
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center z-20"
                    >
                        <h1 className="font-display text-5xl md:text-7xl text-tech-cyan mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">
                            ACCESS GRANTED
                        </h1>
                        <p className="font-mono text-sm text-stark-white/70 tracking-[0.5em] animate-pulse">
                            WELCOME BACK, OPERATIVE
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
