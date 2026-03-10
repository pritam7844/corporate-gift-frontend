'use client';

import { useEvents } from '../../../hooks/useEvents';
import { useAuthStore } from '../../../store/authStore';
import { Calendar, ChevronRight, Gift, Clock } from 'lucide-react';
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
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
            className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all group ${isActive ? 'cursor-pointer hover:shadow-md hover:border-blue-100' : 'opacity-60 cursor-not-allowed'}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? 'bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform' : 'bg-gray-100 text-gray-400'}`}>
                    <Calendar size={28} />
                </div>
                {isActive ? (
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">Active</span>
                ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">Closed</span>
                )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{event.name}</h3>

            <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-500 text-sm font-medium">
                    <Gift size={16} className="mr-2 text-purple-500" />
                    <span>{event.products?.length || 0} Exclusive Gifts</span>
                </div>
                {event.endDate && (
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                        <Clock size={16} className="mr-2 text-orange-500" />
                        <span>Ends {new Date(event.endDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                    <span>View Collection</span>
                    <ChevronRight size={20} className="ml-1" />
                </div>
            )}
        </div>
    );

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Your Events</h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl">
                    Discover exclusive gift collections curated specifically for you. Select an active event to start choosing your gifts.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm hidden">
                    {/* Handled by zero state */}
                </div>
            ) : null}

            {activeEvents.length === 0 && closedEvents.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Available</h2>
                    <p className="text-gray-500 font-medium max-w-md mx-auto">
                        There are currently no active events assigned to your profile. Please check back later or contact HR.
                    </p>
                </div>
            )}

            {activeEvents.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                        Active Collections
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
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-gray-300 mr-3"></span>
                        Past Collections
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
