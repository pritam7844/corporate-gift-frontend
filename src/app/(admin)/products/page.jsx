'use client';

import { useState } from 'react';
import { Package, Plus, Tag, Image as ImageIcon, X, Trash2, Edit } from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import ConfirmModal from '../../../components/common/ConfirmModal';

export default function ProductCatalog() {
  const { products, loading, error, addProduct, updateProduct, removeProduct } = useProducts(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = { name: '', image: '', category: 'electronics', actualPrice: '', discountedPrice: '', isGlobal: true };
  const [formData, setFormData] = useState(emptyForm);

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'warning'
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
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    setFormData({
      name: product.name,
      image: product.image || '',
      category: product.category || 'electronics',
      actualPrice: product.actualPrice || '',
      discountedPrice: product.discountedPrice || '',
      isGlobal: true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = isEditing
      ? await updateProduct(editingId, formData)
      : await addProduct(formData);
    setSubmitting(false);
    if (success) closeModal();
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
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Add Global Product</span>
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Price</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price After Discount</label>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border p-2.5 rounded-lg outline-none cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Decor</option>
                  <option value="vouchers">Gift Vouchers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="https://image-link.com"
                    className="w-full border pl-10 p-2.5 rounded-lg outline-none"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={48} />
                  </div>
                )}
                {/* Action buttons – visible on hover */}
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg shadow-sm hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Actual Price</p>
                    <p className="text-gray-800 font-bold">₹{product.actualPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-blue-600 uppercase font-bold">Offer Price</p>
                    <p className="text-blue-600 font-bold">₹{product.discountedPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && !loading && (
            <div className="col-span-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No global products found.</p>
              <button onClick={openCreateModal} className="mt-4 text-blue-600 font-bold hover:underline">
                Add your first global product
              </button>
            </div>
          )}
        </div>
      )}

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