'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ArrowLeft, Loader2, Calendar, X, Mail, MapPin, User, Gift, Info } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import Link from 'next/link';

export default function MyOrdersPage() {
    const { subdomain } = useParams();
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.replace(`/login`);
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await api.get('/gift-requests/my-requests');
                setOrders(res.data.data || []);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };

        if (isHydrated && isAuthenticated) {
            fetchOrders();
        }
    }, [isHydrated, isAuthenticated, router, subdomain]);

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { color: 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]', icon: Clock, label: 'Pending Approval' };
            case 'approved': return { color: 'bg-[var(--color-accent)] text-[var(--color-text)] border-[var(--color-border)]', icon: CheckCircle2, label: 'Approved' };
            case 'shipped': return { color: 'bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)]', icon: Truck, label: 'Shipped' };
            case 'delivered': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Package, label: 'Delivered' };
            case 'rejected': return { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Cancelled' };
            default: return { color: 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]', icon: Package, label: status || 'Unknown' };
        }
    };

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--color-text)] animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex items-center space-x-6 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 flex items-center justify-center bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Purchase History</h1>
                        <p className="text-[var(--color-text-muted)] font-bold text-sm mt-1">Track and manage your corporate reward selections</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl p-20 text-center">
                        <div className="w-20 h-20 bg-[var(--color-bg)] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[var(--color-border)]">
                            <Package className="w-8 h-8 text-[var(--color-text-muted)] opacity-30" />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text)] mb-3">No selections yet</h2>
                        <p className="text-[var(--color-text-muted)] max-w-sm mx-auto mb-10 font-bold">You haven't requested any gifts yet. When you do, they will show up here for you to track.</p>
                        <Link
                            href={`/`}
                            className="inline-flex items-center justify-center bg-[var(--color-text)] text-[var(--color-surface)] px-10 py-4 rounded-xl font-black hover:opacity-90 transition shadow-lg text-xs uppercase tracking-[0.2em]"
                        >
                            Explore Rewards
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => {
                            const config = getStatusConfig(order.status);
                            const StatusIcon = config.icon;
                            const displayedProducts = order.selectedProducts?.slice(0, 2) || [];
                            const remainingProductsCount = Math.max(0, (order.selectedProducts?.length || 0) - 2);

                            return (
                                <div key={order._id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                                    {/* Order Header */}
                                    <div className="bg-[var(--color-bg)]/50 px-8 py-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex flex-wrap gap-x-10 gap-y-3">
                                            <div>
                                                <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-black tracking-[0.2em] mb-1.5">Submitted On</p>
                                                <p className="text-xs font-black text-[var(--color-text)]">
                                                    <FormattedDate date={order.createdAt} />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-black tracking-[0.2em] mb-1.5">Reference ID</p>
                                                <p className="text-xs font-black text-[var(--color-text)]">
                                                    #{order.orderId || order._id.toString().slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            {order.eventId?.name && (
                                                <div>
                                                    <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-black tracking-[0.2em] mb-1.5">Corporate Event</p>
                                                    <p className="text-xs font-black text-[var(--color-text)] flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                        {order.eventId.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-[0.2em] ${config.color}`}>
                                                <StatusIcon className="w-3 h-3 mr-2" />
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                            <div className="md:col-span-2 space-y-5">
                                                <h3 className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">Selections</h3>
                                                {displayedProducts.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-5">
                                                        <div className="w-16 h-16 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-1 flex-shrink-0">
                                                            {item.productId?.images?.[0] || item.productId?.image ? (
                                                                <img src={item.productId.images?.[0] || item.productId.image} alt={item.productId.name} className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] opacity-20">
                                                                    <Package size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-[var(--color-text)] truncate text-sm mb-1">{item.productId?.name || 'Unknown Item'}</p>
                                                            <p className="text-[9px] text-[var(--color-text-muted)] font-black uppercase tracking-[0.1em]">Quantity: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {remainingProductsCount > 0 && (
                                                    <div className="text-[10px] font-black text-[var(--color-text-muted)] pl-20 pt-1 uppercase tracking-[0.2em]">
                                                        + {remainingProductsCount} more {remainingProductsCount === 1 ? 'item' : 'items'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-8 md:pt-0 md:pl-10 flex flex-col justify-center">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                                                    className="w-full py-4 px-5 bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-between transition-all hover:opacity-90 shadow-lg"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <div className="mt-6">
                                                    <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Shipping To</p>
                                                    <p className="text-xs text-[var(--color-text)] font-bold leading-relaxed line-clamp-2 opacity-80">
                                                        {order.employeeDetails?.address || 'Address not specified'}
                                                    </p>
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

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-[var(--color-text)]/40 backdrop-blur-md z-50 flex items-center justify-center p-[2.5%] md:p-[5%]">
                    <div className="bg-[var(--color-surface)] rounded-[2rem] w-[95%] md:w-[85%] lg:w-[70%] max-w-[850px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--color-border)] flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-[5%] md:p-8 border-b border-[var(--color-border)] flex justify-between items-start bg-[var(--color-bg)]/30 shrink-0">
                            <div>
                                <div className="flex items-center space-x-3 mb-3">
                                    <span className="bg-[var(--color-text)] text-[var(--color-surface)] text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em]">Tracking Details</span>
                                    <span className="text-[var(--color-text-muted)] font-black text-[10px] tracking-wider">#{selectedOrder.orderId || selectedOrder._id.toString().slice(-8).toUpperCase()}</span>
                                </div>
                                <h2 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Order Information</h2>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all border border-[var(--color-border)] shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-10 custom-scrollbar">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <div className="p-4 md:p-6 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                                        <Calendar size={12} className="mr-2 opacity-50" /> Placed On
                                    </div>
                                    <p className="font-black text-sm text-[var(--color-text)]"><FormattedDate date={selectedOrder.createdAt} /></p>
                                </div>
                                <div className="p-4 md:p-6 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                                        <Info size={12} className="mr-2 opacity-50" /> Progress
                                    </div>
                                    <p className="font-black text-sm text-[var(--color-text)] uppercase tracking-[0.1em]">{selectedOrder.status}</p>
                                </div>
                            </div>

                            {/* Branding Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Branding Specs</h3>
                                {selectedOrder.customization?.isBrandingRequired ? (
                                    <div className="bg-[var(--color-accent)] border border-[var(--color-border)] rounded-2xl p-6">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            {selectedOrder.customization.brandingLogo && (
                                                <div className="w-20 h-20 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-3 flex-shrink-0 flex items-center justify-center shadow-sm">
                                                    <img src={selectedOrder.customization.brandingLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                </div>
                                            )}
                                            <div className="flex-1 text-center md:text-left">
                                                <p className="text-base font-black text-[var(--color-text)] mb-1">Custom Branding Applied</p>
                                                <p className="text-[10px] text-[var(--color-text-muted)] font-bold">Individual personalization choices are detailed in the breakdown below.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
                                        <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] italic">Standard Selection (No Branding)</p>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Delivery Context</h3>
                                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-sm">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 bg-[var(--color-bg)] text-[var(--color-text-muted)] rounded-xl flex items-center justify-center mr-5 flex-shrink-0 border border-[var(--color-border)]">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[var(--color-text)] mb-2 uppercase tracking-[0.2em]">Shipping Address</p>
                                            <div className="text-xs text-[var(--color-text-muted)] leading-relaxed font-bold">
                                                {selectedOrder.employeeDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item Breakdown */}
                            <div className="space-y-4 pb-6">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] flex justify-between items-center">
                                    Product Breakdown
                                    <span className="bg-[var(--color-bg)] text-[var(--color-text)] px-3 py-1 rounded-lg text-[10px] uppercase font-black border border-[var(--color-border)]">{selectedOrder.selectedProducts.length} Items</span>
                                </h3>
                                <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-[var(--color-border)]">
                                            <thead className="bg-[var(--color-bg)]">
                                                <tr>
                                                    <th className="px-6 md:px-8 py-4 text-left text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Gift Selection</th>
                                                    <th className="px-6 md:px-8 py-4 text-center text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Qty</th>
                                                    <th className="px-6 md:px-8 py-4 text-right text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                                                {selectedOrder.selectedProducts.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-[var(--color-bg)]/30 transition-colors">
                                                        <td className="px-6 md:px-8 py-5">
                                                            <div className="flex items-center mb-2">
                                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden mr-3 md:mr-5 flex-shrink-0 p-1 shadow-sm">
                                                                    {p.productId?.images?.[0] || p.productId?.image ? <img src={p.productId.images?.[0] || p.productId.image} className="w-full h-full object-cover rounded-lg" /> : <Package size={18} className="m-3 text-[var(--color-text-muted)] opacity-20" />}
                                                                </div>
                                                                <div className="text-sm font-black text-[var(--color-text)] truncate max-w-[140px] md:max-w-[200px]">{p.productId?.name || 'Item'}</div>
                                                            </div>
                                                            {selectedOrder.customization?.isBrandingRequired && (
                                                                <div className="ml-12 md:ml-16 text-[9px] text-[var(--color-text-muted)] font-black uppercase tracking-wider flex flex-wrap gap-2">
                                                                    <span className="bg-[var(--color-bg)] px-2 py-1 rounded-md border border-[var(--color-border)]">Style: {p.brandingType || 'Standard'}</span>
                                                                    <span className="bg-[var(--color-bg)] px-2 py-1 rounded-md border border-[var(--color-border)]">Pos: {p.brandingPositions === 'Custom' ? p.customBrandingPositions : p.brandingPositions || '1'}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 md:px-8 py-5 text-center text-xs font-black text-[var(--color-text)]">x{p.quantity}</td>
                                                        <td className="px-6 md:px-8 py-5 text-right">
                                                            <div className="text-sm font-black text-[var(--color-text)]">₹{(p.discountedPrice || 0).toLocaleString('en-IN')}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 bg-[var(--color-bg)]/30 border-t border-[var(--color-border)] flex justify-end shrink-0">
                            <button onClick={() => setShowDetailModal(false)} className="w-full md:w-auto px-10 py-4 bg-[var(--color-text)] text-[var(--color-surface)] text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all shadow-lg">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}