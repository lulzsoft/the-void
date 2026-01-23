'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Mission } from '@/types/mission';

export default function MissionsPage() {
    const router = useRouter();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'completed'>('all');

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
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2 text-stark-white">
                            OPERASYON PANOSU
                        </h1>
                        <p className="text-silver/50 text-xs md:text-sm tracking-widest">
                            AKTİF GÖREV AKIŞI // CANLI VERİ
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-sm mt-4 md:mt-0">
                        {(['all', 'open', 'in-progress', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-[10px] tracking-widest transition-all ${filter === f
                                        ? 'bg-deep-crimson text-white shadow-glow'
                                        : 'text-silver/50 hover:text-silver hover:bg-white/5'
                                    }`}
                            >
                                {f === 'all' ? 'TÜMÜ' : f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Grid Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/20 text-[10px] text-silver/50 tracking-widest">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-4">OPERASYON ADI</div>
                    <div className="col-span-2">DURUM</div>
                    <div className="col-span-2">ÖDÜL</div>
                    <div className="col-span-2">SÜRE</div>
                    <div className="col-span-1 text-right">AKSİYON</div>
                </div>

                {/* Mission List */}
                <div className="space-y-2 mt-4">
                    {loading ? (
                        <div className="py-20 text-center text-silver/30 animate-pulse">
                            VERİ AKIŞI BEKLENİYOR...
                        </div>
                    ) : missions.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-white/10 bg-white/5">
                            <p className="text-silver/50 mb-2">KRİTERLERE UYGUN GÖREV YOK</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {missions.map((mission, i) => (
                                <MissionRow key={mission.id} mission={mission} index={i} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

function MissionRow({ mission, index }: { mission: Mission; index: number }) {
    const router = useRouter();

    const statusConfig = {
        open: { color: 'text-active-green', bg: 'bg-active-green/10', label: 'AÇIK' },
        'in-progress': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'SÜRÜYOR' },
        completed: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'TAMAMLANDI' },
        cancelled: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'İPTAL' },
    }[mission.status];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(`/missions/${mission.id}`)}
            className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:py-4 md:px-6 bg-white/5 hover:bg-white/10 border-l-2 border-transparent hover:border-deep-crimson transition-all cursor-pointer items-center"
        >
            {/* Mobile Title (visible only on small screens) */}
            <div className="md:hidden font-display text-xl mb-2 flex justify-between items-center">
                <span>{mission.title}</span>
                <span className={`text-[10px] px-2 py-1 ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* ID */}
            <div className="hidden md:block col-span-1 font-mono text-xs text-silver/30">
                {mission.id.substring(0, 4)}
            </div>

            {/* Content */}
            <div className="col-span-12 md:col-span-4">
                <h3 className="hidden md:block font-display text-lg text-stark-white group-hover:text-deep-crimson transition-colors truncate">
                    {mission.title}
                </h3>
                <p className="text-xs text-silver/50 truncate max-w-md">
                    {mission.description.substring(0, 60)}...
                </p>
            </div>

            {/* Status */}
            <div className="hidden md:flex col-span-2 items-center">
                <span className={`text-[10px] tracking-wider px-2 py-1 ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Reward (Visual Bar) */}
            <div className="col-span-6 md:col-span-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-deep-crimson font-mono">{mission.compensation}</span>
                    <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-deep-crimson"
                            style={{
                                width: mission.compensation.includes('$')
                                    ? `${Math.min(parseInt(mission.compensation.replace(/\D/g, '')) / 50, 100)}%`
                                    : '50%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Duration */}
            <div className="col-span-6 md:col-span-2 text-xs text-silver/70 flex items-center gap-2">
                <span className="md:hidden">SÜRE:</span>
                ⏱️ {mission.duration}
            </div>

            {/* Action Arrow */}
            <div className="hidden md:flex col-span-1 justify-end text-silver/30 group-hover:text-stark-white group-hover:translate-x-1 transition-all">
                →
            </div>
        </motion.div>
    );
}
