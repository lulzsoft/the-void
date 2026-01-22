
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminSession } from '@/lib/store';
import { useHeartbeat } from '@/hooks/use-heartbeat';

// Navigasyon öğeleri - TÜRKÇE
const navItems = [
    { label: 'PANEL', href: '/shadow-panel', icon: '◈' },
    { label: 'MANIFESTO', href: '/shadow-panel/manifesto', icon: '◆' },
    { label: 'SİCİL', href: '/shadow-panel/registry', icon: '◇' },
    { label: 'ENGİZİSYON', href: '/shadow-panel/inquisition', icon: '⚖' },
    { label: 'KANDİDATLAR', href: '/shadow-panel/candidates', icon: '⍟' },
    { label: 'KRİPTOS', href: '/shadow-panel/kryptos', icon: '⚿' },
    { label: 'MİMAR', href: '/shadow-panel/architect', icon: '◊' },
];

export default function ShadowPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useHeartbeat();
    const { isAuthenticated, authenticate, logout } = useAdminSession();
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [activeSessions, setActiveSessions] = useState(0);
    const pathname = usePathname();

    // Saat ve Aktif Oturum güncellemesi
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })
            );
        };

        const updateStats = () => {
            fetch('/api/stats/public')
                .then(res => res.json())
                .then(data => setActiveSessions(data.active || 0))
                .catch(() => { });
        };

        updateTime();
        updateStats(); // Initial fetch

        const interval = setInterval(updateTime, 1000);
        const statsInterval = setInterval(updateStats, 10000); // Poll every 10s

        return () => {
            clearInterval(interval);
            clearInterval(statsInterval);
        };
    }, []);

    // Kimlik doğrulama
    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // Gizli anahtar kontrolü
        if (accessKey === 'void-2026' || accessKey === 'bosluk-2026') {
            authenticate();
            setError('');
        } else {
            setError('YETKİSİZ ERİŞİM GİRİŞİMİ KAYDEDİLDİ');
            setAccessKey('');
        }
    };

    // Kimlik doğrulama ekranı
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    {/* Terminal tarzı yetkilendirme */}
                    <div className="razor-border p-8">
                        <div className="text-center mb-8">
                            <h1 className="font-display text-3xl text-stark-white mb-2">GÖLGE PANELİ</h1>
                            <p className="font-mono text-xs text-silver/30 tracking-widest">
                                YETKİLENDİRME GEREKLİ
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">
                            <div>
                                <label className="font-mono text-xs text-silver/50 block mb-2">
                                    ERİŞİM ANAHTARI
                                </label>
                                <input
                                    type="password"
                                    value={accessKey}
                                    onChange={(e) => setAccessKey(e.target.value)}
                                    className="w-full bg-silver/5 border border-silver/20 p-3 font-mono 
                    text-stark-white focus:outline-none focus:border-deep-crimson
                    placeholder:text-silver/20"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="font-mono text-xs text-deep-crimson text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button type="submit" className="btn-void w-full text-sm">
                                KİMLİK DOĞRULA
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-silver/10 text-center">
                            <Link
                                href="/"
                                className="font-mono text-xs text-silver/30 hover:text-silver transition-colors"
                            >
                                ← BOŞLUĞA DÖN
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Panel layout
    return (
        <div className="min-h-screen bg-void-black flex">
            {/* Kenar Çubuğu */}
            <aside className="w-48 border-r border-silver/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-silver/10">
                    <Link href="/" className="font-display text-xl text-stark-white hover:text-silver transition-colors">
                        BOŞLUK
                    </Link>
                    <p className="font-mono text-xs text-deep-crimson mt-1">TANRI MODU</p>
                </div>

                {/* Navigasyon */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block p-3 font-mono text-xs tracking-wider transition-all ${pathname === item.href
                                ? 'bg-deep-crimson/20 text-stark-white border-l-2 border-deep-crimson'
                                : 'text-silver/50 hover:text-silver hover:bg-silver/5'
                                }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Çıkış */}
                <div className="p-4 border-t border-silver/10">
                    <button
                        onClick={logout}
                        className="w-full font-mono text-xs text-silver/30 hover:text-deep-crimson transition-colors text-left"
                    >
                        ◌ OTURUMU KAPAT
                    </button>
                </div>
            </aside>

            {/* Ana İçerik */}
            <main className="flex-1 flex flex-col">
                {/* Üst Bar */}
                <header className="h-16 border-b border-silver/10 flex items-center justify-between px-8">
                    <div className="font-mono text-xs text-silver/50">
                        <span className="text-silver/30">TARİH:</span>{' '}
                        {new Date().toLocaleDateString('tr-TR', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="font-mono text-xs text-silver/30">
                            <span className="text-deep-crimson">●</span> OTURUMLAR: {activeSessions}
                        </div>
                        <div className="font-mono text-xl text-stark-white tracking-wider">
                            {currentTime}
                        </div>
                    </div>
                </header>

                {/* İçerik Alanı */}
                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
