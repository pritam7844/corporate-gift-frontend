'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventByIdAPI } from '../../../../services/event.service';
import { useAuthStore } from '../../../../store/authStore';
import { useCartStore } from '../../../../store/cartStore';
import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Tag, Clock, Maximize2, Gift, Calculator, Maximize, Eye, Loader2 } from 'lucide-react';
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
    const [isOrdered, setIsOrdered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

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
                const data = await getEventByIdAPI(eventId);
                setEvent(data);

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

    const getProductCartQuantity = (productId) => {
        const item = items.find(i => i.product._id === productId && i.eventId === eventId);
        return item ? item.quantity : 0;
    };
    const handleAddToCart = (product) => {
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
            <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--color-text)] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--color-text)] animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button
                    onClick={() => router.push(`/events`)}
                    className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ChevronLeft size={16} className="mr-2" /> Back to Programs
                </button>
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100 shadow-sm">
                    {error || 'Program not found.'}
                </div>
            </div>
        );
    }

    const { products } = event;

    return (
        <main className="max-w-7xl mx-auto px-6 py-12">
            {/* Header Content */}
            <div className="mb-16 border-b border-[var(--color-border)] pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex-1">
                        <button
                            onClick={() => router.push(`/events`)}
                            className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 font-black transition-colors text-[10px] uppercase tracking-[0.2em]"
                        >
                            <ChevronLeft size={16} className="mr-2" /> Back to Programs
                        </button>

                        <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text)] tracking-tight mb-6">{event.name}</h1>

                        <div className="flex flex-wrap items-center gap-4">
                            <span className="px-4 py-1.5 bg-[var(--color-accent)] text-[var(--color-text)] rounded-lg border border-[var(--color-border)] text-[10px] font-black uppercase tracking-[0.2em]">
                                {products.length} Curated Options
                            </span>
                            {event.endDate && (
                                <span className="flex items-center text-[var(--color-text-muted)] bg-[var(--color-bg)] px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Clock size={14} className="mr-2" />
                                    Ends <FormattedDate date={event.endDate} />
                                </span>
                            )}
                            {isOrdered && (
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <ShoppingCart size={14} className="mr-2" />
                                        Selection Submitted
                                    </span>
                                    <button
                                        onClick={() => router.push('/orders')}
                                        className="text-[var(--color-text)] hover:opacity-70 text-[10px] font-black underline flex items-center uppercase tracking-[0.2em] transition-all"
                                    >
                                        History <ChevronRight size={14} className="ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex-shrink-0 flex items-center gap-3 bg-[var(--color-text)] text-[var(--color-surface)] px-8 py-4 rounded-xl text-[10px] font-black hover:opacity-90 transition-all shadow-xl uppercase tracking-[0.2em]"
                    >
                        <Calculator size={16} />
                        Bulk Estimate
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="text-center py-32 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-xl">
                    <div className="w-20 h-20 bg-[var(--color-bg)] text-[var(--color-text-muted)] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[var(--color-border)] opacity-30">
                        <Tag size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-text)] mb-3">No Rewards Available</h2>
                    <p className="text-[var(--color-text-muted)] font-bold opacity-70">There are currently no items assigned to this program.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {products.map((product) => {
                        const quantity = getProductCartQuantity(product._id);
                        const hasDiscount = product.discountedPrice && product.discountedPrice < product.actualPrice;

                        return (

                            <div 
                                key={product._id} 
                                onClick={() => router.push(`/events/${eventId}/products/${product._id}`)}
                                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer relative"
                            >
                                {/* Image Box */}
                                <div className="h-[24rem] bg-[var(--color-bg)] relative overflow-hidden flex items-center justify-center border-b border-[var(--color-border)]">
                                    <ProductImageSlider
                                        images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                        showFullscreen={false}
                                    />
                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4 bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1 rounded-lg text-[9px] font-black text-[var(--color-text)] uppercase tracking-[0.2em] shadow-md z-10">
                                        {product.category}
                                    </div>

                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black px-3 py-1 rounded-lg shadow-md uppercase tracking-[0.2em] z-10">
                                            {Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)}% Advantage
                                        </div>
                                    )}
                                </div>

                                {/* Content Box */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-lg font-black text-[var(--color-text)] leading-tight line-clamp-2 group-hover:opacity-70 transition-opacity mb-2">{product.name}</h3>

                                    {product.description && (
                                        <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed font-bold opacity-70">{product.description}</p>
                                    )}

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
                                        <div className="flex flex-col">
                                            {hasDiscount ? (
                                                <>
                                                    <span className="text-[var(--color-text-muted)] text-[10px] line-through font-black opacity-40">₹{product.actualPrice}</span>
                                                    <span className="text-[var(--color-text)] font-black text-xl tracking-tight">₹{product.discountedPrice}</span>
                                                </>
                                            ) : (
                                                <span className="text-[var(--color-text)] font-black text-xl tracking-tight">₹{product.actualPrice}</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                            {isOrdered ? (
                                                <div className="bg-[var(--color-bg)] text-[var(--color-text-muted)] font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] border border-[var(--color-border)] shadow-inner">
                                                    Locked
                                                </div>
                                            ) : quantity === 0 ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                        className="bg-[var(--color-text)] text-[var(--color-surface)] hover:opacity-90 px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-3 group/btn"
                                                    >
                                                        <ShoppingCart size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Sample</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg border border-[var(--color-text)]">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(product._id, eventId, quantity - 1);
                                                        }}
                                                        className="px-4 py-3 hover:bg-white/10 transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-black text-xs px-2 min-w-[2.5rem] text-center">{quantity}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                        className={`px-4 py-3 transition-colors ${quantity >= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
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

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />

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
