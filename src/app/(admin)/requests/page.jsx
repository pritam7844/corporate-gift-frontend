'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayoutContent from '../../../components/admin/AdminLayoutContent';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gift-requests');
            setOrders(res.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/gift-requests/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
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

    return (
        <AdminLayoutContent>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-500 mt-1">Review and manage employee requests</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border text-center border-gray-200 rounded-xl p-12 shadow-sm">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No orders found</h3>
                    <p className="text-gray-500 mt-1">There are no gift orders yet.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Order Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Employee Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                                            {order.companyId && (
                                                <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mt-2 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded inline-block">
                                                    {order.companyId.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.employeeDetails?.name}</div>
                                            <div className="text-sm text-gray-500">{order.employeeDetails?.email}</div>
                                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{order.employeeDetails?.address}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{order.selectedProducts.length} items</div>
                                            <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">
                                                {order.selectedProducts.map(p => p.productId?.name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <select
                                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayoutContent>
    );
}
