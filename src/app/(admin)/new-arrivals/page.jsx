'use client';

import { useState, useMemo } from 'react';
import { Package, Plus, Sparkles, Image as ImageIcon, X, Trash2, Edit, Upload, Maximize2, Search, Filter, Calendar, LayoutGrid, List, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNewArrivals } from '../../../hooks/useNewArrivals';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ImageSliderModal from '../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';

export default function NewArrivalsAdmin() {
    const { arrivals, loading, error, addArrival, updateArrival, removeArrival } = useNewArrivals();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, coming-soon, live
    const [viewMode, setViewMode] = useState('grid'); // grid, list

    const emptyForm = { productName: '', description: '', images: [], isComingSoon: true, comingSoonDate: '' };
    const [formData, setFormData] = useState(emptyForm);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    // Memoized filtered arrivals
    const filteredArrivals = useMemo(() => {
        return arrivals.filter(arrival => {
            const matchesSearch = arrival.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (arrival.description && arrival.description.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'coming-soon' && arrival.isComingSoon) ||
                (filterStatus === 'live' && !arrival.isComingSoon);

            return matchesSearch && matchesFilter;
        });
    }, [arrivals, searchTerm, filterStatus]);

    const openConfirm = (title, message, onConfirm, type = 'warning') => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(emptyForm);
        setImageFiles([]);
        setImagePreviews([]);
        setShowModal(true);
    };

    const openEditModal = (arrival) => {
        setIsEditing(true);
        setEditingId(arrival._id);
        setFormData({
            productName: arrival.productName,
            description: arrival.description || '',
            images: arrival.images || [],
            isComingSoon: arrival.isComingSoon,
            comingSoonDate: arrival.comingSoonDate ? new Date(arrival.comingSoonDate).toISOString().split('T')[0] : ''
        });
        setImageFiles([]);
        setImagePreviews(arrival.images || []);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData(emptyForm);
        setImageFiles([]);
        setImagePreviews([]);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const selectedFiles = files.slice(0, 5 - imagePreviews.length);
            const newFiles = [...imageFiles, ...selectedFiles];
            setImageFiles(newFiles);

            selectedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImagePreview = (index) => {
        const updatedPreviews = [...imagePreviews];
        const removedItem = updatedPreviews.splice(index, 1)[0];
        setImagePreviews(updatedPreviews);

        if (isEditing) {
            setFormData({
                ...formData,
                images: updatedPreviews.filter(p => typeof p === 'string' && p.startsWith('http'))
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const submissionData = new FormData();
        submissionData.append('productName', formData.productName);
        submissionData.append('description', formData.description);
        submissionData.append('isComingSoon', formData.isComingSoon);
        submissionData.append('comingSoonDate', formData.comingSoonDate || '');

        if (imageFiles.length > 0) {
            imageFiles.forEach(file => {
                submissionData.append('images', file);
            });
        }

        if (isEditing) {
            submissionData.append('images', JSON.stringify(formData.images));
        }

        const success = isEditing
            ? await updateArrival(editingId, submissionData)
            : await addArrival(submissionData);

        setSubmitting(false);
        if (success) closeModal();
    };

    const handleDelete = async (id) => {
        openConfirm(
            'Delete Item?',
            'This action cannot be undone. The new arrival will be removed from all employee portals.',
            () => removeArrival(id),
            'danger'
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Elite Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-600/20">
                            <Sparkles size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Showcase Management</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Curate the future collection and build employee anticipation.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setFilterStatus(filterStatus === 'all' ? 'coming-soon' : filterStatus === 'coming-soon' ? 'live' : 'all')}
                        className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                        <Filter size={18} />
                        <span className="capitalize">{filterStatus.replace('-', ' ')}</span>
                    </button>
                    <div className="h-10 w-px bg-gray-200 mx-2 hidden lg:block"></div>
                    <button
                        onClick={openCreateModal}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl flex items-center space-x-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all active:scale-95 text-sm font-black"
                    >
                        <Plus size={20} />
                        <span>Curate New Item</span>
                    </button>
                </div>
            </div>

            {/* Utility Bar */}
            {/* <div className="flex flex-col md:flex-row gap-4">

                <div className="bg-white p-1 rounded-2xl shadow-sm flex items-center border border-gray-100 right-10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div> */}

            {/* Content Stage */}
            {loading && arrivals.length === 0 ? (
                <div className="bg-white rounded-3xl p-32 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Vault...</p>
                </div>
            ) : filteredArrivals.length === 0 ? (
                <div className="bg-white rounded-3xl p-32 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100 rotate-12 transition-transform hover:rotate-0 duration-500">
                        <Package size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No matching items found</h3>
                    <p className="text-gray-500 max-w-sm mb-8 font-medium">Adjust your search or filters to see the curated collection.</p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-blue-600 font-black text-sm p-4 hover:bg-blue-50 rounded-2xl transition-all">Clear All Search</button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredArrivals.map((arrival) => (
                        <div key={arrival._id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col">
                            <div className="h-64 bg-[#FBFBFC] relative overflow-hidden m-3 rounded-[2rem] border border-gray-50">
                                <ProductImageSlider 
                                    images={arrival.images} 
                                    onOpenModal={(idx) => setSliderModal({ isOpen: true, images: arrival.images, index: idx })}
                                />
                                
                                {/* Overlay Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(arrival); }}
                                        className="p-3 bg-white text-gray-900 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(arrival._id); }}
                                        className="p-3 bg-white text-gray-400 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Status Pills */}
                                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                    {arrival.isComingSoon ? (
                                        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-blue-600 uppercase tracking-widest shadow-xl border border-white flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                            Coming Soon
                                        </div>
                                    ) : (
                                        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-green-600 uppercase tracking-widest shadow-xl border border-white flex items-center gap-1.5">
                                            <CheckCircle2 size={10} />
                                            Live Now
                                        </div>
                                    )}
                                    {arrival.comingSoonDate && (
                                        <div className="bg-gray-900 text-white px-2 py-1 rounded-lg text-[8px] font-black tracking-widest">
                                            {new Date(arrival.comingSoonDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-4">
                                <h3 className="font-black text-gray-900 text-lg mb-2 truncate group-hover:text-blue-600 transition-colors">{arrival.productName}</h3>
                                <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed h-10 italic">
                                    "{arrival.description || 'No curated description set.'}"
                                </p>
                                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{arrival.images?.length || 0} Assets</span>
                                    <button
                                        onClick={() => openEditModal(arrival)}
                                        className="text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-blue-600 flex items-center gap-2"
                                    >
                                        Management <Maximize2 size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Launch Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredArrivals.map((arrival) => (
                                <tr key={arrival._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={arrival.images?.[0] || ''} className="w-full h-full object-contain p-2" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-sm group-hover:text-blue-600">{arrival.productName}</h4>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{arrival.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {arrival.isComingSoon ? (
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">Coming Soon</span>
                                        ) : (
                                            <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100">Live</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-gray-600">{arrival.comingSoonDate ? new Date(arrival.comingSoonDate).toLocaleDateString() : 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEditModal(arrival)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(arrival._id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Elite Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] scale-in overflow-hidden border border-white/20">
                        <div className="p-10 border-b flex justify-between items-center bg-[#FBFBFC]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-900 rounded-2xl text-white">
                                    {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{isEditing ? 'Curate Item' : 'Assemble Item'}</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Product Details & Assets</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-full md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Item Descriptor</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. Obsidian Series Watch"
                                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-[1.5rem] focus:ring-4 focus:ring-blue-600/5 text-gray-900 font-black placeholder:text-gray-300"
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-full md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Launch Configuration</label>
                                    <div className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-[1.5rem]">
                                        <span className="text-sm font-black text-gray-900">Show Coming Soon</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isComingSoon}
                                                onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Collection Notes</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the exclusivity of this product..."
                                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-[1.5rem] focus:ring-4 focus:ring-blue-600/5 text-gray-900 font-bold placeholder:text-gray-300 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {formData.isComingSoon && (
                                    <div className="col-span-full animate-in slide-in-from-top-4 duration-500">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Strategic Launch Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 border-none pl-14 pr-6 py-4 rounded-[1.5rem] focus:ring-4 focus:ring-blue-600/5 text-gray-900 font-black"
                                                value={formData.comingSoonDate}
                                                onChange={(e) => setFormData({ ...formData, comingSoonDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">High-Resolution Assets (Max 5)</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square bg-gray-50 rounded-[1.25rem] border border-gray-100 overflow-hidden group/thumb shadow-sm">
                                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImagePreview(index)}
                                                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        {imagePreviews.length < 5 && (
                                            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.25rem] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-600 transition-all group/upload">
                                                <Upload size={24} className="text-gray-400 group-hover/upload:text-blue-600 transition-colors" />
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2 group-hover/upload:text-blue-600">Add Asset</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 bg-gray-50 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black hover:bg-black transition-all shadow-2xl shadow-gray-900/40 disabled:bg-gray-200 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                    {submitting ? 'Authenticating Assets...' : isEditing ? 'Update Selection' : 'Finalize Showcase'}
                                    {!submitting && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.type === 'danger' ? 'Remove Forever' : 'Yes, Confirm'}
            />

            <style jsx global>{`
                .scale-in {
                    animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}</style>
        </div>
    );
}
