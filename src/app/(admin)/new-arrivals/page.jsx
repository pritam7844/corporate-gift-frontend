'use client';

import { useState, useMemo } from 'react';
import { Package, Plus, Sparkles, Image as ImageIcon, X, Trash2, Edit, Upload, Maximize2, Search, Filter, Calendar, LayoutGrid, List, CheckCircle2, ArrowRight } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import { useNewArrivals } from '../../../hooks/useNewArrivals';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ImageSliderModal from '../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';
import { uploadImagesToCloudinary, validateImageFiles } from '../../../lib/cloudinaryUpload';

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
    const [viewMode, setViewMode] = useState('card'); // card, table

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
        if (files.length === 0) return;

        try {
            validateImageFiles(files);
        } catch (err) {
            alert(err.message);
            return;
        }

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
        const previewToRemove = imagePreviews[index];
        const isNewFile = typeof previewToRemove === 'string' && previewToRemove.startsWith('data:image');

        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);

        if (isNewFile) {
            const newFileIndex = imagePreviews
                .slice(0, index)
                .filter(p => typeof p === 'string' && p.startsWith('data:image'))
                .length;
            setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
        } else if (isEditing) {
            setFormData({
                ...formData,
                images: updatedPreviews.filter(p => typeof p === 'string' && p.startsWith('http'))
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Upload new images to Cloudinary
            let newImageUrls = [];
            if (imageFiles.length > 0) {
                newImageUrls = await uploadImagesToCloudinary(imageFiles, 'new-arrivals');
            }

            // 2. Prepare payload
            const payload = {
                productName: formData.productName,
                description: formData.description,
                isComingSoon: formData.isComingSoon,
                comingSoonDate: formData.comingSoonDate || '',
                images: isEditing
                    ? [...(formData.images || []), ...newImageUrls]
                    : newImageUrls
            };

            // 3. Send to backend
            const success = isEditing
                ? await updateArrival(editingId, payload)
                : await addArrival(payload);

            if (success) closeModal();
        } catch (err) {
            console.error('Submission failed:', err);
            alert(err.message || 'Failed to save item');
        } finally {
            setSubmitting(false);
        }
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
                            <Sparkles size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Showcase Management</h1>
                    </div>
                    <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Curate the future collection and build employee anticipation.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setFilterStatus(filterStatus === 'all' ? 'coming-soon' : filterStatus === 'coming-soon' ? 'live' : 'all')}
                        className="p-3 rounded-xl transition-all flex items-center gap-2 text-sm font-bold border" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                    >
                        <Filter size={18} />
                        <span className="capitalize">{filterStatus.replace('-', ' ')}</span>
                    </button>
                    <div className="h-10 w-px mx-2 hidden lg:block" style={{ backgroundColor: 'var(--color-border)' }}></div>
                    <button
                        onClick={openCreateModal}
                        className="px-8 py-3.5 rounded-xl flex items-center space-x-2 transition-all active:scale-95 text-sm font-black" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                    >
                        <Plus size={20} />
                        <span>Curate New Item</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl group">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search showcase collection..."
                    className="w-full pl-16 pr-8 py-4 rounded-xl outline-none placeholder:text-sm font-medium transition-all border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Stage */}
            {loading && arrivals.length === 0 ? (
                <div className="rounded-xl p-32 text-center border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-6" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-text)' }}></div>
                    <p className="font-black uppercase tracking-[0.2em] text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Accessing Vault...</p>
                </div>
            ) : filteredArrivals.length === 0 ? (
                <div className="rounded-xl p-32 text-center border flex flex-col items-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="w-24 h-24 rounded-xl flex items-center justify-center mb-8 border rotate-12 transition-transform hover:rotate-0 duration-500" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-border)' }}>
                        <Package size={40} />
                    </div>
                    <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>No matching items found</h3>
                    <p className="max-w-sm mb-8 font-medium" style={{ color: 'var(--color-text-muted)' }}>Adjust your search or filters to see the curated collection.</p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="font-black text-sm p-4 rounded-xl transition-all" style={{ color: 'var(--color-text)' }}>Clear Search</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {filteredArrivals.map((arrival) => (
                        <div key={arrival._id} className="group rounded-xl border overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                            <div className="h-74 relative overflow-hidden m-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                <ProductImageSlider
                                    images={arrival.images}
                                    onOpenModal={(idx) => setSliderModal({ isOpen: true, images: arrival.images, index: idx })}
                                />

                                {/* Overlay Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(arrival); }}
                                        className="p-3 rounded-xl shadow-md transition-all transform hover:scale-110" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(arrival._id); }}
                                        className="p-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Status Pills */}
                                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                    {arrival.isComingSoon ? (
                                        <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-text)' }}></div>
                                            Coming Soon
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                            <CheckCircle2 size={10} />
                                            Live Now
                                        </div>
                                    )}
                                    {arrival.comingSoonDate && (
                                        <div className="bg-gray-900 text-white px-2 py-1 rounded-lg text-[8px] font-black tracking-widest">
                                            <FormattedDate date={arrival.comingSoonDate} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-4">
                                <h3 className="font-black text-lg mb-2 truncate" style={{ color: 'var(--color-text)' }}>{arrival.productName}</h3>
                                <p className="text-xs font-medium line-clamp-2 leading-relaxed h-10 italic" style={{ color: 'var(--color-text-muted)' }}>
                                    "{arrival.description || 'No curated description set.'}"
                                </p>
                                <div className="mt-6 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{arrival.images?.length || 0} Assets</span>
                                    <button
                                        onClick={() => openEditModal(arrival)}
                                        className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--color-text)' }}
                                    >
                                        Management <Maximize2 size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Elite Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="p-8 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                                    {isEditing ? <Edit size={22} /> : <Plus size={22} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>{isEditing ? 'Curate Item' : 'Assemble Item'}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--color-text-muted)' }}>Product Details & Assets</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:rotate-90 duration-300" style={{ color: 'var(--color-text-muted)' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-full md:col-span-1">
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Item Descriptor</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. Obsidian Series Watch"
                                        className="w-full px-6 py-4 rounded-xl outline-none font-black text-sm border transition-all"
                                        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-full md:col-span-1">
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Launch Configuration</label>
                                    <div className="flex items-center justify-between px-6 py-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                        <span className="text-sm font-black" style={{ color: 'var(--color-text)' }}>Show Coming Soon</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.isComingSoon} onChange={(e) => setFormData({ ...formData, isComingSoon: e.target.checked })} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ '--tw-peer-checked-bg': 'var(--color-text)' }}></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Collection Notes</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the exclusivity of this product..."
                                        className="w-full px-6 py-4 rounded-xl outline-none font-bold resize-none text-sm border transition-all"
                                        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {formData.isComingSoon && (
                                    <div className="col-span-full animate-in slide-in-from-top-4 duration-500">
                                        <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-3">Strategic Launch Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                                            <input
                                                type="date"
                                                className="w-full pl-14 pr-6 py-4 rounded-xl outline-none font-black text-sm border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                value={formData.comingSoonDate}
                                                onChange={(e) => setFormData({ ...formData, comingSoonDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-3">High-Resolution Assets (Max 5)</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square bg-[var(--color-bg)] rounded-[1.25rem] border border-[var(--color-border)] overflow-hidden group/thumb shadow-sm">
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
                                            <label className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-70 transition-all" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                                                <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
                                                <span className="text-[8px] font-black uppercase tracking-widest mt-2" style={{ color: 'var(--color-text-muted)' }}>Add Asset</span>
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

                        <div className="p-8 border-t" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-xl font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-sm"
                                style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                            >
                                {submitting ? 'Saving...' : isEditing ? 'Update Selection' : 'Finalize Showcase'}
                                {!submitting && <ArrowRight size={18} />}
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
