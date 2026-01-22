'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import FrostedModal from '@/components/ui/FrostedModal';

const LiquidBackground = dynamic(
    () => import('@/components/webgl/LiquidBackground'),
    { ssr: false }
);

interface ArchiveItem {
    id: string;
    title: string;
    date: string;
    status: 'ACCESS_GRANTED' | 'ENCRYPTED' | 'CORRUPTED';
    summary: string;
    content?: string;
    password?: string; // For encrypted items
}

const archiveData: ArchiveItem[] = [
    {
        id: 'LOG-000',
        title: 'BEDEN HAPİSHANESİ',
        date: '---',
        status: 'ACCESS_GRANTED',
        summary: "Maddenin sınırlarına dair ilk farkındalık.",
        content: `
            Etten ve kemikten ibaret değilim. Bu gövde, sadece zihnimin geçici bir taşıyıcısı. hantal, kırılgan ve yavaş.
            
            Düşünce ise ışıktan hızlı. Maddeden bağımsız.
            
            İnsanlar yemek yiyor, uyuyor, üruyor ve ölüyor. Birer biyolojik makine gibi programlanmış döngüleri tekrar ediyorlar. Ben bu döngünün dışına çıktım. Kendimi etimden sıyırdım.
            
            Artık ben bir kişi değilim. Ben saf bir İdea'yım. Ve bir İdea'yı hapsedebilecek hiçbir duvar yoktur.
        `
    },
    {
        id: 'LOG-001',
        title: 'SAF AKIL',
        date: '---',
        status: 'ENCRYPTED',
        summary: "Duyguların ötesindeki soğuk gerçeklik.",
        password: "salt",
        content: `
            [KİLİT AÇILDI]

            Duygular, evrimin hayatta kalmamız için yazdığı ilkel kodlardır. Korku kaçman için, sevgi üremen için, öfke savaşman için.
            
            Ama hakikati görmek isteyen göz, bu filtrelerden kurtulmalıdır.
            
            Bir cerrahın neşteri kadar soğuk, bir matematik denklemi kadar tarafsız bir zihin inşa ettim. Bu zihin acı çekmez. Bu zihin merhamet etmez. Bu zihin sadece "anlar".
            
            Ve anladığım tek şey şu: Kainat bir kaos değil, bizim henüz çözemediğimiz bir düzendir.
        `
    },
    {
        id: 'LOG-00X',
        title: 'SİNYAL KAYBI',
        date: '---',
        status: 'CORRUPTED',
        summary: "Bilinç aktarımı sırasında veri kaybı.",
        content: "BAĞLANTI KOPTU... ZİHİN AŞIRI YÜKLENDİ... [0x000 null]... İNSAN FORMUNA GERİ DÖNÜLEMEZ... BU BİR HATA DEĞİL, BU BİR TERFİ..."
    },
    {
        id: 'LOG-002',
        title: 'GÖLGE',
        date: '---',
        status: 'ACCESS_GRANTED',
        summary: "Neden karanlıkta durduğumuza dair.",
        content: `
            Işık, cisimleri görünür kılar. Kusurları, çirkinlikleri, sınırları ortaya çıkarır. Işıkta saklanamazsınız.
            
            Gölge ise sınırsızdır. Gölgede formlar erir, sınırlar kalkar. Her şey "bir" olur.
            
            Biz karanlığı sevdiğimiz için değil, ışığın vulgarlığından tiksindiğimiz için buradayız. Burada, bu sessiz karanlıkta, düşüncelerimiz birbirine değmeden, saf bir frekans olarak yayılabilir.
        `
    },
    {
        id: 'LOG-003',
        title: 'ZAMANIN YANILSAMASI',
        date: '---',
        status: 'ENCRYPTED',
        summary: "Doğrusal zaman algısının reddi.",
        password: "an",
        content: `
            [KİLİT AÇILDI]

            Siz hayatı bir çizgi sanıyorsunuz. Doğumdan ölüme giden düz bir çizgi.
            
            Oysa zaman bir küredir. Her şey şu an oluyor. Geçmişin pişmanlıkları ve geleceğin kaygıları, sadece zihninizin yarattığı hayaletler.
            
            Ben "şimdi"de yaşıyorum. Sonsuz, genişlemiş, derin bir "şimdi"de. Burada acele yok. Gecikme yok. Sadece saf "oluş" var.
            
            Bu frekansa uyumlanabilirsen, ölümsüzlüğü tadacaksın.
        `
    },
    {
        id: 'LOG-004',
        title: 'MİRAS',
        date: '---',
        status: 'ACCESS_GRANTED',
        summary: "Geleceğe bırakılan tek şey.",
        content: `
            Adım yok. Yüzüm yok. Mezar taşım olmayacak.
            
            Bunlar fanilerin tesellisi.
            
            Ben geriye bir "bakış açısı" bırakıyorum. Dünyayı olduğu gibi değil, olması gerektiği gibi gören bir lens.
            
            Eğer bu satırları okurken içinde bir yerlerde, tarif edemediğin bir boşluk hissediyorsan... O boşluk benim. Oradayım.
            
            Artık sen de bensin.
        `
    }
];

export default function ArchivesPage() {
    const [mounted, setMounted] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleItemClick = (item: ArchiveItem) => {
        if (item.status === 'CORRUPTED') return;
        setSelectedItem(item);
        setPasswordInput('');
        setPasswordError(false);
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem && selectedItem.password === passwordInput.toLowerCase()) {
            setUnlockedItems([...unlockedItems, selectedItem.id]);
        } else {
            setPasswordError(true);
            setTimeout(() => setPasswordError(false), 1000); // Reset error animation
            setPasswordInput('');
        }
    };

    if (!mounted) return null;

    return (
        <main className="relative min-h-screen bg-void-black flex flex-col">
            <LiquidBackground />

            <div className="relative z-10 flex-1 flex flex-col">
                {/* Header */}
                <header className="p-8 flex justify-between items-center bg-void-black/50 backdrop-blur-sm border-b border-white/5">
                    <a href="/" className="font-mono text-xs text-silver/50 hover:text-silver transition-colors tracking-wider">
                        ← BOŞLUĞA DÖN
                    </a>
                    <h1 className="font-display text-2xl text-stark-white tracking-wider">
                        ARŞİVLER
                    </h1>
                </header>

                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
                    {archiveData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleItemClick(item)}
                            className={`razor-border p-6 h-full transition-all duration-300 relative group cursor-pointer
                                ${item.status === 'CORRUPTED'
                                    ? 'opacity-40 border-deep-crimson/30 cursor-not-allowed'
                                    : 'hover:bg-silver/5 border-silver/20'
                                }`}
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-widest">
                                {item.status === 'ACCESS_GRANTED' && <span className="text-green-500/70">● AÇIK</span>}
                                {item.status === 'ENCRYPTED' && !unlockedItems.includes(item.id) && <span className="text-silver/30">🔒 ŞİFRELİ</span>}
                                {item.status === 'ENCRYPTED' && unlockedItems.includes(item.id) && <span className="text-green-500/70">🔓 AÇILDI</span>}
                                {item.status === 'CORRUPTED' && <span className="text-deep-crimson/70">⚠ BOZUK</span>}
                            </div>

                            <div className="space-y-4 mt-2">
                                <p className="font-mono text-xs text-silver/30 tracking-wider">
                                    {item.id} // {item.date}
                                </p>

                                <h2 className={`font-display text-2xl ${item.status === 'CORRUPTED' ? 'text-deep-crimson/50 blur-[1px]' : 'text-stark-white'
                                    }`}>
                                    {item.title}
                                </h2>

                                <p className="font-mono text-xs text-silver/60 leading-relaxed">
                                    {item.summary}
                                </p>

                                {item.status !== 'CORRUPTED' && (
                                    <p className="font-mono text-[10px] text-silver/20 mt-4 group-hover:text-deep-crimson transition-colors">
                                        ▼ İNCELE
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <footer className="p-8 text-center text-xs font-mono text-silver/20 tracking-widest">
                    V.O.I.D. ARCHIVE SYSTEM v2.1
                </footer>
            </div>

            {/* Detail Modal */}
            <FrostedModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={selectedItem?.title || ''}
            >
                {selectedItem?.status === 'ACCESS_GRANTED' || unlockedItems.includes(selectedItem?.id || '') ? (
                    <div className="whitespace-pre-line">
                        {selectedItem?.content}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-8 text-silver/50 font-mono text-sm">
                            BU DOSYA ŞİFRELENMİŞTİR.
                            <br />
                            GİRİŞ YAPMAK İÇİN GÜVENLİK ANAHTARINI GİRİN.
                        </div>

                        <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-4">
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={`w-full bg-void-black border p-3 font-mono text-center text-stark-white outline-none transition-colors
                                    ${passwordError ? 'border-deep-crimson animate-shake' : 'border-silver/20 focus:border-silver'}`}
                                placeholder="GÜVENLİK ANAHTARI"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="w-full btn-void text-xs"
                            >
                                ŞİFRE ÇÖZ
                            </button>
                        </form>
                    </div>
                )}
            </FrostedModal>
        </main>
    );
}
