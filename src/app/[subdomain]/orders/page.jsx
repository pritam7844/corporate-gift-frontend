'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import EmployeeNavbar from '../../../components/employee/EmployeeNavbar';

export default function OrderHistoryPage() {
    const user = useAuthStore(state => state.user);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/gift-requests/my-requests');
                setOrders(res.data.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="text-yellow-500" size={20} />;
            case 'Approved': return <CheckCircle className="text-blue-500" size={20} />;
            case 'Shipped': return <Truck className="text-purple-500" size={20} />;
            case 'Delivered': return <CheckCircle className="text-green-500" size={20} />;
            default: return <AlertCircle className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <EmployeeNavbar />
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <EmployeeNavbar />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                        <p className="text-gray-500">Track the status of your requested gifts</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500">You haven't requested any gifts yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Order ID: #{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500 mt-1">Requested on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full border flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="font-semibold text-sm">{order.status}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Items</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {order.selectedProducts.map((item, idx) => (
                                            <div key={idx} className="flex items-center space-x-4 border border-gray-100 rounded-xl p-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.productId?.image ? (
                                                        <img src={item.productId.image} alt="product" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productId?.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 border-t border-gray-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shipping To</p>
                                            <p className="text-sm text-gray-900">{order.employeeDetails.name}</p>
                                            <p className="text-sm text-gray-600 line-clamp-1">{order.employeeDetails.address}</p>
                                        </div>
                                        {order.eventId?.name && (
                                            <div className="md:text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Event</p>
                                                <p className="text-sm font-medium text-blue-600">{order.eventId.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
