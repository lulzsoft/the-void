'use client';

import { motion } from 'framer-motion';

export default function StatusDashboard() {
    return (
        <div className="w-full h-full min-h-[400px] relative bg-void-panel/30 border border-white/5 rounded-xl overflow-hidden p-6 flex flex-col md:flex-row gap-6">
            {/* Map Area (Left/Main) */}
            <div className="flex-1 relative border border-white/5 bg-void-black/50 rounded-lg p-4 flex items-center justify-center overflow-hidden group">
                {/* Grid Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Abstract World Map (CSS Shapes) */}
                <div className="relative w-full h-full opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700">
                    {/* Placeholder for World Map SVG - Using simple circles for nodes for now */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-tech-cyan rounded-full shadow-[0_0_10px_#00F0FF]"
                            initial={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`
                            }}
                            animate={{
                                opacity: [0.4, 1, 0.4],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity
                            }}
                        >
                            {/* Ping Effect */}
                            <div className="absolute inset-0 rounded-full border border-tech-cyan animate-ping" />
                        </motion.div>
                    ))}

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-display text-4xl text-white/5 font-bold tracking-widest select-none">GLOBAL_OPS</span>
                    </div>
                </div>

                {/* Radar Sweep Line */}
                <div className="absolute inset-0 rounded-full border border-white/5 overflow-hidden">
                    <motion.div
                        className="w-1/2 h-full bg-gradient-to-r from-transparent to-white/5 origin-right absolute left-0 top-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '100% 50%' }}
                    />
                </div>
            </div>

            {/* Metrics Panel (Right/Side) */}
            <div className="w-full md:w-64 flex flex-col gap-4">
                <MetricCard label="ACTIVE AGENTS" value="8,492" trend="+12%" color="text-tech-cyan" />
                <MetricCard label="GLOBAL THREAT" value="LOW" trend="STABLE" color="text-emerald-500" />
                <MetricCard label="CONTRACTS" value="143" trend="+5" color="text-alert-amber" />

                {/* System Log */}
                <div className="flex-1 bg-void-black/40 border border-white/5 rounded-lg p-3 font-mono text-[9px] text-white/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                    <ul className="space-y-2">
                        <li className="flex gap-2">
                            <span className="text-tech-cyan">14:02:11</span>
                            <span>Node #49 connected.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-white/30">14:01:58</span>
                            <span>Transaction verified: 5000 CR.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-alert-amber">14:01:42</span>
                            <span>Sector 7 alert: High latency.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-white/30">14:01:10</span>
                            <span>New contract uploaded.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, color }: { label: string, value: string, trend: string, color: string }) {
    return (
        <div className="bg-void-black/40 border border-white/5 p-4 rounded-lg flex justify-between items-end hover:border-white/10 transition-colors">
            <div>
                <div className="text-[9px] text-white/40 tracking-wider mb-1">{label}</div>
                <div className={`text-2xl font-mono ${color}`}>{value}</div>
            </div>
            <div className="text-[9px] text-white/30 mb-1">{trend}</div>
        </div>
    );
}
