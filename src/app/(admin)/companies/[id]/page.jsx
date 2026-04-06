'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2, Users, Calendar, Plus, Trash2, Edit, Mail, UserPlus,
  CheckCircle2, X, Tag, Globe, Settings, ArrowRight
} from 'lucide-react';
import FormattedDate from '../../../../components/common/FormattedDate';
import api from '../../../../lib/api';
import { useEvents } from '../../../../hooks/useEvents';
import { useUsers } from '../../../../hooks/useUsers';
import { useProducts } from '../../../../hooks/useProducts';
import { assignEventToCompanyAPI } from '../../../../services/event.service';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import {
  getCompanyByIdAPI,
  updateCompanyAPI,
  deleteCompanyAPI
} from '../../../../services/company.service';

export default function CompanyDetail() {
  const { id: companyId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrivateEventModal, setShowPrivateEventModal] = useState(false);

  // Data for Modals
  const { events: globalTemplates, loading: templatesLoading } = useEvents(true);
  const { events: companyEvents, fetchEvents: refreshEvents, addEvent: createPrivateEvent, removeEvent, updateEvent } = useEvents(false, companyId);
  const { users, addUser, updateUser, removeUser } = useUsers(companyId);

  // Edit Event state
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventForm, setEditEventForm] = useState({ name: '', startDate: '', endDate: '' });
  const [savingEvent, setSavingEvent] = useState(false);

  // Employee Edit State
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', password: '' });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [privateEventForm, setPrivateEventForm] = useState({
    name: '', startDate: '', endDate: ''
  });

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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getCompanyByIdAPI(companyId);
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchDetails();
  }, [companyId]);

  const handleAssignTemplate = async (templateId) => {
    try {
      await assignEventToCompanyAPI({
        globalEventId: templateId,
        companyId: companyId
      });
      setShowAssignModal(false);
      refreshEvents();
    } catch (err) {
      openConfirm('Error', err.response?.data?.message || "Failed to assign template", () => { }, 'danger');
    }
  };

  const handleCreatePrivateEvent = async (e) => {
    e.preventDefault();
    try {
      await createPrivateEvent({
        ...privateEventForm,
        companyId,
        isGlobal: false
      });
      setShowPrivateEventModal(false);
      setPrivateEventForm({ name: '', startDate: '', endDate: '' });
      refreshEvents();
    } catch (err) {
      openConfirm('Error', err.response?.data?.message || "Failed to create event", () => { }, 'danger');
    }
  };

  const handleDeleteCompany = async () => {
    const executeDelete = async () => {
      try {
        await deleteCompanyAPI(companyId);
        router.push('/companies');
      } catch (err) {
        openConfirm('Error', 'Failed to delete company. Please try again.', () => { }, 'danger');
      }
    };

    openConfirm(
      'Delete Company Permanently?',
      'FATAL: This will delete the company and ALL its data (Events, Employees, Orders). This action is irreversible.',
      executeDelete,
      'danger'
    );
  };

  const handleOpenEditEvent = (event) => {
    setEditingEvent(event);
    setEditEventForm({
      name: event.name,
      startDate: event.startDate?.substring(0, 10) || '',
      endDate: event.endDate?.substring(0, 10) || '',
    });
    setShowEditEventModal(true);
  };

  const handleSaveEditEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    await updateEvent(editingEvent._id, editEventForm);
    setSavingEvent(false);
    setShowEditEventModal(false);
    setEditingEvent(null);
  };

  // Private event (no clonedFrom) → permanent delete; cloned/assigned → remove from company
  const handleDeleteOrRemoveEvent = async (event) => {
    const isPrivate = !event.clonedFrom;
    const title = isPrivate ? 'Delete Private Event?' : 'Remove Cloned Event?';
    const msg = isPrivate
      ? `Permanently delete "${event.name}" and all its exclusive products? This cannot be undone.`
      : `Remove "${event.name}" from this company? Global data will remain intact.`;

    openConfirm(
      title,
      msg,
      () => removeEvent(event._id),
      isPrivate ? 'danger' : 'warning'
    );
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      const data = await updateCompanyAPI(companyId, {
        name: e.target.name.value,
        subdomain: e.target.subdomain.value
      });
      setCompany(data);
      setShowEditModal(false);
    } catch (err) {
      openConfirm('Error', 'Failed to update company information.', () => { }, 'danger');
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      password: '' // Keep empty for security, only update if provided
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSavingUser(true);
    const result = await updateUser(editingUser._id, editUserForm);
    setIsSavingUser(false);
    if (result.success) {
      setShowEditUserModal(false);
      setEditingUser(null);
    } else {
      alert(`Error: ${result.error || "Unknown error"}`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold uppercase shadow-lg shadow-blue-200">
            {company?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{company?.name}</h1>
            <p className="text-blue-600 font-medium flex items-center">
              <Globe size={14} className="mr-1" />
              {company?.subdomain}.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000'}
            </p>
          </div>
        </div>
        {/* <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-all font-medium"
          >
            <Edit size={18} /> <span>Edit</span>
          </button>
          <button
            onClick={handleDeleteCompany}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
          >
            <Trash2 size={18} /> <span>Delete</span>
          </button>
        </div> */}
      </div>

      {/* Tabs Nav */}
      <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-xl w-fit">
        {[
          { id: 'events', label: 'Events & Gifts', icon: Calendar },
          { id: 'users', label: 'Employees', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all ${activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'events' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Company Events</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                >
                  <Tag size={18} /> <span>Assign Global Template</span>
                </button>
                <button
                  onClick={() => setShowPrivateEventModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  <Plus size={18} /> <span>Create Private Event</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyEvents.map(event => (
                <div key={event._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                      <Calendar size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const today = new Date();
                        const start = new Date(event.startDate);
                        const end = new Date(event.endDate);
                        end.setHours(23, 59, 59, 999);
                        const isActive = today >= start && today <= end;
                        return (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isActive ? 'Active' : 'Closed'}
                          </span>
                        );
                      })()}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditEvent(event); }}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="Edit event"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOrRemoveEvent(event); }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title={!event.clonedFrom ? 'Delete permanently' : 'Remove from company'}
                      >
                        {!event.clonedFrom ? <Trash2 size={14} /> : <X size={14} />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{event.name}</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    <FormattedDate date={event.startDate} /> - <FormattedDate date={event.endDate} />
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                    <Tag size={14} className="mr-2 text-blue-500" />
                    <span>{event.products?.length || 0} Ready Gifts</span>
                  </div>
                  <button
                    onClick={() => router.push(`/companies/${companyId}/events/${event._id}`)}
                    className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-sans"
                  >
                    Manage Event Products
                  </button>
                </div>
              ))}
              {companyEvents.length === 0 && (
                <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-2 opacity-30" />
                  <p className="text-gray-500 font-medium font-sans">No events active for this company.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Company Employees</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                <UserPlus size={18} /> <span>Register Employee</span>
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-none mb-1">{user.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle2 size={14} className="mr-1" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit employee"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => removeUser(user._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete employee"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-gray-400">
                        <Users size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="font-medium">No employees registered for this company.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Settings size={24} className="mr-2 text-gray-400" /> Company Settings
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Update Information</h3>
                <p className="text-sm text-gray-500 mb-4">Edit basic details and branding for {company.name}.</p>
                <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors" onClick={() => setShowEditModal(true)} >
                  Update Company Data
                </button>
              </div>

              <div className="pt-8 border-t border-red-50">
                <h3 className="font-bold text-red-600 mb-2 flex items-center">
                  <Trash2 size={18} className="mr-2" /> Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Deleting this company is irreversible. All events, employees, and gift history will be purged.
                </p>
                <button
                  onClick={handleDeleteCompany}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-100"
                >
                  Delete {company.name}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Template Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Assign Global Template</h2>
                <p className="text-xs text-gray-400">Clone a master event to {company.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {globalTemplates.map(template => (
                <div
                  key={template._id}
                  onClick={() => handleAssignTemplate(template._id)}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 leading-none mb-1">{template.name}</p>
                      <p className="text-xs text-gray-400">{template.products?.length || 0} Default Gift Products</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
              {globalTemplates.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic">
                  No master templates found in the catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">New Employee</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const success = await addUser({
                  name: e.target.name.value,
                  email: e.target.email.value,
                  password: e.target.password.value,
                  role: 'company_user'
                });
                if (success) setShowUserModal(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input name="name" type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email</label>
                <input name="email" type="email" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Password</label>
                <input name="password" type="password" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Register Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Edit Employee</h2>
              <button onClick={() => setShowEditUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email <span className="text-gray-400 font-normal">(not editable)</span></label>
                <input 
                  type="email" readOnly 
                  className="w-full border p-2.5 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={editUserForm.email}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Update Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                <input 
                  type="password" 
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Enter new password..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSavingUser}
                className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-lg ${isSavingUser ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
              >
                {isSavingUser ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      {showPrivateEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">New Private Event</h2>
              <button onClick={() => setShowPrivateEventModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreatePrivateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
                <input
                  type="text" required
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. CEO Anniversary"
                  value={privateEventForm.name}
                  onChange={(e) => setPrivateEventForm({ ...privateEventForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={privateEventForm.startDate}
                    onChange={(e) => setPrivateEventForm({ ...privateEventForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={privateEventForm.endDate}
                    onChange={(e) => setPrivateEventForm({ ...privateEventForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Edit Company Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input name="name" type="text" defaultValue={company.name} required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain</label>
                <input name="subdomain" type="text" defaultValue={company.subdomain} required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Update Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && editingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Edit Event</h2>
              <button onClick={() => setShowEditEventModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEditEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
                <input type="text" required
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={editEventForm.name}
                  onChange={(e) => setEditEventForm({ ...editEventForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <input type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={editEventForm.startDate}
                    onChange={(e) => setEditEventForm({ ...editEventForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                  <input type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={editEventForm.endDate}
                    onChange={(e) => setEditEventForm({ ...editEventForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" disabled={savingEvent}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:bg-blue-300">
                {savingEvent ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
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
        confirmText={confirmState.type === 'danger' ? 'Confirm Delete' : 'Yes, Proceed'}
      />
    </div>
  );
}