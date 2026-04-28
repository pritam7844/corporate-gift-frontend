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
        <section id="contact" className="bg-[var(--color-bg)] py-20 relative overflow-hidden">
            <div className="max-w-xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-[var(--color-accent)] text-[var(--color-text)] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-[var(--color-border)]">
                        <MessageSquare size={14} />
                        <span>Support Center</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)] mb-4">
                        How can we <span className="opacity-50">help?</span>
                    </h2>
                    <p className="text-[var(--color-text-muted)] font-bold text-lg leading-relaxed">
                        Submit a support request or track your existing tickets.
                    </p>
                </div>

                {isAuthenticated && (
                    <div className="flex bg-[var(--color-bg)] p-1 rounded-xl mb-10 border border-[var(--color-border)]">
                        <button
                            onClick={() => setViewMode('form')}
                            className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all uppercase tracking-[0.2em] ${viewMode === 'form' ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                        >
                            New Ticket
                        </button>
                        <button
                            onClick={() => setViewMode('tickets')}
                            className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all uppercase tracking-[0.2em] ${viewMode === 'tickets' ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                        >
                            My History
                        </button>
                    </div>
                )}

                {/* Form View */}
                {(!isAuthenticated || viewMode === 'form') && (
                    <form className="space-y-6 bg-[var(--color-surface)] p-8 md:p-10 rounded-2xl border border-[var(--color-border)] shadow-xl animate-in fade-in slide-in-from-bottom-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                            <input type="text" name="name" defaultValue={user?.name || ''} required className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-text)] transition-all font-bold text-[var(--color-text)] text-sm" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 ml-1">Work Email</label>
                            <input type="email" name="email" defaultValue={user?.email || ''} readOnly={!!user?.email} required className={`w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-text)] transition-all font-bold text-sm ${user?.email ? 'text-[var(--color-text-muted)] opacity-70' : 'text-[var(--color-text)]'}`} placeholder="john@company.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 ml-1">Your Message</label>
                            <textarea name="message" required rows="5" className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-text)] transition-all font-bold text-[var(--color-text)] text-sm resize-none" placeholder="Describe your inquiry in detail..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[var(--color-text)] text-[var(--color-surface)] font-black py-5 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 text-xs uppercase tracking-[0.2em]">
                            Submit Inquiry
                        </button>
                    </form>
                )}

                {/* Tickets History View */}
                {(isAuthenticated && viewMode === 'tickets') && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        {loading ? (
                            <div className="text-sm font-bold text-[var(--color-text-muted)] text-center py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">Loading your tickets...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)] p-16 rounded-2xl border border-[var(--color-border)] text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)] opacity-30" />
                                </div>
                                <p>You haven&apos;t submitted any support tickets yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {tickets.map(ticket => (
                                    <div key={ticket._id} className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-md group hover:border-[var(--color-text)]/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Ticket Reference</span>
                                                <span className="text-xs font-black text-[var(--color-text)] mt-1 tracking-wider">#{ticket._id?.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                                                ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                ticket.status === 'In Progress' ? 'bg-[var(--color-accent)] text-[var(--color-text)] border-[var(--color-border)]' : 
                                                'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                                            }`}>
                                                {ticket.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                {ticket.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-[var(--color-text)] font-bold text-sm leading-relaxed mb-6">{ticket.message}</p>
                                        <div className="flex items-center text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] pt-6 border-t border-[var(--color-border)]">
                                            <Clock className="w-3 h-3 mr-1.5 opacity-50" />
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
