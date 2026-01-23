'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    glitchIntensity?: 'none' | 'low' | 'medium' | 'high';
    mode?: 'classic' | 'decoding';
    onComplete?: () => void;
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>/?1234567890qwertyuiopasdfghjklzxcvbnm';

export default function TypewriterText({
    text,
    speed = 50,
    delay = 0,
    className = '',
    glitchIntensity = 'none',
    mode = 'classic',
    onComplete,
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);

    // For decoding logic
    const [decodedText, setDecodedText] = useState('');

    const indexRef = useRef(0);
    const frameRef = useRef(0);

    // Classic Typewriter Logic
    useEffect(() => {
        if (mode !== 'classic') return;

        setDisplayedText('');
        indexRef.current = 0;
        setIsComplete(false);

        const delayTimer = setTimeout(() => {
            const interval = setInterval(() => {
                if (indexRef.current < text.length) {
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
    }, [text, speed, delay, onComplete, mode]);

    // Decoding Matrix Logic
    useEffect(() => {
        if (mode !== 'decoding') return;

        setDisplayedText(text.split('').map(() => ' ').join('')); // Placeholder
        setIsComplete(false);
        let iteration = 0;

        const delayTimer = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayedText(prev => text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                    setIsComplete(true);
                    onComplete?.();
                }

                iteration += 1 / 3; // Slower reveal than pure random
            }, 30); // Fast matrix flicker

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(delayTimer);

    }, [text, delay, onComplete, mode]);

    // Glitch effect (Common)
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
            {!isComplete && mode === 'classic' && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-deep-crimson inline-block ml-1"
                >
                    |
                </motion.span>
            )}
        </span>
    );
}
