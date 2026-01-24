'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Squad } from '@/types/squad';
import { HexGrid, HexItem } from '@/components/ui/HexGrid';
import HunterButton from '@/components/ui/HunterButton';

export default function SquadsPage() {
    const router = useRouter();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [filter, setFilter] = useState<'all' | 'recruiting' | 'full'>('all');

    useEffect(() => {
        // Mock Data for Visual Dev if API fails or is empty, but let's try fetch first
        fetchSquads();
    }, [filter]);

    const fetchSquads = async () => {
        try {
            const url = filter === 'all' ? '/api/squads' : `/api/squads?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            // If empty, maybe show mock?
            setSquads(data.squads || []);
        } catch (error) {
            console.error('Failed to fetch squads:', error);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white p-8 relative overflow-hidden">
            {/* Background Map Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-20 pointer-events-none border-dashed" />

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center mb-12 text-center">
                <h1 className="font-display text-5xl md:text-7xl tracking-tighter text-stark-white mb-4">TACTICAL_UNITS</h1>
                <div className="flex gap-4">
                    <FilterButton active={filter === 'all'} label="ALL_UNITS" onClick={() => setFilter('all')} />
                    <FilterButton active={filter === 'recruiting'} label="RECRUITING" onClick={() => setFilter('recruiting')} />
                    <FilterButton active={filter === 'full'} label="FULL_SQUAD" onClick={() => setFilter('full')} />
                </div>
            </div>

            {/* Hex Grid Deployment */}
            <div className="relative z-10">
                <HexGrid>
                    {/* Create New Unit Hex */}
                    <HexItem onClick={() => router.push('/squads/create')} className="border-2 border-dashed border-white/20 hover:border-tech-cyan">
                        <div className="text-4xl text-white/20 mb-2 group-hover:text-tech-cyan transition-colors">+</div>
                        <div className="font-mono text-xs text-white/40 tracking-widest uppercase">DEPLOY NEW UNIT</div>
                    </HexItem>

                    {squads.map((squad) => (
                        <HexItem key={squad.id} onClick={() => router.push(`/squads/${squad.id}`)}>
                            <div className="flex flex-col items-center gap-2">
                                {/* Leader/Avatar Placeholder */}
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 overflow-hidden border border-white/20">
                                    <span className="font-display text-xl">{squad.name.substring(0, 2).toUpperCase()}</span>
                                </div>

                                <h3 className="font-display text-lg tracking-wide text-stark-white group-hover:text-tech-cyan transition-colors">
                                    {squad.name}
                                </h3>

                                <span className={`text-[10px] tracking-[0.2em] px-2 py-0.5 rounded ${getStatusStyle(squad.status)}`}>
                                    {squad.status.toUpperCase()}
                                </span>

                                <div className="mt-4 flex gap-4 text-[10px] text-white/40 font-mono">
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg text-white">{squad.members.length}/{squad.maxMembers}</span>
                                        <span>MEMBERS</span>
                                    </div>
                                    <div className="w-[1px] h-full bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg text-white">{squad.level || 1}</span>
                                        <span>LEVEL</span>
                                    </div>
                                </div>
                            </div>
                        </HexItem>
                    ))}
                </HexGrid>
            </div>
        </div>
    );
}

function FilterButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase border transition-all
                ${active ? 'bg-tech-cyan/20 text-tech-cyan border-tech-cyan/50' : 'bg-transparent text-white/30 border-white/10 hover:border-white/30'}
            `}
        >
            {label}
        </button>
    );
}

function getStatusStyle(status: string) {
    if (status === 'recruiting') return 'bg-active-green/20 text-active-green';
    if (status === 'full') return 'bg-alert-amber/20 text-alert-amber';
    return 'bg-white/10 text-white/30';
}
