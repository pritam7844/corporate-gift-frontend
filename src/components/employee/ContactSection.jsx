'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import FormattedDate from '../common/FormattedDate';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function ContactSection({ companyId }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('form'); // 'form' or 'tickets'

    const fetchTickets = async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const res = await api.get('/support/my-tickets');
            setTickets(res.data.data || []);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTickets();
        }
    }, [isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const name = form.name.value;
        const email = form.email.value;
        const message = form.message.value;

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        try {
            await api.post('/support', {
                name, email, message, companyId
            });
            alert('Support ticket submitted successfully!');
            form.reset();

            // Refresh tickets and switch view
            if (isAuthenticated) {
                await fetchTickets();
                setViewMode('tickets');
            }
        } catch (error) {
            console.error('Failed to submit support ticket', error);
            alert('Failed to submit ticket. Please try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    };

    return (
        <section id="contact" className="bg-gray-50 py-10 border-t border-gray-200">
            <div className="max-w-md mx-auto px-6">
                <div className="text-center mb-8">
                    <MessageSquare className="mx-auto mb-4 text-gray-400" size={32} />
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Need Help?</h2>
                    <p className="text-gray-500">Reach out to our support team.</p>
                </div>

                {isAuthenticated && (
                    <div className="flex bg-gray-200/60 p-1.5 rounded-xl mb-8">
                        <button
                            onClick={() => setViewMode('form')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'form' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Submit a Ticket
                        </button>
                        <button
                            onClick={() => setViewMode('tickets')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Tickets
                        </button>
                    </div>
                )}

                {/* Form View (always visible for guests, toggleable for logged in) */}
                {(!isAuthenticated || viewMode === 'form') && (
                    <form className="space-y-4 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" defaultValue={user?.name || ''} required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" defaultValue={user?.email || ''} readOnly={!!user?.email} required className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition ${user?.email ? 'bg-gray-50 text-gray-500' : ''}`} placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea name="message" required rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition mt-2 disabled:opacity-70">
                            Send Message
                        </button>
                    </form>
                )}

                {/* Tickets History View */}
                {(isAuthenticated && viewMode === 'tickets') && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        {loading ? (
                            <div className="text-sm text-gray-500 text-center py-12 bg-white rounded-2xl border border-gray-200">Loading your tickets...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-white p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
                                <MessageSquare className="w-8 h-8 text-gray-300 mb-3" />
                                You haven&apos;t submitted any support tickets yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map(ticket => (
                                    <div key={ticket._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <FormattedDate date={ticket.createdAt} />
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'Resolved' ? 'bg-green-50 text-green-700' : ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {ticket.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {ticket.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
