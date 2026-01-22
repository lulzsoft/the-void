
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '@/components/ui/TypewriterText';
import HiddenNav from '@/components/ui/HiddenNav';
import SubliminalAudio from '@/components/audio/SubliminalAudio';
import { useHeartbeat } from '@/hooks/use-heartbeat';

// WebGL için dynamic import
const LiquidBackground = dynamic(
  () => import('@/components/webgl/LiquidBackground'),
  { ssr: false }
);

// Navigasyon öğeleri
const navItems = [
  { label: 'Nasıl Çalışır', href: '/manifesto' },
  { label: 'Değerlendirme', href: '/initiation' },
  { label: 'Squad\'lar', href: '/squads' },
  { label: 'Giriş', href: '/login' },
];

// Lejyon metinleri
const propagandaTexts = [
  "Elite profesyoneller, güçlü kolektifler.",
  "Yalnız değilsin. Ekibini bul, gücünü katla.",
  "Her mission için doğru squad.",
  "Lejyonerler burada toplanıyor.",
  "Bireysel yetenek + Kolektif güç = Başarı.",
  "Kendi grubunu kur. Büyük işler yap.",
];

export default function Home() {
  useHeartbeat(); // Start heartbeat
  const [showIntro, setShowIntro] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'main'>('loading');
  const [mounted, setMounted] = useState(false);
  const [observerCount, setObserverCount] = useState<string | number>('...');

  useEffect(() => {
    setMounted(true);

    // Fetch real stats
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        if (data.active !== undefined) {
          setObserverCount(data.active);
        }
      })
      .catch(() => setObserverCount('ERR'));

  }, []);

  // İlk yükleme sekansı
  useEffect(() => {
    if (!showIntro) {
      const loadTimer = setTimeout(() => {
        setPhase('intro');
      }, 500);

      const mainTimer = setTimeout(() => {
        setPhase('main');
      }, 3500);

      return () => {
        clearTimeout(loadTimer);
        clearTimeout(mainTimer);
      };
    }
  }, [showIntro]);

  // Propaganda metni döngüsü
  useEffect(() => {
    if (phase !== 'main') return;

    const textCycleInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % propagandaTexts.length);
    }, 8000);

    return () => clearInterval(textCycleInterval);
  }, [phase]);

  // Giriş ekranını kapat ve sesi başlat
  const handleEnter = () => {
    setShowIntro(false);
    setAudioEnabled(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-void-black">
      {/* WebGL Arka Plan */}
      {mounted && <LiquidBackground />}

      {/* Gizli Navigasyon */}
      <HiddenNav items={navItems} holdDuration={3000} />

      {/* Subliminal Ses - sadece intro kapandıktan sonra */}
      <SubliminalAudio enabled={audioEnabled} volume={0.06} />

      {/* BUZLU GİRİŞ EKRANI */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer touch-manipulation"
            onClick={handleEnter}
            onTouchEnd={(e) => {
              e.preventDefault(); // Prevent ghost clicks
              handleEnter();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="text-center max-w-2xl px-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <h1 className="font-display text-6xl md:text-8xl text-stark-white mb-8 tracking-wider">
                  BOŞLUK
                </h1>
              </motion.div>

              {/* Kırmızı çizgi */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="w-32 h-[1px] bg-deep-crimson mx-auto mb-12"
              />

              {/* Tanıtım metni */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="space-y-6"
              >
                <p className="font-mono text-sm md:text-base text-silver/80 leading-relaxed">
                  Doğru yetenekleri, doğru ekiplerle buluşturuyoruz.
                </p>
                <p className="font-mono text-sm md:text-base text-silver/60 leading-relaxed">
                  Becerilerinizi test ediyor, kişiliğinizi anlıyor,
                  size uygun fırsatları gösteriyoruz.
                </p>
                <p className="font-mono text-sm md:text-base text-silver/40 leading-relaxed">
                  Sıradan değilsiniz. Biz de öyle.
                </p>
              </motion.div>

              {/* Giriş butonu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="mt-16"
              >
                <div className="inline-block border border-deep-crimson/50 px-8 py-4 hover:bg-deep-crimson/10 transition-all duration-500">
                  <span className="font-mono text-xs text-silver/70 tracking-widest">
                    DEVAM ETMEK İÇİN TIKLA
                  </span>
                </div>
              </motion.div>

              {/* Ses uyarısı */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="mt-8 font-mono text-xs text-silver/30"
              >
                🎧 Kulaklık önerilir
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yükleme Aşaması */}
      <AnimatePresence>
        {!showIntro && phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-void-black"
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-[1px] bg-deep-crimson mx-auto"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
              <p className="font-mono text-xs text-silver/30 mt-4 tracking-widest">
                YÜKLENİYOR
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Aşaması */}
      <AnimatePresence>
        {phase === 'intro' && !showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-40 flex items-center justify-center"
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-9xl text-stark-white tracking-wider">
              <TypewriterText text="BOŞLUK" speed={150} />
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ana İçerik */}
      <AnimatePresence>
        {phase === 'main' && !showIntro && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative z-20 min-h-screen flex flex-col"
          >
            {/* Üst Bar */}
            <header className="p-6 md:p-8 flex justify-between items-center">
              <div className="font-mono text-xs text-silver/50 tracking-widest">
                SİSTEM AKTİF
              </div>
              <div className="font-mono text-xs text-deep-crimson tracking-wider">
                GÖZLEMCİLER: {observerCount}
              </div>
            </header>

            {/* Üst Çizgi */}
            <div className="razor-line w-full pulse-crimson" />

            {/* Orta İçerik */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              {/* Ana Başlık */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-display text-6xl md:text-8xl lg:text-9xl text-stark-white mb-8 tracking-wider"
              >
                BOŞLUK
              </motion.h1>

              {/* Alt Çizgi */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="w-32 md:w-48 h-[1px] bg-deep-crimson mb-12"
              />

              {/* Propaganda Metin Döngüsü */}
              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="font-mono text-sm md:text-base text-silver text-center max-w-lg tracking-wide"
                  >
                    <TypewriterText
                      text={propagandaTexts[currentTextIndex]}
                      speed={50}
                      glitchIntensity="low"
                    />
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* CTA Butonu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-16"
              >
                <a
                  href="/initiation"
                  className="btn-void text-sm tracking-widest relative z-50 pointer-events-auto"
                >
                  DEĞERLENDİRME BAŞLAT
                </a>
              </motion.div>
            </div>

            {/* Alt Çizgi */}
            <div className="razor-line w-full pulse-crimson" />

            {/* Alt Bar */}
            <footer className="p-6 md:p-8 flex justify-between items-center">
              <div className="font-mono text-xs text-silver/20 tracking-wider">
                © BOŞLUK KOLEKTİFİ
              </div>
              <div className="font-mono text-xs text-silver/30 tracking-wider">
                GÜVENLİ VE GİZLİ
              </div>
            </footer>

            {/* Gizli Navigasyon İpucu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5, duration: 2 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2"
            >
              <p className="font-mono text-xs text-silver/20 tracking-wider text-center">
                NAVİGASYONA ERİŞMEK İÇİN EKRANIN ORTASINI 3 SANİYE BASILI TUT
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
