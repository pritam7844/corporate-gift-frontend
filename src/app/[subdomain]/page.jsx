'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { Gift, Calendar, ShoppingCart, Sparkles, ArrowRight, Plus, Minus, Maximize2 } from 'lucide-react';
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

                // Fetch Active Events for this Company
                const eventsRes = await api.get('/events/my-events');
                const activeEvents = eventsRes.data.data || [];
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
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-blue-100 overflow-x-hidden">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">

                {/* Personalized Hero Dashboard */}
                <section className="mb-20 relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-70"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 opacity-70"></div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                        {/* Decorative Background Pattern */}
                        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-50/20 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 border border-blue-100/50">
                                <span>{company?.name || subdomain} Rewards</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-gray-900 leading-[1.1]">
                                Welcome back,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    {user?.name || 'Employee'}
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed mb-10 mx-auto lg:mx-0">
                                We're excited to celebrate your milestones. Explore your active events below and claim the premium corporate gifts you deserve.
                            </p>

                            {/* Summary Cards */}
                            <div className="flex gap-4 w-full overflow-x-auto pb-4 md:pb-0 snap-x mb-10 justify-center lg:justify-start hide-scrollbar">
                                <div className="min-w-[150px] bg-white rounded-3xl p-6 border border-gray-100 snap-center flex-shrink-0 shadow-lg shadow-gray-200/20">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-blue-50/30">
                                        <Calendar size={22} />
                                    </div>
                                    <p className="text-3xl font-black text-gray-900 mb-1 leading-none">{events.length}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Events</p>
                                </div>

                                <div className="min-w-[150px] bg-white rounded-3xl p-6 border border-gray-100 snap-center flex-shrink-0 shadow-lg shadow-gray-200/20">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-indigo-50/30">
                                        <Gift size={22} />
                                    </div>
                                    <p className="text-3xl font-black text-gray-900 mb-1 leading-none">
                                        {events.reduce((total, event) => total + (event.products?.length || 0), 0)}
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gift Options</p>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="bg-black text-white px-8 py-4.5 rounded-[1.25rem] font-black hover:bg-blue-600 transition-all flex items-center shadow-2xl shadow-blue-900/10 active:scale-95"
                                >
                                    Browse Events <ArrowRight size={18} className="ml-3" />
                                </button>
                            </div>
                        </div>

                        {/* Image Right Side */}
                        <div className="relative z-10 w-full lg:w-5/12 hidden md:block">
                            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop"
                                    alt="Premium Corporate Gift Box"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Events & Products Section */}
                <section id="events" className="scroll-mt-32">
                    <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-6">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-gray-900">Your Active Events</h2>
                            <p className="text-gray-500 mt-2">Select your gifts from the programs below.</p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="bg-white p-16 rounded-[2rem] border border-gray-100 text-center shadow-sm flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Gift size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No active events entirely</h3>
                            <p className="text-gray-500 max-w-md">There are currently no active reward programs for your account. Check back later!</p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {events.map((event) => (
                                <div key={event._id} className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">

                                    {/* Event Header */}
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 relative z-10">
                                        <div className="text-center md:text-left">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                                <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                    {event.status}
                                                </div>
                                                {orderedEventIds.includes(event._id) && (
                                                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                        <ShoppingCart size={12} className="mr-2" />
                                                        Order Placed
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tighter">{event.name}</h3>
                                            <p className="text-sm text-gray-400 font-bold flex items-center justify-center md:justify-start uppercase tracking-widest">
                                                <Calendar size={16} className="mr-2 opacity-50" />
                                                Closes on {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push(orderedEventIds.includes(event._id) ? '/orders' : `/events/${event._id}`)}
                                            className={`${orderedEventIds.includes(event._id) ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'} px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center group/more active:scale-95 w-full md:w-auto`}
                                        >
                                            {orderedEventIds.includes(event._id) ? 'View Request' : 'Choose Gift'} <ArrowRight size={18} className="ml-3 transition-transform group-hover/more:translate-x-1" />
                                        </button>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                                        {event.products?.slice(0, 4).map((product) => (
                                            <div key={product._id} className="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
                                                {/* Image Area */}
                                                <div className="aspect-square bg-[#F8F9FA] overflow-hidden relative border-b border-gray-50">
                                                    <ProductImageSlider
                                                        images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []), index: idx })}
                                                    />
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-900 uppercase tracking-wider shadow-sm">
                                                        {product.category}
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                                                    <div className="mb-4">
                                                        <h5 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h5>
                                                        {product.description && (
                                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                                        )}
                                                    </div>

                                                    {(() => {
                                                        const isOrdered = orderedEventIds.includes(event._id);
                                                        const quantity = getProductCartQuantity(product._id, event._id);

                                                        if (isOrdered) {
                                                            return (
                                                                <button
                                                                    disabled
                                                                    className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed"
                                                                >
                                                                    <ShoppingCart size={18} />
                                                                    <span>Request Placed</span>
                                                                </button>
                                                            );
                                                        }

                                                        return quantity === 0 ? (
                                                            <button
                                                                onClick={() => handleAddToCart(product, event._id)}
                                                                className="w-full bg-gray-900 text-white hover:bg-blue-600 font-bold py-3.5 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 group/btn"
                                                            >
                                                                <ShoppingCart size={18} className="transition-transform group-hover/btn:scale-110" />
                                                                <span>Add to Cart</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center bg-blue-600 text-white rounded-xl overflow-hidden shadow-sm">
                                                                <button
                                                                    onClick={() => updateQuantity(product._id, event._id, quantity - 1)}
                                                                    className="px-4 py-3 hover:bg-blue-700 transition-colors"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="font-bold text-sm flex-1 text-center">{quantity}</span>
                                                                <button
                                                                    onClick={() => handleAddToCart(product, event._id)}
                                                                    className={`px-4 py-3 transition-colors hover:bg-blue-700 ${quantity >= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <Plus size={16} />
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
            <footer className="py-8 text-center text-sm font-medium text-gray-400">
                <p>&copy; {new Date().getFullYear()} {company?.name || subdomain} Corporate Gifts</p>
            </footer>
        </div>
    );
}
