'use client';

import { useEvents } from '../../../hooks/useEvents';
import { useAuthStore } from '../../../store/authStore';
import { Calendar, ChevronRight, Gift, Clock } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EmployeeEventsPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    // Fetch specifically for the logged-in employee (uses /events/my-events)
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

    if (!isHydrated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-100/50">
                    {error}
                </div>
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Derive active/closed from dates — not the `status` field
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
            className={`bg-white rounded-xl p-8 border border-slate-200 shadow-sm transition-all group ${isActive ? 'cursor-pointer hover:shadow-md hover:border-indigo-100' : 'opacity-60 cursor-not-allowed'}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-50 text-indigo-600 transition-transform' : 'bg-slate-100 text-slate-400'}`}>
                    <Calendar size={24} />
                </div>
                {isActive ? (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-emerald-100/50">Active</span>
                ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wider border border-slate-200/50">Closed</span>
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">{event.name}</h3>

            <div className="space-y-2 mb-8">
                <div className="flex items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <Gift size={14} className="mr-2 text-indigo-400" />
                    <span>{event.products?.length || 0} Selection Gifts</span>
                </div>
                {event.endDate && (
                    <div className="flex items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        <Clock size={14} className="mr-2 text-slate-400" />
                        <span>Ends <FormattedDate date={event.endDate} /></span>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="flex items-center text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                    <span>Explore Collection</span>
                    <ChevronRight size={18} className="ml-1" />
                </div>
            )}
        </div>
    );

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-12 border-b border-slate-200 pb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Milestone Programs</h1>
                <p className="text-base text-slate-500 font-medium max-w-2xl">
                    Experience rewarding corporate traditions. Select your gift from the active programs curated by your organization.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm hidden">
                    {/* Handled by zero state */}
                </div>
            ) : null}

            {activeEvents.length === 0 && closedEvents.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Programs Assigned</h2>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
                        Your account currently has no gifting programs. Please check back during the next quarterly cycle.
                    </p>
                </div>
            )}

            {activeEvents.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-sm font-bold text-slate-400 mb-8 flex items-center uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>
                        Active Cycles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeEvents.map(event => (
                            <EventCard key={event._id} event={event} isActive={true} />
                        ))}
                    </div>
                </div>
            )}

            {closedEvents.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-slate-300 mb-8 flex items-center uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mr-3"></span>
                        Previous Cycles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {closedEvents.map(event => (
                            <EventCard key={event._id} event={event} isActive={false} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
