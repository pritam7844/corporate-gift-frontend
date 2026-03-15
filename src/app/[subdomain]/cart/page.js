'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, Minus, Plus, X, Loader2, CheckCircle2, MapPin, CreditCard, ChevronLeft, Scissors, Truck, FileUp, Check, Info } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '../../../components/common/ConfirmModal';

export default function CartPage() {
    const router = useRouter();
    const { subdomain } = useParams();

    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
    const user = useAuthStore((state) => state.user);
    const [mounted, setMounted] = useState(false);

    // Steps: 1 = Cart, 2 = Customization, 3 = Shipping, 4 = Success
    const [currentStep, setCurrentStep] = useState(1);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        employeeId: '',
        // New Fields
        customization: {
            isBrandingRequired: false,
            brandingType: '',
            brandingPositions: 1,
            brandingSize: '',
            brandingLogo: ''
        },
        shippingDetails: {
            deliveryType: 'Single Location',
            multipleLocations: [''], // Changed to array for multiple locations
            deliveryTimeline: ''
        }
    });

    const handleAddLocation = () => {
        setFormData(prev => ({
            ...prev,
            shippingDetails: {
                ...prev.shippingDetails,
                multipleLocations: [...prev.shippingDetails.multipleLocations, '']
            }
        }));
    };

    const handleRemoveLocation = (index) => {
        if (formData.shippingDetails.multipleLocations.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            shippingDetails: {
                ...prev.shippingDetails,
                multipleLocations: prev.shippingDetails.multipleLocations.filter((_, i) => i !== index)
            }
        }));
    };

    const handleLocationChange = (index, value) => {
        const newLocations = [...formData.shippingDetails.multipleLocations];
        newLocations[index] = value;
        setFormData(prev => ({
            ...prev,
            shippingDetails: {
                ...prev.shippingDetails,
                multipleLocations: newLocations
            }
        }));
    };

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomizationChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            customization: { ...prev.customization, [field]: value }
        }));
    };

    const handleShippingChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            shippingDetails: { ...prev.shippingDetails, [field]: value }
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        setLogoUploading(true);
        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                handleCustomizationChange('brandingLogo', data.url);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            openConfirm('Upload Failed', 'Could not upload logo. Please try again.', () => { }, 'error');
        } finally {
            setLogoUploading(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.employeeId || (formData.shippingDetails.deliveryType === 'Single Location' && !formData.address)) {
            openConfirm('Information Required', 'Please fill in all required fields (including Employee ID) before placing your order.', () => { }, 'warning');
            return;
        }

        if (formData.shippingDetails.deliveryType === 'Multiple Locations' && (!formData.shippingDetails.multipleLocations || formData.shippingDetails.multipleLocations.some(loc => !loc.trim()))) {
            openConfirm('Information Required', 'Please provide all location details.', () => { }, 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const eventId = items[0]?.eventId;
            const companyId = items[0]?.product?.companyId || user?.companyId?._id || user?.companyId;

            const orderData = {
                companyId,
                eventId,
                employeeDetails: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    address: formData.address,
                    employeeId: formData.employeeId
                },
                selectedProducts: items.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    actualPrice: item.product.actualPrice,
                    discountedPrice: item.product.discountedPrice || item.product.actualPrice
                })),
                customization: formData.customization,
                shippingDetails: formData.shippingDetails
            };

            await api.post('/gift-requests', orderData);

            clearCart();
            setCurrentStep(4); // Go to success screen (previously 3)

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
            <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">
                {/* Connecting Line */}
                <div className="absolute left-10 right-10 top-5 h-[2px] bg-gray-100 -z-10 rounded-full"></div>
                <div
                    className="absolute left-10 top-5 h-[2px] bg-blue-600 -z-10 rounded-full transition-all duration-500"
                    style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '40%' : '85%' }}
                ></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        {currentStep > 1 ? <CheckCircle2 size={20} className="text-white" /> : '1'}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wider text-center ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Cart
                    </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        {currentStep > 2 ? <CheckCircle2 size={20} className="text-white" /> : '2'}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wider text-center ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Customization
                    </span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 3 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                        3
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold mt-3 uppercase tracking-wider text-center ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Shipping
                    </span>
                </div>
            </div>
        </div>
    );

    if (currentStep === 4) {
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
                        onClick={() => router.push(`/`)}
                        className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push(`/orders`)}
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
                        onClick={() => {
                            if (currentStep === 1) router.back();
                            else setCurrentStep(currentStep - 1);
                        }}
                        className="flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gray-400 group-hover:bg-gray-50 transition-all">
                            <ChevronLeft size={16} className="stroke-[2.5]" />
                        </div>
                        {currentStep === 1 ? 'Continue Shopping' : currentStep === 2 ? 'Back to Cart' : 'Back to Customization'}
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
                                                                {item.product.images?.[0] || item.product.image ? (
                                                                    <img src={item.product.images?.[0] || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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
                                                                        disabled={item.quantity >= 3}
                                                                        title={item.quantity >= 3 ? 'Maximum 3 per item' : ''}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 hover:text-blue-600"
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

                            {/* Step 2: Customization / Branding */}
                            {currentStep === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Personalization</h2>
                                        <p className="text-gray-500 font-medium mt-2">Do you need custom branding or logo placement on your gifts?</p>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Branding Toggle */}
                                        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', false)}
                                                className={`px-8 py-3 rounded-xl font-bold transition-all ${!formData.customization.isBrandingRequired ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                No Branding
                                            </button>
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', true)}
                                                className={`px-8 py-3 rounded-xl font-bold transition-all ${formData.customization.isBrandingRequired ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Yes, Personalize
                                            </button>
                                        </div>

                                        {formData.customization.isBrandingRequired && (
                                            <div className="grid grid-cols-1 gap-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in zoom-in-95 duration-300">
                                                {/* Branding Type */}
                                                <div>
                                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1 mb-3 block">1. Personalization / Branding Type</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {['Digital Print', 'Screen Print', 'Embroidery', 'Embossing', 'Engraving', 'Offset Print', 'UV Stickers'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleCustomizationChange('brandingType', type)}
                                                                className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.customization.brandingType === type ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Branding Positions */}
                                                <div>
                                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1 mb-3 block">2. Number of Branding Positions</label>
                                                    <div className="flex gap-4">
                                                        {[1, 2, 3].map(pos => (
                                                            <button
                                                                key={pos}
                                                                onClick={() => handleCustomizationChange('brandingPositions', pos)}
                                                                className={`w-14 h-14 rounded-xl font-black border-2 transition-all ${formData.customization.brandingPositions === pos ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`}
                                                            >
                                                                {pos}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Branding Size */}
                                                <div>
                                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1 mb-3 block">3. Branding Size</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        {['1 inch to 3 inch', '3 inch to 5 inch', '5 inch to 10 inch'].map(size => (
                                                            <button
                                                                key={size}
                                                                onClick={() => handleCustomizationChange('brandingSize', size)}
                                                                className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.customization.brandingSize === size ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Branding File Upload */}
                                                <div>
                                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider ml-1 mb-3 block">4. Branding File Upload (Logo)</label>
                                                    <div className="flex items-center gap-4">
                                                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-white hover:bg-blue-50/50 cursor-pointer transition-all group">
                                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                                {logoUploading ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700">{logoUploading ? 'Uploading...' : 'Click to upload logo'}</span>
                                                            <span className="text-xs text-gray-400 mt-1">PNG, JPG or SVG (Max 5MB)</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                        </label>
                                                        {formData.customization.brandingLogo && (
                                                            <div className="w-24 h-24 rounded-2xl border bg-white p-2 relative">
                                                                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                                                    <img src={formData.customization.brandingLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleCustomizationChange('brandingLogo', '')}
                                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!formData.customization.isBrandingRequired && (
                                            <div className="p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Info size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No personalization selected. Your gifts will be delivered as standard catalog products.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Shipping Form */}
                            {currentStep === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Details</h2>
                                        <p className="text-gray-500 font-medium mt-2">Where should we deliver your premium gifts?</p>
                                    </div>

                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                                        {/* Contact Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 font-black text-blue-600">Employee ID *</label>
                                                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-5 py-4 bg-blue-50/20 hover:bg-blue-50/50 border border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900" placeholder="Enter your official employee ID" />
                                            </div>
                                        </div>

                                        {/* Delivery Type */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 block">5. Delivery Location Type</label>
                                            <div className="flex gap-4">
                                                {['Single Location', 'Multiple Locations'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleShippingChange('deliveryType', type)}
                                                        className={`flex-1 flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${formData.shippingDetails.deliveryType === type ? 'bg-blue-50 border-blue-600 text-blue-900' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'}`}
                                                    >
                                                        <span className="font-bold">{type}</span>
                                                        {formData.shippingDetails.deliveryType === type && <CheckCircle2 size={20} className="text-blue-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Address / Locations */}
                                        {formData.shippingDetails.deliveryType === 'Single Location' ? (
                                            <>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Complete Delivery Address *</label>
                                                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900 resize-none" placeholder="Enter flat, building, area and city details..."></textarea>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 font-black text-blue-600">Enter Multiple Pincodes or Addresses *</label>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLocation}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Plus size={14} /> Add Address
                                                    </button>
                                                </div>

                                                {formData.shippingDetails.multipleLocations.map((location, index) => (
                                                    <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                        <div className="flex-grow relative">
                                                            <input
                                                                required
                                                                type="text"
                                                                value={location}
                                                                onChange={(e) => handleLocationChange(index, e.target.value)}
                                                                className="w-full px-5 py-3.5 bg-blue-50/20 hover:bg-blue-50/50 border border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900"
                                                                placeholder={`Address #${index + 1}`}
                                                            />
                                                            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        {formData.shippingDetails.multipleLocations.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveLocation(index)}
                                                                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Delivery Timeline */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">6. Required Delivery Timeline / Expected Date</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Within 15 days or by 25th March"
                                                    className="w-full px-5 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl outline-none transition-all font-semibold text-gray-900"
                                                    value={formData.shippingDetails.deliveryTimeline}
                                                    onChange={(e) => handleShippingChange('deliveryTimeline', e.target.value)}
                                                />
                                                <Truck className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            </div>
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

                                        <div className="flex justify-between items-end pt-2">
                                            <div className="flex flex-col">
                                                <span className="font-black text-2xl text-gray-900">Total Amount</span>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">(Incl. of GST & all taxes)</span>
                                            </div>
                                            <span className="font-black text-2xl text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </>
                                ) : (
                                    // Step 2: Show small item thumbnails instead of price breakdown
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 pb-4 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Items Included</h4>
                                        {items.map(item => (
                                            <div key={`${item.product._id}-${item.eventId}`} className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                    {item.product.images?.[0] || item.product.image ? (
                                                        <img src={item.product.images?.[0] || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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
                                    Review Personalization
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : currentStep === 2 ? (
                                <button
                                    onClick={() => {
                                        if (formData.customization.isBrandingRequired && (!formData.customization.brandingType || !formData.customization.brandingSize)) {
                                            openConfirm('Missing Details', 'Please select branding type and size before proceeding.', () => { }, 'warning');
                                            return;
                                        }
                                        setCurrentStep(3);
                                    }}
                                    className="w-full bg-blue-600 text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center group hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    Continue to Shipping
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

