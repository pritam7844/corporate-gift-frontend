'use client';

import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { X, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartDrawer({ isOpen, onClose }) {
    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
    const user = useAuthStore((state) => state.user);
    const [mounted, setMounted] = useState(false);

    const [isCheckoutMode, setIsCheckoutMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: ''
    });

    useEffect(() => {
        setMounted(true);
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
        }
    }, [user]);

    // Reset when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setIsCheckoutMode(false), 300);
        }
    }, [isOpen]);

    if (!mounted) return null;

    // Calculate subtotal (without discounts) to show savings
    const subtotal = items.reduce((total, item) => total + ((item.product.actualPrice || item.product.price) * item.quantity), 0);
    const total = getCartTotal();
    const savings = subtotal > total ? subtotal - total : 0;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Group items by event for the backend
            // In a real app, you might create an order per event or a combined order
            // For now, we'll send the whole cart and the first eventId (assuming single event checkout)
            const eventId = items[0]?.eventId;
            const companyId = items[0]?.product?.companyId || user?.companyId?._id || user?.companyId;

            const orderData = {
                companyId,
                eventId,
                employeeDetails: formData,
                selectedProducts: items.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    // price: item.product.price
                    price: item.product.discountPrice || item.product.actualPrice || item.product.price || 0
                }))
            };

            await api.post('/gift-requests', orderData); // Correct backend endpoint

            alert('Order placed successfully!');
            clearCart();
            onClose();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Darker Blur Overlay */}
            <div
                className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#f8fafc] z-[70] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm relative">
                    <div className="flex items-center space-x-3">
                        {isCheckoutMode ? (
                            <button
                                onClick={() => setIsCheckoutMode(false)}
                                className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
                            >
                                <ArrowLeft size={20} className="stroke-[2.5]" />
                            </button>
                        ) : (
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <ShoppingBag size={20} className="stroke-[2.5]" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                                {isCheckoutMode ? 'Checkout' : 'Your Cart'}
                            </h2>
                            <p className="text-xs text-gray-500 font-bold mt-1">
                                {isCheckoutMode ? 'Shipping Details' : `${items.length} ${items.length === 1 ? 'item' : 'items'} selected`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                        <X size={20} className="stroke-[2.5]" />
                    </button>

                    {/* Progress Bar under header based on items count (visual flair) */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-500" style={{ width: items.length > 0 ? (isCheckoutMode ? '100%' : '50%') : '0%' }}></div>
                </div>

                {/* Main scrollable area */}
                <div className="flex-grow overflow-y-auto relative">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200/50 mb-8 border border-gray-50 relative">
                                <ShoppingBag size={48} className="text-gray-300 relative z-10" />
                                <div className="absolute inset-4 rounded-full bg-gray-50 z-0"></div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your cart is empty</h3>
                            <p className="text-gray-500 font-medium mb-8 max-w-[250px]">Looks like you haven't added any premium gifts to your cart yet.</p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-900/20"
                            >
                                Start Browsing
                            </button>
                        </div>
                    ) : isCheckoutMode ? (
                        // Checkout Form
                        <div className="p-6 bg-white min-h-full animate-in slide-in-from-right-8 duration-300">
                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name *</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all font-medium text-gray-900" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address *</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all font-medium text-gray-900" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all font-medium text-gray-900" placeholder="+91 9876543210" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">WhatsApp Number</label>
                                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all font-medium text-gray-900" placeholder="Optional for order updates" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Shipping Address *</label>
                                    <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all font-medium text-gray-900 resize-none" placeholder="Complete street address for delivery"></textarea>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // Cart Items List
                        <div className="p-6 space-y-4 animate-in slide-in-from-left-8 duration-300">
                            {items.map((item, index) => {
                                const hasDiscount = item.product.discountPrice && item.product.discountPrice < item.product.actualPrice;
                                const price = hasDiscount ? item.product.discountPrice : (item.product.actualPrice || item.product.price);

                                return (
                                    <div
                                        key={`${item.product._id}-${item.eventId}`}
                                        className="bg-white p-4 rounded-[1.5rem] border border-gray-100/80 shadow-sm relative overflow-hidden group"
                                    >
                                        <button
                                            onClick={() => removeFromCart(item.product._id, item.eventId)}
                                            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={16} className="stroke-2" />
                                        </button>

                                        <div className="flex gap-4">
                                            {/* Premium Thumbnail Container */}
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative border border-gray-50 bg-gray-50 p-1">
                                                <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                                                    {item.product.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Tag size={28} className="stroke-1" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow flex flex-col justify-between py-1 pr-6">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1 pr-4">{item.product.name}</h4>
                                                    <p className="text-[11px] font-black tracking-wider text-gray-400 uppercase">{item.product.category || 'Gift'}</p>
                                                </div>

                                                <div className="flex items-end justify-between mt-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-lg text-gray-900 leading-none">
                                                            ₹{price.toLocaleString('en-IN')}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-xs font-bold text-gray-400 line-through mt-0.5">
                                                                ₹{item.product.actualPrice.toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Quantity Controls - Sleeker */}
                                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200/60 p-1 shadow-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity - 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-lg hover:shadow-sm transition-all"
                                                        >
                                                            <Minus size={14} className="stroke-[2.5]" />
                                                        </button>
                                                        <span className="text-sm font-black w-8 text-center text-gray-900">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity + 1)}
                                                            disabled={item.quantity >= 3}
                                                            title={item.quantity >= 3 ? 'Maximum 3 per item' : ''}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                                                        >
                                                            <Plus size={14} className="stroke-[2.5]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer / Checkout Actions */}
                {items.length > 0 && (
                    <div className="bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
                        {/* Summary Section */}
                        <div className="px-6 py-5 bg-gray-50/50">
                            <div className="space-y-3 mb-2 text-sm">
                                <div className="flex justify-between font-semibold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between font-bold text-green-600 bg-green-50/50 p-2 -mx-2 rounded-lg">
                                        <span>Discount Savings</span>
                                        <span>- ₹{savings.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 text-lg">Total Amount</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">(Incl. of GST & all taxes)</span>
                                    </div>
                                    <span className="font-black text-gray-900 text-lg">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="p-6 pt-2 bg-white pb-8">
                            {!isCheckoutMode ? (
                                <button
                                    onClick={() => setIsCheckoutMode(true)}
                                    className="w-full relative overflow-hidden bg-blue-600 text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-between group hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold mb-0.5">Proceed to</span>
                                        <span>Checkout</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ml-3 group-hover:bg-white/30 transition-colors">
                                            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full relative overflow-hidden bg-black text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center group hover:bg-gray-800 transition-all shadow-xl shadow-gray-400/20 active:scale-[0.98] disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between w-full">
                                            <span>Place Order</span>
                                            <span>₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </button>
                            )}

                            {/* Trust Badge */}
                            <div className="flex justify-center items-center mt-4 text-xs font-bold text-gray-400">
                                <ShieldCheck size={14} className="mr-1.5 text-green-500" />
                                Secure Checkout Process
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
