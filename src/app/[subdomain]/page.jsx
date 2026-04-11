'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { Gift, Calendar, ShoppingCart, Sparkles, ArrowRight, Plus, Minus, Maximize2 } from 'lucide-react';
import FormattedDate from '../../components/common/FormattedDate';
import ImageSliderModal from '../../components/common/ImageSliderModal';
import ProductImageSlider from '../../components/common/ProductImageSlider';
import ConfirmModal from '../../components/common/ConfirmModal';
import FaqSection from '../../components/employee/FaqSection';

export default function CompanyLandingPage() {
    const { subdomain } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { items, addToCart, updateQuantity } = useCartStore();

    const [company, setCompany] = useState(null);
    const [events, setEvents] = useState([]);
    const [orderedEventIds, setOrderedEventIds] = useState([]); // Track events where user already ordered
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    // Image Popup State
    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const openConfirm = (title, message, onConfirm = () => { }, type = 'warning') => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.replace(`/login`);
        }
    }, [isHydrated, isAuthenticated, router]);

    useEffect(() => {
        const fetchPortalData = async () => {
            if (!isAuthenticated) return;
            try {
                // Fetch Company Info
                const companyRes = await api.get(`/companies/portal/${subdomain}`);
                setCompany(companyRes.data.data);

                // Fetch ALL Events for this Company (Backend now returns all)
                const eventsRes = await api.get('/events/my-events');
                const allEvents = eventsRes.data.data || [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Filter for active events only on landing page
                const activeEvents = allEvents.filter(e => {
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return today >= start && today <= end;
                });

                setEvents(activeEvents);

                // Fetch User's Order History to check for cycle participation
                const requestsRes = await api.get('/gift-requests/my-requests');
                const userRequests = requestsRes.data.data || [];

                // Filter which events have already been ordered in the current cycle
                const alreadyOrdered = activeEvents.filter(event => {
                    return userRequests.some(req =>
                        req.eventId._id === event._id &&
                        new Date(req.createdAt) >= new Date(event.startDate)
                    );
                }).map(e => e._id);

                setOrderedEventIds(alreadyOrdered);
            } catch (error) {
                console.error("Failed to load portal data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isHydrated && isAuthenticated) {
            fetchPortalData();
        }
    }, [subdomain, isAuthenticated, isHydrated]);
    const handleAddToCart = (product, eventId) => {
        if (orderedEventIds.includes(eventId)) {
            openConfirm('Order Already Placed', 'You have already requested samples for this event in the current cycle.', () => { }, 'warning');
            return;
        }

        // Check for event conflict (only one event's products allowed in cart at once)
        if (items.length > 0 && items[0].eventId !== eventId) {
            openConfirm(
                'Event Conflict',
                'Your cart already contains items from another event. You can only add products from one event at a time. Please clear your cart or complete your current order first.',
                () => { },
                'warning'
            );
            return;
        }

        if (items.length >= 3) {
            openConfirm('Limit Reached', 'Maximum 3 different products are allowed for a sample order.', () => { }, 'warning');
            return;
        }
        const quantity = getProductCartQuantity(product._id, eventId);
        if (quantity >= 1) {
            openConfirm('Limit Reached', 'Maximum 1 unit per product is allowed for sample orders.', () => { }, 'warning');
            return;
        }
        addToCart(product, eventId);
    };

    const getProductCartQuantity = (productId, eventId) => {
        const item = items.find(i => i.product._id === productId && i.eventId === eventId);
        return item ? item.quantity : 0;
    };

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
                    <p className="text-gray-500 font-medium tracking-wide">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Safety check
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">

                {/* Personalized Hero Dashboard */}
                <section className="mb-16">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                        {/* Subtle Background Accent */}
                        <div className="absolute right-0 top-0 w-1/2 h-full bg-indigo-50/30 skew-x-12 translate-x-1/4 pointer-events-none"></div>

                        <div className="relative z-10 flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6 border border-indigo-100">
                                <span>{company?.name || subdomain} Portal</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.15]">
                                Welcome back,<br />
                                <span className="text-indigo-600">
                                    {user?.name || 'Employee'}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed mb-10 mx-auto lg:mx-0">
                                Discover curated corporate gift programs designed specifically for you. Select your preferred rewards below.
                            </p>

                            {/* Summary Cards */}
                            <div className="flex gap-4 w-full overflow-x-auto pb-4 md:pb-0 snap-x mb-10 justify-center lg:justify-start hide-scrollbar">
                                <div className="min-w-[140px] bg-slate-50 rounded-xl p-5 border border-slate-100 snap-center flex-shrink-0">
                                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 mb-0.5">{events.length}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Events</p>
                                </div>

                                <div className="min-w-[140px] bg-slate-50 rounded-xl p-5 border border-slate-100 snap-center flex-shrink-0">
                                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                                        <Gift size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 mb-0.5">
                                        {events.reduce((total, event) => total + (event.products?.length || 0), 0)}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gift Options</p>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center shadow-md active:scale-95"
                                >
                                    Browse Events <ArrowRight size={18} className="ml-3" />
                                </button>
                            </div>
                        </div>

                        {/* Image Right Side */}
                        <div className="relative z-10 w-full lg:w-5/12 hidden md:block">
                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-4 border-slate-50">
                                <img
                                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop"
                                    alt="Premium Corporate Gift Box"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/10 transition-opacity group-hover:bg-slate-900/20 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Events & Products Section */}
                <section id="events" className="scroll-mt-32">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Available Programs</h2>
                            <p className="text-slate-500 mt-1.5 text-sm uppercase tracking-wider font-semibold">Active Selection Cycles</p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Gift size={28} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No active programs</h3>
                            <p className="text-slate-500 max-w-md">There are currently no active reward programs for your account. Check back later!</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {events.map((event) => (
                                <div key={event._id} className="bg-white rounded-xl p-6 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">

                                    {/* Event Header */}
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative z-10">
                                        <div className="text-center md:text-left">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                                    {event.status}
                                                </div>
                                                {orderedEventIds.includes(event._id) && (
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100/50">
                                                        <ShoppingCart size={11} className="mr-1.5" />
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{event.name}</h3>
                                            <p className="text-xs text-slate-400 font-semibold flex items-center justify-center md:justify-start uppercase tracking-wider">
                                                <Calendar size={14} className="mr-2" />
                                                Closes on <FormattedDate date={event.endDate} />
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push(orderedEventIds.includes(event._id) ? '/orders' : `/events/${event._id}`)}
                                            className={`${orderedEventIds.includes(event._id) ? 'bg-slate-50 text-slate-400 border border-slate-200' : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'} px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center group/more active:scale-95 w-full md:w-auto text-sm`}
                                        >
                                            {orderedEventIds.includes(event._id) ? 'View Request' : 'Select Reward'} <ArrowRight size={16} className="ml-2 transition-transform group-hover/more:translate-x-1" />
                                        </button>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                                        {event.products?.slice(0, 4).map((product) => (
                                            <div key={product._id} className="group bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md rounded-xl flex flex-col overflow-hidden transition-all duration-300">
                                                {/* Image Area */}
                                                <div className="aspect-square bg-slate-50 overflow-hidden relative border-b border-slate-100">
                                                    <ProductImageSlider
                                                        images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []), index: idx })}
                                                    />
                                                    <div className="absolute top-3 left-3 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                        {product.category}
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <div className="mb-4">
                                                        <h5 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2">{product.name}</h5>
                                                        {product.description && (
                                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                                        )}
                                                    </div>

                                                    {(() => {
                                                        const isOrdered = orderedEventIds.includes(event._id);
                                                        const quantity = getProductCartQuantity(product._id, event._id);

                                                        if (isOrdered) {
                                                            return (
                                                                <button
                                                                    disabled
                                                                    className="w-full bg-slate-50 text-slate-400 text-xs font-bold py-3 rounded-lg flex items-center justify-center space-x-2 border border-slate-100 cursor-not-allowed"
                                                                >
                                                                    <ShoppingCart size={14} />
                                                                    <span>Selected</span>
                                                                </button>
                                                            );
                                                        }

                                                        return quantity === 0 ? (
                                                            <button
                                                                onClick={() => handleAddToCart(product, event._id)}
                                                                className="w-full bg-slate-900 text-white hover:bg-indigo-600 text-xs font-bold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 group/btn"
                                                            >
                                                                <ShoppingCart size={14} />
                                                                <span>Add For Sample</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center bg-indigo-600 text-white rounded-lg overflow-hidden shadow-sm">
                                                                <button
                                                                    onClick={() => updateQuantity(product._id, event._id, quantity - 1)}
                                                                    className="px-3 py-2.5 hover:bg-indigo-700 transition-colors"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="font-bold text-xs flex-1 text-center">{quantity}</span>
                                                                <button
                                                                    onClick={() => handleAddToCart(product, event._id)}
                                                                    className={`px-3 py-2.5 transition-colors hover:bg-indigo-700 ${quantity >= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Image Slider Modal */}
            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText="Understood"
                type={confirmState.type}
            />

            {/* FAQ Section */}
            {/* <FaqSection /> */}

            {/* Subtle Footer */}
            <footer className="py-12 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                <p>&copy; {new Date().getFullYear()} {company?.name || subdomain} &bull; Corporate Gifting Operations</p>
            </footer>
        </div>
    );
}
