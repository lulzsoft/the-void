'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await fetch('/api/admin/candidates');
            if (res.ok) {
                const data = await res.json();
                setCandidates(data.candidates || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecision = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const res = await fetch('/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });
            if (res.ok) {
                // Listeden çıkar
                setCandidates(prev => prev.filter(c => c.id !== id));
                setSelectedCandidate(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!mounted) return null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-4xl text-stark-white mb-2">KANDİDATLAR</h1>
                    <p className="font-mono text-xs text-silver/50 tracking-wider">
                        İNİSYASYONU GEÇENLER LİSTESİ
                    </p>
                </div>
                <div className="font-mono text-xs text-deep-crimson">
                    TOPLAM: {candidates.length}
                </div>
            </div>

            {candidates.length === 0 ? (
                <div className="razor-border p-12 text-center">
                    <p className="font-mono text-silver/30">HENÜZ KİMSE BU SEVİYEYE ULAŞAMADI.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {candidates.map((candidate, index) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="razor-border p-6 hover:bg-silver/5 transition-colors group cursor-pointer"
                            onClick={() => setSelectedCandidate(candidate)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="font-display text-2xl text-stark-white group-hover:text-deep-crimson transition-colors">
                                            {candidate.codename}
                                        </h3>
                                        <span className="font-mono text-[10px] bg-deep-crimson/20 text-deep-crimson px-2 py-1 rounded">
                                            PUAN: {candidate.score?.toFixed(1) || '0.0'}
                                        </span>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="font-mono text-[10px] text-silver/30 uppercase mb-1">YETENEK</p>
                                            <p className="font-mono text-sm text-silver">
                                                {candidate.skill === 'INTEL' ? 'GÖZLEM / ANALİZ' :
                                                    candidate.skill === 'PSYCH' ? 'PSİKOLOJİ / İKNA' :
                                                        candidate.skill}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-mono text-[10px] text-silver/30 uppercase mb-1">ACI EŞİĞİ</p>
                                            <div className="flex items-center gap-1">
                                                <div className="w-16 h-1 bg-silver/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-deep-crimson"
                                                        style={{ width: `${(candidate.painTolerance / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-sm text-silver ml-2">{candidate.painTolerance}/10</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-mono text-[10px] text-silver/30 uppercase mb-1">TARİH</p>
                                            <p className="font-mono text-xs text-silver/50">
                                                {new Date(candidate.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn-void text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                    DETAYLARI GÖR
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Candidate Details Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-void-black/90 backdrop-blur-sm p-4"
                        onClick={() => setSelectedCandidate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-void-black razor-border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                                <div>
                                    <h2 className="font-display text-3xl text-stark-white mb-1">
                                        {selectedCandidate.codename}
                                    </h2>
                                    <p className="font-mono text-xs text-deep-crimson tracking-wider">
                                        IP: {selectedCandidate.ip} • ID: {selectedCandidate.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="text-silver hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* AI Assessment Section */}
                                <div className="mb-6 razor-border p-4 bg-void-black/50 border-deep-crimson/30">
                                    <h3 className="font-mono text-xs text-deep-crimson mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-deep-crimson rounded-full animate-pulse"></span>
                                        SİSTEM DEĞERLENDİRMESİ
                                    </h3>
                                    <p className="font-mono text-sm text-silver/80 italic leading-relaxed">
                                        "{(() => {
                                            const rawAnswers = selectedCandidate.answers;
                                            let msgs: any[] = [];
                                            if (Array.isArray(rawAnswers)) msgs = rawAnswers;
                                            else if (typeof rawAnswers === 'string') try { msgs = JSON.parse(rawAnswers); } catch { }
                                            else if (typeof rawAnswers === 'object' && rawAnswers) msgs = Object.values(rawAnswers);

                                            // Find last message from model
                                            const lastModelMsg = [...msgs].reverse().find((m: any) => m.role === 'model' || m.role === 'assistant');
                                            return lastModelMsg?.content || lastModelMsg?.parts?.[0]?.text || 'Değerlendirme verisi bulunamadı.';
                                        })()}"
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-mono text-xs text-silver/50 mb-4 sticky top-0 bg-void-black py-2 border-b border-deep-crimson/20">
                                        SORGU KAYITLARI
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-6">
                                            {(() => {
                                                const rawAnswers = selectedCandidate.answers;
                                                let answersToRender: any[] = [];

                                                // Güvenli Parse İşlemi
                                                if (Array.isArray(rawAnswers)) {
                                                    answersToRender = rawAnswers;
                                                } else if (typeof rawAnswers === 'string') {
                                                    try { answersToRender = JSON.parse(rawAnswers); } catch (e) { }
                                                } else if (typeof rawAnswers === 'object' && rawAnswers !== null) {
                                                    // Bazen obje olarak gelebilir
                                                    answersToRender = Object.values(rawAnswers);
                                                }

                                                if (!answersToRender || answersToRender.length === 0) {
                                                    return <div className="text-silver/30 font-mono text-xs italic">KAYIT YOK</div>;
                                                }

                                                return answersToRender.map((msg: any, i: number) => {
                                                    if (!msg || msg.role === 'system') return null;

                                                    return (
                                                        <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'
                                                            }`}>
                                                            <span className="font-mono text-[10px] text-silver/30 uppercase">
                                                                {msg.role === 'user' ? 'ADAY' : 'GATEKEEPER'}
                                                            </span>
                                                            <div className={`p-4 max-w-[90%] text-sm font-mono whitespace-pre-wrap ${msg.role === 'user'
                                                                ? 'bg-deep-crimson/5 border border-deep-crimson/20 text-silver'
                                                                : 'text-silver/60 italic'
                                                                }`}>
                                                                {msg.content || (msg.parts && msg.parts?.[0]?.text) || '...'}
                                                            </div>
                                                        </div>
                                                    )
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-void-black border-t border-white/10 p-6 flex justify-end gap-4 sticky bottom-0 z-10">
                                <button
                                    onClick={() => handleDecision(selectedCandidate.id, 'REJECT')}
                                    className="px-6 py-2 border border-deep-crimson text-deep-crimson font-mono text-sm hover:bg-deep-crimson hover:text-white transition-colors"
                                >
                                    REDDET
                                </button>
                                <button
                                    onClick={() => handleDecision(selectedCandidate.id, 'APPROVE')}
                                    className="px-6 py-2 bg-deep-crimson text-white font-mono text-sm hover:tracking-widest transition-all"
                                >
                                    MÜHÜRLE (ONAYLA)
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
