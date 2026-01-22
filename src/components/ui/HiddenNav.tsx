'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

interface NavItem {
    label: string;
    href: string;
}

interface HiddenNavProps {
    items: NavItem[];
    holdDuration?: number;
}

export default function HiddenNav({ items, holdDuration = 3000 }: HiddenNavProps) {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const holdStartRef = useRef<number | null>(null);
    const animationRef = useRef<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Basılı tutma kontrolü
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (isOpen) return;
            if ((e.target as HTMLElement).closest('a, button')) return;

            // Ekranın ortasında mı kontrol et (200px yarıçap)
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const distance = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
            );

            if (distance < 200) {
                setIsHolding(true);
                holdStartRef.current = Date.now();

                const animate = () => {
                    if (holdStartRef.current) {
                        const elapsed = Date.now() - holdStartRef.current;
                        const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
                        setProgress(newProgress);

                        if (newProgress >= 100) {
                            setIsOpen(true);
                            setIsHolding(false);
                            setProgress(0);
                        } else {
                            animationRef.current = requestAnimationFrame(animate);
                        }
                    }
                };

                animationRef.current = requestAnimationFrame(animate);
            }
        };

        const handleMouseUp = () => {
            setIsHolding(false);
            setProgress(0);
            holdStartRef.current = null;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (isOpen) return;
            if ((e.target as HTMLElement).closest('a, button')) return;

            const touch = e.touches[0];
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const distance = Math.sqrt(
                Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2)
            );

            if (distance < 200) {
                setIsHolding(true);
                holdStartRef.current = Date.now();
                e.preventDefault(); // Prevent scroll/context menu

                const animate = () => {
                    if (holdStartRef.current) {
                        const elapsed = Date.now() - holdStartRef.current;
                        const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
                        setProgress(newProgress);

                        if (newProgress >= 100) {
                            setIsOpen(true);
                            setIsHolding(false);
                            setProgress(0);
                        } else {
                            animationRef.current = requestAnimationFrame(animate);
                        }
                    }
                };
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        const handleTouchEnd = () => handleMouseUp();

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('keydown', handleKeyDown);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [holdDuration, isOpen]);

    // Menü açıldığında animasyon
    useEffect(() => {
        if (isOpen && menuRef.current) {
            const items = menuRef.current.querySelectorAll('.nav-item');
            gsap.fromTo(
                items,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: 'power3.out'
                }
            );
        }
    }, [isOpen]);

    return (
        <>
            {/* İlerleme Göstergesi */}
            <AnimatePresence>
                {isHolding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="relative w-32 h-32">
                            {/* Dış halka */}
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    fill="none"
                                    stroke="rgba(192, 192, 192, 0.1)"
                                    strokeWidth="1"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    fill="none"
                                    stroke="#880000"
                                    strokeWidth="1"
                                    strokeDasharray={`${2 * Math.PI * 60}`}
                                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                                    className="transition-all duration-100"
                                />
                            </svg>
                            {/* Orta metin */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-mono text-xs text-silver/50">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigasyon Menüsü */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-void-black/95 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            ref={menuRef}
                            className="h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Kapat butonu */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-8 right-8 font-mono text-xs text-silver/50 hover:text-silver transition-colors"
                            >
                                KAPAT [ESC]
                            </button>

                            {/* Nav öğeleri */}
                            <nav className="space-y-8">
                                {items.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.href}
                                        className="nav-item block text-center group"
                                    >
                                        <span className="font-mono text-xs text-silver/30 tracking-widest group-hover:text-deep-crimson transition-colors">
                                            0{index + 1}
                                        </span>
                                        <span className="block font-display text-4xl md:text-6xl text-stark-white group-hover:text-silver transition-colors mt-2">
                                            {item.label}
                                        </span>
                                    </a>
                                ))}
                            </nav>

                            {/* Alt ipucu */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                <p className="font-mono text-xs text-silver/20 tracking-wider">
                                    KAPATMAK IÇIN HERHANGI BİR YERE TIKLA
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
