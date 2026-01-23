'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-void-black text-deep-crimson flex flex-col items-center justify-center p-4 font-mono">
            <h1 className="text-6xl mb-4 font-display glitch-text">SİSTEM HATASI</h1>
            <div className="border border-deep-crimson/50 p-6 max-w-md w-full bg-black/50 backdrop-blur">
                <p className="text-xl mb-4 tracking-widest">ÇEKİRDEK ÇÖKÜNTÜSÜ</p>
                <div className="text-[10px] bg-black/80 p-2 mb-6 font-mono text-silver/50 overflow-auto max-h-32">
                    {error.message || 'Bilinmeyen bir hata oluştu.'}
                    {error.digest && <div className="mt-1 text-deep-crimson">Digest: {error.digest}</div>}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex-1 py-3 text-center bg-deep-crimson text-white hover:bg-red-600 transition-all uppercase tracking-widest text-xs"
                    >
                        Sistemi Yeniden Başlat
                    </button>
                    <a
                        href="/"
                        className="flex-1 py-3 text-center border border-white/20 text-silver hover:border-white hover:text-white transition-all uppercase tracking-widest text-xs"
                    >
                        Ana Ekrana Dön
                    </a>
                </div>
            </div>
        </div>
    );
}
