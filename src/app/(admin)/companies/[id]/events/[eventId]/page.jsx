'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar, Gift, Plus, Trash2, ArrowLeft, Package, CheckCircle2, X, Tag, Building2
} from 'lucide-react';
import { getEventByIdAPI, updateEventProductsAPI } from '../../../../../../services/event.service';
import { getProductsAPI, createProductAPI } from '../../../../../../services/product.service';

export default function EventManagement() {
    const { id: companyId, eventId } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPrivateGiftModal, setShowPrivateGiftModal] = useState(false);
    const [globalProducts, setGlobalProducts] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [privateGiftForm, setPrivateGiftForm] = useState({
        name: '', image: '', category: 'electronics', actualPrice: '', discountedPrice: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, productsData] = await Promise.all([
                    getEventByIdAPI(eventId),
                    getProductsAPI(true)
                ]);
                setEvent(eventData);
                setGlobalProducts(productsData);
            } catch (err) {
                console.error("Error loading event", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleAddProducts = async (selectedIds) => {
        setUpdating(true);
        try {
            const updatedEvent = await updateEventProductsAPI(eventId, selectedIds);
            setEvent(updatedEvent);
            setShowProductModal(false);
        } catch (err) {
            alert("Failed to update event products");
        } finally {
            setUpdating(false);
        }
    };

    const handleCreatePrivateGift = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const product = await createProductAPI({
                ...privateGiftForm,
                companyId,
                isGlobal: false
            });
            // Now add this new product to the event
            await updateEventProductsAPI(eventId, [...(event.products?.map(p => p._id) || []), product._id]);

            const refreshedEvent = await getEventByIdAPI(eventId);
            setEvent(refreshedEvent);
            setShowPrivateGiftModal(false);
            setPrivateGiftForm({ name: '', image: '', category: 'electronics', actualPrice: '', discountedPrice: '' });
        } catch (err) {
            alert("Failed to create private gift");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-400 hover:text-gray-800 transition-colors font-medium mb-4"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Company
            </button>

            {/* Header Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift size={120} className="text-blue-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 text-blue-600 font-bold mb-2">
                        <Calendar size={20} />
                        <span className="uppercase tracking-widest text-xs">Event Management</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{event?.name}</h1>
                    <div className="flex space-x-6 text-gray-500 text-sm font-medium">
                        <span className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            {new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center font-bold text-gray-800">
                            <Building2 size={16} className="mr-2" />
                            {event?.companyId?.name || 'Global Template'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Assigned Gifts</h2>
                        <p className="text-sm text-gray-400">Products available for selection during this event.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowPrivateGiftModal(true)}
                            className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        >
                            <Plus size={20} />
                            <span>Create Exclusive Gift</span>
                        </button>
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            <Package size={20} />
                            <span>Library Selection</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {event?.products?.map((product) => (
                            <div key={product._id} className="border border-gray-100 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                                <div className="h-40 bg-gray-50 relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 bg-white text-red-500 rounded shadow-sm hover:bg-red-50">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{product.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                                            {product.category}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800 italic">₹{product.discountedPrice}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(event?.products?.length === 0 || !event?.products) && (
                            <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
                                <Package size={40} className="mx-auto mb-2 opacity-20" />
                                <p className="font-medium">No gifts assigned to this event yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Private Gift Modal */}
            {showPrivateGiftModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">New Exclusive Gift</h2>
                            <button onClick={() => setShowPrivateGiftModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePrivateGift} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text" required
                                    className="w-full border-2 p-3 rounded-xl focus:border-blue-500 outline-none"
                                    value={privateGiftForm.name}
                                    onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (Ref)</label>
                                    <input
                                        type="number" required
                                        className="w-full border-2 p-3 rounded-xl outline-none"
                                        value={privateGiftForm.actualPrice}
                                        onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, actualPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Offer Price</label>
                                    <input
                                        type="number" required
                                        className="w-full border-2 p-3 rounded-xl outline-none"
                                        value={privateGiftForm.discountedPrice}
                                        onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, discountedPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select
                                    className="w-full border-2 p-3 rounded-xl outline-none"
                                    value={privateGiftForm.category}
                                    onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, category: e.target.value })}
                                >
                                    <option value="electronics">Electronics</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="home">Home & Decor</option>
                                    <option value="vouchers">Gift Vouchers</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full border-2 p-3 rounded-xl outline-none"
                                    value={privateGiftForm.image}
                                    onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, image: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl disabled:bg-blue-300"
                            >
                                {updating ? 'Saving...' : 'Create Exclusive Gift'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Selection Modal */}
            {showProductModal && (
                <SelectionModal
                    products={globalProducts}
                    initialSelected={event?.products?.map(p => p._id) || []}
                    onClose={() => setShowProductModal(false)}
                    onSave={handleAddProducts}
                    updating={updating}
                />
            )}
        </div>
    );
}

function SelectionModal({ products, initialSelected, onClose, onSave, updating }) {
    const [selected, setSelected] = useState(initialSelected);

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Select Global Gifts</h2>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Library Selection</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {products.map(product => (
                        <div
                            key={product._id}
                            onClick={() => toggle(product._id)}
                            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selected.includes(product._id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100 mr-4" />
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 mb-1 leading-none">{product.name}</p>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">{product.category}</span>
                                    <span className="text-xs font-bold text-gray-400">₹{product.discountedPrice}</span>
                                </div>
                            </div>
                            {selected.includes(product._id) && (
                                <CheckCircle2 className="text-blue-600" size={24} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-500">Cancel</button>
                    <button
                        disabled={updating}
                        onClick={() => onSave(selected)}
                        className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {updating ? 'Saving...' : 'Update Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
