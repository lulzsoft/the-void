'use client';

export default function DangerLevel({ level }: { level: number }) {
    // 0-10 scale
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`
                        w-1.5 h-4 transition-all duration-300
                        ${i * 2 < level ? getLevelColor(i) : 'bg-white/5'}
                        ${i * 2 < level ? 'shadow-[0_0_5px_currentColor]' : ''}
                    `}
                />
            ))}
        </div>
    );
}

function getLevelColor(index: number) {
    if (index < 2) return 'bg-tech-cyan';      // Low
    if (index < 3) return 'bg-alert-amber';    // Medium
    return 'bg-critical-red';                  // High
}
