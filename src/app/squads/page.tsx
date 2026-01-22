'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Squad } from '@/types/squad';

export default function SquadsPage() {
    const router = useRouter();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'recruiting' | 'full'>('all');

    useEffect(() => {
        fetchSquads();
    }, [filter]);

    const fetchSquads = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/squads' : `/api/squads?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setSquads(data.squads || []);
        } catch (error) {
            console.error('Failed to fetch squads:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2">SQUAD'LAR</h1>
                        <p className="text-silver/60 text-sm">Kolektiflere katıl veya kendi grubunu kur</p>
                    </div>
                    <button
                        onClick={() => router.push('/squads/create')}
                        className="bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white px-6 py-3 text-xs tracking-widest transition-colors"
                    >
                        + YENİ SQUAD OLU\u015eTUR
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    {(['all', 'recruiting', 'full'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs tracking-widest px-4 py-2 transition-colors ${filter === f
                                    ? 'text-deep-crimson border-b-2 border-deep-crimson'
                                    : 'text-silver/50 hover:text-silver'
                                }`}
                        >
                            {f === 'all' ? 'TÜMÜ' : f === 'recruiting' ? 'AÇIK' : 'DOLU'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Squad Grid */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <p className="text-center text-silver/50">Yükleniyor...</p>
                ) : squads.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-silver/50 mb-4">Henüz squad yok</p>
                        <button
                            onClick={() => router.push('/squads/create')}
                            className="text-deep-crimson hover:underline text-sm"
                        >
                            İlk squad'ı sen oluştur →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {squads.map((squad) => (
                            <SquadCard key={squad.id} squad={squad} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SquadCard({ squad }: { squad: Squad }) {
    const router = useRouter();

    const statusColor = {
        recruiting: 'text-active-green',
        full: 'text-silver/50',
        active: 'text-deep-crimson',
        disbanded: 'text-silver/30',
    }[squad.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push(`/squads/${squad.id}`)}
            className="border border-white/10 hover:border-deep-crimson/50 bg-white/5 p-6 cursor-pointer transition-all group"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="font-display text-xl text-stark-white group-hover:text-deep-crimson transition-colors">
                        {squad.name}
                    </h3>
                    <p className="text-xs text-silver/50">by {squad.leader}</p>
                </div>
                <div className={`text-xs ${statusColor}`}>
                    {squad.status === 'recruiting' ? '🟢' : squad.status === 'full' ? '🟡' : '🔴'}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-silver/70 mb-4 line-clamp-2">{squad.description}</p>

            {/* Members */}
            <div className="flex items-center gap-2 text-xs text-silver/50 mb-3">
                <span>👥</span>
                <span>
                    {squad.members.length}/{squad.maxMembers}
                </span>
            </div>

            {/* Skills */}
            {squad.skills && squad.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {squad.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs bg-deep-crimson/20 text-deep-crimson px-2 py-1">
                            {skill}
                        </span>
                    ))}
                    {squad.skills.length > 3 && (
                        <span className="text-xs text-silver/50">+{squad.skills.length - 3}</span>
                    )}
                </div>
            )}

            {/* CTA */}
            <div className="text-xs text-silver/40 group-hover:text-deep-crimson transition-colors">
                DETAYLARI GÖR →
            </div>
        </motion.div>
    );
}
