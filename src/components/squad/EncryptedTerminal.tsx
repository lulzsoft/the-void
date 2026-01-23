'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    user: string;
    text: string;
    timestamp: number;
}

export default function EncryptedTerminal({ squadId, username }: { squadId: string, username: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Polling
    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/squads/${squadId}/chat`);
                const data = await res.json();
                setMessages(data.messages);
            } catch (e) {
                console.error('Chat error:', e);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [squadId, isOpen]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const tempMsg = {
            id: 'temp-' + Date.now(),
            user: username,
            text: input,
            timestamp: Date.now()
        };

        // Optimistic UI update
        setMessages(prev => [...prev, tempMsg]);
        setInput('');

        await fetch(`/api/squads/${squadId}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, text: tempMsg.text })
        });
    };

    return (
        <div className="fixed bottom-0 right-4 md:right-8 z-40 w-full max-w-sm md:max-w-md">
            {/* Header / Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-void-black border border-deep-crimson/50 text-deep-crimson p-3 flex justify-between items-center font-mono text-xs tracking-widest hover:bg-deep-crimson/10 transition-colors rounded-t-lg"
            >
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-active-green animate-pulse' : 'bg-red-900'}`} />
                    ŞİFRELİ HAT // {squadId.substring(0, 8)}
                </div>
                <span>{isOpen ? '▼ GİZLE' : '▲ BAĞLAN'}</span>
            </button>

            {/* Chat Body */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 400, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-void-black/95 backdrop-blur-xl border-x border-b border-deep-crimson/30 flex flex-col overflow-hidden shadow-2xl"
                    >
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar font-mono text-xs">
                            {messages.length === 0 && (
                                <div className="text-center text-silver/30 py-10">
                                    -- BAĞLANTI KURULDU --<br />
                                    HİÇ SİNYAL YOK
                                </div>
                            )}

                            {messages.map((msg) => {
                                const isMe = msg.user === username;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] ${isMe ? 'text-active-green' : 'text-deep-crimson'}`}>
                                                {isMe ? 'BEN' : msg.user.toUpperCase()}
                                            </span>
                                            <span className="text-[8px] text-silver/30">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-3 max-w-[85%] border ${isMe
                                            ? 'border-active-green/30 bg-active-green/5 text-silver'
                                            : 'border-white/10 bg-white/5 text-stark-white'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
                            <span className="text-active-green font-mono py-2">{'>'}</span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-stark-white font-mono text-xs placeholder:text-silver/20"
                                placeholder="Komut veya mesaj girin..."
                            />
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
