'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    timestamp: number;
    read: boolean;
}

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastRefreshed, setLastRefreshed] = useState(Date.now());

    // Fetch Notifications
    const fetchNotifications = async (silent = false) => {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            const data = await res.json();

            if (data.notifications) {
                setNotifications(prev => {
                    const newItems = data.notifications;
                    // Check for new unread items for toast
                    // If not silent (initial load), show toasts for very recent items (< 10s)
                    return newItems;
                });

                const unread = data.notifications.filter((n: Notification) => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Initial load and Polling
    useEffect(() => {
        fetchNotifications(true); // Initial fetch

        const interval = setInterval(() => {
            fetchNotifications(true);
        }, 10000); // 10 seconds poll

        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true })
            });
        } catch (e) {
            console.error('Failed to mark read', e);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            markAllRead();
        }
    };

    return (
        <>
            {/* Bell Icon (Fixed Top Right) */}
            <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
                {/* User Profile Link (Mini) */}
                <a href="/profile/me" className="hidden md:flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full border border-white/20 bg-void-black flex items-center justify-center text-[10px] text-silver group-hover:border-deep-crimson transition-colors">
                        ME
                    </div>
                </a>

                <button
                    onClick={toggleOpen}
                    className="relative w-10 h-10 flex items-center justify-center bg-void-black/80 backdrop-blur-md border border-white/10 rounded-full hover:border-deep-crimson transition-colors group"
                >
                    <span className="text-lg group-hover:scale-110 transition-transform">🔔</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-deep-crimson text-[9px] flex items-center justify-center rounded-full text-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-20 right-6 z-50 w-80 md:w-96 bg-void-black/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <span className="font-mono text-xs text-silver tracking-widest">SİSTEM BİLDİRİMLERİ</span>
                            <button
                                onClick={markAllRead}
                                className="text-[10px] text-deep-crimson hover:underline"
                            >
                                TÜMÜNÜ OKU
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-silver/30 font-mono text-xs">
                                    SESSİZLİK HAKİM...
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-deep-crimson/5' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-display text-sm ${notif.type === 'alert' ? 'text-deep-crimson' : 'text-stark-white'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[9px] text-silver/40 font-mono">
                                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-silver/70 leading-relaxed font-mono">
                                            {notif.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Alerts (Recent Unread, < 10s old) */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.slice(0, 3).map((notif) => (
                        !notif.read && (Date.now() - notif.timestamp < 10000) && (
                            <motion.div
                                key={`toast-${notif.id}`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="pointer-events-auto bg-void-black border border-deep-crimson/50 p-4 shadow-lg backdrop-blur flex items-start gap-3 w-80"
                            >
                                <div className="w-1 h-full bg-deep-crimson absolute left-0 top-0" />
                                <div>
                                    <h5 className="font-mono text-xs text-deep-crimson tracking-wider mb-1">{notif.title}</h5>
                                    <p className="font-mono text-[10px] text-silver">{notif.message}</p>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}
