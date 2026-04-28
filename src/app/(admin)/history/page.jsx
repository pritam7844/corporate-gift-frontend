'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
    Package,
    RefreshCw,
    X,
    Building2,
    Calendar,
    Mail,
    MapPin,
    User,
    History,
    CheckCircle,
    Truck,
    Clock,
    Maximize2
} from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import ImageSliderModal from '../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';

export default function OrderHistoryPage() {
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

    const fetchOrders = async (companyId = selectedCompanyId) => {
        setLoading(true);
        try {
            const baseUrl = companyId ? `/gift-requests/company/${companyId}` : '/gift-requests';
            const res = await api.get(`${baseUrl}?status=Delivered`);
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

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center">
                        <History className="mr-3 text-[var(--color-text)]" size={28} />
                        Order History
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">View all successfully delivered gifts and purchase records</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px] shadow-sm"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                    >
                        <option value="">All Companies</option>
                        {companies.map(company => (
                            <option key={company._id} value={company._id}>{company.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => fetchOrders()}
                        className="flex items-center px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-lg hover:bg-[var(--color-bg)] transition shadow-sm"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-text)]"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-[var(--color-surface)] border text-center border-[var(--color-border)] rounded-2xl p-16 shadow-sm">
                    <div className="w-20 h-20 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} className="text-[var(--color-border)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">No delivered orders</h3>
                    <p className="text-[var(--color-text-muted)] mt-2 max-w-xs mx-auto">Orders will appear here once their status is updated to "Delivered".</p>
                </div>
            ) : (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--color-border)]">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Order Ref</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Gifts</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Completion</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                                {orders.map((order) => {
                                    const totalAmount = order.selectedProducts.reduce((sum, p) => sum + ((p.discountedPrice || p.price || 0) * p.quantity), 0);
                                    return (
                                        <tr key={order._id} className="hover:bg-[var(--color-bg)]/30 transition duration-150 cursor-pointer group" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors">#{order._id.slice(-6).toUpperCase()}</div>
                                                <div className="text-[10px] text-[var(--color-text-muted)] font-bold mt-1 uppercase">
                                                    <FormattedDate date={order.createdAt} />
                                                </div>
                                                {order.companyId && (
                                                    <div className="mt-2 flex">
                                                        <span className="text-[9px] font-black text-[var(--color-text)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                            {order.companyId.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-[var(--color-text)]">{order.employeeDetails?.name}</div>
                                                <div className="text-xs text-[var(--color-text-muted)] font-medium">{order.employeeDetails?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <Package size={14} className="text-[var(--color-text-muted)]" />
                                                    <span className="text-sm font-bold text-[var(--color-text)]">{order.selectedProducts.length}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-black text-[var(--color-text)]">₹{totalAmount.toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-[var(--color-border)] uppercase tracking-wide">
                                                    <CheckCircle size={10} className="mr-1" /> Delivered
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button className="text-[10px] font-black text-[var(--color-text)] hover:text-blue-800 uppercase tracking-widest py-2 px-4 rounded-xl bg-[var(--color-bg)] hover:bg-blue-100 transition-all">
                                                    Analyze
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                    <span className="bg-[var(--color-text)] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">History Log</span>
                                    <span className="text-[var(--color-text-muted)] font-bold text-xs">#{selectedOrder._id.toUpperCase()}</span>
                                </div>
                                <h2 className="text-xl font-black text-[var(--color-text)]">Purchase Record</h2>
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
                                        <Building2 size={12} className="mr-2" /> Client Company
                                    </div>
                                    <p className="font-bold text-sm text-[var(--color-text)]">{selectedOrder.companyId?.name || 'Global'}</p>
                                </div>
                                <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={12} className="mr-2" /> Delivered On
                                    </div>
                                    <p className="font-bold text-sm text-[var(--color-text)]"><FormattedDate date={selectedOrder.updatedAt || selectedOrder.createdAt} /></p>
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
                                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-xs text-[var(--color-text-muted)]">Type: <span className="text-[var(--color-text)] font-bold">{selectedOrder.customization.brandingType}</span></p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Positions: <span className="text-[var(--color-text)] font-bold">{selectedOrder.customization.brandingPositions === 'Custom' ? selectedOrder.customization.customBrandingPositions : selectedOrder.customization.brandingPositions}</span></p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Size: <span className="text-[var(--color-text)] font-bold">{selectedOrder.customization.brandingSize === 'Custom' ? selectedOrder.customization.customBrandingSize : selectedOrder.customization.brandingSize}</span></p>
                                            </div>
                                            {selectedOrder.customization.brandingLogo && (
                                                <div className="flex flex-col items-center justify-center p-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                                                    <a href={selectedOrder.customization.brandingLogo} target="_blank" rel="noreferrer" className="block w-full">
                                                        <img src={selectedOrder.customization.brandingLogo} alt="Logo" className="max-h-20 max-w-full object-contain mx-auto mb-2" />
                                                        <p className="text-[9px] font-black text-[var(--color-text)] text-center uppercase tracking-tighter">View Original Logo</p>
                                                    </a>
                                                </div>
                                            )}
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
                                        <Truck size={16} className="text-[var(--color-text)] mt-0.5" />
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
                                    <div className="bg-[var(--color-bg)]/50 border border-[var(--color-border)] p-4 rounded-xl shadow-sm">
                                        <div className="text-[11px] text-[var(--color-text)] font-bold leading-relaxed whitespace-pre-wrap">
                                            {selectedOrder.employeeDetails.additionalRequirements}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Items Table */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest flex justify-between items-center">
                                    Itemized Receipt
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
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden mr-3 flex flex-shrink-0 cursor-pointer"
                                                                 onClick={() => setSliderModal({ isOpen: true, images: p.productId?.images && p.productId.images.length > 0 ? p.productId.images : (p.productId?.image ? [p.productId.image] : []), index: 0 })}
                                                            >
                                                                {p.productId?.images && p.productId.images.length > 0 ? (
                                                                    <img src={p.productId.images[0]} className="w-full h-full object-cover" />
                                                                ) : p.productId?.image ? (
                                                                    <img src={p.productId.image} className="w-full h-full object-cover" />
                                                                ) : <Package size={20} className="m-auto text-[var(--color-border)]" />}
                                                            </div>
                                                            <div className="text-xs font-bold text-[var(--color-text)] truncate max-w-[120px]">{p.productId?.name || 'Deleted Product'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs font-bold text-[var(--color-text-muted)]">x{p.quantity}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="text-xs font-black text-[var(--color-text)]">₹{(p.discountedPrice || p.price).toLocaleString('en-IN')}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-xs font-black text-[var(--color-text)]">
                                                        ₹{((p.discountedPrice || p.price) * p.quantity).toLocaleString('en-IN')}
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
