export default function NotFound() {
    return (
        <div className="min-h-screen bg-void-black text-deep-crimson flex flex-col items-center justify-center p-4 font-mono">
            <h1 className="text-9xl mb-4 font-display glitch-text" data-text="404">404</h1>
            <div className="border border-deep-crimson/50 p-6 max-w-md w-full bg-black/50 backdrop-blur">
                <p className="text-xl mb-4 tracking-widest">SİNYAL KAYBI</p>
                <p className="text-silver/50 text-sm mb-6">
                    Aradığınız koordinatlarda yaşam belirtisi bulunamadı. Bu sektör Engizisyon tarafından mühürlenmiş olabilir.
                </p>
                <a
                    href="/"
                    className="block w-full py-3 text-center border border-deep-crimson hover:bg-deep-crimson hover:text-white transition-all uppercase tracking-widest text-xs"
                >
                    Ana Üsse Dön
                </a>
            </div>
            <div className="mt-8 text-[10px] text-silver/20 animate-pulse">
                SYSTEM_ID: UNKNOWN_VECTOR
            </div>
        </div>
    );
}
