'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SubliminalAudioProps {
    enabled: boolean;
    volume?: number;
}

export default function SubliminalAudio({ enabled, volume = 0.1 }: SubliminalAudioProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);

    // Binaural beats oluştur
    const startAudio = useCallback(() => {
        if (audioContextRef.current || isMuted) return;

        try {
            const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(audioContext.destination);

            // Sol kulak - 200Hz
            const oscLeft = audioContext.createOscillator();
            const panLeft = audioContext.createStereoPanner();
            oscLeft.frequency.value = 200;
            oscLeft.type = 'sine';
            panLeft.pan.value = -1;
            oscLeft.connect(panLeft);
            panLeft.connect(gainNode);
            oscLeft.start();
            oscillatorsRef.current.push(oscLeft);

            // Sağ kulak - 204Hz
            const oscRight = audioContext.createOscillator();
            const panRight = audioContext.createStereoPanner();
            oscRight.frequency.value = 204;
            oscRight.type = 'sine';
            panRight.pan.value = 1;
            oscRight.connect(panRight);
            panRight.connect(gainNode);
            oscRight.start();
            oscillatorsRef.current.push(oscRight);

            // Sub-bass drone
            const drone = audioContext.createOscillator();
            drone.frequency.value = 40;
            drone.type = 'sine';
            const droneGain = audioContext.createGain();
            droneGain.gain.value = 0.3;
            drone.connect(droneGain);
            droneGain.connect(gainNode);
            drone.start();
            oscillatorsRef.current.push(drone);

            setIsPlaying(true);
        } catch (error) {
            console.error('Ses başlatma hatası:', error);
        }
    }, [volume, isMuted]);

    const stopAudio = useCallback(() => {
        oscillatorsRef.current.forEach((osc) => {
            try {
                osc.stop();
                osc.disconnect();
            } catch {
                // Zaten durdurulmuş
            }
        });
        oscillatorsRef.current = [];

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsPlaying(false);
        setIsMuted(true);
    }, []);

    // enabled olduğunda hemen başlat
    useEffect(() => {
        if (enabled && !isMuted && !audioContextRef.current) {
            startAudio();
        }
    }, [enabled, isMuted, startAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            oscillatorsRef.current.forEach((osc) => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch { }
            });
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    if (!enabled) return null;

    return (
        <>
            {isPlaying && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={stopAudio}
                    className="fixed bottom-4 left-4 z-[100] font-mono text-xs text-deep-crimson/70 hover:text-deep-crimson transition-colors flex items-center gap-2 bg-void-black/80 px-3 py-2 border border-deep-crimson/30"
                >
                    <span className="w-2 h-2 bg-deep-crimson rounded-full animate-pulse" />
                    SESİ KAPAT
                </motion.button>
            )}
        </>
    );
}
