'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TypewriterText from '@/components/ui/TypewriterText';
import HoloCard from '@/components/ui/HoloCard';
import GlitchButton from '@/components/ui/GlitchButton';
import SubliminalAudio from '@/components/audio/SubliminalAudio';
import StatusDashboard from '@/components/ui/StatusDashboard';
import { useHeartbeat } from '@/hooks/use-heartbeat';
import { usePublicStats } from '@/hooks/use-public-stats';

// System Modules (Navigation)
const modules = [
  { id: 'initiation', label: 'BAŞVURU', sub: 'PROTOKOL_BAŞLAT', href: '/initiation', icon: '⚡' },
  { id: 'login', label: 'GİRİŞ', sub: 'PERSONEL_ERİŞİMİ', href: '/login', icon: '🔓' },
  { id: 'squads', label: 'OPERASYONLAR', sub: 'AKTİF_EKİPLER', href: '/squads', icon: '⚔️' },
  { id: 'manifesto', label: 'VERTİGO', sub: 'SİSTEM_MANIFESTOSU', href: '/manifesto', icon: '👁️' },
];

export default function Home() {
  useHeartbeat();
  const { stats } = usePublicStats();
  const [booted, setBooted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Faster boot sequence for the pro feel
    const timer = setTimeout(() => setBooted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInteraction = () => {
    if (!audioEnabled) setAudioEnabled(true);
  };

  return (
    <div
      className="relative min-h-screen p-6 md:p-8 flex flex-col gap-8"
      onClick={handleInteraction}
    >
      {/* 1. Dashboard Area */}
      <section className="w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatusDashboard />
        </motion.div>
      </section>

      {/* 2. Main Title (Integrated) */}
      <section className="w-full max-w-7xl mx-auto flex items-center gap-4 py-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <h1 className="font-display text-4xl md:text-6xl text-stark-white tracking-tighter opacity-80">
          <TypewriterText text="BOŞLUK" mode="decoding" speed={150} />
        </h1>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </section>

      {/* 3. Navigation Grid (The "Dock") */}
      <section className="w-full max-w-7xl mx-auto flex-1 flex items-center">
        <AnimatePresence>
          {booted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {modules.map((mod, i) => (
                <Link href={mod.href} key={mod.id} className="block group">
                  <HoloCard
                    delay={i * 0.1}
                    className="h-full min-h-[180px] flex flex-col justify-between p-6 transition-transform duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:text-tech-cyan group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-300">
                        {mod.icon}
                      </span>
                      <span className="font-mono text-[10px] text-silver/20 border border-silver/10 px-1.5 py-0.5 rounded">
                        MOD_0{i + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xl text-stark-white tracking-wide mb-1 group-hover:text-tech-cyan transition-colors">
                        {mod.label}
                      </h3>
                      <p className="font-mono text-[10px] text-silver/50 group-hover:text-silver/80 tracking-widest uppercase">
                        {mod.sub}
                      </p>
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-tech-cyan/50 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 group-hover:border-tech-cyan/50 transition-colors" />

                    {/* Hover visual */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                      <span className="text-tech-cyan text-xs font-mono">{'>'} ACCESS</span>
                    </div>
                  </HoloCard>
                </Link>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Audio Engine */}
      <SubliminalAudio enabled={audioEnabled} volume={0.05} />
    </div>
  );
}
