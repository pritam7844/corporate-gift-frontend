'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { Gift, Calendar, ShoppingCart, Sparkles, ArrowRight, Plus, Minus, Maximize2 } from 'lucide-react';
import ImageSliderModal from '../../components/common/ImageSliderModal';

export default function CompanyLandingPage() {
    const { subdomain } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { items, addToCart, updateQuantity } = useCartStore();

    const [company, setCompany] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Image Popup State
    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

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
                setEvents(eventsRes.data.data || []);
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
            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">

                {/* Personalized Hero Dashboard */}
                <section className="mb-20 relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-70"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 opacity-70"></div>

                    <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                        {/* Decorative Background Pattern */}
                        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex-1">
                            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100/50">
                                <Sparkles size={16} />
                                <span>{company?.name || subdomain} Rewards</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">
                                Welcome back,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    {user?.name || 'Employee'}
                                </span>
                            </h1>
                            <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-8">
                                We're excited to celebrate your milestones. Explore your active events below and claim the premium corporate gifts you deserve.
                            </p>

                            {/* Summary Cards */}
                            <div className="flex gap-4 w-full overflow-x-auto pb-4 md:pb-0 snap-x mb-8">
                                <div className="min-w-[140px] bg-gray-50 rounded-2xl p-5 border border-gray-100 snap-center flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 mb-1">{events.length}</p>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Events</p>
                                </div>

                                <div className="min-w-[140px] bg-gray-50 rounded-2xl p-5 border border-gray-100 snap-center flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                                        <Gift size={20} />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 mb-1">
                                        {events.reduce((total, event) => total + (event.products?.length || 0), 0)}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gifts</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center shadow-md shadow-gray-200"
                                >
                                    Browse Events <ArrowRight size={18} className="ml-2" />
                                </button>
                            </div>
                        </div>

                        {/* Image Right Side */}
                        <div className="relative z-10 w-full lg:w-5/12 hidden md:block">
                            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 transform hover:scale-[1.02] transition-transform duration-500 border-4 border-white">
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
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 relative z-10">
                                        <div>
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider mb-4 border border-green-100">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                {event.status}
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-3">{event.name}</h3>
                                            <p className="text-gray-500 font-medium flex items-center">
                                                <Calendar size={18} className="mr-2 text-gray-400" />
                                                Closes on {new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                                        {event.products?.map((product) => (
                                            <div key={product._id} className="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
                                                {/* Image Area */}
                                                <div className="aspect-square bg-[#F8F9FA] overflow-hidden relative border-b border-gray-50">
                                                    {product.images && product.images.length > 0 ? (
                                                        <div className="flex w-full h-full overflow-x-auto overflow-y-hidden items-center snap-x snap-mandatory no-scrollbar cursor-pointer group/images" onClick={() => setSliderModal({ isOpen: true, images: product.images, index: 0 })}>
                                                            {product.images.map((img, idx) => (
                                                                <div key={idx} className="flex-shrink-0 w-full h-full relative">
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`${product.name} ${idx}`} 
                                                                        className="w-full h-full object-cover snap-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/images:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Maximize2 className="text-white scale-150" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : product.image ? (
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Gift size={48} />
                                                        </div>
                                                    )}
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
                                                        const quantity = getProductCartQuantity(product._id, event._id);
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
                                                                    disabled={quantity >= 3}
                                                                    title={quantity >= 3 ? 'Maximum 3 per item' : ''}
                                                                    className="px-4 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
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

            {/* Subtle Footer */}
            <footer className="py-8 text-center text-sm font-medium text-gray-400">
                <p>&copy; {new Date().getFullYear()} {company?.name || subdomain} Corporate Gifts</p>
            </footer>
        </div>
    );
}
