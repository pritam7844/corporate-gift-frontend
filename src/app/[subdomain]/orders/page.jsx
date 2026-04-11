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
                // The API returns an array of order objects
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

    // Helper mapping for status badges and colors
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock, label: 'Pending Approval' };
            case 'approved': return { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: CheckCircle2, label: 'Approved' };
            case 'shipped': return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Truck, label: 'Shipped' };
            case 'delivered': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Package, label: 'Delivered' };
            case 'rejected': return { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Cancelled' };
            default: return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: Package, label: status || 'Unknown' };
        }
    };

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex items-center space-x-5 mb-10">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase History</h1>
                        <p className="text-slate-500 text-sm mt-1">Track and manage your corporate reward selections</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No selections yet</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">You haven't requested any gifts yet. When you do, they will show up here for you to track.</p>
                        <Link
                            href={`/`}
                            className="inline-flex items-center justify-center bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-600 transition shadow-sm text-sm uppercase tracking-widest"
                        >
                            Explore Rewards
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const config = getStatusConfig(order.status);
                            const StatusIcon = config.icon;
                            // For UI purposes, if an order has more than 2 types of items, we'll summarize
                            const displayedProducts = order.selectedProducts?.slice(0, 2) || [];
                            const remainingProductsCount = Math.max(0, (order.selectedProducts?.length || 0) - 2);

                            return (
                                <div key={order._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all group">
                                    {/* Order Header */}
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Submitted On</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none">
                                                    <FormattedDate date={order.createdAt} />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Reference ID</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none">
                                                    #{order.orderId || order._id.toString().slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            {order.eventId?.name && (
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Corporate Event</p>
                                                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {order.eventId.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-widest ${config.color}`}>
                                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items & Timeline preview */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                            {/* Items List */}
                                            <div className="md:col-span-2 space-y-4">
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Selections</h3>
                                                {displayedProducts.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-white rounded-lg border border-slate-200 p-0.5 flex-shrink-0">
                                                            {item.productId?.images?.[0] || item.productId?.image ? (
                                                                <img src={item.productId.images?.[0] || item.productId.image} alt={item.productId.name} className="w-full h-full object-cover rounded-md" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-900 leading-none truncate text-sm mb-1">{item.productId?.name || 'Unknown Item'}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Quantity: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {remainingProductsCount > 0 && (
                                                    <div className="text-[10px] font-bold text-slate-400 pl-18 pt-1 uppercase tracking-widest">
                                                        + {remainingProductsCount} more {remainingProductsCount === 1 ? 'item' : 'items'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Actions / Quick Track */}
                                            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                                                    className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-between transition-all hover:bg-indigo-600 shadow-sm"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Shipping To</p>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Tracking Details</span>
                                    <span className="text-slate-400 font-bold text-xs">#{selectedOrder.orderId || selectedOrder._id.toString().slice(-8).toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order Information</h2>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[70vh] space-y-10">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                        <Calendar size={12} className="mr-2" /> Placed On
                                    </div>
                                    <p className="font-bold text-sm text-slate-900"><FormattedDate date={selectedOrder.createdAt} /></p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                        <Info size={12} className="mr-2" /> Progress
                                    </div>
                                    <p className="font-bold text-sm text-indigo-600 uppercase tracking-wide">{selectedOrder.status}</p>
                                </div>
                            </div>

                            {/* Personalization Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branding Specs</h3>
                                {selectedOrder.customization?.isBrandingRequired ? (
                                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-5">
                                        <div className="flex flex-col md:flex-row items-center gap-5">
                                            {selectedOrder.customization.brandingLogo && (
                                                <div className="w-16 h-16 bg-white rounded-lg border border-indigo-100/50 p-2 flex-shrink-0 flex items-center justify-center">
                                                    <img src={selectedOrder.customization.brandingLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                </div>
                                            )}
                                            <div className="flex-1 text-center md:text-left">
                                                <p className="text-sm font-bold text-indigo-900 leading-tight mb-1">Custom Branding Applied</p>
                                                <p className="text-[10px] text-indigo-600/70 font-medium">Individual personalization choices for each product are listed in the breakdown below.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Standard Selection (No Branding)</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Context</h3>
                                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-widest">Shipping Address</p>
                                            <div className="text-xs text-slate-500 leading-relaxed font-medium">
                                                {selectedOrder.employeeDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item Breakdown */}
                            <div className="space-y-4 pb-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                    Product Breakdown
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{selectedOrder.selectedProducts.length} Items</span>
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gift Selection</th>
                                                <th className="px-6 py-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-6 py-3 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {selectedOrder.selectedProducts.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center mb-1">
                                                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden mr-4 flex-shrink-0 p-0.5">
                                                                {p.productId?.images?.[0] || p.productId?.image ? <img src={p.productId.images?.[0] || p.productId.image} className="w-full h-full object-cover rounded-md" /> : <Package size={16} className="m-2 text-slate-200" />}
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{p.productId?.name || 'Item'}</div>
                                                        </div>
                                                        {selectedOrder.customization?.isBrandingRequired && (
                                                            <div className="ml-14 text-[10px] text-slate-500 font-medium">
                                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-1">Style: {p.brandingType || 'Standard'}</span>
                                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded">Pos: {p.brandingPositions === 'Custom' ? p.customBrandingPositions : p.brandingPositions || '1'}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">x{p.quantity}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="text-sm font-bold text-slate-900">₹{(p.discountedPrice || 0).toLocaleString('en-IN')}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-all shadow-sm">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}