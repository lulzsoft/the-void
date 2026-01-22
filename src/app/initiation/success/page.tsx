'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInitiationState } from '@/lib/store';
// Confetti is optional - install with: npm install react-confetti
// import Confetti from 'react-confetti';

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
};

// Username validation
const validateUsername = (username: string): { valid: boolean; error?: string } => {
    if (username.length < 3) return { valid: false, error: 'En az 3 karakter' };
    if (username.length > 20) return { valid: false, error: 'En fazla 20 karakter' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: 'Sadece harf, rakam ve _' };
    return { valid: true };
};

export default function SuccessPage() {
    const router = useRouter();
    const { verdict, score, reset, messages } = useInitiationState();
    const [step, setStep] = useState<'intro' | 'form' | 'processing' | 'done'>('intro');

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // UX state
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [touched, setTouched] = useState({ username: false, password: false, passwordConfirm: false });
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [shake, setShake] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Password strength
    const passwordStrength = calculatePasswordStrength(password);
    const usernameValidation = validateUsername(username);

    useEffect(() => {
        if (!verdict) {
            router.push('/');
        }
    }, [verdict, router]);

    // Window size for confetti
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Username availability check (debounced)
    useEffect(() => {
        if (username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setIsCheckingUsername(true);
        const timer = setTimeout(async () => {
            // Simulated check (replace with actual API call)
            // await fetch(`/api/check-username?u=${username}`);
            // For now, random simulation
            const available = Math.random() > 0.3;
            setUsernameAvailable(available);
            setIsCheckingUsername(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setTouched({ username: true, password: true, passwordConfirm: true });

        // Validation
        if (!usernameValidation.valid) {
            setError(usernameValidation.error || 'Geçersiz kullanıcı adı');
            triggerShake();
            return;
        }

        if (password !== passwordConfirm) {
            setError('⚠️ Şifreler eşleşmiyor');
            triggerShake();
            return;
        }

        if (password.length < 8) {
            setError(`⚠️ Şifre en az 8 karakter olmalı (şu an: ${password.length})`);
            triggerShake();
            return;
        }

        if (passwordStrength < 2) {
            setError('⚠️ Şifre çok zayıf. Büyük harf, rakam veya özel karakter ekleyin');
            triggerShake();
            return;
        }

        setStep('processing');

        try {
            const deviceHash = btoa(
                navigator.userAgent +
                screen.width + 'x' + screen.height +
                navigator.language +
                (navigator.hardwareConcurrency || 1)
            ).substring(0, 16);

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    email: email || undefined,
                    skills: 'YENİ İNİSYE',
                    painTolerance: score || 5,
                    answers: messages,
                    deviceHash
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStep('done');
                setTimeout(() => {
                    router.push('/sanctum');
                }, 3000);
            } else {
                setError(data.error || 'Kayıt başarısız.');
                setStep('form');
                triggerShake();
            }
        } catch (err) {
            setError('Bağlantı hatası.');
            setStep('form');
            triggerShake();
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    if (!verdict) return null;

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-active-green'];
    const strengthLabels = ['Zayıf', 'Orta', 'İyi', 'Güçlü'];

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4 sm:p-6 md:p-8 font-mono text-stark-white overflow-hidden relative">
            {/* Premium gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-deep-crimson/10 via-void-black to-void-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(139,0,0,0.15)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(75,0,0,0.1)_0%,_transparent_50%)]" />

            {/* Confetti on success - optional, requires: npm install react-confetti */}
            {/* {step === 'done' && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    colors={['#8B0000', '#FFFFFF', '#666666']}
                    numberOfPieces={100}
                    recycle={false}
                    gravity={0.3}
                />
            )} */}

            <div className="max-w-4xl w-full relative z-10">
                <AnimatePresence mode="wait">
                    {/* Intro Screen */}
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="text-center space-y-6 sm:space-y-8"
                        >
                            <motion.h1
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display tracking-tighter text-stark-white"
                            >
                                KABUL EDİLDİN
                            </motion.h1>

                            {/* Score badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="inline-block"
                            >
                                <div className={`px-8 py-6 rounded-lg backdrop-blur-xl bg-white/5 border ${score >= 9 ? 'border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.3)]' :
                                    score >= 7 ? 'border-silver shadow-[0_0_30px_rgba(192,192,192,0.2)]' :
                                        'border-deep-crimson shadow-[0_0_30px_rgba(139,0,0,0.2)]'
                                    }`}>
                                    <p className="text-xs tracking-widest text-silver/60 mb-2">PUAN</p>
                                    <p className={`text-5xl sm:text-6xl font-bold ${score >= 9 ? 'text-yellow-500' :
                                        score >= 7 ? 'text-silver' :
                                            'text-deep-crimson'
                                        }`}>
                                        {score?.toFixed(1)}
                                    </p>
                                    <p className="text-xs tracking-widest text-silver/40 mt-1">/ 10.0</p>
                                </div>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-silver/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto px-4"
                            >
                                Boşluk seni sinesine çekti.<br />
                                Artık geri dönüş yok.
                            </motion.p>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep('form')}
                                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 
                                         bg-transparent border-2 border-stark-white hover:bg-stark-white 
                                         transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] 
                                               group-hover:text-void-black transition-colors font-bold">
                                    KİMLİK OLUŞTUR
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                              -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Registration Form */}
                    {step === 'form' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            {/* Progress indicator */}
                            <div className="flex justify-center gap-2 mb-8 px-4">
                                {['Kabul', 'Kimlik', 'Güvenlik', 'Tamamla'].map((label, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
                                        <div className={`h-1 w-full rounded ${i === 0 ? 'bg-active-green' :
                                            i === 1 ? 'bg-deep-crimson animate-pulse' :
                                                'bg-white/10'
                                            }`} />
                                        <span className="text-[10px] text-silver/50 hidden sm:inline">{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Form container with glassmorphism */}
                            <motion.div
                                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg 
                                         shadow-[0_8px_32px_0_rgba(139,0,0,0.2)] p-6 sm:p-8"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-deep-crimson tracking-widest">
                                    MAHLAS BELİRLE
                                </h2>

                                <form onSubmit={handleRegister} className="space-y-6">
                                    {/* Username field */}
                                    <motion.fieldset
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="border border-white/10 rounded p-4 space-y-3"
                                    >
                                        <legend className="text-xs px-2 text-silver/60">👤 KİMLİK BİLGİLERİ</legend>

                                        <div className="relative">
                                            <label className="block text-xs text-silver/50 mb-2 uppercase">
                                                Mahlas
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={e => setUsername(e.target.value)}
                                                    onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                                                    className="w-full bg-white/5 border border-white/10 p-3 pr-10
                                                             focus:border-deep-crimson focus:outline-none focus:ring-2 
                                                             focus:ring-deep-crimson/20 transition-all rounded"
                                                    placeholder="Benzersiz kullanıcı adı"
                                                    aria-label="Kullanıcı adı"
                                                    aria-invalid={touched.username && !usernameValidation.valid}
                                                    required
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {isCheckingUsername && <div className="w-4 h-4 border-2 border-deep-crimson border-t-transparent rounded-full animate-spin" />}
                                                    {!isCheckingUsername && usernameAvailable === true && <span className="text-active-green">✅</span>}
                                                    {!isCheckingUsername && usernameAvailable === false && <span className="text-red-500">❌</span>}
                                                </div>
                                            </div>
                                            {touched.username && !usernameValidation.valid && (
                                                <p className="text-xs text-red-500 mt-1">⚠️ {usernameValidation.error}</p>
                                            )}
                                            {usernameAvailable === false && (
                                                <p className="text-xs text-red-500 mt-1">⚠️ Bu mahlas kullanılıyor</p>
                                            )}
                                            {usernameAvailable === true && (
                                                <p className="text-xs text-active-green mt-1">✅ Mahlas müsait</p>
                                            )}
                                        </div>
                                    </motion.fieldset>

                                    {/* Security fields */}
                                    <motion.fieldset
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="border border-white/10 rounded p-4 space-y-4"
                                    >
                                        <legend className="text-xs px-2 text-silver/60">🔒 GÜVENLİK</legend>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-xs text-silver/50 mb-2 uppercase">Şifre</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                                                    className="w-full bg-white/5 border border-white/10 p-3 pr-10
                                                             focus:border-deep-crimson focus:outline-none focus:ring-2 
                                                             focus:ring-deep-crimson/20 transition-all rounded"
                                                    placeholder="En az 8 karakter"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/50 hover:text-silver"
                                                >
                                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>

                                            {/* Password strength meter */}
                                            {password && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded transition-colors ${passwordStrength >= i ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs mt-1 ${passwordStrength >= 3 ? 'text-active-green' :
                                                        passwordStrength >= 2 ? 'text-yellow-500' :
                                                            'text-red-500'
                                                        }`}>
                                                        {passwordStrength >= 1 ? strengthLabels[passwordStrength - 1] : 'Çok zayıf'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Password confirm */}
                                        <div>
                                            <label className="block text-xs text-silver/50 mb-2 uppercase">Şifre (Tekrar)</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswordConfirm ? 'text' : 'password'}
                                                    value={passwordConfirm}
                                                    onChange={e => setPasswordConfirm(e.target.value)}
                                                    onBlur={() => setTouched(prev => ({ ...prev, passwordConfirm: true }))}
                                                    className="w-full bg-white/5 border border-white/10 p-3 pr-10
                                                             focus:border-deep-crimson focus:outline-none focus:ring-2 
                                                             focus:ring-deep-crimson/20 transition-all rounded"
                                                    placeholder="Şifreyi tekrar gir"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/50 hover:text-silver"
                                                >
                                                    {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>
                                            {passwordConfirm && password && (
                                                <p className={`text-xs mt-1 ${password === passwordConfirm ? 'text-active-green' : 'text-red-500'
                                                    }`}>
                                                    {password === passwordConfirm ? '✅ Şifreler eşleşiyor' : '❌ Şifreler eşleşmiyor'}
                                                </p>
                                            )}
                                        </div>
                                    </motion.fieldset>

                                    {/* Email (optional) */}
                                    <motion.fieldset
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="border border-white/10 rounded p-4 space-y-3 opacity-80"
                                    >
                                        <legend className="text-xs px-2 text-silver/60">📧 KURTARMA (Opsiyonel)</legend>

                                        <div>
                                            <label className="block text-xs text-silver/50 mb-2 uppercase">E-posta</label>
                                            <p className="text-xs text-silver/40 mb-2">Şifre unutulursa kod gönderilebilmesi için</p>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 p-3
                                                         focus:border-deep-crimson focus:outline-none focus:ring-2 
                                                         focus:ring-deep-crimson/20 transition-all rounded"
                                                placeholder="ornek@gmail.com (zorunlu değil)"
                                            />
                                            {email && (
                                                <div className="flex items-center gap-2 text-xs text-active-green mt-2">
                                                    <span>🔒</span>
                                                    <span>E-posta AES-256 ile şifrelenecek</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.fieldset>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-3 bg-red-900/20 border border-red-500/30 text-red-500 text-xs text-center rounded"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit button */}
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-stark-white text-void-black p-4 text-xs font-bold tracking-widest 
                                                 hover:bg-silver transition-all rounded shadow-lg 
                                                 active:scale-95 min-h-[44px]"
                                    >
                                        KAYDI TAMAMLA
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Processing State */}
                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-6 px-4"
                        >
                            <div className="w-20 h-20 border-4 border-deep-crimson border-t-transparent rounded-full animate-spin mx-auto" />

                            <div className="space-y-3">
                                {['Kimlik şifreleniyor...', 'Erişim doğrulanıyor...', 'Mabet açılıyor...'].map((text, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.6 }}
                                        className="text-xs sm:text-sm tracking-widest text-silver/50 font-mono"
                                    >
                                        {text}
                                    </motion.p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Success State */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6 px-4"
                        >
                            {/* Animated checkmark */}
                            <motion.svg
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="w-24 h-24 mx-auto text-active-green"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <motion.path
                                    d="M5 13l4 4L19 7"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </motion.svg>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-display text-stark-white"
                            >
                                MABET AÇILIYOR
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-xs sm:text-sm tracking-widest text-active-green"
                            >
                                ERİŞİM ONAYLANDI
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
