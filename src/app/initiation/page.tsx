'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import TypewriterText from '@/components/ui/TypewriterText';
import { useInitiationState } from '@/lib/store';
import { rastgeleSoruAl, type KapiciMesaj } from '@/lib/openai';

const LiquidBackground = dynamic(
    () => import('@/components/webgl/LiquidBackground'),
    { ssr: false }
);

export default function InitiationPage() {
    const { phase, messages, verdict, score, setPhase, addMessage, setVerdict, reset } = useInitiationState();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Client-side only rendering for WebGL
    useEffect(() => {
        setMounted(true);
    }, []);

    // İlk soru ile başlat veya eksikse tamamla
    useEffect(() => {
        if (phase === 'intro') {
            const timer = setTimeout(() => {
                // Yeni pozitif ama zorlu açılış sorusu:
                const opener = "BOŞLUK'a katılmak için neden burada olduğunu açıkla. Ne değiştirmek istiyorsun?";
                addMessage({ role: 'gatekeeper', content: opener });
                setPhase('questioning');
            }, 2000);
            return () => clearTimeout(timer);
        } else if (phase === 'questioning' && messages.length === 0) {
            // Eğer sayfa yenilendiyse ve mesajlar boşsa ama questioning fazındaysak
            const opener = "BOŞLUK'a katılmak için neden burada olduğunu açıkla. Ne değiştirmek istiyorsun?";
            addMessage({ role: 'gatekeeper', content: opener });
        }
    }, [phase, setPhase, messages.length, addMessage]);

    // Yeni mesajlarda aşağı kaydır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mesaj gönderimi
    const handleSubmit = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        setInput('');
        addMessage({ role: 'user', content: userMessage });
        setIsTyping(true);

        // AI için konuşma geçmişini hazırla
        const conversationHistory: KapiciMesaj[] = messages.map((m) => ({
            role: m.role === 'gatekeeper' ? 'assistant' : 'user',
            content: m.content,
        }));

        conversationHistory.push({ role: 'user', content: userMessage });

        try {
            // Kapıcı API route'unu çağır (Gemini AI kullanır)
            const response = await fetch('/api/gatekeeper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: conversationHistory,
                }), // old currentQuestion removed
            });

            const data = await response.json();

            addMessage({ role: 'gatekeeper', content: data.message });

            if (data.evaluation) {
                setVerdict(data.evaluation.verdict, data.evaluation.score);
            }
        } catch (error) {
            console.error('Kapıcı hatası:', error);
            addMessage({
                role: 'gatekeeper',
                content: 'Boşluk kıpırdıyor... ama sessiz kalıyor. Tekrar dene.'
            });
        } finally {
            setIsTyping(false);
        }
    };

    // Tuş basımı
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Hüküm metinleri - Türkçe
    const verdictTexts = {
        ADMITTED: "Boşluk içinde bir şeyi tanıyor. Zamanı geldiğinde seninle iletişime geçilecek. Bekle. İzle. Dinle.",
        PENDING: "Henüz hazır değilsin. Ama içinde potansiyel kıpırdıyor. Büyüdüğünde geri dön. Boşluk sabırlıdır.",
        REJECTED: "Boşluk seni tanımıyor. Bu yol senin için değil. Bu yeri unut. Burada hiç bulunmadığını varsay."
    };

    const verdictTitles = {
        ADMITTED: "KABUL EDİLDİ",
        PENDING: "BEKLEMEDE",
        REJECTED: "REDDEDİLDİ"
    };

    return (
        <main className="relative min-h-screen bg-void-black">
            {mounted && <LiquidBackground />}

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Başlık */}
                <header className="p-8 flex justify-between items-center">
                    <a href="/" className="font-mono text-xs text-silver/50 hover:text-silver transition-colors tracking-wider">
                        ← BOŞLUĞA DÖN
                    </a>
                    <div className="font-mono text-xs text-silver/30 tracking-wider">
                        KAPICI
                    </div>
                </header>

                {/* Üst Çizgi */}
                <div className="razor-line w-full pulse-crimson" />

                {/* Ana İçerik */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-2xl">

                        {/* Giriş Aşaması */}
                        <AnimatePresence mode="wait">
                            {phase === 'intro' && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <h1 className="font-display text-4xl md:text-6xl text-stark-white mb-8">
                                        <TypewriterText text="KEŞİF GÖRÜŞMESİ" speed={100} />
                                    </h1>
                                    <p className="font-mono text-silver/70 text-sm">
                                        <TypewriterText
                                            text="Sizi tanımak istiyoruz. Sohbet edelim."
                                            speed={50}
                                            delay={1000}
                                        />
                                    </p>
                                </motion.div>
                            )}

                            {/* Sorgulama Aşaması */}
                            {phase === 'questioning' && (
                                <motion.div
                                    key="questioning"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Konuşma Geçmişi */}
                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: message.role === 'gatekeeper' ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                                className={`flex ${message.role === 'gatekeeper' ? 'justify-start' : 'justify-end'} mb-6`}
                                            >
                                                <div className={`max-w-[85%] md:max-w-[70%] ${message.role === 'gatekeeper' ? 'text-left' : 'text-right'}`}>
                                                    {/* Role indicator */}
                                                    <div className={`flex items-center gap-2 mb-2 ${message.role === 'gatekeeper' ? 'justify-start' : 'justify-end'}`}>
                                                        {message.role === 'gatekeeper' && (
                                                            <span className="w-1 h-1 bg-deep-crimson rounded-full animate-pulse" />
                                                        )}
                                                        <span className="font-mono text-[10px] text-silver/40 tracking-[0.2em]">
                                                            {message.role === 'gatekeeper' ? 'KAPICI.SYS' : 'ADAY.USR'} // {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Message Content */}
                                                    <div className={`relative p-4 md:p-6 border 
                                                        ${message.role === 'gatekeeper'
                                                            ? 'border-white/10 bg-white/5 text-silver'
                                                            : 'border-deep-crimson/30 bg-deep-crimson/5 text-stark-white'
                                                        }`}>
                                                        {/* Decorative corner markers */}
                                                        {message.role === 'gatekeeper' ? (
                                                            <>
                                                                <div className="absolute top-0 left-0 w-1 h-1 bg-white/30" />
                                                                <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/30" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="absolute top-0 right-0 w-1 h-1 bg-deep-crimson/50" />
                                                                <div className="absolute bottom-0 left-0 w-1 h-1 bg-deep-crimson/50" />
                                                            </>
                                                        )}

                                                        <p className={`font-mono leading-relaxed whitespace-pre-wrap ${index === 0 && message.role === 'gatekeeper'
                                                                ? 'font-display text-xl md:text-2xl text-stark-white'
                                                                : 'text-sm md:text-base'
                                                            }`}>
                                                            {message.role === 'gatekeeper' ? (
                                                                <TypewriterText text={message.content} speed={15} />
                                                            ) : (
                                                                message.content
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Yazıyor göstergesi */}
                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-left"
                                            >
                                                <span className="font-mono text-xs text-silver/30 tracking-wider mb-2 block">
                                                    KAPICI
                                                </span>
                                                <p className="font-mono text-base text-silver">
                                                    <span className="flicker">düşünüyor...</span>
                                                </p>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Giriş Alanı - Cyber Style */}
                                    <div className="mt-8 relative z-20">
                                        <div className="group relative">
                                            {/* Glow Effect Background */}
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-deep-crimson/50 to-void-black rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-100 group-focus-within:duration-200" />

                                            <div className="relative bg-void-black border border-white/10 group-focus-within:border-deep-crimson/80 p-6 transition-colors duration-300">
                                                {/* Corner Accents */}
                                                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-silver/50" />
                                                <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-silver/50" />
                                                <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-silver/50" />
                                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-silver/50" />

                                                <textarea
                                                    ref={inputRef}
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Sinyal gönder..."
                                                    className="w-full bg-transparent font-mono text-stark-white text-base 
                                                        resize-none focus:outline-none placeholder:text-silver/20 tracking-wide"
                                                    rows={2}
                                                    disabled={isTyping}
                                                />

                                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-deep-crimson animate-pulse' : 'bg-active-green'}`} />
                                                        <span className="font-mono text-[10px] text-silver/30 tracking-widest uppercase">
                                                            {isTyping ? 'BAĞLANTI MEŞGUL' : 'SİSTEM HAZIR'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="font-mono text-[10px] text-silver/20">
                                                            {input.length} / 500
                                                        </span>
                                                        <button
                                                            onClick={handleSubmit}
                                                            disabled={!input.trim() || isTyping}
                                                            className="font-mono text-xs tracking-widest text-stark-white hover:text-deep-crimson disabled:text-silver/20 disabled:cursor-not-allowed transition-colors uppercase flex items-center gap-2 group/btn"
                                                        >
                                                            <span>{isTyping ? 'İŞLENİYOR' : 'GÖNDER'}</span>
                                                            <span className="text-lg leading-none group-hover/btn:translate-x-1 transition-transform">→</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Hüküm Aşaması */}
                            {phase === 'verdict' && verdict && (
                                <motion.div
                                    key="verdict"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="mb-12">
                                        <p className="font-mono text-xs text-silver/50 tracking-widest mb-8">
                                            HÜKÜM VERİLDİ
                                        </p>
                                        <h2
                                            className={`font-display text-6xl md:text-8xl mb-4 ${verdict === 'ADMITTED'
                                                ? 'text-stark-white'
                                                : verdict === 'PENDING'
                                                    ? 'text-silver'
                                                    : 'text-deep-crimson'
                                                }`}
                                        >
                                            {verdictTitles[verdict]}
                                        </h2>
                                        {score !== null && (
                                            <p className="font-mono text-xs text-silver/30 tracking-wider">
                                                REZONANS PUANI: {score.toFixed(1)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Hükme özel mesajlar */}
                                    <div className="max-w-md mx-auto mb-12">
                                        <p className="font-mono text-silver leading-relaxed">
                                            <TypewriterText
                                                text={verdictTexts[verdict]}
                                                speed={40}
                                            />
                                        </p>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        {verdict === 'ADMITTED' ? (
                                            <>
                                                {/* @ts-ignore */}
                                                {(messages[messages.length - 1]?.content?.includes('MÜHÜR') || verdictTexts[verdict].includes('kimlik doğrulandı')) ? (
                                                    <a href="/sanctum" className="btn-void text-xs">
                                                        KAPIYI AÇ (GİRİŞ)
                                                    </a>
                                                ) : (
                                                    <a href="/initiation/success" className="btn-void text-xs">
                                                        KAYDI TAMAMLA
                                                    </a>
                                                )}

                                                <button onClick={reset} className="btn-void text-xs">
                                                    TEKRAR (DEBUG)
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <a href="/" className="btn-void text-xs">
                                                    GERİ DÖN
                                                </a>
                                                <button onClick={reset} className="btn-void text-xs">
                                                    TEKRAR BAŞLA (DEBUG MODU)
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Alt Çizgi */}
                <div className="razor-line w-full pulse-crimson" />

                {/* Alt Bilgi */}
                <footer className="p-8 flex justify-center">
                    <span className="font-mono text-xs text-silver/20 tracking-wider">
                        TÜM YANITLAR KAYDEDİLMEKTEDİR
                    </span>
                </footer>
            </div>
        </main>
    );
}
