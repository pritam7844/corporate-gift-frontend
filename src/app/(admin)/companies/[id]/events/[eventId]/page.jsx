'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, Gift, Plus, Trash2, ArrowLeft, Package, CheckCircle2, X, Tag, Building2, Edit, Image as ImageIcon, Upload, Maximize2
} from 'lucide-react';
import FormattedDate from '../../../../../../components/common/FormattedDate';
import ImageSliderModal from '../../../../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../../../../components/common/ProductImageSlider';
import { getEventByIdAPI, updateEventProductsAPI } from '../../../../../../services/event.service';
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI } from '../../../../../../services/product.service';
import ConfirmModal from '../../../../../../components/common/ConfirmModal';
import { uploadImagesToCloudinary, validateImageFiles } from '../../../../../../lib/cloudinaryUpload';

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
        name: '', description: '', image: '', /* category: 'electronics', */ actualPrice: '', discountedPrice: ''
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Image Slider State
    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    // Edit product state
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductForm, setEditProductForm] = useState({ name: '', description: '', image: '', /* category: 'electronics', */ actualPrice: '', discountedPrice: '' });
    const [savingProduct, setSavingProduct] = useState(false);

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            validateImageFiles(files);
        } catch (err) {
            alert(err.message);
            return;
        }

        const remainingSlots = 5 - imagePreviews.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
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
            const newFileIndex = imagePreviews
                .slice(0, index)
                .filter(p => typeof p === 'string' && p.startsWith('data:image'))
                .length;
            setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
        } else if (showEditProductModal) {
            // Update edit form's images when removing existing remote ones
            const remainingRemote = imagePreviews
                .filter((p, i) => i !== index && typeof p === 'string' && p.startsWith('http'));
            setEditProductForm(prev => ({ ...prev, images: remainingRemote }));
        }
    };

    const openConfirm = (title, message, onConfirm, type = 'warning') => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

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
            // 1. Upload images to Cloudinary
            let imageUrls = [];
            if (imageFiles.length > 0) {
                imageUrls = await uploadImagesToCloudinary(imageFiles, 'products');
            }

            // 2. Create product with JSON payload
            const productPayload = {
                name: privateGiftForm.name,
                description: privateGiftForm.description,
                actualPrice: privateGiftForm.actualPrice,
                discountedPrice: privateGiftForm.discountedPrice,
                companyId: companyId,
                isGlobal: false,
                images: imageUrls
            };

            const product = await createProductAPI(productPayload);

            // 3. Now add this new product to the event
            await updateEventProductsAPI(eventId, [...(event.products?.map(p => p._id) || []), product._id]);

            const refreshedEvent = await getEventByIdAPI(eventId);
            setEvent(refreshedEvent);
            setShowPrivateGiftModal(false);
            setPrivateGiftForm({ name: '', description: '', image: '', /* category: 'electronics', */ actualPrice: '', discountedPrice: '' });
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err) {
            console.error('Private gift creation failed:', err);
            alert(err.message || "Failed to create private gift");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveProduct = async (productId) => {
        const executeRemove = async () => {
            try {
                const remaining = event.products.filter(p => p._id !== productId).map(p => p._id);
                await updateEventProductsAPI(eventId, remaining);
                const refreshedEvent = await getEventByIdAPI(eventId);
                setEvent(refreshedEvent);
            } catch (err) {
                openConfirm('Error', 'Failed to remove product from event.', () => { }, 'danger');
            }
        };

        openConfirm(
            'Remove Product?',
            'Are you sure you want to remove this gift from the event? It will no longer be available for selection.',
            executeRemove,
            'warning'
        );
    };

    const handleOpenEditProduct = (product) => {
        setEditingProduct(product);
        setEditProductForm({
            name: product.name,
            description: product.description || '',
            category: product.category || 'electronics',
            actualPrice: product.actualPrice || '',
            discountedPrice: product.discountedPrice || '',
            images: product.images || []
        });
        setImageFiles([]);
        setImagePreviews(product.images || []);
        setShowEditProductModal(true);
    };

    const handleSaveEditProduct = async (e) => {
        e.preventDefault();
        setSavingProduct(true);
        try {
            // 1. Upload new images to Cloudinary
            let newImageUrls = [];
            if (imageFiles.length > 0) {
                newImageUrls = await uploadImagesToCloudinary(imageFiles, 'products');
            }

            // 2. Prepare payload
            const payload = {
                name: editProductForm.name,
                description: editProductForm.description,
                actualPrice: editProductForm.actualPrice,
                discountedPrice: editProductForm.discountedPrice,
                images: [...(editProductForm.images || []), ...newImageUrls]
            };

            await updateProductAPI(editingProduct._id, payload);
            const refreshedEvent = await getEventByIdAPI(eventId);
            setEvent(refreshedEvent);
            setShowEditProductModal(false);
            setEditingProduct(null);
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err) {
            console.error('Edit failed:', err);
            alert(err.message || 'Failed to update product');
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const executeDelete = async () => {
            try {
                await deleteProductAPI(productId);
                const refreshedEvent = await getEventByIdAPI(eventId);
                setEvent(refreshedEvent);
            } catch (err) {
                openConfirm('Error', 'Failed to delete exclusive product.', () => { }, 'danger');
            }
        };

        openConfirm(
            'Delete Product Permanently?',
            'This exclusive gift will be deleted forever. This action cannot be undone.',
            executeDelete,
            'danger'
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text)]"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium mb-4"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Company
            </button>

            {/* Header Info */}
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift size={120} className="text-[var(--color-text)]" />
                </div>

                <div className="relative z-5">
                    <div className="flex items-center space-x-3 text-[var(--color-text)] font-bold mb-2">
                        <Calendar size={20} />
                        <span className="uppercase tracking-widest text-xs">Event Management</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{event?.name}</h1>
                    <div className="flex space-x-6 text-[var(--color-text-muted)] text-sm font-medium">
                        <span className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <FormattedDate date={event?.startDate} /> - <FormattedDate date={event?.endDate} />
                        </span>
                        <span className="flex items-center font-bold text-[var(--color-text)]">
                            <Building2 size={16} className="mr-2" />
                            {event?.companyId?.name || 'Global Template'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Management */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">Assigned Gifts</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">Products available for selection during this event.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowPrivateGiftModal(true)}
                            className="flex items-center space-x-2 bg-[var(--color-bg)] text-[var(--color-text)] px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-text)] hover:text-white transition-all border border-[var(--color-border)]"
                        >
                            <Plus size={20} />
                            <span>Create Exclusive Gift</span>
                        </button>
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="flex items-center space-x-2 bg-[var(--color-text)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-text)] transition-all shadow-lg "
                        >
                            <Package size={20} />
                            <span>Library Selection</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {event?.products?.map((product) => (
                            <div key={product._id} className="border border-[var(--color-border)] rounded-xl overflow-hidden group hover:shadow-md transition-all relative flex flex-col h-full">
                                <div className="h-100 bg-[var(--color-bg)] relative overflow-hidden">
                                    <Link href={`/products/${product._id}`} className="block h-full">
                                        <ProductImageSlider
                                            images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                                            showFullscreen={false}
                                        />
                                    </Link>
                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEditProduct(product)}
                                            className="p-1.5 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded shadow-sm hover:bg-blue-500 hover:text-white transition-colors"
                                            title="Edit product"
                                        >
                                            <Edit size={13} />
                                        </button>
                                        {product.isGlobal ? (
                                            <button
                                                onClick={() => handleRemoveProduct(product._id)}
                                                className="p-1.5 bg-[var(--color-surface)] text-orange-500 rounded shadow-sm hover:bg-orange-500 hover:text-white transition-colors"
                                                title="Remove from event"
                                            >
                                                <X size={14} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="p-1.5 bg-[var(--color-surface)] text-red-500 rounded shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                                                title="Delete product permanently"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/products/${product._id}`} className="p-4 flex-1 flex flex-col cursor-pointer">
                                    <h3 className="font-bold text-[var(--color-text)] text-sm mb-1 truncate group-hover:text-[var(--color-text)] transition-colors">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed mb-3">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center mt-auto">
                                        {/* <span className="text-xs font-bold text-[var(--color-text)] uppercase bg-[var(--color-bg)] px-2 py-0.5 rounded">
                                            {product.category}
                                        </span> */}
                                        <span className="text-sm font-bold text-[var(--color-text)] italic">₹
                                            <span className="text-sm font-bold text-[var(--color-text)] italic line-through">{product.actualPrice}</span>
                                        </span>
                                        <span className="text-sm font-bold text-[var(--color-text)] italic">₹{product.discountedPrice}</span>

                                    </div>
                                </Link>
                            </div>
                        ))}

                        {(event?.products?.length === 0 || !event?.products) && (
                            <div className="col-span-full py-20 text-center text-[var(--color-text-muted)] bg-[var(--color-bg)] border-2 border-dashed rounded-xl">
                                <Package size={40} className="mx-auto mb-2 opacity-20" />
                                <p className="font-medium">No gifts assigned to this event yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Private Gift Modal */}
            {showPrivateGiftModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ">
                    <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
                            <h2 className="text-xl font-bold text-[var(--color-text)]">New Exclusive Gift</h2>
                            <button onClick={() => setShowPrivateGiftModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePrivateGift} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text)] mb-1">Product Name</label>
                                <input
                                    type="text" required
                                    className="w-full border-2 p-3 rounded-xl focus:border-[var(--color-text)] outline-none"
                                    value={privateGiftForm.name}
                                    onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text)] mb-1">Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the product, materials, features..."
                                    className="w-full border-2 p-3 rounded-xl focus:border-[var(--color-text)] outline-none resize-none text-sm"
                                    value={privateGiftForm.description}
                                    onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text)] mb-1">Actual Price (With GST*)</label>
                                    <input
                                        type="number" required
                                        className="w-full border-2 p-3 rounded-xl outline-none"
                                        value={privateGiftForm.actualPrice}
                                        onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, actualPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text)] mb-1">Selling Price (With GST*)</label>
                                    <input
                                        type="number" required
                                        className="w-full border-2 p-3 rounded-xl outline-none"
                                        value={privateGiftForm.discountedPrice}
                                        onChange={(e) => setPrivateGiftForm({ ...privateGiftForm, discountedPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* <div>
                                <label className="block text-sm font-bold text-[var(--color-text)] mb-1">Category</label>
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
                            </div> */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">Product Images (Max 5)</label>
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square bg-[var(--color-bg)] border rounded-lg overflow-hidden group">
                                            <img src={preview} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImagePreview(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && (
                                        <label className="aspect-square bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
                                            <Plus size={20} className="text-[var(--color-text-muted)]" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-[var(--color-text)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--color-text)] shadow-xl disabled:opacity-50"
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

            {/* Edit Product Modal */}
            {showEditProductModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
                            <h2 className="text-xl font-bold text-[var(--color-text)]">Edit Gift Details</h2>
                            <button onClick={() => setShowEditProductModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveEditProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Product Name</label>
                                <input type="text" required placeholder="e.g. Apple MacBook Air"
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[var(--color-text)] outline-none"
                                    value={editProductForm.name}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span></label>
                                <textarea rows={3} placeholder="Describe the product..."
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[var(--color-text)] outline-none resize-none text-sm"
                                    value={editProductForm.description}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Actual Price (With GST*)</label>
                                    <input type="number" required className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[var(--color-text)] outline-none"
                                        value={editProductForm.actualPrice}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, actualPrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Selling Price (With GST*)</label>
                                    <input type="number" required className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[var(--color-text)] outline-none"
                                        value={editProductForm.discountedPrice}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, discountedPrice: e.target.value })} />
                                </div>
                            </div>
                            {/* <div>
                                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Category</label>
                                <select className="w-full border p-2.5 rounded-lg outline-none cursor-pointer"
                                    value={editProductForm.category}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}>
                                    <option value="electronics">Electronics</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="home">Home & Decor</option>
                                    <option value="vouchers">Gift Vouchers</option>
                                </select>
                            </div> */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Product Images (Max 5)</label>
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square bg-[var(--color-bg)] border rounded-lg overflow-hidden group">
                                            <img src={preview} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImagePreview(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && (
                                        <label className="aspect-square bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
                                            <Plus size={20} className="text-[var(--color-text-muted)]" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <button type="submit" disabled={savingProduct}
                                className="w-full bg-[var(--color-text)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-text)] transition-colors shadow-lg disabled:opacity-50">
                                {savingProduct ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
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

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.type === 'danger' ? 'Delete Permanently' : 'Yes, Proceed'}
            />
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
            <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b bg-[var(--color-bg)] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">Select Global Gifts</h2>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Library Selection</p>
                    </div>
                    <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {products.map(product => (
                        <div
                            key={product._id}
                            onClick={() => toggle(product._id)}
                            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selected.includes(product._id)
                                ? 'border-[var(--color-text)] bg-[var(--color-bg)]'
                                : 'border-gray-50 hover:border-[var(--color-border)]'
                                }`}
                        >
                            <img src={product.images?.[0] || product.image} className="w-12 h-12 rounded-lg object-cover bg-[var(--color-bg)] mr-4" />
                            <div className="flex-1">
                                <p className="font-bold text-[var(--color-text)] mb-1 leading-none">{product.name}</p>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold text-[var(--color-text)] uppercase">{product.category}</span>
                                    <span className="text-xs font-bold text-[var(--color-text-muted)]">₹
                                        <span className="text-xs font-bold text-[var(--color-text-muted)] line-through">{product.actualPrice}</span>
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-text-muted)]">₹{product.discountedPrice}</span>
                                </div>
                            </div>
                            {selected.includes(product._id) && (
                                <CheckCircle2 className="text-[var(--color-text)]" size={24} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t bg-[var(--color-bg)] flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-[var(--color-text-muted)]">Cancel</button>
                    <button
                        disabled={updating}
                        onClick={() => onSave(selected)}
                        className="px-8 py-2.5 bg-[var(--color-text)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--color-text)] disabled:opacity-50"
                    >
                        {updating ? 'Saving...' : 'Update Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
