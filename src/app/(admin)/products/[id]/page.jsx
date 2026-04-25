'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductByIdAPI, updateProductAPI, deleteProductAPI } from '../../../../services/product.service';
import { ArrowLeft, Edit, Trash2, Tag, Calendar, ShieldCheck, Maximize2, X, Upload } from 'lucide-react';
import ProductImageSlider from '../../../../components/common/ProductImageSlider';
import ImageSliderModal from '../../../../components/common/ImageSliderModal';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { uploadImagesToCloudinary, validateImageFiles } from '../../../../lib/cloudinaryUpload';
import Link from 'next/link';

export default function AdminProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        actualPrice: '',
        discountedPrice: '',
        images: []
    });

    // Confirm Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await getProductByIdAPI(id);
            setProduct(data);
            setFormData({
                name: data.name,
                description: data.description || '',
                actualPrice: data.actualPrice,
                discountedPrice: data.discountedPrice,
                images: data.images || []
            });
            setImagePreviews(data.images || []);
        } catch (err) {
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleOpenEdit = () => {
        setShowEditModal(true);
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
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
                setImageFiles(prev => [...prev, file]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImagePreview = (index) => {
        const previewToRemove = imagePreviews[index];
        const isNewFile = typeof previewToRemove === 'string' && previewToRemove.startsWith('data:image');
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (isNewFile) {
            const newFileIndex = imagePreviews.slice(0, index).filter(p => typeof p === 'string' && p.startsWith('data:image')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
        } else {
            setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== previewToRemove) }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let newUrls = [];
            if (imageFiles.length > 0) {
                newUrls = await uploadImagesToCloudinary(imageFiles, 'products');
            }
            const payload = {
                ...formData,
                images: [...formData.images, ...newUrls]
            };
            await updateProductAPI(id, payload);
            await fetchProduct();
            setShowEditModal(false);
            setImageFiles([]);
        } catch (err) {
            alert('Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to permanently delete this product?',
            onConfirm: async () => {
                try {
                    await deleteProductAPI(id);
                    router.push('/products');
                } catch (err) {
                    alert('Failed to delete product');
                }
            }
        });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !product) return (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-100">
            <p className="text-red-500 font-bold mb-4">{error || 'Product not found'}</p>
            <Link href="/products" className="text-blue-600 font-bold hover:underline">Back to Catalog</Link>
        </div>
    );

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-blue-600 font-bold transition-colors text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Catalog
                </button>
                <div className="flex space-x-3">
                    <button
                        onClick={handleOpenEdit}
                        className="p-2.5 bg-white text-blue-600 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all flex items-center space-x-2 px-4"
                    >
                        <Edit size={18} />
                        <span className="font-bold text-xs uppercase">Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 bg-white text-red-600 rounded-xl border border-red-100 shadow-sm hover:bg-red-50 transition-all flex items-center space-x-2 px-4"
                    >
                        <Trash2 size={18} />
                        <span className="font-bold text-xs uppercase">Delete</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Image Section */}
                <div className="space-y-6 min-w-0">
                    <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden relative border border-gray-100 group">
                        <ProductImageSlider
                            images={images}
                            onOpenModal={(idx) => setSliderModal({ isOpen: true, images, index: idx })}
                        />
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-5 gap-3">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSliderModal({ isOpen: true, images, index: idx })}
                                className="aspect-square rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:border-blue-500 transition-all"
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col min-w-0">
                    <div className="mb-8">
                        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Tag size={12} />
                            <span>Global Catalog Item</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 overflow-hidden">
                            <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line break-words">
                                {product.description || 'No description available for this premium reward selection.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 bg-blue-600 rounded-3xl text-white mb-8 shadow-xl shadow-blue-600/20">
                        <div>
                            <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Standard MRP</p>
                            <p className="text-2xl font-bold text-blue-200/60 line-through">₹{product.actualPrice}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white font-black uppercase tracking-widest mb-1">Offer Price</p>
                            <p className="text-3xl font-black text-white">₹{product.discountedPrice}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Quality Assured</p>
                                <p className="text-[10px] text-gray-500 font-medium">Hand-selected for corporate standards</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Immediate Availability</p>
                                <p className="text-[10px] text-gray-500 font-medium">Available for all active gifting cycles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">MRP</label>
                                    <input
                                        type="number" required
                                        className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.actualPrice}
                                        onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Offer Price</label>
                                    <input
                                        type="number" required
                                        className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.discountedPrice}
                                        onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Images (Max 5)</label>
                                <div className="flex flex-wrap gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative w-16 h-16 border rounded-lg overflow-hidden group">
                                            <img src={preview} className="w-full h-full object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => removeImagePreview(index)}
                                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && (
                                        <label className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                            <Upload size={16} className="text-gray-400" />
                                            <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type="danger"
            />
        </div>
    );
}
