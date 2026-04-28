'use client';

import { useEvents } from '../../../hooks/useEvents';
import { useAuthStore } from '../../../store/authStore';
import { Calendar, ChevronRight, Gift, Clock, Loader2 } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EmployeeEventsPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { events, loading, error } = useEvents(false, null, true);

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    if (!isHydrated || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--color-text)] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100">
                    {error}
                </div>
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeEvents = events.filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
    });
    
    const closedEvents = events.filter(e => {
        const end = new Date(e.endDate);
        end.setHours(23, 59, 59, 999);
        return today > end;
    });

    const EventCard = ({ event, isActive }) => (
        <div
            onClick={() => isActive && router.push(`/events/${event._id}`)}
            className={`rounded-3xl p-10 border transition-all duration-500 group relative overflow-hidden ${isActive ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : 'opacity-60 cursor-not-allowed'}`}
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
            <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm" style={isActive ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' } : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                    <Calendar size={28} />
                </div>
                {isActive ? (
                    <span className="px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-sm animate-pulse" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' }}>Active</span>
                ) : (
                    <span className="px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] border" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>Closed</span>
                )}
            </div>

            <h3 className="text-2xl font-black mb-3 tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>{event.name}</h3>

            <div className="space-y-3 mb-10">
                <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--color-text)' }}>
                    <Gift size={14} className="mr-3 opacity-50" />
                    <span>{event.products?.length || 0} Premium Options</span>
                </div>
                {event.endDate && (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--color-text)' }}>
                        <Clock size={14} className="mr-3 opacity-50" />
                        <span>Deadline: <FormattedDate date={event.endDate} /></span>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-all" style={{ color: 'var(--color-text)' }}>
                    <span>Explore Collection</span>
                    <ChevronRight size={16} className="ml-2" />
                </div>
            )}
        </div>
    );

    return (
        <main className="max-w-7xl mx-auto px-6 py-20">
            <div className="mb-16 pb-12 border-b border-[var(--color-border)]">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6" style={{ color: 'var(--color-text)' }}>Milestone Programs</h1>
                <p className="text-lg font-bold max-w-2xl opacity-70 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Experience rewarding corporate traditions. Select your gift from the active programs curated by your organization.
                </p>
            </div>

            {activeEvents.length === 0 && closedEvents.length === 0 && (
                <div className="text-center py-32 rounded-[2.5rem] border shadow-xl" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <Calendar size={32} className="opacity-20" style={{ color: 'var(--color-text)' }} />
                    </div>
                    <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>No Programs Assigned</h2>
                    <p className="text-base font-bold max-w-xs mx-auto opacity-60" style={{ color: 'var(--color-text-muted)' }}>
                        Your account currently has no gifting programs. Please check back during the next quarterly cycle.
                    </p>
                </div>
            )}

            {activeEvents.length > 0 && (
                <div className="mb-24">
                    <h2 className="text-[10px] font-black mb-10 flex items-center uppercase tracking-[0.3em]" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="w-2 h-2 rounded-full mr-4 bg-[var(--color-text)]"></span>
                        Active Cycles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {activeEvents.map(event => (
                            <EventCard key={event._id} event={event} isActive={true} />
                        ))}
                    </div>
                </div>
            )}

            {closedEvents.length > 0 && (
                <div>
                    <h2 className="text-[10px] font-black mb-10 flex items-center uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="w-2 h-2 rounded-full mr-4 bg-[var(--color-border)]"></span>
                        Previous Cycles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {closedEvents.map(event => (
                            <EventCard key={event._id} event={event} isActive={false} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
