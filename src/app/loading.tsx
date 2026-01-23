export default function Loading() {
    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-t-2 border-l-2 border-deep-crimson rounded-full animate-spin" />
                <p className="font-mono text-xs text-silver/50 tracking-[0.2em] animate-pulse">
                    VERİ AKIŞI SAĞLANIYOR...
                </p>
            </div>
        </div>
    );
}
