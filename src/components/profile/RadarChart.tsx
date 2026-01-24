'use client';

export default function RadarChart({ skills }: { skills: Record<string, number> }) {
    // Default skills if not provided
    const data = skills || {
        "TACTICS": 80,
        "STEALTH": 65,
        "INTEL": 90,
        "TECH": 75,
        "COMBAT": 40
    };

    const keys = Object.keys(data);
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const angleStep = (Math.PI * 2) / keys.length;

    const getCoordinates = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const points = keys.map((key, i) => {
        const { x, y } = getCoordinates(data[key], i);
        return `${x},${y}`;
    }).join(' ');

    const bgPoints = keys.map((_, i) => {
        const { x, y } = getCoordinates(100, i);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="relative flex justify-center items-center py-4">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Web */}
                {[20, 40, 60, 80, 100].map((level, j) => (
                    <polygon
                        key={j}
                        points={keys.map((_, i) => {
                            const { x, y } = getCoordinates(level, i);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {keys.map((_, i) => {
                    const { x, y } = getCoordinates(100, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill="rgba(0, 240, 255, 0.2)"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                />

                {/* Labels */}
                {keys.map((key, i) => {
                    const { x, y } = getCoordinates(120, i); // Push labels out
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            fill="rgba(255,255,255,0.5)"
                            fontSize="8"
                            fontFamily="var(--font-jetbrains)"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {key}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
