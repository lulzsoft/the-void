'use client';

import { motion } from 'framer-motion';

interface HexMember {
    id: string;
    codename: string; // or name/username
    role?: string;
    avatarUrl?: string; // Optional
}

export default function HexGrid({ members }: { members: HexMember[] }) {
    if (!members || members.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-4 p-4">
            {members.map((member, i) => (
                <motion.div
                    key={member.id || i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative w-32 h-36 group cursor-pointer"
                >
                    {/* Altıgen Şekli (Clip-path) */}
                    <div
                        className="absolute inset-0 bg-white/5 border border-white/10 hover:bg-deep-crimson/20 hover:border-deep-crimson transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm"
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                        {/* İçerik */}
                        <div className="text-center z-10">
                            <h3 className="font-display text-2xl text-stark-white mb-1">
                                {member.codename.substring(0, 2).toUpperCase()}
                            </h3>
                            <p className="font-mono text-[10px] text-silver/70 tracking-widest truncate max-w-[80px]">
                                {member.codename}
                            </p>
                            {member.role && (
                                <p className="font-mono text-[8px] text-deep-crimson mt-1 uppercase">
                                    {member.role === 'leader' ? 'LİDER' : 'ÜYE'}
                                </p>
                            )}
                        </div>

                        {/* Dekoratif Çizgiler */}
                        <div className="absolute inset-0 bg-scanline opacity-20 pointer-events-none" />
                    </div>
                </motion.div>
            ))}

            {/* Boş Slotlar (Estetik için) */}
            {Array.from({ length: Math.max(0, 5 - members.length) }).map((_, i) => (
                <div
                    key={`empty-${i}`}
                    className="w-32 h-36 opacity-10 border border-white/20"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                />
            ))}
        </div>
    );
}
