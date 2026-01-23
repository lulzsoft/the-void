'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TypewriterText from '@/components/ui/TypewriterText';
import HoloCard from '@/components/ui/HoloCard';
import GlitchButton from '@/components/ui/GlitchButton';
import SubliminalAudio from '@/components/audio/SubliminalAudio';
import { useHeartbeat } from '@/hooks/use-heartbeat';
import { usePublicStats } from '@/hooks/use-public-stats';

// System Modules (Navigation)
const modules = [
  { id: 'initiation', label: 'BAŞVURU', sub: 'Protokol Başlat', href: '/initiation', icon: '⚡' },
  { id: 'login', label: 'GİRİŞ', sub: 'Personel Erişimi', href: '/login', icon: '🔓' },
  { id: 'squads', label: 'OPERASYONLAR', sub: 'Aktif Ekipler', href: '/squads', icon: '⚔️' },
  { id: 'manifesto', label: 'VERTİGO', sub: 'Sistem Manifestosu', href: '/manifesto', icon: '👁️' },
];

export default function Home() {
  useHeartbeat();
  const { stats, loading: statsLoading } = usePublicStats();
  const [booted, setBooted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Simulate BIOS boot sequence
    const timer = setTimeout(() => setBooted(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleInteraction = () => {
    if (!audioEnabled) setAudioEnabled(true);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-void-black text-stark-white cursor-crosshair selection:bg-deep-crimson selection:text-white"
      onClick={handleInteraction}
    >
      {/* 1. LAYER: Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-abyssal-blue via-void-black to-void-black" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        <div className="scanlines" />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-deep-crimson/10 blur-[120px] rounded-full mix-blend-screen animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-abyssal-blue/20 blur-[150px] rounded-full mix-blend-screen animate-float-delayed" />
      </div>

      {/* 2. LAYER: UI Grid */}
      <div className="relative z-10 min-h-screen flex flex-col p-6 md:p-12">

        {/* Header / StatusBar */}
        <header className="flex justify-between items-start mb-12">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-active-green rounded-full animate-pulse" />
              <span className="font-mono text-xs text-silver/50 tracking-widest">SİSTEM ÇEVRİMİÇİ</span>
            </div>
            <div className="font-mono text-[10px] text-silver/30">
              V.3.0.1_ABYSS // {new Date().toLocaleTimeString('tr-TR')}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-xs text-deep-crimson tracking-wider mb-1">
              CANLI VERİ AKIŞI
            </div>
            <div className="font-mono text-[10px] text-silver/50">
              AJANLAR: {statsLoading ? '...' : (stats?.members.total || 0)} // AKTİF: {statsLoading ? '...' : (stats?.members.active || 0)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">

          {/* Massive Title */}
          <div className="relative mb-16 md:mb-24 text-center z-20 mix-blend-overlay">
            <h1 className="font-display text-[15vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-stark-white to-transparent opacity-80 select-none">
              <TypewriterText
                text="BOŞLUK"
                mode="decoding"
                speed={100}
                className="tracking-tighter"
              />
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1.5 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-deep-crimson to-transparent w-full mt-4"
            />
          </div>

          {/* Navigation Grid (The "Dock") */}
          <AnimatePresence>
            {booted && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
                {modules.map((mod, i) => (
                  <Link href={mod.href} key={mod.id} className="block group">
                    <HoloCard
                      delay={i * 0.1}
                      className="h-full min-h-[160px] flex flex-col justify-between p-6 transition-transform duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                          {mod.icon}
                        </span>
                        <span className="font-mono text-[10px] text-silver/20 border border-silver/10 px-1 rounded">
                          0{i + 1}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-mono text-xl text-stark-white tracking-wider mb-1 group-hover:text-deep-crimson transition-colors">
                          {mod.label}
                        </h3>
                        <p className="font-mono text-xs text-silver/50 group-hover:text-silver/80">
                          {mod.sub}
                        </p>
                      </div>

                      {/* Hover visual */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-deep-crimson text-xs">→</span>
                      </div>
                    </HoloCard>
                  </Link>
                ))}
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Status */}
        <footer className="mt-12 md:mt-0 flex justify-between items-end border-t border-white/5 pt-6">
          <div className="max-w-md">
            <p className="font-mono text-[10px] text-silver/30 leading-relaxed max-w-xs">
              UYARI: BU ARAYÜZ SİNİRSEL AĞLARA DOĞRUDAN BAĞLANIR.
              SÜREKLİ MARUZ KALMAK GERÇEKLİK ALGISINDA BOZULMALARA YOL AÇABİLİR.
            </p>
          </div>

          <div className="flex gap-4">
            <GlitchButton variant="active" className="text-xs py-2 px-4 bg-white/5 hover:bg-white/10" onClick={() => window.open('https://github.com/gemini-void', '_blank')}>
              GITHUB_ERİŞİMİ
            </GlitchButton>
          </div>
        </footer>
      </div>

      <SubliminalAudio enabled={audioEnabled} volume={0.05} />
    </main>
  );
}
