
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Helper for initials
const getInitials = (name: string) => (name || '?').substring(0, 2).toUpperCase();

// Helper for color by rank
const getRankColor = (role: string) => {
    switch (role) {
        case 'ELİT': return 'text-amber-500';
        case 'AJAN': return 'text-deep-crimson';
        case 'GÖZCÜ': default: return 'text-silver/70';
    }
};

export default function SanctumPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [messages, setMessages] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState<any[]>([]); // Will contain {codename, role, score}
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    router.push('/login');
                }
            } catch (e) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (!user) return;

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/sanctum', { cache: 'no-store' });
            if (res.status === 403) {
                setError("ERİŞİM ENGELLENDİ. SÜRGÜN EDİLDİNİZ.");
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                setActiveUsers(data.users || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;
        await sendMessage(inputText, 'text');
    };

    const sendMessage = async (content: string, type: 'text' | 'image' | 'file', fileData?: string) => {
        setSending(true);
        setWarning(null);

        try {
            const res = await fetch('/api/sanctum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: content,
                    author: user.codename,
                    type,
                    fileData
                })
            });

            const data = await res.json();

            if (res.status === 403) {
                setError("ERİŞİM ENGELLENDİ. SÜRGÜN EDİLDİNİZ.");
                setInputText('');
                return;
            }

            if (data.flagged) {
                setWarning(data.message);
                setTimeout(() => setWarning(null), 4000);
            }

            if (data.success) {
                setInputText('');
                fetchMessages();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 1024 * 1024 * 50) { // 50MB Limit
            setWarning("DOSYA BOYUTU ÇOK YÜKSEK (LİMİT: 50MB). İLETİM REDDEDİLDİ.");
            setTimeout(() => setWarning(null), 4000);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setWarning("DOSYA YÜKLENİYOR..."); // Temporary loading state

        try {
            const uploadRes = await fetch('/api/sanctum/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;
            const type = file.type.startsWith('image/') ? 'image' : 'file';

            await sendMessage(file.name, type, fileUrl);
            setWarning(null);

        } catch (err) {
            console.error(err);
            setWarning("YÜKLEME HATASI OLUŞTU.");
            setTimeout(() => setWarning(null), 4000);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Grouping Users
    const elites = activeUsers.filter(u => u.role === 'ELİT');
    const agents = activeUsers.filter(u => u.role === 'AJAN');
    const scouts = activeUsers.filter(u => u.role === 'GÖZCÜ');

    if (loading) return <div className="min-h-screen bg-void-black text-white flex items-center justify-center font-mono animate-pulse">BAĞLANTI KURULUYOR...</div>;
    if (!user) return null;

    if (error) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center text-deep-crimson font-mono text-xl animate-pulse">
                {error}
            </div>
        );
    }

    const isUserBanned = user.role === 'BANNED' || user.status === 'REJECTED';
    if (isUserBanned) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center text-deep-crimson font-mono text-xl">
                ERİŞİMİNİZ ENGİZİSYON TARAFINDAN SONLANDIRILDI.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-void-black overflow-hidden font-mono relative">
            {/* Warning Overlay */}
            <AnimatePresence>
                {warning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-0 right-0 z-[60] flex justify-center pointer-events-none"
                    >
                        <div className="bg-void-black/95 text-deep-crimson px-6 py-4 border border-deep-crimson shadow-[0_0_30px_rgba(136,0,0,0.4)] flex items-center gap-3 rounded-sm">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="font-bold tracking-widest text-xs">ENGİZİSYON UYARISI</p>
                                <p className="text-xs opacity-80">{warning}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-void-black relative">
                <header className="shrink-0 h-16 border-b border-white/10 flex items-center justify-between px-6 bg-void-black/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl text-silver">#</span>
                        <div className="font-display text-lg text-stark-white tracking-[0.2em]">LEJYON</div>
                    </div>
                    <div className="text-xs text-silver/40">
                        BAĞLI: <span className="text-stark-white">{activeUsers.length}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {messages.map((msg, i) => {
                        const isMe = msg.author === user.codename;
                        const prevMsg = messages[i - 1];
                        const isSameAuthor = prevMsg && prevMsg.author === msg.author;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 group ${isSameAuthor ? 'mt-1' : 'mt-4'}`}
                            >
                                {/* Avatar Column */}
                                <div className="w-10 flex-shrink-0 flex flex-col items-center">
                                    {!isSameAuthor ? (
                                        <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-silver/50 font-bold text-xs group-hover:border-deep-crimson/50 transition-colors">
                                            {getInitials(msg.author)}
                                        </div>
                                    ) : (
                                        <div className="w-px h-full bg-transparent group-hover:bg-white/5" />
                                    )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    {!isSameAuthor && (
                                        <div className="flex items-baseline gap-3 mb-1">
                                            <span className={`text-sm font-bold ${isMe ? 'text-amber-500' : 'text-crimson-red'}`}>
                                                {msg.author}
                                            </span>
                                            <span className="text-[10px] text-silver/30">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Message Body */}
                                    <div className={`text-sm text-silver/90 leading-relaxed whitespace-pre-wrap break-words ${isMe ? 'opacity-100' : 'opacity-90'}`}>
                                        {msg.type === 'image' && msg.fileData ? (
                                            <div className="mt-1">
                                                <img
                                                    src={msg.fileData}
                                                    alt="Görsel Eklentisi"
                                                    className="max-w-xs md:max-w-md rounded border border-white/10 hover:border-deep-crimson/50 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        const w = window.open("");
                                                        w?.document.write(`<img src="${msg.fileData}" />`);
                                                    }}
                                                />
                                                <div className="text-[10px] text-silver/40 mt-1 flex gap-2">
                                                    <span>[GÖRSEL]</span>
                                                    <span>{msg.text}</span>
                                                </div>
                                            </div>
                                        ) : msg.type === 'file' && msg.fileData ? (
                                            <div className="mt-1">
                                                <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors max-w-sm">
                                                    <div className="text-2xl">📄</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-stark-white truncate">{msg.text}</div>
                                                        <div className="text-[10px] text-silver/50">DOSYA EKLENTİSİ</div>
                                                    </div>
                                                    <a
                                                        href={msg.fileData}
                                                        download={msg.text}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] border border-white/20 px-2 py-1 hover:bg-white/20 text-stark-white transition-colors cursor-pointer no-underline"
                                                    >
                                                        İNDİR
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={bottomRef} className="h-4" />
                </div>

                <div className="p-4 mx-4 mb-4">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 focus-within:border-deep-crimson/50 focus-within:ring-1 focus-within:ring-deep-crimson/50 transition-all w-full max-w-full"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 cursor-pointer text-silver/50 transition-colors shrink-0"
                            title="Dosya Ekle"
                        >
                            +
                        </button>
                        <input
                            id="chat-input"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-stark-white placeholder:text-silver/20 font-mono text-sm py-2 min-w-0"
                            placeholder={`Mesaj gönder #${user.codename}...`}
                            disabled={sending}
                        />
                        <button type="submit" className="text-[10px] text-silver/30 mr-2 hidden md:block hover:text-white transition-colors shrink-0">
                            ENTER
                        </button>
                    </form>
                </div>
            </main>

            {/* Right Sidebar - Professional Member List */}
            <aside className="hidden md:flex w-72 bg-void-black border-l border-white/10 flex-col shrink-0">
                <header className="h-16 border-b border-white/10 flex items-center px-4 shrink-0">
                    <div className="text-xs font-bold text-silver/50 tracking-widest uppercase">
                        ÜYELER — {activeUsers.length}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                    {/* Elite Section */}
                    {elites.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-active-green/70 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> ELİT KADRO — {elites.length}
                            </h3>
                            <div className="space-y-1">
                                {elites.map(u => <MemberItem key={u.codename} user={u} current={user.codename} />)}
                            </div>
                        </div>
                    )}

                    {/* Agent Section */}
                    {agents.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-deep-crimson/70 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-deep-crimson" /> SAHA AJANLARI — {agents.length}
                            </h3>
                            <div className="space-y-1">
                                {agents.map(u => <MemberItem key={u.codename} user={u} current={user.codename} />)}
                            </div>
                        </div>
                    )}

                    {/* Scout Section */}
                    {scouts.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-silver/40 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-silver/40" /> GÖZCÜLER — {scouts.length}
                            </h3>
                            <div className="space-y-1">
                                {scouts.map(u => <MemberItem key={u.codename} user={u} current={user.codename} />)}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

// Sub-component for member list item
function MemberItem({ user, current }: { user: any, current: string }) {
    const isMe = user.codename === current;
    return (
        <div className={`flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-default group ${isMe ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <div className="relative">
                <div className={`w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold ${getRankColor(user.role)}`}>
                    {getInitials(user.codename)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-void-black rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium truncate ${isMe ? 'text-stark-white' : 'text-silver'}`}>
                        {user.codename}
                    </span>
                    {isMe && <span className="text-[8px] bg-white/10 px-1 rounded text-silver/50">SEN</span>}
                </div>
                <div className="text-[10px] text-silver/30 truncate group-hover:text-silver/50">
                    {user.role}
                </div>
            </div>
        </div>
    );
}
