'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductByIdAPI } from '../../../../../../services/product.service';
import { getEventByIdAPI } from '../../../../../../services/event.service';
import { useAuthStore } from '../../../../../../store/authStore';
import { useCartStore } from '../../../../../../store/cartStore';
import { ChevronLeft, ShoppingCart, Plus, Minus, Tag, Clock, Maximize2, ShieldCheck, Gift } from 'lucide-react';
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
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-red-500 font-bold mb-4">{error || 'Product not found'}</p>
            <button onClick={() => router.back()} className="text-indigo-600 font-bold hover:underline">Go Back</button>
        </div>
    );

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    const quantity = getProductQuantity();
    const hasDiscount = product.discountedPrice && product.discountedPrice < product.actualPrice;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Breadcrumbs / Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 font-bold transition-colors text-xs uppercase tracking-widest"
            >
                <ChevronLeft size={16} className="mr-2" /> Back to Selection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                {/* Image Section */}
                <div className="space-y-8 min-w-0">
                    <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative border border-slate-100 group">
                        <ProductImageSlider
                            images={images}
                            onOpenModal={(idx) => setSliderModal({ isOpen: true, images, index: idx })}
                        />
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSliderModal({ isOpen: true, images, index: idx })}
                                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all flex-shrink-0"
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col min-w-0">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-100/50">
                                {product.category}
                            </span>
                            {event && (
                                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                                    {event.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">{product.name}</h1>
                        
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8 overflow-hidden">
                            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line break-words">
                                {product.description || 'No detailed description available for this reward item.'}
                            </p>
                        </div>

                        <div className="flex items-end gap-6 mb-10">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Standard Value</p>
                                <p className="text-3xl font-bold text-slate-300 line-through">₹{product.actualPrice}</p>
                            </div>
                            <div className="text-right ml-auto">
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Redemption Value</p>
                                <p className="text-5xl font-black text-indigo-600">₹{product.discountedPrice || product.actualPrice}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-8 border-t border-slate-100">
                        {isOrdered ? (
                            <div className="w-full bg-slate-50 border border-slate-100 text-slate-400 py-6 rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest space-x-3">
                                <ShoppingCart size={20} />
                                <span>Selection Already Submitted</span>
                            </div>
                        ) : quantity === 0 ? (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center space-x-3 active:scale-[0.98]"
                            >
                                <Plus size={24} />
                                <span>Add For Sample</span>
                            </button>
                        ) : (
                            <div className="flex items-center bg-indigo-600 text-white rounded-2xl overflow-hidden shadow-xl shadow-indigo-600/20">
                                <button
                                    onClick={() => updateQuantity(productId, eventId, quantity - 1)}
                                    className="p-6 hover:bg-indigo-700 transition-colors flex-1 flex justify-center"
                                >
                                    <Minus size={24} />
                                </button>
                                <span className="font-black text-2xl px-12 border-x border-indigo-500/30">{quantity}</span>
                                <button
                                    onClick={handleAddToCart}
                                    className={`p-6 transition-colors hover:bg-indigo-700 flex-1 flex justify-center ${quantity >= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        )}
                        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
                            Free corporate delivery &bull; Quality inspection guaranteed
                        </p>
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
