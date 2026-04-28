'use client';

import { useState } from 'react';
import { Calendar, Plus, Tag, X, Trash2, Edit } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
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

  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'warning' });
  const openConfirm = (title, message, onConfirm, type = 'warning') => setConfirmState({ isOpen: true, title, message, onConfirm, type });

  const openCreateModal = () => { setIsEditing(false); setEditingId(null); setFormData(emptyForm); setShowModal(true); };
  const openEditModal = (event) => {
    setIsEditing(true); setEditingId(event._id);
    setFormData({ name: event.name, startDate: event.startDate?.substring(0, 10) || '', endDate: event.endDate?.substring(0, 10) || '', isGlobal: true });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setIsEditing(false); setEditingId(null); setFormData(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    const success = isEditing ? await updateEvent(editingId, formData) : await addEvent(formData);
    setSubmitting(false);
    if (success) closeModal();
  };

  const handleDelete = (id) => openConfirm('Delete Event Template?', 'Are you sure? Companies using it will lose their copy and assigned products.', () => removeEvent(id), 'danger');

  const inputStyle = { backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  const onFocus = e => e.currentTarget.style.borderColor = 'var(--color-text)';
  const onBlur = e => e.currentTarget.style.borderColor = 'var(--color-border)';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Global Event Catalog</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Master templates that can be assigned to any company.</p>
        </div>
        <button onClick={openCreateModal} className="px-5 py-2.5 rounded-xl flex items-center space-x-2 font-bold text-sm transition-all active:scale-95 hover:opacity-90" style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
          <Plus size={18} /><span>Create Event Template</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{isEditing ? 'Edit Event Template' : 'New Event Template'}</h2>
              <button onClick={closeModal} style={{ color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Event Name</label>
                <input type="text" required placeholder="e.g. Annual Rewards 2026"
                  className="w-full p-3 rounded-xl outline-none transition-all font-medium text-sm border"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar size={12} className="mr-1" /> Start Date
                  </label>
                  <input type="date" required className="w-full p-3 rounded-xl outline-none text-sm border"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                    value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar size={12} className="mr-1" /> End Date
                  </label>
                  <input type="date" required className="w-full p-3 rounded-xl outline-none text-sm border"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                    value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>
              {!isEditing && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-medium leading-relaxed italic" style={{ color: 'var(--color-text-muted)' }}>
                    Products for this event can be assigned later when finalizing the company profile.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 font-bold text-sm rounded-xl transition-all border"
                  style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}>Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 py-2.5 font-black text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}>
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventsLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-text)' }}></div>
        </div>
      ) : events.length === 0 ? (
        <div className="col-span-full py-20 rounded-2xl border-2 border-dashed text-center" style={{ borderColor: 'var(--color-border)' }}>
          <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-muted)' }}>No event templates found.</p>
          <button onClick={openCreateModal} className="mt-2 font-black text-sm hover:underline" style={{ color: 'var(--color-text)' }}>
            Create your first master template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event._id} className="rounded-2xl border p-6 group hover:shadow-md transition-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
                  <Calendar size={24} />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-1 text-[10px] font-black rounded uppercase tracking-wide" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>Template</span>
                  <button onClick={() => openEditModal(event)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(event._id)} className="p-1.5 rounded-lg transition-colors text-red-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-black mb-3" style={{ color: 'var(--color-text)' }}>{event.name}</h3>
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar size={13} className="mr-2" />
                  <FormattedDate date={event.startDate} /> — <FormattedDate date={event.endDate} />
                </p>
                <p className="text-xs font-medium flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  <Tag size={13} className="mr-2" />
                  {event.products?.length || 0} Default Gift Options
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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