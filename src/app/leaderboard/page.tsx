'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardData {
    agents: any[];
    squads: any[];
}

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardData>({ agents: [], squads: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'agents' | 'squads'>('agents');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2 text-stark-white">
                        LİDERLİK TABLOSU
                    </h1>
                    <p className="text-silver/50 text-xs md:text-sm tracking-widest">
                        EN İYİLER // HALL OF FAME
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white/5 p-1 rounded-sm gap-1">
                        <button
                            onClick={() => setActiveTab('agents')}
                            className={`px-8 py-2 text-xs tracking-widest transition-all ${activeTab === 'agents'
                                ? 'bg-deep-crimson text-white shadow-glow'
                                : 'text-silver/50 hover:bg-white/5'
                                }`}
                        >
                            EN İYİ AJANLAR
                        </button>
                        <button
                            onClick={() => setActiveTab('squads')}
                            className={`px-8 py-2 text-xs tracking-widest transition-all ${activeTab === 'squads'
                                ? 'bg-deep-crimson text-white shadow-glow'
                                : 'text-silver/50 hover:bg-white/5'
                                }`}
                        >
                            EN İYİ EKİPLER
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white/5 border border-white/10 p-1">
                    {loading ? (
                        <div className="p-10 text-center text-silver/30 animate-pulse">
                            VERİ HESAPLANIYOR...
                        </div>
                    ) : (data[activeTab]?.length === 0) ? (
                        <div className="p-10 text-center text-silver/30">
                            VERİ YOK
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {data[activeTab].map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 flex items-center justify-center font-display text-lg ${i < 3 ? 'text-deep-crimson' : 'text-silver/30'}`}>
                                        #{item.rank}
                                    </div>

                                    {/* Avatar (Agents only) */}
                                    {activeTab === 'agents' && (
                                        <div className="w-10 h-10 bg-void-black border border-white/20 rounded-full overflow-hidden">
                                            {item.avatar && <img src={item.avatar} alt={item.name} />}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="font-display text-lg text-stark-white group-hover:text-deep-crimson transition-colors">
                                            {item.name}
                                        </h3>
                                        {item.secondary && (
                                            <p className="text-[10px] text-silver/50 tracking-widest uppercase">
                                                {item.secondary}
                                            </p>
                                        )}
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <div className="font-mono text-xl text-active-green">
                                            {activeTab === 'squads' ? `$${item.score.toLocaleString()}` : item.score}
                                        </div>
                                        <div className="text-[9px] text-silver/30 tracking-widest">
                                            {activeTab === 'squads' ? 'KAZANÇ' : 'XP'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
