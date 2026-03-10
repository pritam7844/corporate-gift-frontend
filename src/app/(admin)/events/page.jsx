'use client';

import { useState } from 'react';
import { Calendar, Plus, Tag, X, Trash2, Edit } from 'lucide-react';
import { useEvents } from '../../../hooks/useEvents';
import ConfirmModal from '../../../components/common/ConfirmModal';

export default function EventCatalog() {
  const { events, loading: eventsLoading, addEvent, removeEvent, updateEvent } = useEvents(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = { name: '', startDate: '', endDate: '', isGlobal: true };
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

  const openEditModal = (event) => {
    setIsEditing(true);
    setEditingId(event._id);
    setFormData({
      name: event.name,
      startDate: event.startDate?.substring(0, 10) || '',
      endDate: event.endDate?.substring(0, 10) || '',
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
      ? await updateEvent(editingId, formData)
      : await addEvent(formData);
    setSubmitting(false);
    if (success) closeModal();
  };

  const handleDelete = async (id) => {
    openConfirm(
      'Delete Event Template?',
      'Are you sure you want to delete this master template? Companies using it will lose their copy and assigned products.',
      () => removeEvent(id),
      'danger'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Global Event Catalog</h1>
          <p className="text-gray-500">Master templates that can be assigned to any company.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Create Event Template</span>
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Event Template' : 'New Event Template'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form id="event-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Annual Rewards 2026"
                  className="w-full border-2 p-3 rounded-xl focus:border-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-2 flex items-center">
                    <Calendar size={14} className="mr-1" /> Default Start
                  </label>
                  <input
                    type="date" required
                    className="w-full border-2 p-3 rounded-xl outline-none text-sm"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-red-600 mb-2 flex items-center">
                    <Calendar size={14} className="mr-1" /> Default End
                  </label>
                  <input
                    type="date" required
                    className="w-full border-2 p-3 rounded-xl outline-none text-sm"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-[10px] text-blue-700 leading-relaxed italic font-medium">
                    Products for this event can be assigned later when finalizing the company profile.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:bg-blue-300"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventsLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                    Template
                  </span>
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{event.name}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Tag size={14} className="mr-2" />
                  {event.products?.length || 0} Default Gift Options
                </p>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No event templates found.</p>
              <button onClick={openCreateModal} className="mt-2 text-blue-600 font-bold hover:underline">
                Create your first master template
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
        confirmText={confirmState.type === 'danger' ? 'Delete Template' : 'Yes, Proceed'}
      />
    </div>
  );
}