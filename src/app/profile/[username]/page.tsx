'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

// Holografik Kimlik Kartı Bileşeni
function IdentityCard({ profile }: { profile: any }) {
    if (!profile) return null;

    return (
        <div className="relative group perspective-1000">
            {/* Hologram Efekti */}
            <div className="absolute -inset-1 bg-gradient-to-r from-deep-crimson via-purple-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500 group-hover:duration-200" />

            <div className="relative bg-void-black border border-white/10 p-8 rounded-xl overflow-hidden backdrop-blur-sm">
                {/* Scanline Animasyonu */}
                <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-crimson/5 to-transparent translate-y-[-100%] animate-scan pointer-events-none" />

                {/* Üst Kısım: Avatar ve Temel Bilgi */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* Avatar Çerçevesi */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <div className="absolute inset-0 border-2 border-deep-crimson rounded-full animate-spin-slow opacity-50" style={{ borderStyle: 'dashed' }} />
                        <div className="absolute inset-2 border border-white/30 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center font-display text-4xl text-stark-white bg-white/5 rounded-full overflow-hidden">
                            {profile.codename?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-deep-crimson text-white text-[10px] px-2 py-1 rounded-full font-mono tracking-widest">
                            LVL {Math.floor(Math.random() * 10) + 1}
                        </div>
                    </div>

                    {/* İsim ve Rütbe */}
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <h1 className="font-display text-4xl md:text-5xl text-stark-white tracking-wider">
                                {profile.codename}
                            </h1>
                            <span className="w-2 h-2 bg-active-green rounded-full animate-pulse" title="Online" />
                        </div>
                        <p className="font-mono text-deep-crimson tracking-[0.3em] text-sm mb-4">
                            {profile.role === 'admin' ? 'SİSTEM YÖNETİCİSİ' : 'SAHA AJANI'}
                        </p>

                        {/* Statlar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                <div className="text-[10px] text-silver/50 font-mono">GÖREVLER</div>
                                <div className="text-xl text-stark-white font-display">12</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                <div className="text-[10px] text-silver/50 font-mono">BAŞARI</div>
                                <div className="text-xl text-active-green font-display">94%</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                <div className="text-[10px] text-silver/50 font-mono">REPUTATION</div>
                                <div className="text-xl text-purple-400 font-display">850</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alt Kısım: Detaylar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    {/* Yetenekler */}
                    <div>
                        <h3 className="font-mono text-xs text-silver/50 tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-deep-crimson" /> YETENEK MATRİSİ
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.split(',').map((skill: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-silver hover:border-deep-crimson/50 hover:text-white transition-colors cursor-default">
                                    {skill.trim()}
                                </span>
                            )) || <span className="text-silver/30 text-xs text-mono">Veri yok...</span>}
                        </div>
                    </div>

                    {/* Bio / Log */}
                    <div>
                        <h3 className="font-mono text-xs text-silver/50 tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-deep-crimson" /> SİSTEM KAYITLARI
                        </h3>
                        <p className="font-mono text-xs text-silver/70 leading-relaxed">
                            Ajan sisteme {new Date(profile.createdAt).toLocaleDateString()} tarihinde giriş yaptı.
                            Son aktivite: {new Date().toLocaleDateString()}.
                            Dayanıklılık seviyesi: {profile.painTolerance || 'Bilinmiyor'}.
                            Durum: <span className="text-active-green">{profile.status}</span>
                        </p>
                    </div>
                </div>

                {/* Footer Deco */}
                <div className="absolute bottom-2 right-4 font-mono text-[10px] text-white/10">
                    ID: {profile.id?.substring(0, 8).toUpperCase()} // ENC_V2
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const params = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gerçek API'den veri çekmece
        // Not: Şu an sadece mock data veya kendi profilimizi çekebiliriz.
        // İleride /api/users/[username] endpoint'i gerekecek.
        // Hızlı gösterim için şimdilik 'initiation' verilerinden veya mock'tan beslenelim.

        const fetchProfile = async () => {
            // Simule edilmiş veri (Backend entegrasyonu sonraki adımda yapılabilir)
            // Gerçekte: await fetch(`/api/users/${params.username}`)
            setTimeout(() => {
                setProfile({
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    codename: decodeURIComponent(params.username as string),
                    role: 'user',
                    status: 'ACTIVE',
                    createdAt: Date.now() - 10000000,
                    skills: 'React, Next.js, Cyber Security, UI Design',
                    painTolerance: 'Yüksek'
                });
                setLoading(false);
            }, 1000);
        };

        fetchProfile();
    }, [params.username]);

    return (
        <div className="min-h-screen bg-void-black text-stark-white p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header Nav */}
                <div className="flex justify-between items-center mb-12">
                    <a href="/" className="font-mono text-xs text-silver/50 hover:text-silver transition-colors">
                        ← ANA ÜS'SE DÖN
                    </a>
                    <div className="font-mono text-xs text-deep-crimson tracking-widest opacity-50">
                        PERSONEL DOSYASI
                    </div>
                </div>

                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center font-mono text-silver/50"
                    >
                        DOSYA ŞİFRESİ ÇÖZÜLÜYOR...
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <IdentityCard profile={profile} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
