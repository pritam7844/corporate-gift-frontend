'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, Minus, Plus, X, Loader2, CheckCircle2, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '../../../components/common/ConfirmModal';

export default function CartPage() {
    const router = useRouter();
    const { subdomain } = useParams();

    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
    const user = useAuthStore((state) => state.user);
    const [mounted, setMounted] = useState(false);

    // Steps: 1 = Cart, 2 = Shipping, 3 = Success
    const [currentStep, setCurrentStep] = useState(1);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        employeeId: ''
    });

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const openConfirm = (title, message, onConfirm, type = 'warning') => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    useEffect(() => {
        setMounted(true);
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                employeeId: user.employeeId || ''
            }));
        }
    }, [user]);

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

        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            openConfirm('Information Required', 'Please fill in all required delivery fields before placing your order.', () => { }, 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const eventId = items[0]?.eventId;
            const companyId = items[0]?.product?.companyId || user?.companyId?._id || user?.companyId;

            const orderData = {
                companyId,
                eventId,
                employeeDetails: formData,
                selectedProducts: items.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    actualPrice: item.product.actualPrice,
                    discountedPrice: item.product.discountedPrice || item.product.actualPrice
                }))
            };

            await api.post('/gift-requests', orderData);

            clearCart();
            setCurrentStep(3); // Go to success screen

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error placing order:', error);
            openConfirm('Order Failed', 'We couldn\'t process your request. Please check your connection and try again.', () => { }, 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Trackbar Component
    const TrackBar = () => (
        <div className="w-full mb-10 pb-8 border-b border-gray-100">
            <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 w-full h-[2px] bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 h-[2px] bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                    style={{ width: currentStep === 1 ? '0%' : '100%' }}
                ></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        {currentStep > 1 ? <CheckCircle2 size={20} className="text-white" /> : '1'}
                    </div>
                    <span className={`text-xs font-bold mt-3 uppercase tracking-wider ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Cart Items
                    </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        2
                    </div>
                    <span className={`text-xs font-bold mt-3 uppercase tracking-wider ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Shipping Details
                    </span>
                </div>
            </div>
        </div>
    );

    if (currentStep === 3) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                    <CheckCircle2 size={48} className="stroke-[2.5]" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight text-center">Order Placed Successfully!</h1>
                <p className="text-gray-500 font-medium text-lg mb-10 max-w-md text-center">
                    Your gift request has been sent to the company. You will be notified once the admin approves it.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push(`/${subdomain}`)}
                        className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push(`/${subdomain}/orders`)}
                        className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-900/20"
                    >
                        Track Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header / Back */}
                <div className="mb-8">
                    <button
                        onClick={() => currentStep === 2 ? setCurrentStep(1) : router.back()}
                        className="flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gray-400 group-hover:bg-gray-50 transition-all">
                            <ChevronLeft size={16} className="stroke-[2.5]" />
                        </div>
                        {currentStep === 2 ? 'Back to Cart' : 'Continue Shopping'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Main Content Area */}
                    <div className="flex-grow w-full lg:w-2/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-10">
                        <TrackBar />

                        <div className="relative">
                            {/* Step 1: Cart Items */}
                            {currentStep === 1 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Cart</h2>
                                        <span className="bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm">
                                            {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                                                <ShoppingBag size={40} className="text-gray-300" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h3>
                                            <p className="text-gray-500 mb-8">Looks like you haven't added any premium gifts yet.</p>
                                            <button
                                                onClick={() => router.push(`/${subdomain}`)}
                                                className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                                            >
                                                Start Browsing
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {items.map((item) => {
                                                const hasDiscount = item.product.discountedPrice && item.product.discountedPrice < item.product.actualPrice;
                                                const price = hasDiscount ? item.product.discountedPrice : (item.product.actualPrice || item.product.price);

                                                return (
                                                    <div
                                                        key={`${item.product._id}-${item.eventId}`}
                                                        className="flex gap-6 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group relative"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                openConfirm(
                                                                    'Remove Item?',
                                                                    `Are you sure you want to remove "${item.product.name}" from your cart?`,
                                                                    () => removeFromCart(item.product._id, item.eventId),
                                                                    'warning'
                                                                );
                                                            }}
                                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={18} className="stroke-2" />
                                                        </button>

                                                        <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm p-2">
                                                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50">
                                                                {item.product.image ? (
                                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                        <Tag size={32} className="stroke-1" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-grow flex flex-col justify-center py-2">
                                                            <div>
                                                                <p className="text-xs font-black tracking-wider text-blue-600 uppercase mb-1 flex items-center">
                                                                    <MapPin size={12} className="mr-1 inline" /> {item.product.category || 'Gift'}
                                                                </p>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight mb-3 pr-8">{item.product.name}</h4>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-black text-xl text-gray-900 leading-none">
                                                                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                                        </span>
                                                                        {hasDiscount && (
                                                                            <span className="text-xs font-bold text-gray-400 line-through decoration-gray-300/80 decoration-2">
                                                                                ₹{(item.product.actualPrice * item.quantity).toLocaleString('en-IN')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                                                                        Subtotal: ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                                    </div> */}
                                                                </div>

                                                                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity - 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all"
                                                                    >
                                                                        <Minus size={16} className="stroke-[2.5]" />
                                                                    </button>
                                                                    <span className="text-base font-black w-10 text-center text-gray-900">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity + 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all"
                                                                    >
                                                                        <Plus size={16} className="stroke-[2.5]" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Shipping Form */}
                            {currentStep === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Details</h2>
                                        <p className="text-gray-500 font-medium mt-2">Where should we deliver your premium gifts?</p>
                                    </div>

                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name *</label>
                                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address *</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="john@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
                                            <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="+91 9876543210" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">WhatsApp Number</label>
                                            <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="Optional for order updates" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Employee ID</label>
                                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="e.g. EMP-12345" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Flat, House no., Building, Company, Apartment *</label>
                                            <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 resize-none" placeholder="Enter full delivery address..."></textarea>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-28">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                                <CreditCard className="mr-3 text-blue-600" size={24} />
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-6">
                                {/* Only show pricing breakdown if on Step 1. On step 2, show small items list */}
                                {currentStep === 1 ? (
                                    <>
                                        <div className="flex justify-between text-gray-600 font-semibold">
                                            <span>Actual Amount ({items.length} items)</span>
                                            <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {savings > 0 && (
                                            <div className="flex justify-between font-bold text-green-600">
                                                <span>Discount Savings</span>
                                                <span>- ₹{savings.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600 font-semibold pb-4 border-b border-gray-100">
                                            <span>Delivery Charges</span>
                                            <span className="text-green-600 font-bold uppercase tracking-wider text-xs flex items-center">Free</span>
                                        </div>

                                        <div className="flex justify-between font-black text-2xl text-gray-900 pt-2">
                                            <span>Total Amount</span>
                                            <span>₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </>
                                ) : (
                                    // Step 2: Show small item thumbnails instead of price breakdown
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 pb-4 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Items Included</h4>
                                        {items.map(item => (
                                            <div key={`${item.product._id}-${item.eventId}`} className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                    {item.product.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Tag size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions based on step */}
                            {currentStep === 1 ? (
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={items.length === 0}
                                    className="w-full bg-blue-600 text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center group hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    Proceed to Shipping Details
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full relative overflow-hidden bg-gray-900 text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center group hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 active:scale-[0.98] disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full">
                                            <span>Place Order</span>
                                        </div>
                                    )}
                                </button>
                            )}

                            {/* Trust Elements */}
                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-50 py-2 px-4 rounded-xl w-full">
                                    <ShieldCheck size={16} className="mr-2 text-green-500" />
                                    Secure & Encrypted Checkout
                                </div>
                                {savings > 0 && (
                                    <p className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                                        You will save ₹{savings.toLocaleString('en-IN')} on this order
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.type === 'danger' || confirmState.type === 'warning' ? 'Okay' : 'Confirm'}
            />
        </div>
    );
}

