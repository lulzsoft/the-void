'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import IDCard from '@/components/profile/IDCard';
import RadarChart from '@/components/profile/RadarChart';
import HUDFrame from '@/components/ui/HUDFrame';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Mock Data Simulation
            setTimeout(() => {
                setProfile({
                    id: 'OP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    codename: decodeURIComponent(params.username as string).toUpperCase(),
                    role: 'FIELD OPERATIVE',
                    status: 'ACTIVE',
                    createdAt: Date.now() - 10000000,
                    painTolerance: 'HIGH',
                    xp: 1250,
                    stats: {
                        "TACTICS": 85,
                        "STEALTH": 60,
                        "INTEL": 92,
                        "TECH": 78,
                        "COMBAT": 45
                    }
                });
                setLoading(false);
            }, 1000);
        };

        fetchProfile();
    }, [params.username]);

    return (
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center relative">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5" />
            </div>

            <div className="w-full max-w-5xl relative z-10">
                {/* Back Nav */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-8 font-mono text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>{'<'}</span> RETURN TO BASE
                </button>

                {loading ? (
                    <div className="text-center font-mono text-xs text-silver/50 animate-pulse">
                        DECRYPTING PERSONNEL FILE...
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-8"
                    >
                        {/* LEFT COLUMN: ID Card & Core Info */}
                        <div className="md:col-span-5 space-y-8">
                            <IDCard profile={profile} />

                            <HUDFrame cornerLabel="BIO_METRICS" status="neutral">
                                <div className="p-6 space-y-4">
                                    <BioRow label="HEART_RATE" value="62 BPM" />
                                    <BioRow label="CORTISOL" value="NORMAL" />
                                    <BioRow label="NEURAL_SYNC" value="98.4%" color="text-active-green" />
                                    <div className="pt-4 border-t border-white/5">
                                        <p className="font-mono text-[9px] text-white/30 leading-relaxed">
                                            Subject displays exceptional cognitive stability under pressure. Recommended for high-risk surveillance operations.
                                        </p>
                                    </div>
                                </div>
                            </HUDFrame>
                        </div>

                        {/* RIGHT COLUMN: Service Record & Stats */}
                        <div className="md:col-span-7 space-y-8">
                            {/* Stats Radar */}
                            <HUDFrame cornerLabel="SKILL_MATRIX" status="active">
                                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <RadarChart skills={profile.stats} />
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <div className="font-mono text-[9px] text-white/40 mb-2">KEY_METRICS</div>
                                        {Object.keys(profile.stats).map(key => (
                                            <div key={key} className="flex justify-between font-mono text-xs">
                                                <span className="text-white/60">{key.substring(0, 3)}</span>
                                                <span className="text-tech-cyan">{profile.stats[key]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </HUDFrame>

                            {/* Achievements / Ribbons */}
                            <HUDFrame cornerLabel="SERVICE_RECORD" status="neutral">
                                <div className="p-6">
                                    <div className="grid grid-cols-4 gap-2">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="h-8 bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/30 transition-colors" title={`Award #${i + 4902}`}>
                                                {/* Ribbon patterns stripes */}
                                                <div className={`absolute inset-0 bg-gradient-to-r ${getRibbonGradient(i)} opacity-80`} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 font-mono text-[9px] text-white/30 text-right">
                                        TOTAL COMMENDATIONS: 8
                                    </div>
                                </div>
                            </HUDFrame>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function BioRow({ label, value, color = "text-stark-white" }: { label: string, value: string, color?: string }) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="font-mono text-[10px] text-white/40 tracking-widest">{label}</span>
            <span className={`font-mono text-sm ${color}`}>{value}</span>
        </div>
    );
}

function getRibbonGradient(index: number) {
    const gradients = [
        'from-blue-900 via-yellow-500 to-blue-900', // Service Medal
        'from-red-900 via-white to-red-900', // Combat Star
        'from-green-900 via-black to-green-900', // Ops
        'from-purple-900 via-gold-500 to-purple-900', // Intel
        'from-gray-800 via-blue-400 to-gray-800',
        'from-yellow-700 via-red-500 to-yellow-700',
        'from-teal-900 via-white to-teal-900',
        'from-black via-white to-black',
    ];
    return gradients[index % gradients.length];
}
