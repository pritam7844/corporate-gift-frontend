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
    const [isAlreadyOrdered, setIsAlreadyOrdered] = useState(false);
    const [participatingEvent, setParticipatingEvent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        employeeId: '',
        additionalRequirements: '',
        customization: {
            isBrandingRequired: false,
            brandingLogo: '',
            productCustomizations: {}
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

            const checkParticipation = async () => {
                const eventId = items[0]?.eventId;
                if (!eventId) return;

                try {
                    const eventRes = await api.get(`/events/${eventId}`);
                    const event = eventRes.data.data;
                    setParticipatingEvent(event);

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('logo', file);

        setLogoUploading(true);
        try {
            const { data } = await api.post('/upload', uploadData, {
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

        if (!formData.name || !formData.email || !formData.phone || !formData.employeeId || !formData.address) {
            openConfirm('Information Required', 'Please fill in all required fields before placing your order.', () => { }, 'warning');
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
            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error placing order:', error);
            openConfirm('Order Failed', 'We couldn\'t process your request. Please try again.', () => { }, 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const TrackBar = () => (
        <div className="w-full mb-12 border-b border-[var(--color-border)] pb-10">
            <div className="flex items-center justify-between max-w-lg mx-auto relative px-4 text-[9px] font-black uppercase tracking-[0.2em]">
                <div className="absolute left-10 right-10 top-[14px] h-[1px] bg-[var(--color-border)] -z-10"></div>
                <div
                    className="absolute left-10 top-[14px] h-[1px] bg-[var(--color-text)] -z-10 transition-all duration-500"
                    style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                ></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${currentStep >= 1 ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                        {currentStep > 1 ? <Check size={14} /> : '1'}
                    </div>
                    <span className={`mt-4 ${currentStep >= 1 ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>Cart</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${currentStep >= 2 ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                        {currentStep > 2 ? <Check size={14} /> : '2'}
                    </div>
                    <span className={`mt-4 ${currentStep >= 2 ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>Design</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${currentStep >= 3 ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                        3
                    </div>
                    <span className={`mt-4 ${currentStep >= 3 ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>Shipping</span>
                </div>
            </div>
        </div>
    );

    if (currentStep === 4) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-10 border border-emerald-100 shadow-xl">
                    <Check size={48} className="stroke-[3]" />
                </div>
                <h1 className="text-4xl font-black text-[var(--color-text)] mb-4 tracking-tight text-center">Selection Submitted</h1>
                <p className="text-[var(--color-text-muted)] font-bold text-lg mb-12 max-w-sm text-center opacity-80">
                    Your reward selection has been recorded. Our team will begin processing your corporate tokens shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button
                        onClick={() => router.push(`/`)}
                        className="flex-1 px-10 py-4 border border-[var(--color-border)] text-[var(--color-text)] font-black rounded-xl hover:bg-[var(--color-bg)] transition-all active:scale-[0.98] text-[10px] uppercase tracking-[0.2em]"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push(`/orders`)}
                        className="flex-1 px-10 py-4 bg-[var(--color-text)] text-[var(--color-surface)] font-black rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg text-[10px] uppercase tracking-[0.2em]"
                    >
                        View Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] py-12 px-6 sm:px-10 lg:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <button
                        onClick={() => {
                            if (currentStep === 1) router.back();
                            else setCurrentStep(currentStep - 1);
                        }}
                        className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-black transition-all group text-[10px] uppercase tracking-[0.2em]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mr-4 group-hover:bg-[var(--color-bg)] transition-all shadow-sm">
                            <ChevronLeft size={16} />
                        </div>
                        {currentStep === 1 ? 'Back to Portal' : 'Previous Step'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    <div className="flex-grow w-full lg:w-2/3 bg-[var(--color-surface)] rounded-[2rem] shadow-xl border border-[var(--color-border)] p-8 sm:p-12">
                        <TrackBar />

                        <div className="relative">
                            {/* Step 1: Cart Items */}
                            {currentStep === 1 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-10 border-b border-[var(--color-border)]/50 pb-8">
                                        <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Your Selection</h2>
                                        <span className="bg-[var(--color-accent)] text-[var(--color-text)] font-black px-4 py-1.5 rounded-lg text-[9px] uppercase tracking-[0.2em] border border-[var(--color-border)]">
                                            {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="py-24 flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 bg-[var(--color-bg)] rounded-[1rem] flex items-center justify-center mb-8 border border-[var(--color-border)]">
                                                <ShoppingBag size={32} className="text-[var(--color-text-muted)] opacity-30" />
                                            </div>
                                            <h3 className="text-2xl font-black text-[var(--color-text)] mb-3">Selection is empty</h3>
                                            <p className="text-[var(--color-text-muted)] font-bold text-sm mb-10 opacity-70">Looks like you haven't added any premium gifts yet.</p>
                                            <button
                                                onClick={() => router.push(`/`)}
                                                className="px-10 py-4 bg-[var(--color-text)] text-[var(--color-surface)] font-black rounded-xl hover:opacity-90 transition-all shadow-lg text-[10px] uppercase tracking-[0.2em]"
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
                                                        className="flex gap-8 p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-text)]/30 hover:bg-[var(--color-bg)]/30 transition-all group relative"
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
                                                            className="absolute top-6 right-6 p-2.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={18} />
                                                        </button>

                                                        <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] p-1.5 cursor-pointer"
                                                            onClick={() => setSliderModal({ isOpen: true, images: item.product.images && item.product.images.length > 0 ? item.product.images : (item.product.image ? [item.product.image] : []), index: 0 })}
                                                        >
                                                            <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--color-bg)] flex items-center justify-center relative group/img">
                                                                {item.product.images?.[0] || item.product.image ? (
                                                                    <img src={item.product.images?.[0] || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Tag size={32} className="text-[var(--color-text-muted)] opacity-20" />
                                                                )}
                                                                <div className="absolute inset-0 bg-[var(--color-text)]/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Maximize2 size={24} className="text-white scale-90" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-grow flex flex-col justify-center">
                                                            <div>
                                                                <p className="text-[9px] font-black tracking-[0.2em] text-[var(--color-text)] opacity-50 uppercase mb-2 flex items-center">
                                                                    <Tag size={10} className="mr-2" /> {item.product.category || 'Gift Selection'}
                                                                </p>
                                                                <h4 className="text-lg font-black text-[var(--color-text)] leading-tight mb-4 pr-10">{item.product.name}</h4>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-border)]/50">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-black text-xl text-[var(--color-text)] leading-none">
                                                                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                                    </span>
                                                                    {hasDiscount && (
                                                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] line-through opacity-50">
                                                                            ₹{(item.product.actualPrice * item.quantity).toLocaleString('en-IN')}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.product._id, item.eventId, item.quantity - 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-all"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="text-sm font-black w-10 text-center text-[var(--color-text)]">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (item.quantity >= 1) {
                                                                                openConfirm('Limit Reached', 'Only 1 unit per product is allowed for samples.', () => { }, 'warning');
                                                                                return;
                                                                            }
                                                                            updateQuantity(item.product._id, item.eventId, item.quantity + 1);
                                                                        }}
                                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${item.quantity >= 1 ? 'text-[var(--color-text-muted)] opacity-30 cursor-not-allowed' : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'}`}
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

                            {/* Step 2: Customization */}
                            {currentStep === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-10 border-b border-[var(--color-border)]/50 pb-8">
                                        <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Design & Branding</h2>
                                        <p className="text-[var(--color-text-muted)] font-bold mt-2 text-base opacity-70">Configure how your organization's logo should appear.</p>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="flex p-1.5 bg-[var(--color-bg)] rounded-2xl w-fit border border-[var(--color-border)]">
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', false)}
                                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${!formData.customization.isBrandingRequired ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'text-[var(--color-text-muted)]'}`}
                                            >
                                                Standard
                                            </button>
                                            <button
                                                onClick={() => handleCustomizationChange('isBrandingRequired', true)}
                                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${formData.customization.isBrandingRequired ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'text-[var(--color-text-muted)]'}`}
                                            >
                                                Custom Logo
                                            </button>
                                        </div>

                                        {formData.customization.isBrandingRequired && (
                                            <div className="space-y-12">
                                                <div className="p-10 bg-[var(--color-bg)]/50 rounded-2xl border border-[var(--color-border)] border-dashed">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-10">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl flex items-center justify-center font-black text-[10px]">A</div>
                                                                <h3 className="text-lg font-black text-[var(--color-text)] uppercase tracking-tight">Organization Logo</h3>
                                                            </div>
                                                            <p className="text-xs text-[var(--color-text-muted)] font-bold opacity-70 leading-relaxed">Upload the primary high-resolution logo for branding application.</p>
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            <div className="flex items-center gap-6">
                                                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-2xl px-10 py-6 bg-[var(--color-surface)] hover:border-[var(--color-text)] cursor-pointer transition-all group min-w-[200px] shadow-sm">
                                                                    <div className="w-10 h-10 bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                                        {logoUploading ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-[0.2em]">{logoUploading ? 'Uploading' : 'Browse Files'}</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                                </label>
                                                                {formData.customization.brandingLogo && (
                                                                    <div className="w-24 h-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 relative shadow-md group animate-in zoom-in-95">
                                                                        <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--color-bg)] flex items-center justify-center">
                                                                            <img src={formData.customization.brandingLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleCustomizationChange('brandingLogo', '')}
                                                                            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl flex items-center justify-center font-black text-[10px] border border-[var(--color-border)] shadow-sm">B</div>
                                                        <h3 className="text-lg font-black text-[var(--color-text)] uppercase tracking-tight">Product Specifications</h3>
                                                    </div>

                                                    {items.map((item, idx) => {
                                                        const pId = item.product._id;
                                                        const cust = formData.customization.productCustomizations[pId] || {};

                                                        return (
                                                            <div key={pId} className="p-8 bg-[var(--color-bg)]/30 rounded-2xl border border-[var(--color-border)] animate-in slide-in-from-bottom-4 duration-500 shadow-sm" style={{ animationDelay: `${idx * 100}ms` }}>
                                                                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[var(--color-border)]/50">
                                                                    <div className="w-14 h-14 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-1.5 flex-shrink-0 shadow-sm">
                                                                        <img src={item.product.images?.[0] || item.product.image} className="w-full h-full object-cover rounded-lg" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-base font-black text-[var(--color-text)] leading-none truncate mb-2">{item.product.name}</h4>
                                                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Qty: {item.quantity}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                                    <div className="space-y-6">
                                                                        <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] block ml-1">1. Branding Style</label>
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            {['Digital Print', 'Screen Print', 'Embroidery', 'Embossing', 'Engraving', 'UV Stickers'].map(type => (
                                                                                <button
                                                                                    key={type}
                                                                                    onClick={() => handleCustomizationChange('brandingType', type, pId)}
                                                                                    className={`px-4 py-3 rounded-xl text-[10px] font-black border transition-all uppercase tracking-wider ${cust.brandingType === type ? 'bg-[var(--color-text)] border-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)]/30'}`}
                                                                                >
                                                                                    {type}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-8">
                                                                        <div className="space-y-5">
                                                                            <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] block ml-1">2. Placement</label>
                                                                            <div className="flex flex-wrap gap-3">
                                                                                {[1, 2, 3].map(pos => (
                                                                                    <button
                                                                                        key={pos}
                                                                                        onClick={() => {
                                                                                            handleCustomizationChange('brandingPositions', pos, pId);
                                                                                            handleCustomizationChange('customBrandingPositions', '', pId);
                                                                                        }}
                                                                                        className={`w-11 h-11 rounded-xl font-black text-xs border transition-all ${cust.brandingPositions === pos ? 'bg-[var(--color-text)] border-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)]/30'}`}
                                                                                    >
                                                                                        {pos}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => handleCustomizationChange('brandingPositions', 'Custom', pId)}
                                                                                    className={`px-5 h-11 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${cust.brandingPositions === 'Custom' ? 'bg-[var(--color-text)] border-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)]/30'}`}
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
                                                                                    className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none font-bold text-sm text-[var(--color-text)] placeholder:opacity-30"
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-5">
                                                                            <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] block ml-1">3. Dimensions</label>
                                                                            <div className="flex flex-wrap gap-3">
                                                                                {['1" to 3"', '3" to 5"', '5" to 10"'].map(size => (
                                                                                    <button
                                                                                        key={size}
                                                                                        onClick={() => {
                                                                                            handleCustomizationChange('brandingSize', size, pId);
                                                                                            handleCustomizationChange('customBrandingSize', '', pId);
                                                                                        }}
                                                                                        className={`px-5 h-11 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${cust.brandingSize === size ? 'bg-[var(--color-text)] border-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)]/30'}`}
                                                                                    >
                                                                                        {size}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => handleCustomizationChange('brandingSize', 'Custom', pId)}
                                                                                    className={`px-5 h-11 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${cust.brandingSize === 'Custom' ? 'bg-[var(--color-text)] border-[var(--color-text)] text-[var(--color-surface)] shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)]/30'}`}
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
                                                                                    className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none font-bold text-sm text-[var(--color-text)] placeholder:opacity-30"
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
                                            <div className="p-16 bg-[var(--color-bg)]/50 rounded-2xl border border-dashed border-[var(--color-border)] text-center">
                                                <div className="w-16 h-16 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--color-border)] shadow-sm">
                                                    <Info size={28} className="text-[var(--color-text-muted)] opacity-30" />
                                                </div>
                                                <h4 className="text-xl font-black text-[var(--color-text)] mb-2">Standard Selection</h4>
                                                <p className="text-[var(--color-text-muted)] font-bold text-sm max-w-sm mx-auto opacity-70">Your rewards will be delivered as standard catalog products without additional personalization.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Shipping */}
                            {currentStep === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-10 border-b border-[var(--color-border)]/50 pb-8">
                                        <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Delivery Details</h2>
                                        <p className="text-[var(--color-text-muted)] font-bold mt-2 text-base opacity-70">Where should we deliver your selected rewards?</p>
                                    </div>

                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Full Name</label>
                                                <input readOnly required type="text" name="name" value={formData.name} className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl outline-none font-bold text-[var(--color-text-muted)] opacity-60 cursor-not-allowed text-sm" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Email</label>
                                                <input readOnly required type="email" name="email" value={formData.email} className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl outline-none font-bold text-[var(--color-text-muted)] opacity-60 cursor-not-allowed text-sm" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Phone</label>
                                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none transition-all font-bold text-[var(--color-text)] text-sm shadow-sm" placeholder="+91 00000 00000" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Employee ID</label>
                                                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none transition-all font-bold text-[var(--color-text)] text-sm shadow-sm" placeholder="ID Number" />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Delivery Address</label>
                                            <textarea
                                                required
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none transition-all font-bold text-[var(--color-text)] resize-none text-sm shadow-sm"
                                                placeholder="Enter your complete delivery address..."
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] ml-1">Notes (Optional)</label>
                                            <textarea
                                                name="additionalRequirements"
                                                value={formData.additionalRequirements}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-text)] rounded-xl outline-none transition-all font-bold text-[var(--color-text)] resize-none text-sm shadow-sm"
                                                placeholder="Any additional instructions..."
                                            ></textarea>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="w-full lg:w-1/3 space-y-8">
                        <div className="bg-[var(--color-surface)] rounded-[2rem] shadow-xl border border-[var(--color-border)] p-8 sm:p-10 sticky top-28">
                            <h3 className="text-xl font-black text-[var(--color-text)] mb-8 flex items-center">
                                <CreditCard className="mr-4 opacity-50" size={24} />
                                Order Summary
                            </h3>

                            <div className="space-y-6 mb-10">
                                {currentStep === 1 ? (
                                    <>
                                        <div className="flex justify-between text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                                            <span>Subtotal</span>
                                            <span className="text-[var(--color-text)]">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {savings > 0 && (
                                            <div className="flex justify-between text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                                <span>Savings</span>
                                                <span>- ₹{savings.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] pb-6 border-b border-[var(--color-border)]/50">
                                            <span>Shipping</span>
                                            <span className="text-emerald-600">Included</span>
                                        </div>

                                        <div className="flex justify-between items-center pt-4">
                                            <span className="font-black text-lg text-[var(--color-text)]">Total</span>
                                            <span className="font-black text-2xl text-[var(--color-text)] tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 pb-6 border-b border-[var(--color-border)]/50">
                                        <h4 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">Item Overview</h4>
                                        {items.map(item => (
                                            <div key={`${item.product._id}-${item.eventId}`} className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden flex-shrink-0 p-1">
                                                    <img src={item.product.images?.[0] || item.product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-[var(--color-text)] truncate">{item.product.name}</p>
                                                    <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-wider">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-[10px] font-black text-[var(--color-text)] bg-[var(--color-bg)] px-5 py-4 rounded-xl border border-[var(--color-border)] mt-6">
                                    <div className="flex items-center gap-3 uppercase tracking-[0.2em]">
                                        <Truck size={16} className="opacity-50" />
                                        <span>Delivery</span>
                                    </div>
                                    <span className="opacity-50"> 4-5 working days</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {isAlreadyOrdered ? (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center animate-in shake duration-500">
                                    <Info className="text-red-500 mx-auto mb-3" size={24} />
                                    <p className="text-red-700 font-black text-[10px] uppercase tracking-[0.2em]">Limit Reached</p>
                                    <p className="text-red-600 font-bold text-xs mt-2 leading-relaxed">Order already submitted for this event.</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="mt-6 text-[var(--color-text)] font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-[var(--color-text)] hover:opacity-70 transition-all pb-1"
                                    >
                                        Return Home
                                    </button>
                                </div>
                            ) : currentStep === 1 ? (
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={items.length === 0}
                                    className="w-full bg-[var(--color-text)] text-[var(--color-surface)] font-black text-[10px] uppercase tracking-[0.2em] py-5 px-6 rounded-xl flex items-center justify-center group hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Proceed to Design
                                    <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
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
                                    className="w-full bg-[var(--color-text)] text-[var(--color-surface)] font-black text-[10px] uppercase tracking-[0.2em] py-5 px-6 rounded-xl flex items-center justify-center group hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Shipping Details
                                    <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[var(--color-text)] text-[var(--color-surface)] font-black text-[10px] uppercase tracking-[0.2em] py-5 px-6 rounded-xl flex items-center justify-center group hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-3">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Processing</span>
                                        </div>
                                    ) : (
                                        <span>Confirm Selection</span>
                                    )}
                                </button>
                            )}

                            <div className="mt-8 flex items-center justify-center text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] opacity-50">
                                <ShieldCheck size={14} className="mr-2 text-emerald-500" />
                                Secure Verification
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

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
