'use client';

import { motion } from 'framer-motion';
import { Mission } from '@/types/mission';
import HunterButton from '@/components/ui/HunterButton';
import DangerLevel from '@/components/ui/DangerLevel';

interface MissionDossierProps {
    mission: Mission;
    onClose: () => void;
}

export default function MissionDossier({ mission, onClose }: MissionDossierProps) {
    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-12 right-0 bottom-8 w-full md:w-[500px] bg-void-panel border-l border-white/10 shadow-2xl z-40 overflow-hidden flex flex-col"
        >
            {/* Header / Top Bar */}
            <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-active-green rounded-full animate-pulse" />
                    <span className="font-mono text-xs tracking-widest text-stark-white">
                        CASE_FILE: {mission.id.substring(0, 6).toUpperCase()}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-critical-red transition-colors font-mono text-xl"
                >
                    ×
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* Title Block */}
                <div>
                    <h2 className="font-display text-3xl text-stark-white mb-2 leading-tight">
                        {mission.title}
                    </h2>
                    <div className="flex gap-4 items-center mb-4">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${getStatusStyle(mission.status)}`}>
                            {mission.status}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 tracking-wider">THREAT:</span>
                            <DangerLevel level={parseDifficulty(mission.difficulty || 'medium')} />
                        </div>
                    </div>
                </div>

                {/* Briefing */}
                <div className="space-y-2">
                    <SectionHeader title="MISSION_BRIEFING" />
                    <p className="font-mono text-sm text-silver/70 leading-relaxed">
                        {mission.description}
                    </p>
                    {/* Simulated details if description is short */}
                    <p className="font-mono text-sm text-silver/70 leading-relaxed mt-4">
                        Additional intel suggests heavy resistance in the sector. Operatives are advised to equip stealth modules.
                    </p>
                </div>

                {/* Rewards & Specs */}
                <div className="grid grid-cols-2 gap-4">
                    <StatBox label="COMPENSATION" value={mission.compensation} />
                    <StatBox label="EST. DURATION" value={mission.duration || 'UNKNOWN'} />
                    <StatBox label="SQUAD SIZE" value={mission.minLevel ? `${mission.minLevel}-${mission.minLevel + 2}` : '4-6'} />
                    <StatBox label="CLEARANCE" value="LEVEL 3" />
                </div>

                {/* Visual Intel (Placeholder Map) */}
                <div className="space-y-2">
                    <SectionHeader title="TACTICAL_MAP" />
                    <div className="aspect-video bg-black relative border border-white/10 rounded-lg overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        {/* Fake Map Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                        {/* Target Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border border-critical-red rounded-full animate-ping" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-critical-red rounded-full" />
                        </div>

                        {/* Scanned terrain lines */}
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-tech-cyan/10 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-void-black/50 border-t border-white/10">
                <HunterButton label="ACCEPT CONTRACT" />
            </div>
        </motion.div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2 mb-2 opacity-50">
            <div className="w-1 h-1 bg-tech-cyan" />
            <span className="font-mono text-[10px] tracking-[0.2em]">{title}</span>
            <div className="h-[1px] flex-1 bg-white/20" />
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-3 rounded hover:border-tech-cyan/30 transition-colors">
            <div className="text-[9px] text-white/30 tracking-widest mb-1">{label}</div>
            <div className="font-mono text-lg text-stark-white">{value}</div>
        </div>
    );
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'open': return 'bg-active-green/20 text-active-green';
        case 'completed': return 'bg-blue-500/20 text-blue-400';
        case 'in-progress': return 'bg-alert-amber/20 text-alert-amber';
        default: return 'bg-white/10 text-white/50';
    }
}

function parseDifficulty(diff: string) {
    if (diff === 'easy') return 2;
    if (diff === 'medium') return 5;
    if (diff === 'hard') return 8;
    return 10;
}
