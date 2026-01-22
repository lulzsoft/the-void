'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    glitchIntensity?: 'none' | 'low' | 'medium' | 'high';
    onComplete?: () => void;
}

export default function TypewriterText({
    text,
    speed = 50,
    delay = 0,
    className = '',
    glitchIntensity = 'none',
    onComplete,
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        // Reset on text change
        setDisplayedText('');
        indexRef.current = 0;
        setIsComplete(false);

        // Start after delay
        const delayTimer = setTimeout(() => {
            const interval = setInterval(() => {
                if (indexRef.current < text.length) {
                    // Karakteri doğrudan al - spread kullanma
                    setDisplayedText(text.substring(0, indexRef.current + 1));
                    indexRef.current++;
                } else {
                    clearInterval(interval);
                    setIsComplete(true);
                    onComplete?.();
                }
            }, speed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(delayTimer);
    }, [text, speed, delay, onComplete]);

    // Glitch effect
    useEffect(() => {
        if (glitchIntensity === 'none' || !isComplete) return;

        const glitchChance = {
            low: 0.02,
            medium: 0.05,
            high: 0.1,
        }[glitchIntensity];

        const interval = setInterval(() => {
            if (Math.random() < glitchChance) {
                setIsGlitching(true);
                setTimeout(() => setIsGlitching(false), 100 + Math.random() * 200);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [glitchIntensity, isComplete]);

    return (
        <span
            className={`${className} ${isGlitching ? 'glitch' : ''}`}
            data-text={isGlitching ? text : undefined}
        >
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-deep-crimson"
                >
                    |
                </motion.span>
            )}
        </span>
    );
}
