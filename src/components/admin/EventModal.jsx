'use client';

import { useState } from 'react';
import { X, Calendar, Package, Search, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api'; // ADDED: Ensure api is imported

export default function EventModal({ isOpen, onClose, globalProducts, companies }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Added loading state for UX
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    companyId: '', // Empty means Global
    isGlobal: true
  });

  const toggleProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateEvent = async () => {
    if (!eventData.name) return alert("Please enter an event name");

    setLoading(true);
    try {
      const payload = {
        ...eventData,
        products: selectedProducts // Send array of ObjectIds
      };

      await api.post('/events', payload); //
      onClose();
      // Optional: window.location.reload() or a refresh prop could go here
    } catch (err) {
      console.error("Event creation failed", err);
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Create New Event</h2>
            <p className="text-sm text-gray-500">Define the period and select available gifts.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Event Details */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Name</label>
              <input
                type="text" placeholder="e.g. New Year 2026"
                className="w-full border-2 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                value={eventData.name}
                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-blue-600 flex items-center">
                  <Calendar size={14} className="mr-1" /> Start Date
                </label>
                <input type="date" className="w-full border-2 p-3 rounded-xl outline-none"
                  onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-red-600 flex items-center">
                  <Calendar size={14} className="mr-1" /> End Date
                </label>
                <input type="date" className="w-full border-2 p-3 rounded-xl outline-none"
                  onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Company</label>
              <select
                className="w-full border-2 p-3 rounded-xl outline-none bg-white"
                onChange={(e) => setEventData({
                  ...eventData,
                  companyId: e.target.value,
                  isGlobal: e.target.value === ""
                })}
              >
                <option value="">Make Global Template</option>
                {companies?.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2 italic">
                *Global events are available for any company to copy later.
              </p>
            </div>
          </div>

          {/* Right Side: Product Selection */}
          <div className="flex flex-col h-full border-l lg:pl-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700">Select Products ({selectedProducts.length})</label>
              <div className="relative">
                <Search className="absolute left-2 top-2 text-gray-400" size={16} />
                <input type="text" placeholder="Search..." className="pl-8 p-1.5 border rounded-lg text-sm outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {globalProducts?.map(product => (
                <div
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedProducts.includes(product._id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                    <img src={product.images?.[0] || product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{product.name}</p>
                    <p className="text-xs text-blue-600 font-medium">₹{product.price || product.actualPrice}</p>
                  </div>
                  {selectedProducts.includes(product._id) && (
                    <CheckCircle2 className="text-blue-600" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Only One Copy Now */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEvent}
            disabled={loading}
            className={`px-10 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}