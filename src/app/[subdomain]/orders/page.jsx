'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ArrowLeft, Loader2, Calendar, X, Mail, MapPin, User, Gift, Info } from 'lucide-react';
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
            case 'pending': return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending Approval' };
            case 'approved': return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Approved' };
            case 'shipped': return { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck, label: 'Shipped' };
            case 'delivered': return { color: 'bg-green-50 text-green-700 border-green-200', icon: Package, label: 'Delivered' };
            case 'rejected': return { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' };
            default: return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Package, label: status || 'Unknown' };
        }
    };

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">Track and manage your corporate gifts</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't requested any gifts yet. When you do, they will show up here for you to track.</p>
                        <Link
                            href={`/`}
                            className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            Explore Events
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
                                <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    {/* Order Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order Placed</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order ID</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    #{order.orderId || order._id.toString().slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            {order.eventId?.name && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Event</p>
                                                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {order.eventId.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items & Timeline preview */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                            {/* Items List */}
                                            <div className="md:col-span-2 space-y-4">
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Items Included</h3>
                                                {displayedProducts.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 p-1 flex-shrink-0">
                                                            {item.productId?.image ? (
                                                                <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <Package className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 leading-tight truncate">{item.productId?.name || 'Unknown Item'}</p>
                                                            <p className="text-sm text-gray-500 mt-1 font-medium">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {remainingProductsCount > 0 && (
                                                    <div className="text-sm font-medium text-gray-500 pl-20 pt-2">
                                                        + {remainingProductsCount} more {remainingProductsCount === 1 ? 'item' : 'items'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Actions / Quick Track */}
                                            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                                                    className="w-full py-3 px-4 bg-white border border-gray-200 hover:border-black text-gray-900 rounded-xl font-bold flex items-center justify-between transition-colors group-hover:border-black group-hover:bg-gray-50"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                                </button>
                                                <div className="mt-4 text-xs text-gray-500 leading-relaxed font-medium">
                                                    <p><span className="text-gray-700 font-bold">Delivery Addr:</span> {order.employeeDetails?.address || 'N/A'}</p>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Order Detail</span>
                                    <span className="text-gray-400 font-bold text-xs">#{selectedOrder.orderId || selectedOrder._id.toString().slice(-8).toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Tracking Information</h2>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={12} className="mr-2" /> Placed On
                                    </div>
                                    <p className="font-bold text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Info size={12} className="mr-2" /> Current Status
                                    </div>
                                    <p className="font-bold text-sm text-blue-600">{selectedOrder.status}</p>
                                </div>
                            </div>

                            {/* Personalization Section */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personalization</h3>
                                {selectedOrder.customization?.isBrandingRequired ? (
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-xs text-gray-500">Branding Type: <span className="text-gray-900 font-bold">{selectedOrder.customization.brandingType}</span></p>
                                                <p className="text-xs text-gray-500">Positions: <span className="text-gray-900 font-bold">{selectedOrder.customization.brandingPositions}</span></p>
                                                <p className="text-xs text-gray-500">Size: <span className="text-gray-900 font-bold">{selectedOrder.customization.brandingSize}</span></p>
                                            </div>
                                            {selectedOrder.customization.brandingLogo && (
                                                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-blue-50">
                                                    <img src={selectedOrder.customization.brandingLogo} alt="Logo" className="max-h-16 max-w-full object-contain mb-2" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Uploaded Logo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                        <p className="text-xs font-bold text-gray-500 italic text-center">No branding required for this order</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Section */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping & Delivery</h3>
                                <div className="grid grid-cols-1 gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-start">
                                        <MapPin size={14} className="mr-2.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-900">{selectedOrder.shippingDetails?.deliveryType || 'Single Location'}</p>
                                            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                                {selectedOrder.shippingDetails?.deliveryType === 'Multiple Locations'
                                                    ? selectedOrder.shippingDetails.multipleLocations
                                                    : selectedOrder.employeeDetails?.address}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedOrder.shippingDetails?.deliveryTimeline && (
                                        <div className="flex items-center pt-2 border-t border-gray-50">
                                            <Clock size={14} className="mr-2.5 text-blue-500" />
                                            <p className="text-xs font-bold text-gray-900">Timeline: <span className="text-gray-500 font-medium">{selectedOrder.shippingDetails.deliveryTimeline}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Item Breakdown */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between items-center">
                                    Item Breakdown
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{selectedOrder.selectedProducts.length} Items</span>
                                </h3>
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-[9px] font-black text-gray-400 uppercase tracking-wider">Gift</th>
                                                <th className="px-4 py-2 text-center text-[9px] font-black text-gray-400 uppercase tracking-wider">Qty</th>
                                                <th className="px-4 py-2 text-right text-[9px] font-black text-gray-400 uppercase tracking-wider">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {selectedOrder.selectedProducts.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden mr-3">
                                                                {p.productId?.image ? <img src={p.productId.image} className="w-full h-full object-cover" /> : <Package size={16} className="m-2 text-gray-300" />}
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{p.productId?.name || 'Item'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs font-bold text-gray-600">x{p.quantity}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="text-xs font-black text-gray-900">₹{(p.discountedPrice || 0).toLocaleString('en-IN')}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 bg-black text-white text-xs font-black rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}