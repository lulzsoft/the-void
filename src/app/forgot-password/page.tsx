'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'code' | 'newPassword' | 'success'>('email');
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Hata oluştu.');
                return;
            }

            setStep('code');
        } catch (err) {
            setError('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== newPasswordConfirm) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Şifre en az 8 karakter olmalı.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, code, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Hata oluştu.');
                return;
            }

            setStep('success');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setError('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-stark-white flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-widest text-deep-crimson mb-2">ŞİFRE SIFIRLAMA</h1>
                    <p className="text-sm text-silver/50">BOŞLUK Erişim Kurtarma</p>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label className="block text-xs text-silver/50 mb-2 uppercase">MAHLAS</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 focus:border-deep-crimson focus:outline-none transition-colors"
                                placeholder="Mahlas (kullanıcı adın)"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-deep-crimson text-stark-white p-4 text-xs font-bold tracking-widest hover:bg-deep-crimson/80 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'GÖNDERİLİYOR...' : 'E-POSTAYA KOD GÖNDER'}
                        </button>

                        <Link href="/login" className="block text-center text-xs text-silver/50 hover:text-white transition-colors">
                            ← Giriş sayfasına dön
                        </Link>
                    </form>
                )}

                {step === 'code' && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-xs text-silver/50 mb-2 uppercase">DOĞRULAMA KODU</label>
                            <p className="text-xs text-silver/40 mb-3">E-postana gönderilen 6 haneli kodu gir</p>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 focus:border-deep-crimson focus:outline-none transition-colors text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-silver/50 mb-2 uppercase">YENİ ŞİFRE</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 focus:border-deep-crimson focus:outline-none transition-colors"
                                placeholder="En az 8 karakter"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-silver/50 mb-2 uppercase">YENİ ŞİFRE (TEKRAR)</label>
                            <input
                                type="password"
                                value={newPasswordConfirm}
                                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 focus:border-deep-crimson focus:outline-none transition-colors"
                                placeholder="Şifreyi tekrar gir"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-deep-crimson text-stark-white p-4 text-xs font-bold tracking-widest hover:bg-deep-crimson/80 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'SIFIRLANIYOR...' : 'ŞİFREYİ SIFIRLA'}
                        </button>
                    </form>
                )}

                {step === 'success' && (
                    <div className="text-center space-y-4">
                        <div className="text-deep-crimson text-6xl mb-4">✓</div>
                        <h2 className="text-xl font-bold">Şifren Sıfırlandı</h2>
                        <p className="text-sm text-silver/50">Giriş sayfasına yönlendiriliyorsun...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
