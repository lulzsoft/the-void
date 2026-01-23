'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Squad } from '@/types/squad';
import HexGrid from '@/components/visual/HexGrid';
import Link from 'next/link';

export default function SquadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [squad, setSquad] = useState<Squad | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
        fetchSquad();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (e) {
            console.error('Auth check failed:', e);
        }
    };

    const fetchSquad = async () => {
        try {
            const res = await fetch(`/api/squads/${id}`);
            if (!res.ok) {
                throw new Error('Squad not found');
            }
            const data = await res.json();
            setSquad(data.squad); // API structure: { squad: ... }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch squad');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setJoining(true);
        try {
            const res = await fetch(`/api/squads/${id}/join`, {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to join squad');
            }

            // Refresh squad data
            fetchSquad();
            alert('Hücreye katılım başarılı.');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to join');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white p-8 flex items-center justify-center">
                <p className="font-mono text-silver/50 animate-pulse">VERİ AKIŞI BEKLENİYOR...</p>
            </div>
        );
    }

    if (error || !squad) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display text-4xl text-deep-crimson mb-4">404</h1>
                    <p className="font-mono text-silver/50">{error || 'Squad not found'}</p>
                    <button
                        onClick={() => router.push('/squads')}
                        className="mt-8 text-sm text-stark-white hover:text-deep-crimson transition-colors"
                    >
                        ← Listeye Dön
                    </button>
                </div>
            </div>
        );
    }

    const isMember = user && squad.members.includes(user.codename);
    const isFull = squad.members.length >= squad.maxMembers;
    const canJoin = squad.status === 'recruiting' && !isMember && !isFull;

    // HexGrid için üye listesini hazırla
    const memberList = squad.members.map(m => ({
        id: m,
        codename: m,
        role: m === squad.leader ? 'leader' : 'member'
    }));

    return (
        <div className="min-h-screen bg-void-black text-stark-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Nav */}
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <Link href="/squads" className="font-mono text-xs text-silver/50 hover:text-white transition-colors">
                        ← KOMUTA MERKEZİNE DÖN
                    </Link>
                    <div className="font-mono text-[10px] text-deep-crimson tracking-widest">
                        SQUAD_ID: {squad.id.substring(0, 8)}
                    </div>
                </div>

                {/* Ana Başlık ve Durum */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-display text-5xl md:text-7xl text-stark-white mb-4"
                        >
                            {squad.name}
                        </motion.h1>
                        <p className="font-mono text-silver/70 leading-relaxed max-w-2xl border-l-2 border-deep-crimson pl-4">
                            {squad.description}
                        </p>
                    </div>

                    {/* Stats Paneli */}
                    <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                        <h3 className="font-mono text-xs text-silver/50 mb-4 tracking-widest">TAKIM METRİKLERİ</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-silver">DURUM</span>
                                <span className={`font-mono text-xs px-2 py-1 ${squad.status === 'recruiting' ? 'bg-active-green/20 text-active-green' :
                                        squad.status === 'full' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                    {squad.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-silver">KAPASİTE</span>
                                <span className="font-mono text-stark-white">
                                    {squad.members.length} / {squad.maxMembers}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-silver">GÖREV GÜCÜ</span>
                                <div className="text-right flex flex-col items-end gap-1">
                                    {(squad.skills || []).slice(0, 3).map(skill => (
                                        <span key={skill} className="text-[10px] text-silver/70 bg-white/5 px-1">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-8">
                            {canJoin ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="w-full bg-deep-crimson hover:bg-red-600 text-white font-mono text-xs py-3 tracking-widest transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 uppercase"
                                >
                                    {joining ? 'BAĞLANTI KURULUYOR...' : 'EKİBİ DESTEKLE (KATIL)'}
                                </button>
                            ) : isMember ? (
                                <button disabled className="w-full border border-active-green/30 text-active-green font-mono text-xs py-3 cursor-default bg-active-green/5">
                                    EKİP ÜYESİSİNİZ
                                </button>
                            ) : (
                                <button disabled className="w-full border border-white/10 text-silver/30 font-mono text-xs py-3 cursor-not-allowed">
                                    ERİŞİM KISITLI / DOLU
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Üye Grid (Hex) */}
                <div className="mb-12">
                    <h2 className="font-display text-2xl text-stark-white mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-deep-crimson rounded-full" />
                        AKTİF PERSONEL
                    </h2>

                    <div className="bg-void-black border border-white/5 p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                        <HexGrid members={memberList} />
                    </div>
                </div>
            </div>
        </div>
    );
}
