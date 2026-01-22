
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Member {
    id: string;
    codename: string;
    ip: string;
    tier: 'aday' | 'inisye' | 'ustat';
    createdAt: number;
    approvedAt?: number;
    score?: number;
    status: 'ADMITTED' | 'BANNED' | 'REJECTED';
    skills: string;
    accessKey?: string;
}

export default function RegistryPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'ADMITTED' | 'BANNED'>('ADMITTED');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/members');
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (id: string, codename: string) => {
        if (!confirm(`${codename} adlı üyeyi sürgün etmek istediğinize emin misiniz?`)) return;
        try {
            await fetch('/api/admin/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchMembers(); // Refresh
            setSelectedMember(null);
        } catch (e) {
            alert('İşlem başarısız.');
        }
    };

    const handleUnban = async (id: string, codename: string) => {
        if (!confirm(`${codename} için af çıkarmak istediğinize emin misiniz?`)) return;
        try {
            await fetch('/api/admin/unban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchMembers(); // Refresh
            setSelectedMember(null);
        } catch (e) {
            alert('İşlem başarısız.');
        }
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch = (m.codename?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (m.ip || '').includes(searchQuery);
        if (filter === 'ALL') return matchesSearch;
        return matchesSearch && m.status === filter;
    });

    // Sort: Online/Admitted first, then by date
    filteredMembers.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-silver/10 pb-6">
                <div>
                    <h1 className="font-display text-4xl text-stark-white mb-2 tracking-tight">SİCİL VERİTABANI</h1>
                    <p className="font-mono text-xs text-silver/40 tracking-widest uppercase">
                        GÖLGE KONSEYİ • YETKİ SEVİYESİ 5
                    </p>
                </div>
                <div className="flex gap-2">
                    <TabButton active={filter === 'ADMITTED'} onClick={() => setFilter('ADMITTED')} label="AKTİF ÜYELER" count={members.filter(m => m.status === 'ADMITTED').length} />
                    <TabButton active={filter === 'BANNED'} onClick={() => setFilter('BANNED')} label="SÜRGÜNLER" count={members.filter(m => m.status === 'BANNED' || m.status === 'REJECTED').length} color="red" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                <div className="flex items-center gap-3 px-3 w-96">
                    <span className="text-silver/30">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Mahlas, IP veya ID ile ara..."
                        className="bg-transparent border-none focus:ring-0 text-sm font-mono text-white w-full placeholder:text-silver/20"
                    />
                </div>
                <div className="flex items-center gap-4 px-4 font-mono text-xs text-silver/50">
                    <button onClick={fetchMembers} className="hover:text-white transition-colors">YENİLE</button>
                    <span>|</span>
                    <span>TOPLAM: {members.length}</span>
                </div>
            </div>

            {/* Data Grid */}
            <div className="border border-white/10 rounded overflow-hidden">
                <table className="w-full text-left font-mono text-sm">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs text-silver/40 uppercase tracking-wider">
                            <th className="p-4 font-normal">MAHLAS / ID</th>
                            <th className="p-4 font-normal">DURUM</th>
                            <th className="p-4 font-normal">YETKİ</th>
                            <th className="p-4 font-normal">ERİŞİM</th>
                            <th className="p-4 font-normal">IP ADRESİ</th>
                            <th className="p-4 font-normal text-right">EYLEM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-silver/30 animate-pulse">VERİLER ŞİFRESİ ÇÖZÜLÜYOR...</td></tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-silver/30">KAYIT BULUNAMADI.</td></tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-display text-lg text-white group-hover:text-deep-crimson transition-colors">
                                            {member.codename || 'BİLİNMEYEN'}
                                        </div>
                                        <div className="text-[10px] text-silver/30 font-mono tracking-wider">{member.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={member.status} />
                                    </td>
                                    <td className="p-4 text-silver/70">
                                        {member.tier || 'İNİSYE'}
                                    </td>
                                    <td className="p-4">
                                        {member.accessKey ? (
                                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-silver group-hover:text-white transition-colors">
                                                {member.accessKey}
                                            </span>
                                        ) : (
                                            <span className="text-silver/20">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-silver/50">
                                        {member.ip}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10 text-silver transition-colors"
                                        >
                                            DETAY
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMember(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            className="bg-void-black border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                                <div>
                                    <h2 className="font-display text-3xl text-white">{selectedMember.codename}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={selectedMember.status} />
                                        <span className="text-xs font-mono text-silver/40">ID: {selectedMember.id}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMember(null)} className="text-silver/50 hover:text-white">✕</button>
                            </div>

                            <div className="p-6 space-y-6 font-mono text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded border border-white/5">
                                        <div className="text-[10px] text-silver/40 uppercase mb-1">ERİŞİM ANAHTARI</div>
                                        <div className="text-deep-crimson font-bold tracking-widest">{selectedMember.accessKey || 'YOK'}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/5">
                                        <div className="text-[10px] text-silver/40 uppercase mb-1">IP ADRESİ</div>
                                        <div className="text-silver">{selectedMember.ip}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/5 col-span-2">
                                        <div className="text-[10px] text-silver/40 uppercase mb-1">YETENEK PROFİLİ</div>
                                        <div className="text-silver">{selectedMember.skills || 'VERİ YOK'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                                {selectedMember.status === 'ADMITTED' ? (
                                    <button
                                        onClick={() => handleBan(selectedMember.id, selectedMember.codename)}
                                        className="bg-deep-crimson/10 border border-deep-crimson text-deep-crimson px-4 py-2 text-xs font-bold hover:bg-deep-crimson hover:text-white transition-all tracking-wider"
                                    >
                                        SÜRGÜN ET (BAN)
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUnban(selectedMember.id, selectedMember.codename)}
                                        className="bg-active-green/10 border border-active-green text-active-green px-4 py-2 text-xs font-bold hover:bg-active-green hover:text-black transition-all tracking-wider"
                                    >
                                        AF ÇIKAR (RESTORE)
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Components
function TabButton({ active, onClick, label, count, color = 'silver' }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-mono text-xs font-bold transition-all border-b-2 ${active
                ? `text-stark-white border-${color === 'red' ? 'deep-crimson' : 'stark-white'}`
                : 'text-silver/40 border-transparent hover:text-silver'
                }`}
        >
            {label} <span className="opacity-50 ml-1">({count})</span>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'ADMITTED') {
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold tracking-wider border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AKTİF
        </span>
    }
    if (status === 'BANNED' || status === 'REJECTED') {
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold tracking-wider border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> SÜRGÜN
        </span>
    }
    return <span className="text-[10px] text-silver/50">{status}</span>
}
