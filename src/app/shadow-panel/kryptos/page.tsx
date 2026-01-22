'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Bu veriler normalde bir veritabanından gelmeli, şimdilik mock
const encryptedArchives = [
    { id: 'LOG-001', title: 'SAF AKIL', key: 'salt', status: 'ACTIVE' },
    { id: 'LOG-003', title: 'ZAMANIN YANILSAMASI', key: 'an', status: 'ACTIVE' },
    { id: 'LOG-XXX', title: 'SONSUZ DÖNGÜ', key: 'omega', status: 'PENDING' },
];

export default function KryptosPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-4xl text-stark-white mb-2">KRİPTOS</h1>
                    <p className="font-mono text-xs text-silver/50 tracking-wider">
                        ŞİFRELİ ARŞİV ANAHTARLARI
                    </p>
                </div>
                <div className="font-mono text-xs text-deep-crimson">
                    AKTİF KİLİTLER: {encryptedArchives.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {encryptedArchives.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="razor-border p-6 bg-void-black/50 group hover:border-deep-crimson/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-mono text-xs text-silver/30">{item.id}</span>
                            <span className={`font-mono text-[10px] px-2 py-1 rounded ${item.status === 'ACTIVE' ? 'bg-green-900/20 text-green-500' : 'bg-silver/10 text-silver'
                                }`}>
                                {item.status === 'ACTIVE' ? '● AKTİF' : '○ BEKLEMEDE'}
                            </span>
                        </div>

                        <h3 className="font-display text-xl text-stark-white mb-4">{item.title}</h3>

                        <div className="flex items-center gap-4 p-3 bg-white/5 font-mono">
                            <span className="text-xs text-silver/50">ANAHTAR:</span>
                            <span className="text-deep-crimson text-lg tracking-widest blur-sm hover:blur-none transition-all cursor-crosshair select-all">
                                {item.key}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Yeni Ekleme Kartı */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="razor-border p-6 border-dashed border-silver/10 flex items-center justify-center cursor-pointer hover:bg-silver/5 group"
                >
                    <div className="text-center">
                        <span className="text-4xl text-silver/20 group-hover:text-deep-crimson transition-colors block mb-2">+</span>
                        <p className="font-mono text-xs text-silver/30">YENİ ŞİFRE OLUŞTUR</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
