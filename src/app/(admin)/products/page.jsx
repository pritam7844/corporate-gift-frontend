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
          <h1 className="text-2xl font-bold text-gray-800">Global Product Catalog</h1>
          <p className="text-gray-500">Manage gifts available for all company events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Add Global Product</span>
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Sony WH-1000XM5"
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Describe the product, materials, features..."
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Price(With GST*)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                    <input
                      type="number" required
                      className="w-full border pl-7 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.actualPrice}
                      onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price(With GST*)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                    <input
                      type="number" required
                      className="w-full border pl-7 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images (Max 5)</label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group">
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
                      <label className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold text-center">Add</span>
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
                  <p className="text-[10px] text-gray-400 text-center">PNG, JPG or JPEG (Max. 5MB per file)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-300"
              >
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Global Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No global products found.</p>
          <button onClick={openCreateModal} className="mt-4 text-blue-600 font-bold hover:underline">
            Add your first global product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col h-full">
              <div className="h-100 bg-gray-100 relative overflow-hidden">
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
                    className="p-2.5 bg-white text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    title="Edit Product"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(product._id); }}
                    className="p-2.5 bg-white text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <Link href={`/products/${product._id}`} className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {product.description || 'No description provided for this premium global product.'}
                  </p>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Actual MRP</span>
                      <span className="text-gray-400 text-sm line-through font-bold">₹{product.actualPrice}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-0.5">Offer Price</span>
                      <span className="text-blue-600 text-xl font-black">₹{product.discountedPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-blue-600 transition-colors group/link">
                    View Details <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
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