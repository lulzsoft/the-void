'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Squad } from '@/types/squad';

export default function SquadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const squadId = params.id as string;

    const [squad, setSquad] = useState<Squad | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
        fetchSquad();
    }, [squadId]);

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
        setLoading(true);
        try {
            const res = await fetch(`/api/squads/${squadId}`);
            const data = await res.json();
            if (res.ok) {
                setSquad(data.squad);
            } else {
                setError(data.error || 'Squad not found');
            }
        } catch (e) {
            setError('Failed to load squad');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setActionLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/squads/${squadId}/join`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                setSquad(data.squad);
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Failed to join squad');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        setActionLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/squads/${squadId}/leave`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                setSquad(data.squad);
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Failed to leave squad');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisband = async () => {
        if (!confirm('Squad\'ı kalıcı olarak dağıtmak istediğinize emin misiniz?')) {
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/squads/${squadId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/squads');
            } else {
                const data = await res.json();
                setError(data.error);
            }
        } catch (e) {
            setError('Failed to disband squad');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white font-mono flex items-center justify-center">
                <p className="text-silver/50">Yükleniyor...</p>
            </div>
        );
    }

    if (error && !squad) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white font-mono flex items-center justify-center">
                <div className="text-center">
                    <p className="text-deep-crimson mb-4">{error}</p>
                    <button onClick={() => router.push('/squads')} className="text-sm text-silver/50 hover:text-silver">
                        ← Squad'lara dön
                    </button>
                </div>
            </div>
        );
    }

    if (!squad) return null;

    const isLeader = user && squad.leader === user.codename;
    const isMember = user && squad.members.includes(user.codename);
    const isFull = squad.members.length >= squad.maxMembers;

    const statusColor = {
        recruiting: 'text-active-green',
        full: 'text-silver/50',
        active: 'text-deep-crimson',
        disbanded: 'text-silver/30',
    }[squad.status];

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/squads')}
                    className="text-sm text-silver/50 hover:text-silver mb-6"
                >
                    ← Squad'lara dön
                </button>

                {error && (
                    <div className="bg-deep-crimson/20 border border-deep-crimson text-deep-crimson p-4 text-sm mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 bg-white/5 p-8 mb-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2">
                                {squad.name}
                            </h1>
                            <p className="text-sm text-silver/50">Leader: {squad.leader}</p>
                        </div>
                        <div className={`text-sm ${statusColor}`}>
                            {squad.status === 'recruiting' ? '🟢 AÇIK' : squad.status === 'full' ? '🟡 DOLU' : '🔴 KAPALI'}
                        </div>
                    </div>

                    <p className="text-silver/70 mb-6">{squad.description}</p>

                    {/* Stats */}
                    <div className="flex gap-8 text-sm mb-6">
                        <div>
                            <span className="text-silver/50">Üyeler:</span>{' '}
                            <span className="text-stark-white font-bold">
                                {squad.members.length}/{squad.maxMembers}
                            </span>
                        </div>
                        <div>
                            <span className="text-silver/50">Durum:</span>{' '}
                            <span className={statusColor}>{squad.status.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Skills */}
                    {squad.skills && squad.skills.length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs text-silver/50 mb-2">ARANAN YETENEKler:</p>
                            <div className="flex flex-wrap gap-2">
                                {squad.skills.map((skill, i) => (
                                    <span key={i} className="text-xs bg-deep-crimson/20 text-deep-crimson px-3 py-1">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        {!user ? (
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white px-6 py-3 text-xs tracking-widest transition-colors"
                            >
                                GİRİŞ YAP VE KATIL
                            </button>
                        ) : isLeader ? (
                            <>
                                <button
                                    onClick={() => router.push(`/squads/${squadId}/edit`)}
                                    className="bg-white/10 hover:bg-white/20 text-stark-white px-6 py-3 text-xs tracking-widest transition-colors"
                                    disabled={actionLoading}
                                >
                                    DÜZENLE
                                </button>
                                <button
                                    onClick={handleDisband}
                                    className="bg-deep-crimson/20 hover:bg-deep-crimson/40 text-deep-crimson px-6 py-3 text-xs tracking-widest transition-colors"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'İŞLENİYOR...' : 'DAĞIT'}
                                </button>
                            </>
                        ) : isMember ? (
                            <button
                                onClick={handleLeave}
                                className="bg-white/10 hover:bg-white/20 text-stark-white px-6 py-3 text-xs tracking-widest transition-colors"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'İŞLENİYOR...' : 'AYRIL'}
                            </button>
                        ) : (
                            <button
                                onClick={handleJoin}
                                className="bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white px-6 py-3 text-xs tracking-widest transition-colors"
                                disabled={actionLoading || isFull}
                            >
                                {actionLoading ? 'İŞLENİYOR...' : isFull ? 'DOLU' : 'KATIL'}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Members */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-white/10 bg-white/5 p-8"
                >
                    <h2 className="text-xl font-display tracking-wider mb-4">ÜYELER ({squad.members.length})</h2>
                    <div className="space-y-3">
                        {squad.members.map((member, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-white/5 border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-deep-crimson/20 border border-deep-crimson flex items-center justify-center text-xs font-bold">
                                        {member.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm">{member}</span>
                                </div>
                                {member === squad.leader && (
                                    <span className="text-xs bg-deep-crimson/20 text-deep-crimson px-2 py-1">LEADER</span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
