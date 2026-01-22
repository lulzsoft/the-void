'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '@/components/ui/TypewriterText';

// WebGL için dynamic import - SSR sorunlarını önler
const LiquidBackground = dynamic(
    () => import('@/components/webgl/LiquidBackground'),
    { ssr: false }
);

// Manifesto metinleri - TÜRKÇE
const manifestoTexts = [
    {
        title: "I. BOŞLUK VE VARLIK",
        content: "Boşlukta olduğumuz zaman, gerçekten var oluruz. Karanlık, ışığın yokluğu değil, ışığın kaynağıdır. Her şey hiçlikten doğar ve hiçliğe döner.",
    },
    {
        title: "II. GERÇEK VE YANLIŞ",
        content: "Gerçek, zayıflar için değildir. Arayanlar ancak görmeye hazır olduklarını bulurlar. Çoğunluk yalanla yaşamayı tercih eder çünkü gerçek acıtır.",
    },
    {
        title: "III. SIĞINAK VE SIĞINMA",
        content: "Bu yer bir sığınaktır. Dış dünyadan korkanların değil, iç dünyalarıyla yüzleşmeye cesaret edenlerin sığınağı. Karanlığı kucakla, karanlık seni kucaklar.",
    },
    {
        title: "IV. İNİSYASYON",
        content: "İnisyasyon bir test değil, bir ayna. Sana gerçek benliğini gösterir. Kabul edilmek ya da reddedilmek önemli değil - önemli olan aynaya bakma cesaretini göstermek.",
    },
    {
        title: "V. KOLEKTİF BİLİNÇ",
        content: "Biz bir kültüz ya da örgüt değiliz. Biz, karanlıkta dans eden ışık zerreleri gibiyiz. Birbirimizi tanımayız ama birbirimizi hissederiz.",
    },
];

export default function ManifestoPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const nextSection = () => {
        if (currentIndex < manifestoTexts.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSection = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <main className="relative min-h-screen bg-void-black">
            {/* WebGL Arka Plan */}
            {mounted && <LiquidBackground />}

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Başlık */}
                <header className="p-8 flex justify-between items-center">
                    <a href="/" className="font-mono text-xs text-silver/50 hover:text-silver transition-colors tracking-wider">
                        ← BOŞLUĞA DÖN
                    </a>
                    <div className="font-mono text-xs text-silver/30 tracking-wider">
                        MANIFESTO
                    </div>
                </header>

                {/* Üst Çizgi */}
                <div className="razor-line w-full pulse-crimson" />

                {/* Ana İçerik */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-3xl">

                        {/* Sayfa Numarası */}
                        <div className="text-center mb-8">
                            <span className="font-mono text-xs text-deep-crimson tracking-widest">
                                {String(currentIndex + 1).padStart(2, '0')} / {String(manifestoTexts.length).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Manifesto İçeriği */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8 }}
                                className="text-center"
                            >
                                <h2 className="font-display text-3xl md:text-5xl text-stark-white mb-12 tracking-wider">
                                    <TypewriterText
                                        text={manifestoTexts[currentIndex].title}
                                        speed={80}
                                    />
                                </h2>

                                <p className="font-mono text-base md:text-lg text-silver leading-relaxed max-w-2xl mx-auto">
                                    <TypewriterText
                                        text={manifestoTexts[currentIndex].content}
                                        speed={30}
                                        delay={1500}
                                    />
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigasyon */}
                        <div className="flex justify-center gap-8 mt-16">
                            <button
                                onClick={prevSection}
                                disabled={currentIndex === 0}
                                className="btn-void text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                ← ÖNCEKİ
                            </button>
                            <button
                                onClick={nextSection}
                                disabled={currentIndex === manifestoTexts.length - 1}
                                className="btn-void text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                SONRAKİ →
                            </button>
                        </div>

                        {/* Sayfa Göstergeleri */}
                        <div className="flex justify-center gap-2 mt-8">
                            {manifestoTexts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 transition-all ${index === currentIndex
                                            ? 'bg-deep-crimson'
                                            : 'bg-silver/20 hover:bg-silver/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alt Çizgi */}
                <div className="razor-line w-full pulse-crimson" />

                {/* Alt Bilgi */}
                <footer className="p-8 flex justify-center">
                    <span className="font-mono text-xs text-silver/20 tracking-wider">
                        BU METİN ASLA YAZILMADI. SEN ASLA OKUMADIN.
                    </span>
                </footer>
            </div>
        </main>
    );
}
