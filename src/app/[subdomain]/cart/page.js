'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, Minus, Plus, X, Loader2, CheckCircle2, MapPin, CreditCard, ChevronLeft, Scissors, Truck, FileUp, Check, Info, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ImageSliderModal from '../../../components/common/ImageSliderModal';

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
    const [isAlreadyOrdered, setIsAlreadyOrdered] = useState(false); // New state
    const [participatingEvent, setParticipatingEvent] = useState(null); // Store event info for warning
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        employeeId: '',
        additionalRequirements: '',
        // New Fields
        customization: {
            isBrandingRequired: false,
            brandingLogo: '',
            productCustomizations: {} // Map of productID -> { brandingType, brandingPositions, etc. }
        },
        shippingDetails: {
            deliveryType: 'Single Location'
        }
    });


    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    // Image Slider State
    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
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

            // Check for participation constraint
            const checkParticipation = async () => {
                const eventId = items[0]?.eventId;
                if (!eventId) return;

                try {
                    // Fetch Event to get startDate
                    const eventRes = await api.get(`/events/${eventId}`);
                    const event = eventRes.data.data;
                    setParticipatingEvent(event);

                    // Fetch User Requests
                    const requestsRes = await api.get('/gift-requests/my-requests');
                    const userRequests = requestsRes.data.data || [];

                    const alreadyOrdered = userRequests.some(req =>
                        req.eventId._id === eventId &&
                        new Date(req.createdAt) >= new Date(event.startDate)
                    );
                    setIsAlreadyOrdered(alreadyOrdered);
                } catch (err) {
                    console.error("Failed to check participation", err);
                }
            };
            checkParticipation();
        }
    }, [user, items]);

    // Sync productCustomizations with items in cart
    useEffect(() => {
        if (items.length > 0) {
            setFormData(prev => {
                const newProductCustomizations = { ...prev.customization.productCustomizations };
                let hasChanges = false;

                items.forEach(item => {
                    const productId = item.product._id;
                    if (!newProductCustomizations[productId]) {
                        newProductCustomizations[productId] = {
                            brandingType: '',
                            brandingPositions: 1,
                            customBrandingPositions: '',
                            brandingSize: '',
                            customBrandingSize: ''
                        };
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    return {
                        ...prev,
                        customization: {
                            ...prev.customization,
                            productCustomizations: newProductCustomizations
                        }
                    };
                }
                return prev;
            });
        }
    }, [items]);

    if (!mounted) return null;

    // Calculate subtotal (without discounts) to show savings
    const subtotal = items.reduce((total, item) => total + ((item.product.actualPrice || item.product.price) * item.quantity), 0);
    const total = getCartTotal();
    const savings = subtotal > total ? subtotal - total : 0;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomizationChange = (field, value, productId = null) => {
        if (productId) {
            setFormData(prev => ({
                ...prev,
                customization: {
                    ...prev.customization,
                    productCustomizations: {
                        ...prev.customization.productCustomizations,
                        [productId]: {
                            ...prev.customization.productCustomizations[productId],
                            [field]: value
                        }
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customization: { ...prev.customization, [field]: value }
            }));
        }
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
                    employeeId: formData.employeeId,
                    additionalRequirements: formData.additionalRequirements
                },
                selectedProducts: items.map(item => {
                    const productId = item.product._id;
                    const cust = formData.customization.productCustomizations[productId] || {};
                    return {
                        productId: productId,
                        quantity: item.quantity,
                        actualPrice: item.product.actualPrice,
                        discountedPrice: item.product.discountedPrice || item.product.actualPrice,
                        brandingType: cust.brandingType,
                        brandingPositions: cust.brandingPositions,
                        customBrandingPositions: cust.customBrandingPositions,
                        brandingSize: cust.brandingSize,
                        customBrandingSize: cust.customBrandingSize
                    };
                }),
                customization: {
                    isBrandingRequired: formData.customization.isBrandingRequired,
                    brandingLogo: formData.customization.brandingLogo
                },
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
        <div className="w-full mb-12 border-b border-slate-100 pb-8">
            <div className="flex items-center justify-between max-w-lg mx-auto relative px-4 text-[10px] font-bold uppercase tracking-widest">
                {/* Connecting Line */}
                <div className="absolute left-10 right-10 top-[14px] h-[1px] bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-10 top-[14px] h-[1px] bg-indigo-600 -z-10 transition-all duration-500"
                    style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                ></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${currentStep >= 1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {currentStep > 1 ? <Check size={14} /> : '1'}
                    </div>
                    <span className={`mt-3 ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Cart</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${currentStep >= 2 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {currentStep > 2 ? <Check size={14} /> : '2'}
                    </div>
                    <span className={`mt-3 ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Design</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${currentStep >= 3 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>
                        3
                    </div>
                    <span className={`mt-3 ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Shipping</span>
                </div>
            </div>
        </div>
    );

    if (currentStep === 4) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8 border border-emerald-100 shadow-sm">
                    <Check size={40} className="stroke-[3]" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight text-center">Selection Submitted!</h1>
                <p className="text-slate-500 font-medium text-base mb-10 max-w-sm text-center">
                    Your reward selection has been recorded. Our team will begin processing your corporate tokens shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                        onClick={() => router.push(`/`)}
                        className="flex-1 px-8 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98] text-sm"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push(`/orders`)}
                        className="flex-1 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-indigo-600 transition-all active:scale-[0.98] shadow-sm text-sm"
                    >
                        View Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header / Back */}
                <div className="mb-8">
                    <button
                        onClick={() => {
                            if (currentStep === 1) router.back();
                            else setCurrentStep(currentStep - 1);
                        }}
                        className="flex items-center text-slate-500 hover:text-slate-900 font-bold transition-all group text-xs uppercase tracking-widest"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:bg-slate-50 transition-all">
                            <ChevronLeft size={14} />
                        </div>
                        {currentStep === 1 ? 'Back to Portal' : 'Previous Step'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Main Content Area */}
                    <div className="flex-grow w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10">
                        <TrackBar />

                        <div className="relative">
                            {/* Step 1: Cart Items */}
                            {currentStep === 1 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Selection</h2>
                                        <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-md text-[10px] uppercase tracking-wider border border-indigo-100/50">
                                            {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-slate-100">
                                                <ShoppingBag size={32} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Selection is empty</h3>
                                            <p className="text-slate-500 text-sm mb-8">Looks like you haven't added any premium gifts yet.</p>
                                            <button
                                                onClick={() => router.push(`/`)}
                                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
                                            >
                                                Start Browsing
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item) => {
                                                const hasDiscount = item.product.discountedPrice && item.product.discountedPrice < item.product.actualPrice;
                                                const price = hasDiscount ? item.product.discountedPrice : (item.product.actualPrice || item.product.price);

                                                return (
                                                    <div
                                                        key={`${item.product._id}-${item.eventId}`}
                                                        className="flex gap-6 p-5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/30 transition-all group relative"
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
                                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>

                                                        <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-slate-200 p-1 cursor-pointer"
                                                            onClick={() => setSliderModal({ isOpen: true, images: item.product.images && item.product.images.length > 0 ? item.product.images : (item.product.image ? [item.product.image] : []), index: 0 })}
                                                        >
                                                            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center relative group/img">
                                                                {item.product.images?.[0] || item.product.image ? (
                                                                    <img src={item.product.images?.[0] || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Tag size={32} className="text-slate-200" />
                                                                )}
                                                                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Maximize2 size={24} className="text-white scale-90" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-grow flex flex-col justify-center">
                                                            <div>
                                                                <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1.5 flex items-center">
                                                                    <Tag size={10} className="mr-1.5" /> {item.product.category || 'Gift Selection'}
                                                                </p>
                                                                <h4 className="text-base font-bold text-slate-900 leading-snug mb-3 pr-8">{item.product.name}</h4>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-lg text-slate-900 leading-none">
                                                                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                                    </span>
                                                                    {hasDiscount && (
                                                                        <span className="text-[10px] font-bold text-slate-400 line-through">
                                                                            ₹{(item.product.actualPrice * item.quantity).toLocaleString('en-IN')}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity - 1)}
                                                                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded transition-all"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="text-sm font-bold w-8 text-center text-slate-900">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (item.quantity >= 1) {
                                                                                openConfirm('Limit Reached', 'Only 1 unit per product is allowed.', () => { }, 'warning');
                                                                                return;
                                                                            }
                                                                            updateQuantity(item.product._id, item.eventId, item.quantity + 1);
                                                                        }}
                                                                        className={`w-7 h-7 flex items-center justify-center rounded transition-all text-slate-400 ${item.quantity >= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-indigo-600'}`}
                                                                    >
                                                                        <Plus size={14} />
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
                                    <div className="mb-8 border-b border-slate-50 pb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Design & Branding</h2>
                                        <p className="text-slate-500 font-medium mt-1.5 text-sm">Configure how your organization's logo should appear.</p>
                                    </div>

                                    <div className="space-y-10">
                                        {/* Branding Toggle */}
                                        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', false)}
                                                className={`px-6 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${!formData.customization.isBrandingRequired ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                            >
                                                Standard
                                            </button>
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', true)}
                                                className={`px-6 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${formData.customization.isBrandingRequired ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                                            >
                                                Custom Logo
                                            </button>
                                        </div>

                                        {formData.customization.isBrandingRequired && (
                                            <div className="space-y-10">
                                                {/* Global Branding Logo Section */}
                                                <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center font-bold text-[10px] uppercase">A</div>
                                                                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Organization Logo</h3>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium">Upload the primary logo for branding application.</p>
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl px-6 py-4 bg-white hover:border-indigo-300 cursor-pointer transition-all group min-w-[180px]">
                                                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                                                        {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{logoUploading ? 'Uploading...' : 'Browse Files'}</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                                </label>
                                                                {formData.customization.brandingLogo && (
                                                                    <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-2 relative shadow-sm group">
                                                                        <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                                                            <img src={formData.customization.brandingLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleCustomizationChange('brandingLogo', '')}
                                                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white"
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Individual Product Customization */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded flex items-center justify-center font-bold text-[10px] uppercase">B</div>
                                                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Product Specifications</h3>
                                                    </div>

                                                    {items.map((item, idx) => {
                                                        const pId = item.product._id;
                                                        const cust = formData.customization.productCustomizations[pId] || {};

                                                        return (
                                                            <div key={pId} className="p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50">
                                                                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-0.5 flex-shrink-0">
                                                                        <img src={item.product.images?.[0] || item.product.image} className="w-full h-full object-cover rounded-md" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-sm font-bold text-slate-900 leading-none truncate mb-1.5">{item.product.name}</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    {/* Branding Type */}
                                                                    <div className="space-y-4">
                                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. Style</label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {['Digital Print', 'Screen Print', 'Embroidery', 'Embossing', 'Engraving', 'UV Stickers'].map(type => (
                                                                                <button
                                                                                    key={type}
                                                                                    onClick={() => handleCustomizationChange('brandingType', type, pId)}
                                                                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${cust.brandingType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                                                >
                                                                                    {type}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        {/* Positions */}
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. Placement</label>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {[1, 2, 3].map(pos => (
                                                                                    <button
                                                                                        key={pos}
                                                                                        onClick={() => {
                                                                                            handleCustomizationChange('brandingPositions', pos, pId);
                                                                                            handleCustomizationChange('customBrandingPositions', '', pId);
                                                                                        }}
                                                                                        className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${cust.brandingPositions === pos ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                                                    >
                                                                                        {pos}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => handleCustomizationChange('brandingPositions', 'Custom', pId)}
                                                                                    className={`px-4 h-9 rounded-lg font-bold text-xs border transition-all ${cust.brandingPositions === 'Custom' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                                                >
                                                                                    Other
                                                                                </button>
                                                                            </div>
                                                                            {cust.brandingPositions === 'Custom' && (
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Describe placement..."
                                                                                    value={cust.customBrandingPositions || ''}
                                                                                    onChange={(e) => handleCustomizationChange('customBrandingPositions', e.target.value, pId)}
                                                                                    className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none font-medium text-xs text-slate-900 placeholder:text-slate-300"
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        {/* Size */}
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">3. Dimensions</label>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {['1" to 3"', '3" to 5"', '5" to 10"'].map(size => (
                                                                                    <button
                                                                                        key={size}
                                                                                        onClick={() => {
                                                                                            handleCustomizationChange('brandingSize', size, pId);
                                                                                            handleCustomizationChange('customBrandingSize', '', pId);
                                                                                        }}
                                                                                        className={`px-3 h-9 rounded-lg font-bold text-xs border transition-all ${cust.brandingSize === size ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                                                    >
                                                                                        {size}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => handleCustomizationChange('brandingSize', 'Custom', pId)}
                                                                                    className={`px-4 h-9 rounded-lg font-bold text-xs border transition-all ${cust.brandingSize === 'Custom' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                                                >
                                                                                    Specs
                                                                                </button>
                                                                            </div>
                                                                            {cust.brandingSize === 'Custom' && (
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="e.g. 2x2 inch"
                                                                                    value={cust.customBrandingSize || ''}
                                                                                    onChange={(e) => handleCustomizationChange('customBrandingSize', e.target.value, pId)}
                                                                                    className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none font-medium text-xs text-slate-900 placeholder:text-slate-300"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {!formData.customization.isBrandingRequired && (
                                            <div className="p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <Info size={24} className="text-slate-300" />
                                                </div>
                                                <h4 className="text-base font-bold text-slate-900 mb-1">Standard Selection</h4>
                                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Your rewards will be delivered as standard catalog products without additional personalization.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Shipping Form */}
                            {currentStep === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-8 border-b border-slate-50 pb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Details</h2>
                                        <p className="text-slate-500 font-medium mt-1.5 text-sm">Where should we deliver your selected rewards?</p>
                                    </div>

                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                                        {/* Contact Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                                <input readOnly required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-500 cursor-not-allowed text-sm" placeholder="Full Name" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <input readOnly required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-500 cursor-not-allowed text-sm" placeholder="Email Address" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all font-semibold text-slate-900 text-sm" placeholder="+91 00000 00000" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                                                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all font-semibold text-slate-900 text-sm" placeholder="ID Number" />
                                            </div>
                                        </div>

                                        {/* Address Area */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                                            <textarea
                                                required
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all font-semibold text-slate-900 resize-none text-sm"
                                                placeholder="Enter your complete delivery address..."
                                            ></textarea>
                                        </div>

                                        {/* Additional Requirements Area */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                            <textarea
                                                name="additionalRequirements"
                                                value={formData.additionalRequirements}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all font-semibold text-slate-900 resize-none text-sm"
                                                placeholder="Any additional instructions..."
                                            ></textarea>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 sticky top-28">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <CreditCard className="mr-3 text-indigo-600" size={20} />
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-6">
                                {currentStep === 1 ? (
                                    <>
                                        <div className="flex justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                            <span>Subtotal</span>
                                            <span className="text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {savings > 0 && (
                                            <div className="flex justify-between text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                                <span>Savings</span>
                                                <span>- ₹{savings.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider pb-4 border-b border-slate-100">
                                            <span>Shipping</span>
                                            <span className="text-emerald-600">Included</span>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="font-bold text-base text-slate-900">Total</span>
                                            <span className="font-bold text-xl text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 pb-4 border-b border-slate-100">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Overview</h4>
                                        {items.map(item => (
                                            <div key={`${item.product._id}-${item.eventId}`} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.product.images?.[0] || item.product.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-4 py-3 rounded-lg border border-indigo-100/50 mt-4">
                                    <div className="flex items-center gap-2 uppercase tracking-widest">
                                        <Truck size={14} />
                                        <span>Delivery</span>
                                    </div>
                                    <span>5-7 Days</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {isAlreadyOrdered ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                                    <Info className="text-red-500 mx-auto mb-2" size={20} />
                                    <p className="text-red-700 font-bold text-xs uppercase tracking-wider">Limit Reached</p>
                                    <p className="text-red-600 text-[10px] mt-1">Order already submitted for this event.</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="mt-4 text-slate-900 font-bold text-[10px] uppercase tracking-widest border-b border-slate-900"
                                    >
                                        Home
                                    </button>
                                </div>
                            ) : currentStep === 1 ? (
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={items.length === 0}
                                    className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-4 px-6 rounded-lg flex items-center justify-center group hover:bg-indigo-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    Proceed to Design
                                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : currentStep === 2 ? (
                                <button
                                    onClick={() => {
                                        if (formData.customization.isBrandingRequired) {
                                            const incompleteProduct = items.find(item => {
                                                const cust = formData.customization.productCustomizations[item.product._id];
                                                return !cust?.brandingType ||
                                                    !cust?.brandingPositions ||
                                                    (cust?.brandingPositions === 'Custom' && !cust?.customBrandingPositions) ||
                                                    !cust?.brandingSize ||
                                                    (cust?.brandingSize === 'Custom' && !cust?.customBrandingSize);
                                            });

                                            if (incompleteProduct) {
                                                openConfirm('Missing Info', `Please complete branding for ${incompleteProduct.product.name}`, () => { }, 'warning');
                                                return;
                                            }
                                        }
                                        setCurrentStep(3);
                                    }}
                                    className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-4 px-6 rounded-lg flex items-center justify-center group hover:bg-indigo-600 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    Shipping Details
                                    <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-4 px-6 rounded-lg flex items-center justify-center group hover:bg-indigo-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <span>Confirm Selection</span>
                                    )}
                                </button>
                            )}

                            {/* Trust Elements */}
                            <div className="mt-6 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <ShieldCheck size={14} className="mr-2 text-emerald-500" />
                                Secure Verification
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.type === 'danger' ? 'Okay' : 'Yes, Proceed'}
            />

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />
        </div>
    );
}
