'use client';

import { motion } from 'framer-motion';

export default function IDCard({ profile }: { profile: any }) {
    if (!profile) return null;

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-[1.586] bg-void-black rounded-lg overflow-hidden border border-white/10 shadow-2xl group select-none">
            {/* Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

            {/* Scanline Overlay */}
            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover mix-blend-overlay" />
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-tech-cyan/20 to-transparent h-[10%] z-10 pointer-events-none"
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Card Content Grid */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-0">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-2xl tracking-tighter text-stark-white">PROTOCOL_VOID</span>
                        <span className="font-mono text-[8px] tracking-[0.3em] text-tech-cyan uppercase">Authorized Personnel</span>
                    </div>
                    {/* Chip / Logo */}
                    <div className="w-10 h-8 rounded border border-white/20 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                        <div className="w-6 h-4 border border-alert-amber/50 rounded-sm bg-alert-amber/10" />
                    </div>
                </div>

                {/* Body: Photo & Details */}
                <div className="flex gap-6 items-end">
                    {/* Photo Area */}
                    <div className="relative w-24 h-32 border border-white/20 bg-black/40 p-1">
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl font-display text-white/20">
                            {profile.codename?.substring(0, 1) || '?'}
                        </div>
                        {/* Face Scan overlay */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-tech-cyan" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-tech-cyan" />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 space-y-3">
                        <DetailRow label="CODENAME" value={profile.codename} isLarge />
                        <DetailRow label="CLEARANCE" value="LEVEL 4 [TOP SECRET]" />
                        <DetailRow label="ID_REF" value={profile.id || 'Unknown'} />
                        <DetailRow label="STATUS" value={profile.status} color="text-active-green" />
                    </div>
                </div>

                {/* Footer / Barcode */}
                <div className="flex justify-between items-end border-t border-white/10 pt-2">
                    <div className="font-mono text-[8px] text-white/30 max-w-[150px] leading-tight">
                        PROPERTY OF THE VOID. IF FOUND, DESTROY IMMEDIATELY.
                    </div>
                    {/* Fake Barcode */}
                    <div className="h-6 flex items-end gap-[2px] opacity-60">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? 2 : 1, height: Math.random() * 100 + '%' }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, color = 'text-stark-white', isLarge = false }: { label: string, value: string, color?: string, isLarge?: boolean }) {
    return (
        <div>
            <div className="font-mono text-[8px] text-white/30 tracking-widest uppercase mb-0.5">{label}</div>
            <div className={`font-mono ${isLarge ? 'text-xl font-bold tracking-tight' : 'text-xs'} ${color} uppercase`}>{value}</div>
        </div>
    );
}
