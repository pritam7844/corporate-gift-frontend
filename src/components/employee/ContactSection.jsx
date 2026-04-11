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
        <section id="contact" className="bg-slate-50 py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -z-10 -translate-y-1/2 translate-x-1/3 opacity-40"></div>

            <div className="max-w-xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-100/50">
                        <MessageSquare size={14} />
                        <span>Support Center</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        How can we <span className="text-indigo-600">help?</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        Submit a support request or track your existing tickets.
                    </p>
                </div>

                {isAuthenticated && (
                    <div className="flex bg-slate-200/50 p-1 rounded-xl mb-10 border border-slate-200/50">
                        <button
                            onClick={() => setViewMode('form')}
                            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all uppercase tracking-widest ${viewMode === 'form' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            New Ticket
                        </button>
                        <button
                            onClick={() => setViewMode('tickets')}
                            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all uppercase tracking-widest ${viewMode === 'tickets' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            My History
                        </button>
                    </div>
                )}

                {/* Form View */}
                {(!isAuthenticated || viewMode === 'form') && (
                    <form className="space-y-5 bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                            <input type="text" name="name" defaultValue={user?.name || ''} required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition font-medium text-slate-900 text-sm" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                            <input type="email" name="email" defaultValue={user?.email || ''} readOnly={!!user?.email} required className={`w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition font-medium text-sm ${user?.email ? 'text-slate-500 grayscale' : 'text-slate-900'}`} placeholder="john@company.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Message</label>
                            <textarea name="message" required rows="5" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition font-medium text-slate-900 text-sm resize-none" placeholder="Describe your inquiry in detail..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 text-sm uppercase tracking-widest">
                            Submit Inquiry
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
                                    <div key={ticket._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket ID</span>
                                                <span className="text-xs font-mono font-bold text-slate-900 mt-0.5">#{ticket._id?.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                                ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                ticket.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {ticket.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                {ticket.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">{ticket.message}</p>
                                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                                            <Clock className="w-3 h-3 mr-1.5" />
                                            <FormattedDate date={ticket.createdAt} />
                                        </div>
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
