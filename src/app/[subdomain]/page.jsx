'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { Gift, Calendar, ShoppingCart, Sparkles, ArrowRight, Plus, Minus, Maximize2, Tag, Eye } from 'lucide-react';
import Link from 'next/link';
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
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: 'var(--color-text)' }}></div>
                    <p className="font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Safety check
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">

                {/* Personalized Hero Dashboard */}
                <section className="mb-16">
                    <div className="rounded-2xl p-8 md:p-12 border flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="absolute right-0 top-0 w-1/2 h-full skew-x-12 translate-x-1/4 pointer-events-none" style={{ backgroundColor: 'var(--color-bg)', opacity: 0.5 }}></div>

                        <div className="relative z-10 flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-6 border" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)', borderColor: 'var(--color-accent-dark)' }}>
                                <span>{company?.name || subdomain} Portal</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 leading-[1.15]" style={{ color: 'var(--color-text)' }}>
                                Welcome back,<br />
                                <span style={{ color: 'var(--color-text)' }}>
                                    {user?.name || 'Employee'}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg max-w-lg leading-relaxed mb-10 mx-auto lg:mx-0" style={{ color: 'var(--color-text-muted)' }}>
                                Discover curated corporate gift programs designed specifically for you. Select your preferred rewards below.
                            </p>

                            {/* Summary Cards */}
                            <div className="flex gap-4 w-full overflow-x-auto pb-4 md:pb-0 snap-x mb-10 justify-center lg:justify-start hide-scrollbar">
                                <div className="min-w-[140px] rounded-xl p-5 border snap-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--color-text)' }}>{events.length}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Active Events</p>
                                </div>

                                <div className="min-w-[140px] rounded-xl p-5 border snap-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                        <Gift size={20} />
                                    </div>
                                    <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--color-text)' }}>
                                        {events.reduce((total, event) => total + (event.products?.length || 0), 0)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Gift Options</p>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="px-8 py-4 rounded-xl font-black transition-all flex items-center active:scale-95" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
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
                    <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Available Programs</h2>
                            <p className="mt-1.5 text-sm uppercase tracking-wider font-black" style={{ color: 'var(--color-text-muted)' }}>Active Selection Cycles</p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="p-16 rounded-2xl border text-center flex flex-col items-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-border)' }}>
                                <Gift size={28} />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text)' }}>No active programs</h3>
                            <p className="max-w-md" style={{ color: 'var(--color-text-muted)' }}>There are currently no active reward programs for your account. Check back later!</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {events.map((event) => (
                                <div key={event._id} className="rounded-2xl p-6 md:p-10 border relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

                                    {/* Event Header */}
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative z-10">
                                        <div className="text-center md:text-left">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
                                                    <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: 'var(--color-text)' }}></div>
                                                    {event.status}
                                                </div>
                                                {orderedEventIds.includes(event._id) && (
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                                                        <ShoppingCart size={11} className="mr-1.5" />
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black mb-2 tracking-tight" style={{ color: 'var(--color-text)' }}>{event.name}</h3>
                                            <p className="text-xs font-bold flex items-center justify-center md:justify-start uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                                <Calendar size={14} className="mr-2" />
                                                Closes on <FormattedDate date={event.endDate} />
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push(orderedEventIds.includes(event._id) ? '/orders' : `/events/${event._id}`)}
                                            className="px-6 py-3 rounded-xl font-black transition-all flex items-center justify-center active:scale-95 w-full md:w-auto text-sm"
                                            style={orderedEventIds.includes(event._id) ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' } : { backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                                        >
                                            {orderedEventIds.includes(event._id) ? 'View Request' : 'Select Reward'} <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                        {event.products?.slice(0, 3).map((product) => (
                                            <div key={product._id} className="group rounded-xl flex flex-col overflow-hidden transition-all duration-300 border hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                                                <div className="h-100 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                                                    <Link href={`/events/${event._id}/products/${product._id}`} className="block h-full">
                                                        <ProductImageSlider
                                                            images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                                            showFullscreen={false}
                                                        />
                                                    </Link>
                                                    {product.category && <div className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>{product.category}</div>}
                                                </div>

                                                <Link href={`/events/${event._id}/products/${product._id}`} className="p-5 flex-1 flex flex-col">
                                                    <div className="mb-4">
                                                        <h5 className="font-black leading-snug mb-1 line-clamp-2" style={{ color: 'var(--color-text)' }}>{product.name}</h5>
                                                        {product.description && (
                                                            <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{product.description}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                                <div className="px-5 pb-5 mt-auto">

                                                    {(() => {
                                                        const isOrdered = orderedEventIds.includes(event._id);
                                                        const quantity = getProductCartQuantity(product._id, event._id);

                                                        if (isOrdered) {
                                                            return (
                                                                <button disabled className="w-full text-xs font-black py-3 rounded-lg flex items-center justify-center space-x-2 border cursor-not-allowed" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                                                                    <ShoppingCart size={14} /><span>Selected</span>
                                                                </button>
                                                            );
                                                        }

                                                        return quantity === 0 ? (
                                                            <div className="space-y-2">
                                                                <Link href={`/events/${event._id}/products/${product._id}`} className="w-full text-xs font-black py-3 rounded-lg transition-colors flex items-center justify-center border" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                                                                    <span>View Details</span>
                                                                </Link>
                                                                <button onClick={() => handleAddToCart(product, event._id)} className="w-full text-xs font-black py-3 rounded-lg transition-all flex items-center justify-center space-x-2 active:scale-95" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                                                    <ShoppingCart size={14} /><span>Add For Sample</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                                                <button onClick={() => updateQuantity(product._id, event._id, quantity - 1)} className="px-3 py-2.5 hover:opacity-80 transition-opacity"><Minus size={14} /></button>
                                                                <span className="font-black text-xs flex-1 text-center">{quantity}</span>
                                                                <button onClick={() => handleAddToCart(product, event._id)} className={`px-3 py-2.5 transition-opacity ${quantity >= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}`}><Plus size={14} /></button>
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
            <footer className="py-12 text-center text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                <p>&copy; {new Date().getFullYear()} {company?.name || subdomain} &bull; Corporate Gifting Operations</p>
            </footer>
        </div>
    );
}
