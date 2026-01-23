'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Mission } from '@/types/mission';

export default function MissionsPage() {
    const router = useRouter();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'in-progress'>('all');

    useEffect(() => {
        fetchMissions();
    }, [filter]);

    const fetchMissions = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/missions' : `/api/missions?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setMissions(data.missions || []);
        } catch (error) {
            console.error('Failed to fetch missions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-4 md:p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="font-display text-3xl md:text-6xl tracking-wider mb-2">MISSION'LAR</h1>
                        <p className="text-silver/60 text-xs md:text-sm">Büyük projeler, güçlü squad'lar gerektirir</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex overflow-x-auto pb-4 gap-2 md:gap-4 border-b border-white/10 no-scrollbar">
                    {(['all', 'open', 'in-progress'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs tracking-widest px-4 py-2 transition-colors whitespace-nowrap ${filter === f
                                ? 'text-deep-crimson border-b-2 border-deep-crimson'
                                : 'text-silver/50 hover:text-silver'
                                }`}
                        >
                            {f === 'all' ? 'TÜMÜ' : f === 'open' ? 'AÇIK' : 'DEVAM EDEN'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mission Grid */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <p className="text-center text-silver/50">Yükleniyor...</p>
                ) : missions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-silver/50 mb-4">Henüz mission yok</p>
                        <p className="text-xs text-silver/30">Mission'lar yakında eklenecek</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {missions.map((mission) => (
                            <MissionCard key={mission.id} mission={mission} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MissionCard({ mission }: { mission: Mission }) {
    const router = useRouter();

    const statusColor = {
        open: 'text-active-green',
        'in-progress': 'text-deep-crimson',
        completed: 'text-silver/50',
        cancelled: 'text-silver/30',
    }[mission.status];

    const statusText = {
        open: '🟢 AÇIK',
        'in-progress': '🔴 DEVAM EDIYOR',
        completed: '✅ TAMAMLANDI',
        cancelled: '❌ İPTAL',
    }[mission.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push(`/missions/${mission.id}`)}
            className="border border-white/10 hover:border-deep-crimson/50 bg-white/5 p-6 cursor-pointer transition-all group"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-xl text-stark-white group-hover:text-deep-crimson transition-colors pr-2">
                    {mission.title}
                </h3>
                <div className={`text-xs ${statusColor} whitespace-nowrap`}>
                    {statusText}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-silver/70 mb-4 line-clamp-3">{mission.description}</p>

            {/* Meta */}
            <div className="space-y-2 text-xs text-silver/50 mb-4">
                <div>⏱️ {mission.duration}</div>
                <div>💰 {mission.compensation}</div>
                {mission.applications.length > 0 && (
                    <div>📋 {mission.applications.length} başvuru</div>
                )}
            </div>

            {/* Requirements */}
            {mission.requirements && mission.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {mission.requirements.slice(0, 3).map((req, i) => (
                        <span key={i} className="text-xs bg-deep-crimson/20 text-deep-crimson px-2 py-1">
                            {req}
                        </span>
                    ))}
                    {mission.requirements.length > 3 && (
                        <span className="text-xs text-silver/50">+{mission.requirements.length - 3}</span>
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
