'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StylePreset {
    id: string;
    name: string;
    styles: {
        headingSize: number;
        bodySize: number;
        lineHeight: number;
        darkness: number;
        accentOpacity: number;
    };
}

const presets: StylePreset[] = [
    {
        id: 'default',
        name: 'BOŞLUK VARSAYILAN',
        styles: { headingSize: 1, bodySize: 1, lineHeight: 1.5, darkness: 100, accentOpacity: 0.8 },
    },
    {
        id: 'minimal',
        name: 'ULTRA MİNİMAL',
        styles: { headingSize: 0.8, bodySize: 0.9, lineHeight: 1.8, darkness: 100, accentOpacity: 0.5 },
    },
    {
        id: 'dramatic',
        name: 'DRAMATİK',
        styles: { headingSize: 1.3, bodySize: 1.1, lineHeight: 1.4, darkness: 100, accentOpacity: 1 },
    },
    {
        id: 'soft',
        name: 'YUMUŞAK BOŞLUK',
        styles: { headingSize: 1, bodySize: 1, lineHeight: 1.6, darkness: 85, accentOpacity: 0.6 },
    },
];

export default function ArchitectPage() {
    const [headingSize, setHeadingSize] = useState(1);
    const [bodySize, setBodySize] = useState(1);
    const [lineHeight, setLineHeight] = useState(1.5);
    const [darkness, setDarkness] = useState(100);
    const [accentOpacity, setAccentOpacity] = useState(0.8);
    const [activePreset, setActivePreset] = useState<string | null>('default');

    // Önizleme stilleri
    const previewStyles = {
        '--preview-heading-size': `${headingSize}rem`,
        '--preview-body-size': `${bodySize}rem`,
        '--preview-line-height': lineHeight,
        '--preview-bg-darkness': `${darkness}%`,
        '--preview-accent-opacity': accentOpacity,
    } as React.CSSProperties;

    const applyPreset = (preset: StylePreset) => {
        setHeadingSize(preset.styles.headingSize);
        setBodySize(preset.styles.bodySize);
        setLineHeight(preset.styles.lineHeight);
        setDarkness(preset.styles.darkness);
        setAccentOpacity(preset.styles.accentOpacity);
        setActivePreset(preset.id);
    };

    const handleSliderChange = () => {
        setActivePreset(null);
    };

    return (
        <div className="space-y-8">
            {/* Başlık */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-display text-3xl text-stark-white mb-2">MİMAR</h1>
                    <p className="font-mono text-xs text-silver/50 tracking-wider">
                        CANLI STİL YAPILANDIRMASI
                    </p>
                </div>
                <button className="btn-void text-xs">KAYDET VE UYGULA</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kontroller */}
                <div className="space-y-6">
                    {/* Ön Ayarlar */}
                    <div className="razor-border p-6">
                        <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-4">ÖN AYARLAR</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {presets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => applyPreset(preset)}
                                    className={`p-3 font-mono text-xs tracking-wider transition-all ${activePreset === preset.id
                                            ? 'bg-deep-crimson/30 border border-deep-crimson text-stark-white'
                                            : 'bg-silver/5 border border-silver/20 text-silver/50 hover:bg-silver/10'
                                        }`}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tipografi */}
                    <div className="razor-border p-6">
                        <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-6">TİPOGRAFİ</h3>

                        <div className="space-y-6">
                            <SliderControl
                                label="BAŞLIK BOYUTU"
                                value={headingSize}
                                min={0.5}
                                max={2}
                                step={0.1}
                                unit="rem"
                                onChange={(v) => {
                                    setHeadingSize(v);
                                    handleSliderChange();
                                }}
                            />

                            <SliderControl
                                label="GÖVDe BOYUTU"
                                value={bodySize}
                                min={0.5}
                                max={1.5}
                                step={0.05}
                                unit="rem"
                                onChange={(v) => {
                                    setBodySize(v);
                                    handleSliderChange();
                                }}
                            />

                            <SliderControl
                                label="SATIR YÜKSEKLİĞİ"
                                value={lineHeight}
                                min={1}
                                max={2.5}
                                step={0.1}
                                unit=""
                                onChange={(v) => {
                                    setLineHeight(v);
                                    handleSliderChange();
                                }}
                            />
                        </div>
                    </div>

                    {/* Atmosfer */}
                    <div className="razor-border p-6">
                        <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-6">ATMOSFER</h3>

                        <div className="space-y-6">
                            <SliderControl
                                label="KARANLIK SEVİYESİ"
                                value={darkness}
                                min={70}
                                max={100}
                                step={1}
                                unit="%"
                                onChange={(v) => {
                                    setDarkness(v);
                                    handleSliderChange();
                                }}
                            />

                            <SliderControl
                                label="AKSAN OPAKLIGI"
                                value={accentOpacity}
                                min={0.2}
                                max={1}
                                step={0.05}
                                unit=""
                                onChange={(v) => {
                                    setAccentOpacity(v);
                                    handleSliderChange();
                                }}
                            />
                        </div>
                    </div>

                    {/* CSS Çıktısı */}
                    <div className="razor-border p-6">
                        <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-4">CSS DEĞİŞKENLERİ</h3>
                        <pre className="font-mono text-xs text-silver/70 bg-silver/5 p-4 overflow-x-auto">
                            {`:root {
  --font-size-heading-scale: ${headingSize};
  --font-size-body-scale: ${bodySize};
  --line-height-base: ${lineHeight};
  --darkness-level: ${darkness}%;
  --accent-opacity: ${accentOpacity};
}`}
                        </pre>
                    </div>
                </div>

                {/* Canlı Önizleme */}
                <div className="razor-border p-6 sticky top-8" style={previewStyles}>
                    <h3 className="font-mono text-xs text-silver/50 tracking-wider mb-4">CANLI ÖNİZLEME</h3>

                    <div
                        className="min-h-[500px] border border-silver/20 p-8 transition-all duration-300"
                        style={{
                            backgroundColor: `hsl(0, 0%, ${100 - darkness}%)`,
                        }}
                    >
                        {/* Sahte açılış sayfası */}
                        <div className="space-y-8">
                            {/* Başlık */}
                            <div className="flex justify-between items-center">
                                <div
                                    className="w-12 h-1 transition-all"
                                    style={{
                                        backgroundColor: `rgba(136, 0, 0, ${accentOpacity})`,
                                    }}
                                />
                                <span className="font-mono text-xs text-silver/30">BOŞLUK</span>
                                <div
                                    className="w-12 h-1 transition-all"
                                    style={{
                                        backgroundColor: `rgba(136, 0, 0, ${accentOpacity})`,
                                    }}
                                />
                            </div>

                            {/* Ana içerik */}
                            <div className="text-center py-12">
                                <h1
                                    className="font-display text-stark-white mb-4 transition-all"
                                    style={{
                                        fontSize: `calc(3rem * ${headingSize})`,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    BOŞLUK
                                </h1>

                                <p
                                    className="font-mono text-silver max-w-md mx-auto transition-all"
                                    style={{
                                        fontSize: `calc(1rem * ${bodySize})`,
                                        lineHeight,
                                    }}
                                >
                                    Karanlıkta berraklık vardır. Boşluktan geçerek gerçeği buluruz.
                                </p>
                            </div>

                            {/* Örnek elementler */}
                            <div className="space-y-4">
                                <div
                                    className="h-px transition-all"
                                    style={{
                                        backgroundColor: `rgba(136, 0, 0, ${accentOpacity})`,
                                    }}
                                />

                                <p
                                    className="font-mono text-silver/50 transition-all"
                                    style={{
                                        fontSize: `calc(0.75rem * ${bodySize})`,
                                        lineHeight,
                                    }}
                                >
                                    Bu metin tipografi ayarlarını gösteriyor.
                                    Satır yüksekliği ve font boyutunun okunabilirliği nasıl etkilediğine dikkat edin.
                                </p>

                                <h2
                                    className="font-display text-stark-white transition-all"
                                    style={{
                                        fontSize: `calc(1.5rem * ${headingSize})`,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    İkincil Başlık
                                </h2>

                                <button
                                    className="px-6 py-2 font-mono text-xs border transition-all"
                                    style={{
                                        fontSize: `calc(0.75rem * ${bodySize})`,
                                        borderColor: `rgba(136, 0, 0, ${accentOpacity})`,
                                        color: '#C0C0C0',
                                    }}
                                >
                                    İNİSYASYONA BAŞLA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Slider Kontrol Bileşeni
function SliderControl({
    label,
    value,
    min,
    max,
    step,
    unit,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (value: number) => void;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-silver/50">{label}</span>
                <span className="font-mono text-xs text-stark-white">
                    {value.toFixed(2)}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-silver/20 appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-deep-crimson 
          [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
          [&::-moz-range-thumb]:bg-deep-crimson [&::-moz-range-thumb]:border-0"
            />
        </div>
    );
}
