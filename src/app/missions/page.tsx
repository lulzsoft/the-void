'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mission } from '@/types/mission';
import MissionDossier from '@/components/missions/MissionDossier';
import DangerLevel from '@/components/ui/DangerLevel';

export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        difficulty: 'all',
        minReward: 0
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMissions();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchMissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);

            const res = await fetch(`/api/missions?${params.toString()}`);
            const data = await res.json();
            setMissions(data.missions || []);
        } catch (error) {
            console.error('Failed to fetch missions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative">

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tech-cyan/5 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-alert-amber animate-pulse rounded-sm" />
                            <span className="font-mono text-xs text-alert-amber tracking-[0.3em]">LIVE_FEED</span>
                        </div>
                        <h1 className="font-display text-5xl text-stark-white tracking-tight">OPERATIONS_BOARD</h1>
                    </div>

                    <div className="flex gap-4 mt-4 md:mt-0">
                        <FilterBadge active={filters.status === 'all'} onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))} label="ALL_OPS" />
                        <FilterBadge active={filters.status === 'open'} onClick={() => setFilters(prev => ({ ...prev, status: 'open' }))} label="OPEN" />
                        <FilterBadge active={filters.status === 'in-progress'} onClick={() => setFilters(prev => ({ ...prev, status: 'in-progress' }))} label="ACTIVE" />
                    </div>
                </div>

                {/* Operations Grid */}
                <div className="bg-void-panel/50 border border-white/5 backdrop-blur-sm rounded-lg overflow-hidden min-h-[600px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10 bg-white/5 font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-1 text-center">THREAT</div>
                        <div className="col-span-4 pl-4">MISSION_PROFILE</div>
                        <div className="col-span-2">STATUS</div>
                        <div className="col-span-2">BOUNTY</div>
                        <div className="col-span-1 text-right">ETA</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-12 text-center font-mono text-xs text-silver/30 animate-pulse">
                                Scanning global networks...
                            </div>
                        ) : missions.length === 0 ? (
                            <div className="p-12 text-center font-mono text-xs text-silver/30">
                                NO OPERATIONS FOUND IN CURRENT SECTOR
                            </div>
                        ) : (
                            missions.map((mission, i) => (
                                <MissionRow
                                    key={mission.id}
                                    mission={mission}
                                    index={i}
                                    onClick={() => setSelectedMission(mission)}
                                    isSelected={selectedMission?.id === mission.id}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-out Dossier */}
            <AnimatePresence>
                {selectedMission && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMission(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                        />
                        <MissionDossier
                            mission={selectedMission}
                            onClose={() => setSelectedMission(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function MissionRow({ mission, index, onClick, isSelected }: { mission: Mission, index: number, onClick: () => void, isSelected: boolean }) {
    const statusColor = mission.status === 'open' ? 'text-active-green' : mission.status === 'completed' ? 'text-blue-400' : 'text-alert-amber';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`
                grid grid-cols-12 items-center px-6 py-4 
                cursor-pointer transition-all duration-200
                hover:bg-white/5 
                ${isSelected ? 'bg-white/10 border-l-2 border-tech-cyan' : 'border-l-2 border-transparent'}
            `}
        >
            <div className="col-span-1 font-mono text-[10px] text-white/30">{mission.id.substring(0, 4)}</div>
            <div className="col-span-1 flex justify-center">
                <DangerLevel level={mission.difficulty === 'hard' ? 8 : mission.difficulty === 'medium' ? 5 : 2} />
            </div>
            <div className="col-span-4 pl-4">
                <div className={`font-display text-sm tracking-wide ${isSelected ? 'text-tech-cyan' : 'text-stark-white'} group-hover:text-tech-cyan transition-colors`}>
                    {mission.title}
                </div>
            </div>
            <div className="col-span-2">
                <span className={`text-[9px] tracking-widest uppercase border border-white/5 px-2 py-0.5 rounded ${statusColor} bg-white/5`}>
                    {mission.status}
                </span>
            </div>
            <div className="col-span-2 font-mono text-xs text-silver/70">
                {mission.compensation}
            </div>
            <div className="col-span-1 text-right font-mono text-[10px] text-white/30">
                {mission.duration || '--'}
            </div>
            <div className="col-span-1 text-right text-tech-cyan opacity-0 hover:opacity-100 transition-opacity">
                →
            </div>
        </motion.div>
    );
}

function FilterBadge({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1 text-[10px] tracking-widest uppercase transition-all
                border border-transparent
                ${active ? 'bg-tech-cyan/20 text-tech-cyan border-tech-cyan/30' : 'text-white/40 hover:text-white hover:border-white/20'}
            `}
        >
            {label}
        </button>
    );
}
