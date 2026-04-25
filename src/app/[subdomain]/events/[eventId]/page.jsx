'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventByIdAPI } from '../../../../services/event.service';
import { useAuthStore } from '../../../../store/authStore';
import { useCartStore } from '../../../../store/cartStore';
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Tag, Clock, Maximize2, Gift, Calculator, Maximize, Eye } from 'lucide-react';
import Link from 'next/link';
import FormattedDate from '../../../../components/common/FormattedDate';
import ImageSliderModal from '../../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../../components/common/ProductImageSlider';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import BulkEstimationModal from '../../../../components/common/BulkEstimationModal';

export default function EventProductsPage() {
    const { subdomain, eventId } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { items, addToCart, removeFromCart, updateQuantity } = useCartStore();

    const [event, setEvent] = useState(null);
    const [isOrdered, setIsOrdered] = useState(false); // New state to track participation
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
        const fetchEventDetails = async () => {
            try {
                // Fetch Event Details
                const data = await getEventByIdAPI(eventId);
                setEvent(data);

                // Check if user has already ordered for this event in the current cycle
                const requestsRes = await import('../../../../lib/api').then(m => m.default.get('/gift-requests/my-requests'));
                const userRequests = requestsRes.data.data || [];
                const alreadyOrdered = userRequests.some(req =>
                    req.eventId._id === eventId &&
                    new Date(req.createdAt) >= new Date(data.startDate)
                );
                setIsOrdered(alreadyOrdered);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    // Derived state for the specific event's cart items
    const getProductCartQuantity = (productId) => {
        const item = items.find(i => i.product._id === productId && i.eventId === eventId);
        return item ? item.quantity : 0;
    };
    const handleAddToCart = (product) => {
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

        const quantity = getProductCartQuantity(product._id);
        if (quantity >= 1) {
            openConfirm('Limit Reached', 'Maximum 1 unit per product is allowed for sample orders.', () => { }, 'warning');
            return;
        }

        addToCart(product, eventId);
    };

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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button
                    onClick={() => router.push(`/events`)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-semibold"
                >
                    <ChevronLeft size={18} className="mr-1" /> Back to Programs
                </button>
                <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-100/50">
                    {error || 'Program not found.'}
                </div>
            </div>
        );
    }

    const { products } = event;

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">

            {/* Header Content */}
            <div className="mb-12 border-b border-slate-200 pb-8">
                <button
                    onClick={() => router.push(`/events`)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 font-bold transition-colors text-xs uppercase tracking-wider"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back to Programs
                </button>

                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">{event.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/50 uppercase tracking-wider">
                        {products.length} Options
                    </span>
                    {event.endDate && (
                        <span className="flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50 uppercase tracking-wider">
                            <Clock size={14} className="mr-1.5" />
                            Ends <FormattedDate date={event.endDate} />
                        </span>
                    )}
                    {isOrdered && (
                        <div className="flex items-center gap-3">
                            <span className="flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider">
                                <ShoppingCart size={14} className="mr-1.5" />
                                Selection Submitted
                            </span>
                            <button
                                onClick={() => router.push('/orders')}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold underline flex items-center uppercase tracking-wider"
                            >
                                History <ChevronRight size={12} className="ml-0.5" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 transition-all shadow-sm uppercase tracking-wider"
                    >
                        <Calculator size={14} />
                        Bulk Estimate
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Tag size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Rewards Available</h2>
                    <p className="text-slate-500 text-sm font-medium">There are currently no items assigned to this program.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => {
                        const quantity = getProductCartQuantity(product._id);
                        const hasDiscount = product.discountedPrice && product.discountedPrice < product.actualPrice;

                        return (
                            <div key={product._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col">
                                {/* Image Box */}
                                <div className="h-80 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                    <Link href={`/events/${eventId}/products/${product._id}`} className="block h-full w-full">
                                        <ProductImageSlider
                                            images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                            showFullscreen={false}
                                        />
                                    </Link>
                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3 bg-white border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                                        {product.category}
                                    </div>

                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                            {Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>

                                {/* Content Box */}
                                <Link href={`/events/${eventId}/products/${product._id}`} className="p-5 flex-grow flex flex-col group/link">
                                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2 min-h-[2.5rem] group-hover/link:text-indigo-600 transition-colors">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                                    )}
                                </Link>
                                <div className="px-5 pb-5">

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                                        <div>
                                            {hasDiscount ? (
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-[10px] line-through font-semibold">₹{product.actualPrice}</span>
                                                    <span className="text-indigo-600 font-bold text-lg">₹{product.discountedPrice}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-900 font-bold text-lg">₹{product.actualPrice}</span>
                                            )}
                                        </div>

                                        {/* Add to Cart Controls */}
                                        <div className="relative">
                                            {isOrdered ? (
                                                <div className="bg-slate-50 text-slate-400 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border border-slate-100">
                                                    Selected
                                                </div>
                                            ) : quantity === 0 ? (
                                                <div className="space-y-2">
                                                    <Link
                                                        href={`/events/${eventId}/products/${product._id}`}
                                                        className="w-full bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 border border-slate-200"
                                                    >
                                                        {/* <Eye size={14} /> */}
                                                        <span>View Details</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="w-full bg-slate-900 text-white hover:bg-indigo-600 text-xs font-bold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 group/btn shadow-md p-5"
                                                    >
                                                        <ShoppingCart size={14} />
                                                        <span>Add For Sample</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center bg-indigo-600 text-white rounded-lg overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(product._id, eventId, quantity - 1)}
                                                        className="px-2.5 py-1.5 hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold text-xs px-2 min-w-[24px] text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className={`px-2.5 py-1.5 transition-colors hover:bg-indigo-700 ${quantity >= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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

            <BulkEstimationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                products={products}
            />
        </main>
    );
}
