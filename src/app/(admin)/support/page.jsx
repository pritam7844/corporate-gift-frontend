'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { MessageSquare, RefreshCw, Mail, Building2 } from 'lucide-react';
import AdminLayoutContent from '../../../components/admin/AdminLayoutContent';

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

    useEffect(() => {
        fetchTickets();
    }, []);

    const updateStatus = async (ticketId, newStatus) => {
        try {
            await api.put(`/support/${ticketId}/status`, { status: newStatus });
            setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-50 text-red-700 border-red-200';
            case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <AdminLayoutContent>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Queries</h1>
                    <p className="text-gray-500 mt-1">Review contact form submissions</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && tickets.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white border text-center border-gray-200 rounded-xl p-12 shadow-sm">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No support tickets</h3>
                    <p className="text-gray-500 mt-1">There are no inquiries at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="border-b border-gray-100 p-5 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Mail size={12} className="mr-1.5" />
                                        <a href={`mailto:${ticket.email}`} className="hover:text-blue-500">{ticket.email}</a>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <div className="p-5 flex-grow">
                                {ticket.companyId && (
                                    <div className="flex items-center text-xs font-medium text-blue-600 mb-4 bg-blue-50 border border-blue-100 rounded inline-flex px-2 py-1">
                                        <Building2 size={12} className="mr-1.5" />
                                        {ticket.companyId.name}
                                    </div>
                                )}
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticket.message}</p>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-gray-50/30">
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Update Status</label>
                                <select
                                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
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
        </AdminLayoutContent>
    );
}
