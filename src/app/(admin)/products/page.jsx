'use client';

import { useState } from 'react';
import { Package, Plus, Tag, Image as ImageIcon, X, Trash2, Edit, Upload, Maximize2, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import ConfirmModal from '../../../components/common/ConfirmModal';
import ImageSliderModal from '../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';
import Link from 'next/link';
import { uploadImagesToCloudinary, validateImageFiles } from '../../../lib/cloudinaryUpload';

export default function ProductCatalog() {
  const { products, loading, error, addProduct, updateProduct, removeProduct } = useProducts(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [viewMode, setViewMode] = useState('card');

  const emptyForm = { name: '', description: '', images: [], /* category: 'electronics', */ actualPrice: '', discountedPrice: '', isGlobal: true };
  const [formData, setFormData] = useState(emptyForm);

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'warning'
  });

  // Slider State
  const [sliderModal, setSliderModal] = useState({
    isOpen: false,
    images: [],
    index: 0
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

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || 'electronics',
      actualPrice: product.actualPrice || '',
      discountedPrice: product.discountedPrice || '',
      isGlobal: product.isGlobal !== undefined ? product.isGlobal : true,
      companyId: product.companyId || '',
      images: product.images || [],
    });
    setImageFiles([]);
    setImagePreviews(product.images || []);
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

    const currentTotal = imagePreviews.length;
    const remainingSlots = 5 - currentTotal;

    if (remainingSlots <= 0) {
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    // Support appending one-by-one or in batch
    filesToUpload.forEach(file => {
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
      // Correctly identify which new file to remove
      const newFileIndex = imagePreviews
        .slice(0, index)
        .filter(p => typeof p === 'string' && p.startsWith('data:image'))
        .length;

      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    } else if (isEditing) {
      // Keep track of remaining remote URLs
      const updatedExistingImages = imagePreviews
        .filter((p, i) => i !== index && typeof p === 'string' && p.startsWith('http'));
      setFormData(prev => ({ ...prev, images: updatedExistingImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Upload new images to Cloudinary
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        newImageUrls = await uploadImagesToCloudinary(imageFiles, 'products');
      }

      // 2. Prepare payload
      const payload = {
        name: formData.name,
        description: formData.description,
        actualPrice: formData.actualPrice,
        discountedPrice: formData.discountedPrice,
        isGlobal: formData.isGlobal,
        companyId: formData.companyId || null,
        images: isEditing
          ? [...(formData.images || []), ...newImageUrls]
          : newImageUrls
      };

      // 3. Send to backend
      const success = isEditing
        ? await updateProduct(editingId, payload)
        : await addProduct(payload);

      if (success) closeModal();
    } catch (err) {
      console.error('Submission failed:', err);
      alert(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    openConfirm(
      'Delete Global Product?',
      'Are you sure you want to delete this product? It will be permanently removed from all events using it.',
      () => removeProduct(id),
      'danger'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Global Product Catalog</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Manage gifts available for all company events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl flex items-center space-x-2 font-bold text-sm transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
          >
            <Plus size={18} />
            <span>Add Global Product</span>
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{isEditing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={closeModal} style={{ color: 'var(--color-text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Product Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Sony WH-1000XM5"
                  className="w-full p-3 rounded-xl outline-none transition-all font-medium text-sm border"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Description <span className="normal-case font-medium">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Describe the product, materials, features..."
                  className="w-full p-3 rounded-xl outline-none transition-all font-medium text-sm border resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Actual Price (With GST*)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>₹</span>
                    <input
                      type="number" required
                      className="w-full pl-7 p-3 rounded-xl outline-none transition-all font-medium text-sm border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                      value={formData.actualPrice}
                      onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Selling Price (With GST*)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>₹</span>
                    <input
                      type="number" required
                      className="w-full pl-7 p-3 rounded-xl outline-none transition-all font-medium text-sm border"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Category</label>
                <select
                  className="w-full border p-2.5 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Decor</option>
                  <option value="vouchers">Gift Vouchers</option>
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Product Images (Max 5)</label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden group">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="w-20 h-20 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
                        <Upload size={20} className="text-[var(--color-text-muted)]" />
                        <span className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-bold text-center">Add</span>
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
                  <p className="text-[10px] text-[var(--color-text-muted)] text-center">PNG, JPG or JPEG (Max. 5MB per file)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
                style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
              >
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Global Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-text)' }}></div>
          <p className="mt-4 font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed py-20 text-center" style={{ borderColor: 'var(--color-border)' }}>
          <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-muted)' }}>No global products found.</p>
          <button onClick={openCreateModal} className="mt-4 font-black text-sm hover:underline" style={{ color: 'var(--color-text)' }}>
            Add your first global product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="rounded-2xl border overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="h-100 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                <Link href={`/products/${product._id}`} className="block h-full">
                  <ProductImageSlider
                    images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                    showFullscreen={false}
                  />
                </Link>
                {/* Action buttons – visible on hover */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(product); }}
                    className="p-2.5 rounded-xl shadow-lg transition-all active:scale-95 font-bold"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
                    title="Edit Product"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(product._id); }}
                    className="p-2.5 bg-[var(--color-surface)] text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <Link href={`/products/${product._id}`} className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-black text-lg mb-2 line-clamp-1 transition-colors" style={{ color: 'var(--color-text)' }}>{product.name}</h3>
                  <p className="text-sm line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {product.description || 'No description provided for this premium global product.'}
                  </p>
                </div>

                <div className="flex justify-between items-end pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Actual MRP</span>
                      <span className="text-sm line-through font-bold" style={{ color: 'var(--color-text-muted)' }}>₹{product.actualPrice}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest mb-0.5" style={{ color: 'var(--color-text)' }}>Offer Price</span>
                      <span className="text-xl font-black" style={{ color: 'var(--color-text)' }}>₹{product.discountedPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>
                    View Details <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
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
        confirmText={confirmState.type === 'danger' ? 'Delete Forever' : 'Yes, Proceed'}
      />
    </div>
  );
}