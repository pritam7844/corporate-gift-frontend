'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle, RefreshCw, X, Building2, Calendar, Mail, MapPin, User, Gift, Maximize2 } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';
import ImageSliderModal from '../../../components/common/ImageSliderModal';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Image Slider State
    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
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

    const fetchOrders = async (companyId = selectedCompanyId) => {
        setLoading(true);
        try {
            const baseUrl = companyId ? `/gift-requests/company/${companyId}` : '/gift-requests';
            const separator = baseUrl.includes('?') ? '&' : '?';
            const res = await api.get(`${baseUrl}${separator}excludeStatus=Delivered`);
            setOrders(res.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data.data);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchCompanies();
    }, []);

    const handleCompanyChange = (e) => {
        const id = e.target.value;
        setSelectedCompanyId(id);
        fetchOrders(id);
    };

    const updateStatus = async (orderId, newStatus) => {
        const executeUpdate = async () => {
            try {
                await api.put(`/gift-requests/${orderId}/status`, { status: newStatus });
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            } catch (error) {
                console.error('Failed to update status:', error);
                openConfirm('Error', 'Failed to update order status. Please try again.', () => { }, 'danger');
            }
        };

        if (newStatus === 'Delivered') {
            openConfirm(
                'Mark as Delivered?',
                'This will move the order to History. You won\'t be able to manage its status from here anymore.',
                executeUpdate,
                'warning'
            );
        } else {
            executeUpdate();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-[var(--color-accent)] text-[var(--color-text)] border-[var(--color-border)]';
            case 'Shipped': return 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]';
            case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]';
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Orders Management</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Review and manage employee requests</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <select
                            value={selectedCompanyId}
                            onChange={handleCompanyChange}
                            className="appearance-none pl-10 pr-10 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all cursor-pointer shadow-sm min-w-[200px]"
                        >
                            <option value="">All Companies</option>
                            {companies.map((company) => (
                                <option key={company._id} value={company._id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchOrders()}
                        className="flex items-center px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition shadow-sm"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-[var(--color-surface)] border text-center border-[var(--color-border)] rounded-xl p-12 shadow-sm">
                    <Package size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-xl font-medium text-[var(--color-text)]">No orders found</h3>
                    <p className="text-[var(--color-text-muted)] mt-1">There are no gift orders yet.</p>
                </div>
            ) : (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--color-border)]">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Order Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Employee Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-[var(--color-bg)]/50 transition duration-150 cursor-pointer" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors">#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-xs text-[var(--color-text-muted)] mt-1"><FormattedDate date={order.createdAt} /></div>
                                            {order.companyId && (
                                                <div className="text-[10px] font-black uppercase tracking-wider mt-2 px-2 py-0.5 rounded inline-block" style={{backgroundColor:'var(--color-text)',color:'var(--color-surface)'}}>
                                                    {order.companyId.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[var(--color-text)]">{order.employeeDetails?.name}</div>
                                            <div className="text-sm text-[var(--color-text-muted)]">{order.employeeDetails?.email}</div>
                                            <div className="text-xs text-[var(--color-text-muted)] mt-1 truncate max-w-[200px]">
                                                {order.employeeDetails?.address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[var(--color-text)]">{order.selectedProducts.length} items</div>
                                            <div className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[150px] truncate">
                                                {order.selectedProducts.map(p => p.productId?.name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                                                    className="text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl border transition-all" style={{backgroundColor:'var(--color-bg)',color:'var(--color-text)',borderColor:'var(--color-border)'}}
                                                >
                                                    Analyze
                                                </button>
                                                <select
                                                    className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] block p-2 outline-none w-32"
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                >
                                                    {order.status === 'Pending' && <option value="Pending">Pending</option>}
                                                    <option value="Approved">Approved</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border" style={{backgroundColor:'var(--color-surface)',borderColor:'var(--color-border)'}}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start bg-[var(--color-bg)]/50">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="bg-[var(--color-text)] text-[var(--color-surface)] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Order Review</span>
                                    <span className="text-[var(--color-text-muted)] font-bold text-xs">#{selectedOrder.orderId || selectedOrder._id.toString().slice(-6).toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-black text-[var(--color-text)]">Order Analysis</h2>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent hover:border-[var(--color-border)]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Building2 size={12} className="mr-2" /> Company
                                    </div>
                                    <p className="font-bold text-sm text-[var(--color-text)]">{selectedOrder.companyId?.name || 'Global'}</p>
                                </div>
                                <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={12} className="mr-2" /> Order Date
                                    </div>
                                    <p className="font-bold text-sm text-[var(--color-text)]"><FormattedDate date={selectedOrder.createdAt} /></p>
                                </div>
                            </div>

                            {/* Recipient Info */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Recipient Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-xs font-semibold text-[var(--color-text)]">
                                            <User size={14} className="mr-2.5 text-[var(--color-accent)]" /> {selectedOrder.employeeDetails?.name}
                                        </div>
                                        <div className="flex items-center text-xs font-semibold text-[var(--color-text)]">
                                            <Mail size={14} className="mr-2.5 text-[var(--color-accent)]" /> {selectedOrder.employeeDetails?.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-start text-xs font-semibold text-[var(--color-text)]">
                                            <MapPin size={14} className="mr-2.5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                            <div className="leading-snug space-y-1">
                                                {selectedOrder.employeeDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personalization Section */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Branding Requirements</h3>
                                {selectedOrder.customization?.isBrandingRequired ? (
                                    <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-2xl p-4">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            {selectedOrder.customization.brandingLogo && (
                                                <div className="flex flex-col items-center justify-center p-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-accent)]/20 flex-shrink-0">
                                                    <a href={selectedOrder.customization.brandingLogo} target="_blank" rel="noreferrer" className="block">
                                                        <img src={selectedOrder.customization.brandingLogo} alt="Logo" className="max-h-12 max-w-[80px] object-contain mb-1" />
                                                        <p className="text-[7px] font-black text-[var(--color-text)] text-center uppercase tracking-tighter">Logo</p>
                                                    </a>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-[var(--color-accent)] leading-tight">Per-Product Customization Enabled</p>
                                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Specific branding details for each item are listed in the breakdown below.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4">
                                        <p className="text-xs font-bold text-[var(--color-text-muted)] italic text-center uppercase tracking-widest opacity-50">Standard Order - No Branding</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Section */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Shipping & Timeline</h3>
                                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-xl">
                                    <div className="flex items-start gap-4 mb-3 pb-3 border-b border-[var(--color-border)]">
                                        <Truck size={16} className="text-[var(--color-accent)] mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[var(--color-text)] leading-tight">Delivery Address</p>
                                            <div className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                                                {selectedOrder.employeeDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Requirements Section */}
                            {selectedOrder.employeeDetails?.additionalRequirements && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-[var(--color-text)]">Additional Requirements / Notes</h3>
                                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-xl shadow-sm">
                                        <div className="text-[11px] text-[var(--color-text)] font-bold leading-relaxed whitespace-pre-wrap">
                                            {selectedOrder.employeeDetails.additionalRequirements}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Items Table */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest flex justify-between items-center">
                                    Item Breakdown
                                    <span className="bg-[var(--color-bg)] text-[var(--color-text-muted)] px-2 py-0.5 rounded text-[10px]">{selectedOrder.selectedProducts.length} Items</span>
                                </h3>
                                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-[var(--color-border)]">
                                        <thead className="bg-[var(--color-bg)]">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Gift</th>
                                                <th className="px-4 py-2 text-center text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Qty</th>
                                                <th className="px-4 py-2 text-right text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Unit</th>
                                                <th className="px-4 py-2 text-right text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                                            {selectedOrder.selectedProducts.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden mr-3 flex flex-shrink-0 cursor-pointer"
                                                                 onClick={() => setSliderModal({ isOpen: true, images: p.productId?.images && p.productId.images.length > 0 ? p.productId.images : (p.productId?.image ? [p.productId.image] : []), index: 0 })}
                                                            >
                                                                {p.productId?.images && p.productId.images.length > 0 ? (
                                                                    <img src={p.productId.images[0]} className="w-full h-full object-cover" />
                                                                ) : p.productId?.image ? (
                                                                    <img src={p.productId.image} className="w-full h-full object-cover" />
                                                                ) : <Package size={20} className="m-auto text-[var(--color-text-muted)]" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-[var(--color-text)] truncate max-w-[120px]">{p.productId?.name || 'Deleted Product'}</div>
                                                                {selectedOrder.customization?.isBrandingRequired && (
                                                                    <div className="text-[9px] text-[var(--color-text-muted)] font-medium mt-1">
                                                                        {p.brandingType || 'Standard'} | {p.brandingPositions === 'Custom' ? p.customBrandingPositions : p.brandingPositions || '1'} Pos | {p.brandingSize === 'Custom' ? p.customBrandingSize : p.brandingSize || 'Standard'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs font-bold text-[var(--color-text)]">x{p.quantity}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="text-xs font-black text-[var(--color-text)]">₹{(p.discountedPrice || p.price || 0).toLocaleString('en-IN')}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-xs font-black text-[var(--color-text)]">
                                                        ₹{((p.discountedPrice || p.price || 0) * p.quantity).toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot style={{backgroundColor:'var(--color-text)',color:'#ffffff'}}>
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Grand Total (With GST*)</td>
                                                <td className="px-4 py-3 text-right text-sm font-black italic">
                                                    ₹{selectedOrder.selectedProducts.reduce((sum, p) => sum + ((p.discountedPrice || p.price || 0) * p.quantity), 0).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 bg-gray-900 text-white text-xs font-black rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.type === 'danger' ? 'Okay' : 'Yes, Proceed'}
            />
            {/* Image Slider Modal */}
            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />
        </>
    );
}
