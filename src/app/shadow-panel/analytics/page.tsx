'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsData {
    range: string;
    timestamp: number;
    members: {
        total: number;
        new: number;
        accepted: number;
        active: number;
        dailyGrowth: { date: string; count: number }[];
        weeklyGrowth: { date: string; count: number }[];
    };
    squads: {
        total: number;
        new: number;
        active: number;
        avgSize: number;
    };
    missions: {
        total: number;
        new: number;
        open: number;
        inProgress: number;
        completed: number;
    };
    topSkills: { skill: string; count: number }[];
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30d');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/analytics?range=${range}`);

            if (res.status === 403) {
                router.push('/shadow-panel');
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const analyticsData = await res.json();
            setData(analyticsData);
            setError('');
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-deep-crimson">ANALYTICS</h1>
                    <p className="text-silver/50">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-void-black text-stark-white p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-deep-crimson">ANALYTICS</h1>
                    <p className="text-red-500">{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

    // Chart configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#e0e0e0' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#888' },
                grid: { color: '#222' }
            },
            y: {
                ticks: { color: '#888' },
                grid: { color: '#222' }
            }
        }
    };

    const growthData = range === '7d' || range === '30d' ? data.members.dailyGrowth : data.members.weeklyGrowth;

    return (
        <div className="min-h-screen bg-void-black text-stark-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-deep-crimson">ANALYTICS</h1>

                    {/* Range Selector */}
                    <div className="flex gap-2">
                        {['7d', '30d', '90d', 'all'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-2 font-mono text-xs tracking-widest transition-colors ${range === r
                                        ? 'bg-deep-crimson text-white'
                                        : 'bg-white/5 text-silver/70 hover:bg-white/10'
                                    }`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 border border-white/10 p-6">
                        <div className="text-xs text-silver/50 mb-2">TOTAL MEMBERS</div>
                        <div className="text-4xl font-bold text-deep-crimson mb-2">{data.members.total}</div>
                        <div className="text-xs text-active-green">+{data.members.new} new ({range})</div>
                        <div className="text-xs text-silver/40 mt-2">{data.members.active} active</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6">
                        <div className="text-xs text-silver/50 mb-2">TOTAL SQUADS</div>
                        <div className="text-4xl font-bold text-deep-crimson mb-2">{data.squads.total}</div>
                        <div className="text-xs text-active-green">+{data.squads.new} new ({range})</div>
                        <div className="text-xs text-silver/40 mt-2">Avg size: {data.squads.avgSize}</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6">
                        <div className="text-xs text-silver/50 mb-2">TOTAL MISSIONS</div>
                        <div className="text-4xl font-bold text-deep-crimson mb-2">{data.missions.total}</div>
                        <div className="text-xs text-active-green">+{data.missions.new} new ({range})</div>
                        <div className="text-xs text-silver/40 mt-2">{data.missions.open} open</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth */}
                    <div className="bg-white/5 border border-white/10 p-6">
                        <h2 className="text-xl font-bold mb-4 text-silver">User Growth</h2>
                        <div className="h-64">
                            <Line
                                data={{
                                    labels: growthData.map(d => d.date.substring(5)),
                                    datasets: [{
                                        label: 'New Users',
                                        data: growthData.map(d => d.count),
                                        borderColor: '#dc2626',
                                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                        fill: true,
                                        tension: 0.4
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>

                    {/* Mission Status */}
                    <div className="bg-white/5 border border-white/10 p-6">
                        <h2 className="text-xl font-bold mb-4 text-silver">Mission Status</h2>
                        <div className="h-64">
                            <Doughnut
                                data={{
                                    labels: ['Open', 'In Progress', 'Completed'],
                                    datasets: [{
                                        data: [
                                            data.missions.open,
                                            data.missions.inProgress,
                                            data.missions.completed
                                        ],
                                        backgroundColor: ['#dc2626', '#f59e0b', '#10b981'],
                                    }]
                                }}
                                options={{
                                    ...chartOptions,
                                    scales: undefined
                                }}
                            />
                        </div>
                    </div>

                    {/* Top Skills */}
                    <div className="bg-white/5 border border-white/10 p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text-silver">Top Skills</h2>
                        <div className="h-64">
                            <Bar
                                data={{
                                    labels: data.topSkills.map(s => s.skill),
                                    datasets: [{
                                        label: 'Squad Count',
                                        data: data.topSkills.map(s => s.count),
                                        backgroundColor: '#dc2626',
                                    }]
                                }}
                                options={chartOptions}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
