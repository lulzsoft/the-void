'use client';

import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import AlienChat from './AlienChat';

// SECRET (Obfuscated in real build, but here for demo)
const GHOST_SECRET = 'VOID_SIGNAL_ACCESS_KEY_X9';

export default function GhostLayer() {
    const [activeToken, setActiveToken] = useState<string | null>(null);

    useEffect(() => {
        // Teyit Mekanizması: Hash TOTP kontrolü
        const checkSignal = () => {
            const hash = window.location.hash.replace('#', '');
            if (!hash) return;

            // Generate Expected TOTP
            const totp = new OTPAuth.TOTP({
                issuer: 'Void',
                label: 'GhostAccess',
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromUTF8(GHOST_SECRET)
            });

            // Validate
            // We allow a window of +/- 1 delta (30s) for clock drift.
            const delta = totp.validate({ token: hash, window: 1 });

            if (delta !== null) {
                console.log('>> GHOST SIGNAL DETECTED. INJECTING PAYLOAD...');
                setActiveToken(hash); // Token'ı belleğe al

                // GÜVENLİK: Linki hemen patlat (URL'den sil)
                window.history.replaceState(null, '', ' ');
            } else {
                console.log('>> SIGNAL NOISE. IGNORING.');
            }
        };

        // Check on load
        checkSignal();

        // Check on hash change
        window.addEventListener('hashchange', checkSignal);
        return () => window.removeEventListener('hashchange', checkSignal);
    }, []);

    if (!activeToken) return null; // Ghost is invisible

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Pointer events none allows clicking through to the site, 
                but the Chat component inside will re-enable pointer events for itself */}
            <div className="pointer-events-auto">
                <AlienChat token={activeToken} />
            </div>
        </div>
    );
}
