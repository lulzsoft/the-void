'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateSquadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        maxMembers: 5,
        skills: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/squads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    maxMembers: formData.maxMembers,
                    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create squad');
                setLoading(false);
                return;
            }

            // Redirect to squad detail
            router.push(`/squads/${data.squad.id}`);
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white font-mono p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-silver/50 hover:text-silver mb-4"
                    >
                        ← Geri
                    </button>
                    <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2">
                        SQUAD OLUŞTUR
                    </h1>
                    <p className="text-silver/60 text-sm">
                        Kendi kolektifini kur, lejyonerleri bir araya getir
                    </p>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 border border-white/10 bg-white/5 p-8"
                >
                    {error && (
                        <div className="bg-deep-crimson/20 border border-deep-crimson text-deep-crimson p-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-xs text-silver/70 mb-2 tracking-widest">
                            SQUAD ADI *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-void-black border border-white/20 text-stark-white p-3 text-sm 
                       focus:border-deep-crimson focus:outline-none"
                            placeholder="Design Collective, Dev Warriors..."
                            required
                            minLength={3}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-silver/70 mb-2 tracking-widest">
                            AÇIKLAMA *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-void-black border border-white/20 text-stark-white p-3 text-sm 
                       focus:border-deep-crimson focus:outline-none h-32"
                            placeholder="Squad'ınızın amacını, çalışma tarzını, ne tür projeler yaptığınızı açıklayın..."
                            required
                            minLength={10}
                        />
                        <p className="text-xs text-silver/50 mt-1">
                            {formData.description.length}/300
                        </p>
                    </div>

                    {/* Max Members */}
                    <div>
                        <label className="block text-xs text-silver/70 mb-2 tracking-widest">
                            MAX ÜYE SAYISI
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="2"
                                max="8"
                                value={formData.maxMembers}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxMembers: parseInt(e.target.value) })
                                }
                                className="flex-1"
                            />
                            <span className="text-2xl font-bold text-deep-crimson w-12 text-center">
                                {formData.maxMembers}
                            </span>
                        </div>
                        <p className="text-xs text-silver/50 mt-1">
                            Squad'ınıza maksimum kaç kişi katılabilir
                        </p>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-xs text-silver/70 mb-2 tracking-widest">
                            ARANAN YETENEKler (Opsiyonel)
                        </label>
                        <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className="w-full bg-void-black border border-white/20 text-stark-white p-3 text-sm 
                       focus:border-deep-crimson focus:outline-none"
                            placeholder="Frontend, Design, Marketing (virgülle ayırın)"
                        />
                        <p className="text-xs text-silver/50 mt-1">
                            Hangi yeteneklere ihtiyacınız var?
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-deep-crimson hover:bg-deep-crimson/80 text-stark-white p-4 
                     text-xs tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'OLUŞTURULUYOR...' : 'SQUAD OLUŞTUR'}
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
