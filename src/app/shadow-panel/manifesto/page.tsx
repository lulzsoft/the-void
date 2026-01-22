'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TextBlock {
    id: string;
    content: string;
    startTime: number;
    duration: number;
    fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    glitchIntensity: 'none' | 'low' | 'medium' | 'high';
    fontType: 'serif' | 'mono';
}

const defaultBlocks: TextBlock[] = [
    {
        id: '1',
        content: 'Gerçek zayıflar için değildir.',
        startTime: 0,
        duration: 3,
        fontSize: '2xl',
        glitchIntensity: 'low',
        fontType: 'serif',
    },
    {
        id: '2',
        content: 'Arayanlar ancak görmeye hazır olduklarını bulurlar.',
        startTime: 4,
        duration: 5,
        fontSize: 'lg',
        glitchIntensity: 'none',
        fontType: 'mono',
    },
];

export default function ManifestoPage() {
    const [blocks, setBlocks] = useState<TextBlock[]>(defaultBlocks);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(blocks[0]?.id || null);
    const [previewTime, setPreviewTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

    const addBlock = () => {
        const lastBlock = blocks[blocks.length - 1];
        const newBlock: TextBlock = {
            id: Date.now().toString(),
            content: 'Yeni propaganda metni...',
            startTime: lastBlock ? lastBlock.startTime + lastBlock.duration + 1 : 0,
            duration: 3,
            fontSize: 'lg',
            glitchIntensity: 'none',
            fontType: 'mono',
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlock(newBlock.id);
    };

    const updateBlock = (id: string, updates: Partial<TextBlock>) => {
        setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter((b) => b.id !== id));
        if (selectedBlock === id) {
            setSelectedBlock(blocks[0]?.id || null);
        }
    };

    const totalDuration = blocks.reduce(
        (max, b) => Math.max(max, b.startTime + b.duration),
        0
    );

    const handlePlay = () => {
        setIsPlaying(true);
        setPreviewTime(0);
        const interval = setInterval(() => {
            setPreviewTime((t) => {
                if (t >= totalDuration) {
                    clearInterval(interval);
                    setIsPlaying(false);
                    return 0;
                }
                return t + 0.1;
            });
        }, 100);
    };

    return (
        <div className="space-y-8">
            {/* Başlık */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-display text-3xl text-stark-white mb-2">MANIFESTO</h1>
                    <p className="font-mono text-xs text-silver/50 tracking-wider">
                        ZAMAN ÇİZGİSİ İÇERİK EDİTÖRÜ
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={addBlock} className="btn-void text-xs">
                        + BLOK EKLE
                    </button>
                    <button onClick={() => console.log('Kaydediliyor:', blocks)} className="btn-void text-xs">
                        MANIFESTO'YU KAYDET
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Zaman Çizelgesi Görünümü */}
                <div className="razor-border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-mono text-xs text-silver/50 tracking-wider">ZAMAN ÇİZELGESİ</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePlay}
                                disabled={isPlaying}
                                className="font-mono text-xs text-silver hover:text-stark-white disabled:opacity-50"
                            >
                                {isPlaying ? '▶ OYNATIYOR...' : '▶ ÖNİZLEME'}
                            </button>
                            <span className="font-mono text-xs text-silver/30">
                                {previewTime.toFixed(1)}sn / {totalDuration}sn
                            </span>
                        </div>
                    </div>

                    {/* Zaman Çizelgesi İzi */}
                    <div
                        className="relative h-48 bg-silver/5 overflow-x-auto"
                        style={{ minWidth: `${Math.max(totalDuration * 30, 400)}px` }}
                    >
                        {/* Zaman işaretçileri */}
                        <div className="absolute top-0 left-0 right-0 h-6 border-b border-silver/10 flex">
                            {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute font-mono text-xs text-silver/30"
                                    style={{ left: `${i * 30}px` }}
                                >
                                    {i}sn
                                </div>
                            ))}
                        </div>

                        {/* Oynatma çubuğu */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-0.5 bg-deep-crimson z-10"
                            style={{ left: `${previewTime * 30}px` }}
                        />

                        {/* Bloklar */}
                        <div className="absolute top-8 left-0 right-0 bottom-0 p-2">
                            {blocks.map((block, index) => (
                                <motion.div
                                    key={block.id}
                                    layout
                                    onClick={() => setSelectedBlock(block.id)}
                                    className={`absolute h-12 cursor-pointer rounded transition-all ${selectedBlock === block.id
                                            ? 'bg-deep-crimson/30 border border-deep-crimson'
                                            : 'bg-silver/10 border border-silver/20 hover:bg-silver/20'
                                        }`}
                                    style={{
                                        left: `${block.startTime * 30}px`,
                                        width: `${block.duration * 30}px`,
                                        top: `${index * 52}px`,
                                    }}
                                >
                                    <div className="p-2 truncate font-mono text-xs text-silver">
                                        {block.content.slice(0, 20)}...
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Blok Editörü */}
                <div className="razor-border p-6">
                    <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-4">
                        BLOK EDİTÖRÜ
                    </h3>

                    {selectedBlockData ? (
                        <div className="space-y-6">
                            {/* İçerik */}
                            <div>
                                <label className="font-mono text-xs text-silver/30 block mb-2">İÇERİK</label>
                                <textarea
                                    value={selectedBlockData.content}
                                    onChange={(e) => updateBlock(selectedBlockData.id, { content: e.target.value })}
                                    className="w-full h-24 bg-silver/5 border border-silver/20 p-3 font-mono 
                    text-stark-white text-sm focus:outline-none focus:border-deep-crimson resize-none"
                                />
                            </div>

                            {/* Zamanlama */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono text-xs text-silver/30 block mb-2">BAŞLANGIÇ (sn)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={selectedBlockData.startTime}
                                        onChange={(e) =>
                                            updateBlock(selectedBlockData.id, { startTime: parseFloat(e.target.value) })
                                        }
                                        className="w-full bg-silver/5 border border-silver/20 p-2 font-mono 
                      text-stark-white text-sm focus:outline-none focus:border-deep-crimson"
                                    />
                                </div>
                                <div>
                                    <label className="font-mono text-xs text-silver/30 block mb-2">SÜRE (sn)</label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        value={selectedBlockData.duration}
                                        onChange={(e) =>
                                            updateBlock(selectedBlockData.id, { duration: parseFloat(e.target.value) })
                                        }
                                        className="w-full bg-silver/5 border border-silver/20 p-2 font-mono 
                      text-stark-white text-sm focus:outline-none focus:border-deep-crimson"
                                    />
                                </div>
                            </div>

                            {/* Font Boyutu */}
                            <div>
                                <label className="font-mono text-xs text-silver/30 block mb-2">FONT BOYUTU</label>
                                <div className="flex gap-2">
                                    {(['sm', 'base', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => updateBlock(selectedBlockData.id, { fontSize: size })}
                                            className={`px-3 py-1 font-mono text-xs transition-all ${selectedBlockData.fontSize === size
                                                    ? 'bg-deep-crimson text-stark-white'
                                                    : 'bg-silver/10 text-silver/50 hover:bg-silver/20'
                                                }`}
                                        >
                                            {size.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Tipi */}
                            <div>
                                <label className="font-mono text-xs text-silver/30 block mb-2">FONT TİPİ</label>
                                <div className="flex gap-2">
                                    {(['serif', 'mono'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => updateBlock(selectedBlockData.id, { fontType: type })}
                                            className={`px-4 py-2 font-mono text-xs transition-all ${selectedBlockData.fontType === type
                                                    ? 'bg-deep-crimson text-stark-white'
                                                    : 'bg-silver/10 text-silver/50 hover:bg-silver/20'
                                                }`}
                                        >
                                            {type === 'serif' ? 'SERİF' : 'MONO'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Glitch Yoğunluğu */}
                            <div>
                                <label className="font-mono text-xs text-silver/30 block mb-2">GLİTCH YOĞUNLUĞU</label>
                                <div className="flex gap-2">
                                    {(['none', 'low', 'medium', 'high'] as const).map((intensity) => (
                                        <button
                                            key={intensity}
                                            onClick={() => updateBlock(selectedBlockData.id, { glitchIntensity: intensity })}
                                            className={`px-3 py-1 font-mono text-xs transition-all ${selectedBlockData.glitchIntensity === intensity
                                                    ? 'bg-deep-crimson text-stark-white'
                                                    : 'bg-silver/10 text-silver/50 hover:bg-silver/20'
                                                }`}
                                        >
                                            {intensity === 'none' ? 'YOK' : intensity === 'low' ? 'DÜŞÜK' : intensity === 'medium' ? 'ORTA' : 'YÜKSEK'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sil */}
                            <button
                                onClick={() => deleteBlock(selectedBlockData.id)}
                                className="font-mono text-xs text-alert-red/50 hover:text-alert-red transition-colors"
                            >
                                BLOĞU SİL
                            </button>
                        </div>
                    ) : (
                        <p className="font-mono text-xs text-silver/30">Düzenlemek için bir blok seçin</p>
                    )}
                </div>
            </div>

            {/* Önizleme */}
            <div className="razor-border p-8 min-h-32 flex items-center justify-center">
                <div className="text-center">
                    <p className="font-mono text-xs text-silver/30 mb-4">CANLI ÖNİZLEME</p>
                    {blocks
                        .filter(
                            (b) => previewTime >= b.startTime && previewTime < b.startTime + b.duration
                        )
                        .map((block) => (
                            <p
                                key={block.id}
                                className={`text-stark-white ${block.fontType === 'serif' ? 'font-display' : 'font-mono'
                                    } ${block.glitchIntensity !== 'none' ? 'glitch' : ''
                                    }`}
                                style={{
                                    fontSize: {
                                        sm: '0.875rem',
                                        base: '1rem',
                                        lg: '1.25rem',
                                        xl: '1.5rem',
                                        '2xl': '2rem',
                                        '3xl': '3rem',
                                    }[block.fontSize],
                                }}
                            >
                                {block.content}
                            </p>
                        ))}
                </div>
            </div>
        </div>
    );
}
