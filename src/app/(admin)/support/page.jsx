'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { MessageSquare, RefreshCw, Mail, Building2 } from 'lucide-react';

const S = { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
const B = { backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/support');
            setTickets(res.data.data);
        } catch (error) {
            console.error('Failed to fetch support tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const updateStatus = async (ticketId, newStatus) => {
        try {
            await api.put(`/support/${ticketId}/status`, { status: newStatus });
            setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
            case 'In Progress': return { backgroundColor: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE68A' };
            case 'Resolved': return { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' };
            default: return { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' };
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Support Queries</h1>
                    <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Review contact form submissions</p>
                </div>
                <button onClick={fetchTickets} className="flex items-center px-4 py-2 border rounded-xl text-sm font-bold transition-all" style={S} disabled={loading}>
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && tickets.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-text)' }}></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="border text-center rounded-xl p-12" style={S}>
                    <MessageSquare size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
                    <h3 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>No support tickets</h3>
                    <p className="mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>There are no inquiries at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="rounded-2xl border flex flex-col h-full overflow-hidden" style={S}>
                            <div className="border-b p-5 flex items-center justify-between" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                <div>
                                    <h3 className="font-black" style={{ color: 'var(--color-text)' }}>{ticket.name}</h3>
                                    <div className="flex items-center text-xs mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                        <Mail size={12} className="mr-1.5" />
                                        <a href={`mailto:${ticket.email}`}>{ticket.email}</a>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 text-xs font-black rounded-full border" style={getStatusStyle(ticket.status)}>
                                    {ticket.status}
                                </span>
                            </div>

                            <div className="p-5 flex-grow">
                                {ticket.companyId && (
                                    <div className="flex items-center text-xs font-black mb-4 px-2 py-1 rounded-lg inline-flex border" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                                        <Building2 size={12} className="mr-1.5" />
                                        {ticket.companyId.name}
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap font-medium" style={{ color: 'var(--color-text)' }}>{ticket.message}</p>
                            </div>

                            <div className="p-5 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Update Status</label>
                                <select
                                    className="text-sm block w-full p-2.5 rounded-xl outline-none border font-bold cursor-pointer"
                                    style={S}
                                    value={ticket.status}
                                    onChange={(e) => updateStatus(ticket._id, e.target.value)}
                                >
                                    <option value="Open">🔴 Open</option>
                                    <option value="In Progress">🟡 In Progress</option>
                                    <option value="Resolved">🟢 Resolved</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
