'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductByIdAPI } from '../../../../../../services/product.service';
import { getEventByIdAPI } from '../../../../../../services/event.service';
import { useAuthStore } from '../../../../../../store/authStore';
import { useCartStore } from '../../../../../../store/cartStore';
import { ChevronLeft, ShoppingCart, Plus, Minus, Tag, Clock, Maximize2, ShieldCheck, Gift, Loader2, Truck } from 'lucide-react';
import FormattedDate from '../../../../../../components/common/FormattedDate';
import ProductImageSlider from '../../../../../../components/common/ProductImageSlider';
import ImageSliderModal from '../../../../../../components/common/ImageSliderModal';
import api from '../../../../../../lib/api';

export default function EmployeeProductDetailPage() {
    const { subdomain, eventId, productId } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { items, addToCart, updateQuantity } = useCartStore();

    const [product, setProduct] = useState(null);
    const [event, setEvent] = useState(null);
    const [isOrdered, setIsOrdered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, eventData] = await Promise.all([
                    getProductByIdAPI(productId),
                    getEventByIdAPI(eventId)
                ]);
                setProduct(productData);
                setEvent(eventData);

                // Check if already ordered
                const requestsRes = await api.get('/gift-requests/my-requests');
                const userRequests = requestsRes.data.data || [];
                const alreadyOrdered = userRequests.some(req =>
                    req.eventId._id === eventId &&
                    new Date(req.createdAt) >= new Date(eventData.startDate)
                );
                setIsOrdered(alreadyOrdered);

            } catch (err) {
                setError('Failed to load product or event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId, eventId]);

    const getProductQuantity = () => {
        const item = items.find(i => i.product._id === productId && i.eventId === eventId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = () => {
        if (items.length > 0 && items[0].eventId !== eventId) {
            alert('Your cart contains items from another event. Please clear it first.');
            return;
        }
        if (items.length >= 3) {
            alert('Maximum 3 different products are allowed for a sample order.');
            return;
        }
        if (getProductQuantity() >= 1) {
            alert('Maximum 1 unit per product is allowed for sample orders.');
            return;
        }
        addToCart(product, eventId);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-bg)]">
            <Loader2 className="w-8 h-8 text-[var(--color-text)] animate-spin" />
        </div>
    );

    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-red-500 font-bold mb-4">{error || 'Product not found'}</p>
            <button onClick={() => router.back()} className="text-[var(--color-text)] font-black hover:opacity-70 text-[10px] uppercase tracking-[0.2em] transition-all">Go Back</button>
        </div>
    );

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    const quantity = getProductQuantity();
    const hasDiscount = product.discountedPrice && product.discountedPrice < product.actualPrice;

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12">
            {/* Navigation */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-10 font-black transition-all text-[10px] uppercase tracking-[0.2em]"
            >
                <div className="w-10 h-10 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mr-4 shadow-sm hover:bg-[var(--color-bg)]">
                    <ChevronLeft size={16} />
                </div>
                Return to Selection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-[var(--color-surface)] p-8 md:p-16 rounded-[1rem] border border-[var(--color-border)] shadow-2xl relative overflow-hidden">
                {/* Image Section */}
                <div className="space-y-10 min-w-0">
                    <div className="aspect-square bg-[var(--color-bg)] rounded-[1rem] overflow-hidden relative border border-[var(--color-border)] group shadow-inner">
                        <ProductImageSlider
                            images={images}
                            onOpenModal={(idx) => setSliderModal({ isOpen: true, images, index: idx })}
                        />
                        <div className="absolute top-6 left-6 flex flex-col gap-3">
                            <span className="px-4 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[9px] font-black text-[var(--color-text)] uppercase tracking-[0.2em] shadow-md">
                                {product.category}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSliderModal({ isOpen: true, images, index: idx })}
                                    className="w-24 h-24 rounded-md overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--color-text)] transition-all flex-shrink-0 p-1 bg-[var(--color-surface)]"
                                >
                                    <img src={img} className="w-full h-full object-cover rounded-md" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col min-w-0">
                    <div className="flex-grow">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-sm">
                                <Gift size={20} />
                            </div>
                            {event && (
                                <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                                    Curated for {event.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text)] leading-tight mb-8 tracking-tight">{product.name}</h1>

                        <div className="bg-[var(--color-bg)]/50 p-10 rounded-[0.5rem] border border-[var(--color-border)] mb-10">
                            <p className="text-[var(--color-text)] font-bold text-lg leading-relaxed whitespace-pre-line break-words opacity-80">
                                {product.description || 'No detailed description available for this reward item.'}
                            </p>
                        </div>

                        <div className="flex items-end justify-between gap-10 mb-12">
                            <div className="space-y-2">
                                <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-[0.2em] opacity-50">Market Value</p>
                                <p className="text-2xl font-black text-[var(--color-text-muted)] line-through opacity-30">₹{product.actualPrice.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right space-y-2">
                                <p className="text-[10px] text-[var(--color-text)] font-black uppercase tracking-[0.2em]">Corporate Price</p>
                                <p className="text-5xl font-black text-[var(--color-text)] tracking-tighter">₹{(product.discountedPrice || product.actualPrice).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-10 border-t border-[var(--color-border)]">
                        {isOrdered ? (
                            <div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] py-6 rounded-xl flex items-center justify-center font-black uppercase tracking-[0.2em] space-x-4 shadow-inner">
                                <ShieldCheck size={24} className="opacity-40" />
                                <span>Order Already Placed</span>
                            </div>
                        ) : quantity === 0 ? (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[var(--color-text)] text-[var(--color-surface)] py-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98]"
                            >
                                <ShoppingCart size={20} />
                                <span>Add Selection For Sample</span>
                            </button>
                        ) : (
                            <div className="flex items-center bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl overflow-hidden shadow-2xl border border-[var(--color-text)]">
                                <button
                                    onClick={() => updateQuantity(productId, eventId, quantity - 1)}
                                    className="p-6 hover:bg-white/10 transition-colors flex-1 flex justify-center"
                                >
                                    <Minus size={24} />
                                </button>
                                <span className="font-black text-3xl px-12 border-x border-white/20">{quantity}</span>
                                <button
                                    onClick={handleAddToCart}
                                    className={`p-6 transition-colors flex-1 flex justify-center ${quantity >= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-8 mt-10 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] opacity-50">
                            <span className="flex items-center gap-2"><Truck size={14} /> Corporate Delivery</span>
                            <span className="flex items-center gap-2"><ShieldCheck size={14} /> QC Inspected</span>
                        </div>
                    </div>
                </div>
            </div>

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />
        </div>
    );
}
