'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface FrostedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function FrostedModal({ isOpen, onClose, title, children }: FrostedModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-void-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-void-black/40 border border-white/10 p-1 overflow-hidden shadow-2xl"
                    >
                        {/* Glass Effect Layer */}
                        <div className="absolute inset-0 backdrop-blur-md bg-white/5 noise" />

                        {/* Content Container */}
                        <div className="relative z-10 razor-border p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-4">
                                <h2 className="font-display text-2xl text-stark-white tracking-wide">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-silver/50 hover:text-deep-crimson transition-colors font-mono text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="font-mono text-silver/80 leading-relaxed space-y-4">
                                {children}
                            </div>
                        </div>

                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-deep-crimson/50" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-deep-crimson/50" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-deep-crimson/50" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-deep-crimson/50" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
