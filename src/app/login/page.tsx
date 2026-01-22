
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Fingerprint simülasyonu
            const deviceHash = btoa(navigator.userAgent + screen.width + screen.height).substring(0, 16);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, deviceHash })
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/sanctum');
            } else {
                setError(data.error || 'Giriş başarısız.');
            }
        } catch (err) {
            setError('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-void-black border border-white/10 p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="font-display text-4xl text-stark-white mb-2">SİSTEM GİRİŞİ</h1>
                        <p className="font-mono text-xs text-silver/40 tracking-[0.3em]">ERİŞİM PROTOKOLÜ</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-mono text-xs text-silver/50 uppercase tracking-wider">MAHLAS</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 text-stark-white font-mono focus:border-deep-crimson focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-mono text-xs text-silver/50 uppercase tracking-wider">ŞİFRE</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 text-stark-white font-mono focus:border-deep-crimson focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-500 text-xs font-mono text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stark-white text-void-black font-bold py-4 hover:bg-silver transition-colors font-mono text-sm tracking-widest disabled:opacity-50"
                        >
                            {loading ? 'DOĞRULANIYOR...' : 'SİSTEME GİR'}
                        </button>
                    </form>

                    <Link
                        href="/forgot-password"
                        className="block text-center text-xs text-silver/50 hover:text-deep-crimson transition-colors mt-4"
                    >
                        Şifremi unuttum →
                    </Link>

                    <div className="mt-8 text-center">
                        <a href="/initiation" className="text-xs font-mono text-silver/30 hover:text-silver transition-colors">
                            HESABIN YOK MU? İNİSYASYONA BAŞLA &rarr;
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
