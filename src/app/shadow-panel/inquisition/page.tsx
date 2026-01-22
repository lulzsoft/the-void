'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InquisitionPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [bannedIPs, setBannedIPs] = useState<string[]>([]);
    const [inspectingId, setInspectingId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch('/api/sanctum/admin');
            const data = await res.json();
            setMessages(data.messages || []);
            setBannedIPs(data.bannedIPs || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (action: string, id?: string, ip?: string) => {
        try {
            await fetch('/api/sanctum/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, id, ip })
            });
            fetchAdminData(); // Refresh immediately
        } catch (err) {
            console.error(err);
        }
    };

    // Context Logic
    const getContextMessages = (flaggedMsg: any) => {
        if (!flaggedMsg) return [];
        // Sort all messages by time
        const all = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const index = all.findIndex(m => m.id === flaggedMsg.id);
        if (index === -1) return [];

        // Get 10 before
        const start = Math.max(0, index - 10);
        return all.slice(start, index + 1); // Include the flagged message itself at the end
    };

    if (!mounted) return null;

    const flaggedMessages = messages.filter(m => m.flagged);

    return (
        <div className="space-y-12 relative">
            {/* Inspection Modal */}
            <AnimatePresence>
                {inspectingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-void-black/90 backdrop-blur-sm p-4"
                        onClick={() => setInspectingId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-void-black razor-border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-void-black">
                                <h3 className="font-display text-xl text-deep-crimson">BAĞLAM İNCELEMESİ</h3>
                                <button onClick={() => setInspectingId(null)} className="text-silver hover:text-white">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-void-black/50">
                                {getContextMessages(messages.find(m => m.id === inspectingId)).map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-3 border-l-2 ${msg.id === inspectingId
                                            ? 'border-deep-crimson bg-deep-crimson/10'
                                            : 'border-silver/20 bg-white/5 opacity-60'}`}
                                    >
                                        <div className="flex justify-between text-[10px] font-mono mb-1 text-silver/50">
                                            <span>{msg.author}</span>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={`font-mono text-sm ${msg.id === inspectingId ? 'text-stark-white' : 'text-silver'}`}>
                                            {msg.id === inspectingId && msg.flaggedWords ? (
                                                msg.text.split(' ').map((word: string, i: number) => (
                                                    msg.flaggedWords.includes(word.toLowerCase()) ?
                                                        <span key={i} className="text-deep-crimson font-bold underline decoration-deep-crimson">{word} </span> :
                                                        <span key={i}>{word} </span>
                                                ))
                                            ) : msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-void-black">
                                <button
                                    onClick={() => {
                                        const msg = messages.find(m => m.id === inspectingId);
                                        if (msg) handleAction('BAN_IP', undefined, msg.ip);
                                        setInspectingId(null);
                                    }}
                                    className="btn-void bg-deep-crimson text-white border-none hover:bg-red-700"
                                >
                                    SUÇLUYU BANLA
                                </button>
                                <button
                                    onClick={() => {
                                        handleAction('DELETE_MESSAGE', inspectingId || undefined);
                                        setInspectingId(null);
                                    }}
                                    className="btn-void"
                                >
                                    MESAJI SİL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h1 className="font-display text-4xl text-stark-white mb-2">ENGİZİSYON</h1>
                    <p className="font-mono text-xs text-silver/50 tracking-wider">
                        DENETİM VE CEZA MEKANİZMASI
                    </p>
                </div>
                <div className="flex gap-4 font-mono text-xs">
                    <div className="text-deep-crimson">
                        BAYRAKLI: {flaggedMessages.length}
                    </div>
                    <div className="text-silver/50">
                        YASAKLI IP: {bannedIPs.length}
                    </div>
                </div>
            </header>

            {/* Flagged Messages Queue */}
            <section>
                <h2 className="font-display text-2xl text-deep-crimson mb-6 flex items-center gap-4">
                    Suçlu Mesajlar (Otomatik Filtre)
                    <div className="h-[1px] flex-1 bg-deep-crimson/30" />
                </h2>

                {flaggedMessages.length === 0 ? (
                    <div className="font-mono text-silver/30 italic text-center py-8 border border-dashed border-white/5">
                        Tüm ruhlar temiz görünüyor... şimdilik.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {flaggedMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="razor-border p-4 bg-deep-crimson/5 border-deep-crimson/30"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-xs text-deep-crimson font-bold">{msg.author}</span>
                                    <span className="font-mono text-[10px] text-silver/30">{msg.ip}</span>
                                </div>

                                <p className="font-mono text-sm text-silver mb-4">
                                    {msg.text.split(' ').map((word: string, i: number) => (
                                        msg.flaggedWords?.includes(word.toLowerCase()) ?
                                            <span key={i} className="text-deep-crimson bg-deep-crimson/20 px-1">{word}</span> :
                                            <span key={i}>{word} </span>
                                    ))}
                                </p>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setInspectingId(msg.id)}
                                        className="text-[10px] font-mono border border-silver/50 px-3 py-1 hover:bg-silver/10 text-stark-white transition-colors"
                                    >
                                        İNCELE
                                    </button>
                                    <button
                                        onClick={() => handleAction('DELETE_MESSAGE', msg.id)}
                                        className="text-[10px] font-mono border border-silver/20 px-3 py-1 hover:bg-silver/10 text-silver transition-colors"
                                    >
                                        SİL
                                    </button>
                                    <button
                                        onClick={() => handleAction('BAN_IP', undefined, msg.ip)}
                                        className="text-[10px] font-mono bg-deep-crimson text-stark-white px-3 py-1 hover:bg-red-700 transition-colors"
                                    >
                                        IP BANLA
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Banned IPs List */}
            <section>
                <h2 className="font-display text-2xl text-silver mb-6 flex items-center gap-4">
                    Sürgün Edilenler
                    <div className="h-[1px] flex-1 bg-white/10" />
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {bannedIPs.map((ip) => (
                        <div key={ip} className="bg-void-black border border-white/10 p-3 font-mono text-xs flex justify-between items-center group">
                            <span className="text-silver/50">{ip}</span>
                            <button
                                onClick={() => handleAction('UNBAN_IP', undefined, ip)}
                                className="text-deep-crimson opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                            >
                                AF
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
