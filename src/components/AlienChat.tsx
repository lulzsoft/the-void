'use client';

import { useState, useEffect, useRef } from 'react';
import { joinRoom } from 'trystero/torrent';
import { AlienCrypto } from '@/lib/alien-crypto';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

export default function AlienChat({ token }: { token: string }) {
    const [messages, setMessages] = useState<{ id: number, sender: 'alien' | 'me', text: string, timestamp: number }[]>([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('SEARCHING_VOID...');
    const [peerCount, setPeerCount] = useState(0);
    const [room, setRoom] = useState<any>(null);
    const [sendP2P, setSendP2P] = useState<any>(null);

    // AUTO-DESTRUCT: Mesajları 30 saniye sonra sil
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            setMessages(prev => prev.filter(m => now - m.timestamp < 30000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // P2P BAĞLANTISI (Trystero)
        const initP2P = async () => {
            // Room ID = 'void-' + token (Böylece sadece aynı şifreye sahip olanlar birbirini bulur)
            const roomId = `void-signal-${token}`;

            // Konfigürasyon: Public Torrent Tracker'lar üzerinden işaretleşme (Serverless)
            const roomConfig = { appId: 'the-void-chat' };
            const p2pRoom = joinRoom(roomConfig, roomId);

            setRoom(p2pRoom);

            // Action: 'msg' kanalı
            const [sendAction, getAction] = p2pRoom.makeAction('msg');
            setSendP2P(() => sendAction);

            // Mesaj Geldiğinde
            getAction((data: any) => {
                // Şifreli mesajı çöz
                // PSK (Pre-Shared Key): Token'ın kendisi anahtarımız.
                // Basitlik için Token'ı hashleyip 32-byte key yapıyoruz.
                const key = nacl.hash(new TextEncoder().encode(token)).slice(0, 32);

                try {
                    const decrypted = AlienCrypto.decryptMessage(data, key);
                    if (decrypted) {
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            sender: 'alien',
                            text: decrypted,
                            timestamp: Date.now()
                        }]);
                    }
                } catch (e) {
                    console.error("Decryption failed", e);
                }
            });

            // Akran (Peer) Durumları
            p2pRoom.onPeerJoin(() => {
                setPeerCount(prev => prev + 1);
                setStatus(`UPLINK_ESTABLISHED`);
            });

            p2pRoom.onPeerLeave(() => {
                setPeerCount(prev => Math.max(0, prev - 1));
            });
        };

        if (token) initP2P();
    }, [token]);

    // Status update based on peers
    useEffect(() => {
        if (peerCount > 0) setStatus(`${peerCount} ACTIVE_NODES`);
        else setStatus('SCANNING_FOR_PEERS...');
    }, [peerCount]);


    const sendMessage = async () => {
        if (!input.trim() || !sendP2P) return;

        const msgText = input;

        // 1. Kendi ekranına yaz (LOCAL)
        setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: msgText, timestamp: Date.now() }]);
        setInput('');

        // 2. Şifrele ve Ağa Gönder (P2P)
        // Anahtar türetme (PSK)
        const key = nacl.hash(new TextEncoder().encode(token)).slice(0, 32);
        const encrypted = AlienCrypto.encryptMessage(msgText, key);

        // Gönder (Echo yok, sadece karşıya gider)
        sendP2P(encrypted);
    };

    return (
        /* MOBILE ADAPTATION: 
           - sm:w-96 (Desktop: Fixed width)
           - w-full (Mobile: Full width)
           - h-[50vh] (Mobile: Half screen)
           - sm:h-96 (Desktop: Fixed height)
           - bottom-0 (Mobile: Stick to bottom)
        */
        <div className="fixed bottom-0 right-0 w-full h-[50vh] sm:h-96 sm:w-96 sm:bottom-4 sm:right-4 bg-black border-t-2 sm:border border-green-500 font-mono text-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)] z-50 p-4 flex flex-col bg-opacity-95 backdrop-blur-md">
            <div className="border-b border-green-500 pb-2 mb-2 flex justify-between items-center">
                <span className="text-xs sm:text-sm">:: VOID_SIGNAL ::</span>
                <span className="animate-pulse text-xs text-right">{status}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                {messages.length === 0 && <div className="text-center opacity-30 mt-10">WAITING FOR SIGNAL...</div>}
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-1 text-sm sm:text-base ${m.sender === 'me' ? 'text-white border-r-2 border-green-500 pr-2' : 'text-green-400 border-l-2 border-green-500 pl-2'}`}>
                            {m.sender === 'alien' ? '>' : ''} {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 flex gap-2 border-t border-green-500 pt-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="bg-transparent border-none outline-none w-full text-green-500 placeholder-green-800"
                    placeholder="ENTER COMMAND..."
                    autoFocus
                />
                <button onClick={sendMessage} className="hover:text-white px-2">&gt;&gt;</button>
            </div>
        </div>
    );
}
