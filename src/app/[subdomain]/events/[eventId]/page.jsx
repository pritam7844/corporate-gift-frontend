'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventByIdAPI } from '../../../../services/event.service';
import { useAuthStore } from '../../../../store/authStore';
import { useCartStore } from '../../../../store/cartStore';
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Tag, Clock, Maximize2, Gift, Calculator } from 'lucide-react';
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

    if (error || !event) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button
                    onClick={() => router.push(`/events`)}
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back to Events
                </button>
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
                    {error || 'Event not found.'}
                </div>
            </div>
        );
    }

    const { products } = event;

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">

            {/* Header Content */}
            <div className="mb-12">
                <button
                    onClick={() => router.push(`/events`)}
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 font-bold transition-colors"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back to Events
                </button>

                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{event.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        {products.length} Exclusive Gifts
                    </span>
                    {event.endDate && (
                        <span className="flex items-center text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">
                            <Clock size={16} className="mr-1" />
                            Ends <FormattedDate date={event.endDate} />
                        </span>
                    )}
                    {isOrdered && (
                        <div className="flex items-center gap-3">
                            <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                <ShoppingCart size={16} className="mr-1.5" />
                                Order Already Placed
                            </span>
                            <button
                                onClick={() => router.push('/orders')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-black underline flex items-center"
                            >
                                View Order History <ChevronRight size={14} className="ml-0.5" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                    >
                        <Calculator size={16} />
                        Bulk order estimation
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Tag size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Gifts Found</h2>
                    <p className="text-gray-500 font-medium">There are currently no gifts assigned to this event.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const quantity = getProductCartQuantity(product._id);
                        const hasDiscount = product.discountedPrice && product.discountedPrice < product.actualPrice;

                        return (
                            <div key={product._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                                {/* Image Box */}
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                    <ProductImageSlider 
                                        images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])} 
                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []), index: idx })}
                                    />

                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm">
                                            {Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>

                                {/* Content Box */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{product.name}</h3>
                                    <p className="text-sm font-medium text-gray-400 capitalize mb-1">{product.category}</p>
                                    {product.description && (
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                                    )}

                                    <div className="mt-auto pt-1 flex items-end justify-between border-t border-gray-50 relative">
                                        <div>
                                            <div className="flex flex-col">
                                                {hasDiscount ? (
                                                    <><span className="text-gray-700 font-black text-xl">₹
                                                        <span className="text-gray-700 font-black text-xl line-through">{product.actualPrice}</span>
                                                    </span><span className="text-gray-900 font-black text-xl">₹{product.discountedPrice}</span></>
                                                ) : (
                                                    <span className="text-gray-900 font-black text-xl">₹{product.actualPrice}</span>
                                                )}
                                            </div>

                                        </div>

                                        {/* Add to Cart Controls */}
                                        <div className="relative">
                                            {isOrdered ? (
                                                <button
                                                    disabled
                                                    className="bg-gray-100 text-gray-400 font-bold px-4 py-2 rounded-xl text-sm cursor-not-allowed flex items-center"
                                                >
                                                    <ShoppingCart size={16} className="mr-1.5" /> PLACED
                                                </button>
                                            ) : quantity === 0 ? (
                                                <button
                                                    onClick={() => {
                                                        if (items.length >= 3) {
                                                            openConfirm('Limit Reached', 'Maximum 3 different products are allowed for a sample order.', () => { }, 'warning');
                                                            return;
                                                        }
                                                        addToCart(product, eventId);
                                                    }}
                                                    className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-colors flex items-center"
                                                >
                                                    <ShoppingCart size={16} className="mr-1.5" /> ADD
                                                </button>
                                            ) : (
                                                <div className="flex items-center bg-blue-600 text-white rounded-xl overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(product._id, eventId, quantity - 1)}
                                                        className="px-3 py-2 hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-bold text-sm px-2 w-8 text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (quantity >= 1) {
                                                                openConfirm('Limit Reached', 'Maximum 1 unit per product is allowed for sample orders.', () => { }, 'warning');
                                                                return;
                                                            }
                                                            if (items.length >= 3) {
                                                                openConfirm('Limit Reached', 'Maximum 3 different products are allowed for a sample order.', () => { }, 'warning');
                                                                return;
                                                            }
                                                            addToCart(product, eventId);
                                                        }}
                                                        className={`px-3 py-2 transition-colors hover:bg-blue-700 ${quantity >= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Plus size={16} />
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
