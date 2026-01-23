'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Mission } from '@/types/mission';
import type { Squad } from '@/types/squad';

export default function MissionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const missionId = params.id as string;

    const [mission, setMission] = useState<Mission | null>(null);
    const [userSquads, setUserSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [applying, setApplying] = useState(false);

    // Submission State
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [proofUrl, setProofUrl] = useState('');
    const [submitNotes, setSubmitNotes] = useState('');
    const [submitStatus, setSubmitStatus] = useState<{ loading: boolean; error?: string; success?: boolean }>({ loading: false });

    // ... useEffect ...

    const handleSubmitProof = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus({ loading: true });

        try {
            const res = await fetch(`/api/missions/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proofUrl, notes: submitNotes })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSubmitStatus({ loading: false, success: true });
            setShowSubmitModal(false);
            alert('Kanıt başarıyla iletildi. İnceleniyor.');
            setProofUrl('');
            setSubmitNotes('');
        } catch (err: any) {
            setSubmitStatus({ loading: false, error: err.message });
        }
    };

    const [selectedSquad, setSelectedSquad] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
        fetchMission();
    }, [missionId]);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                fetchUserSquads(data.user.codename);
            }
        } catch (e) {
            console.error('Auth check failed');
        }
    };

    const fetchUserSquads = async (username: string) => {
        try {
            const res = await fetch(`/api/squads?leader=${username}`);
            if (res.ok) {
                const data = await res.json();
                setUserSquads(data.squads || []);
            }
        } catch (e) {
            console.error('Failed to fetch user squads');
        }
    };

    const fetchMission = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/missions/${missionId}`);
            const data = await res.json();
            if (res.ok) {
                setMission(data.mission);
            } else {
                setError(data.error || 'Mission not found');
            }
        } catch (e) {
            setError('Failed to load mission');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!selectedSquad) {
            setError('Please select a squad');
            return;
        }

        setApplying(true);
        setError('');

        try {
            const res = await fetch(`/api/missions/${missionId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ squadId: selectedSquad, message }),
            });

            const data = await res.json();

            if (res.ok) {
                setMission(data.mission);
                setSelectedSquad('');
                setMessage('');
                alert('Başvuru gönderildi!');
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white font-mono flex items-center justify-center">
                <p className="text-silver/50">Yükleniyor...</p>
            </div>
        );
    }

    if (error && !mission) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white font-mono flex items-center justify-center">
                <div className="text-center">
                    <p className="text-deep-crimson mb-4">{error}</p>
                    <button onClick={() => router.push('/missions')} className="text-sm text-silver/50 hover:text-silver">
                        ← Mission'lara dön
                    </button>
                </div>
            </div>
        );
    }

    if (!mission) return null;

    const statusColor = {
        open: 'text-active-green',
        'in-progress': 'text-deep-crimson',
        completed: 'text-silver/50',
        cancelled: 'text-silver/30',
    }[mission.status];

    const hasApplied = user && userSquads.some(squad =>
        mission.applications.some(app => app.squadId === squad.id)
    );

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push('/missions')}
                    className="text-sm text-silver/50 hover:text-silver mb-6"
                >
                    ← Mission'lara dön
                </button>

                {/* Mission Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 bg-white/5 p-8 mb-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="font-display text-4xl md:text-6xl tracking-wider">
                            {mission.title}
                        </h1>
                        <div className={`text-sm ${statusColor}`}>
                            {mission.status.toUpperCase()}
                        </div>
                    </div>

                    <p className="text-silver/70 mb-6 leading-relaxed">{mission.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div>
                            <span className="text-silver/50">Süre:</span>{' '}
                            <span className="text-stark-white">{mission.duration}</span>
                        </div>
                        <div>
                            <span className="text-silver/50">Ödeme:</span>{' '}
                            <span className="text-stark-white">{mission.compensation}</span>
                        </div>
                        {mission.requiredSquadSize && (
                            <div>
                                <span className="text-silver/50">Min Squad:</span>{' '}
                                <span className="text-stark-white">{mission.requiredSquadSize} kişi</span>
                            </div>
                        )}
                        <div>
                            <span className="text-silver/50">Başvurular:</span>{' '}
                            <span className="text-stark-white">{mission.applications.length}</span>
                        </div>
                    </div>

                    {mission.requirements && mission.requirements.length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs text-silver/50 mb-2">GEREKENLER:</p>
                            <div className="flex flex-wrap gap-2">
                                {mission.requirements.map((req, i) => (
                                    <span key={i} className="text-xs bg-deep-crimson/20 text-deep-crimson px-3 py-1">
                                        {req}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Application Form */}
                {mission.status === 'open' && user && !hasApplied && userSquads.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="border border-white/10 bg-white/5 p-8"
                    >
                        <h2 className="text-xl font-display tracking-wider mb-4">BAŞVUR</h2>

                        {error && (
                            <div className="bg-deep-crimson/20 border border-deep-crimson text-deep-crimson p-3 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-silver/70 mb-2">SQUAD SEÇ</label>
                                <select
                                    value={selectedSquad}
                                    onChange={(e) => setSelectedSquad(e.target.value)}
                                    className="w-full bg-void-black border border-white/20 text-stark-white p-3 text-sm"
                                >
                                    <option value="">Bir squad seç...</option>
                                    {userSquads.map((squad) => (
                                        <option key={squad.id} value={squad.id}>
                                            {squad.name} ({squad.members.length} üye)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-silver/70 mb-2">MESAJ (Opsiyonel)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-void-black border border-white/20 text-stark-white p-3 text-sm h-24"
                                    placeholder="Squad'ınızın neden uygun olduğunu açıklayın..."
                                />
                            </div>

                            <button
                                onClick={handleApply}
                                disabled={applying || !selectedSquad}
                                className="w-full bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white p-4 text-xs tracking-widest transition-colors disabled:opacity-50"
                            >
                                {applying ? 'GÖNDERİLİYOR...' : 'BAŞVUR'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {hasApplied && (
                    <div className="bg-deep-crimson/10 border border-deep-crimson/30 p-6 text-center">
                        <p className="text-deep-crimson">✓ Squad'larınızdan biri zaten başvurdu</p>
                    </div>
                )}

                {!user && mission.status === 'open' && (
                    <div className="text-center py-6">
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white px-8 py-4 text-xs tracking-widest"
                        >
                            GİRİŞ YAP VE BAŞVUR
                        </button>
                    </div>
                )}
                {/* Submission Modal */}
                <AnimatePresence>
                    {showSubmitModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="w-full max-w-md bg-void-black border border-deep-crimson p-8 relative"
                            >
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="absolute top-4 right-4 text-silver/50 hover:text-white"
                                >
                                    ✕
                                </button>

                                <h3 className="font-display text-2xl text-stark-white mb-6">KANIT ODASI</h3>
                                <p className="text-xs text-silver/70 mb-6 font-mono">
                                    Görevin tamamlandığına dair kanıtları (Github Repo, Drive Linki, Ekran Görüntüsü URL'i) buraya bırakın.
                                </p>

                                <form onSubmit={handleSubmitProof} className="space-y-6">
                                    <div>
                                        <label className="block text-xs text-silver/50 mb-2 uppercase">Kanıt URL'i</label>
                                        <input
                                            type="url"
                                            value={proofUrl}
                                            onChange={e => setProofUrl(e.target.value)}
                                            required
                                            placeholder="https://github.com/..."
                                            className="w-full bg-white/5 border border-white/10 p-3 text-sm text-stark-white focus:border-deep-crimson focus:outline-none focus:ring-1 focus:ring-deep-crimson transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-silver/50 mb-2 uppercase">Operasyon Notları</label>
                                        <textarea
                                            value={submitNotes}
                                            onChange={e => setSubmitNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Opsiyonel detaylar..."
                                            className="w-full bg-white/5 border border-white/10 p-3 text-sm text-stark-white focus:border-deep-crimson focus:outline-none focus:ring-1 focus:ring-deep-crimson transition-colors resize-none"
                                        />
                                    </div>

                                    {submitStatus.error && (
                                        <div className="text-red-500 text-xs">{submitStatus.error}</div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitStatus.loading}
                                        className="w-full bg-active-green hover:bg-green-600 text-void-black font-bold py-3 text-xs tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {submitStatus.loading ? 'YÜKLENİYOR...' : 'DOSYAYI MÜHÜRLE VE GÖNDER'}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
