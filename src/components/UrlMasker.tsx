'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function UrlMasker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // STEALTH MODE: Her URL değişiminde adres çubuğunu temizle
        // Admin Paneli HARİÇ (Debug ve navigasyon için gerekli)
        if (pathname.startsWith('/shadow-panel')) return;

        if (typeof window !== 'undefined') {
            // Mevcut hash'i koru (Alien Chat için), geri kalanı sil
            const hash = window.location.hash;
            const cleanUrl = '/' + (hash ? hash : '');

            window.history.replaceState(null, '', cleanUrl);
        }
    }, [pathname, searchParams]);

    return null; // Bu bileşen görünmezdir
}
