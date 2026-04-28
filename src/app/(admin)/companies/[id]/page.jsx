'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2, Users, Calendar, Plus, Trash2, Edit, Mail, UserPlus,
  CheckCircle2, X, Tag, Globe, Settings, ArrowRight, Image as ImageIcon
} from 'lucide-react';

import FormattedDate from '../../../../components/common/FormattedDate';
import api from '../../../../lib/api';
import { useEvents } from '../../../../hooks/useEvents';
import { useUsers } from '../../../../hooks/useUsers';
import { useProducts } from '../../../../hooks/useProducts';
import { assignEventToCompanyAPI } from '../../../../services/event.service';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import Toast from '../../../../components/common/Toast';
import {
  getCompanyByIdAPI,
  updateCompanyAPI,
  deleteCompanyAPI,
  uploadLogoAPI
} from '../../../../services/company.service';

export default function CompanyDetail() {
  const { id: companyId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('events');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

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

  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
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
    const fetchDetails = async () => {
      try {
        const data = await getCompanyByIdAPI(companyId);
        setCompany(data);
        if (data.logo) setLogoPreview(data.logo);
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
      let logoUrl = company.logo;
      if (logoFile) {
        const uploadRes = await uploadLogoAPI(logoFile);
        if (uploadRes.success) {
          logoUrl = uploadRes.url;
        }
      }

      const data = await updateCompanyAPI(companyId, {
        name: e.target.name.value,
        subdomain: e.target.subdomain.value,
        logo: logoUrl
      });
      setCompany(data);
      setLogoPreview(logoUrl);
      setLogoFile(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Update failed:', err);
      openConfirm('Error', 'Failed to update company information.', () => { }, 'danger');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
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

  const handleDeleteUser = (user) => {
    openConfirm(
      'Delete Employee?',
      `Are you sure you want to delete ${user.name}? This will remove their access to the portal.`,
      () => removeUser(user._id),
      'danger'
    );
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSavingUser(true);
    const result = await updateUser(editingUser._id, editUserForm);
    setIsSavingUser(false);
    if (result.success) {
      setShowEditUserModal(false);
      setEditingUser(null);
      showToast('Employee updated successfully!');
    } else {
      showToast(result.error || "Unknown error", 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text)]"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-lg ">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold uppercase">{company?.name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{company?.name}</h1>
            <p className="text-[var(--color-text)] font-medium flex items-center">
              <Globe size={14} className="mr-1" />
              {company?.subdomain}.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] transition-all font-medium"
          >
            <Edit size={18} /> <span>Edit</span>
          </button>
          <button
            onClick={handleDeleteCompany}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all font-medium"
          >
            <Trash2 size={18} /> <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex space-x-1 bg-[var(--color-bg)] p-1.5 rounded-xl w-fit">
        {[
          { id: 'events', label: 'Events & Gifts', icon: Calendar },
          { id: 'users', label: 'Employees', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all ${activeTab === tab.id
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
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
              <h2 className="text-xl font-bold text-[var(--color-text)]">Company Events</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center space-x-2 bg-[var(--color-bg)] text-[var(--color-text)] px-4 py-2.5 rounded-xl font-bold hover:bg-[var(--color-text)] hover:text-white transition-all border border-[var(--color-border)]"
                >
                  <Tag size={18} /> <span>Assign Global Template</span>
                </button>
                <button
                  onClick={() => setShowPrivateEventModal(true)}
                  className="flex items-center space-x-2 bg-[var(--color-text)] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[var(--color-text)] shadow-lg  transition-all">
                  <Plus size={18} /> <span>Create Private Event</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyEvents.map(event => (
                <div key={event._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between mb-4">
                    <div className="p-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-muted)]">
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'}`}>
                            {isActive ? 'Active' : 'Closed'}
                          </span>
                        );
                      })()}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditEvent(event); }}
                        className="p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] rounded transition-colors"
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
                  <h3 className="font-bold text-[var(--color-text)] mb-1">{event.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-4">
                    <FormattedDate date={event.startDate} /> - <FormattedDate date={event.endDate} />
                  </p>
                  <div className="flex items-center text-sm text-[var(--color-text-muted)] mb-4 bg-[var(--color-bg)] p-2 rounded-lg">
                    <Tag size={14} className="mr-2 text-[var(--color-text-muted)]" />
                    <span>{event.products?.length || 0} Ready Gifts</span>
                  </div>
                  <button
                    onClick={() => router.push(`/companies/${companyId}/events/${event._id}`)}
                    className="w-full py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-text)] hover:text-white hover:border-[var(--color-text)] transition-all font-sans"
                  >
                    Manage Event Products
                  </button>
                </div>
              ))}
              {companyEvents.length === 0 && (
                <div className="col-span-full py-20 bg-[var(--color-bg)] rounded-2xl border-2 border-dashed border-[var(--color-border)] text-center">
                  <Calendar size={40} className="mx-auto text-[var(--color-border)] mb-2 opacity-30" />
                  <p className="text-[var(--color-text-muted)] font-medium font-sans">No events active for this company.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Company Employees</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center space-x-2 bg-[var(--color-text)] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[var(--color-text)] shadow-lg  transition-all"
              >
                <UserPlus size={18} /> <span>Register Employee</span>
              </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center font-bold mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-text)] leading-none mb-1">{user.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-[var(--color-bg)] text-[var(--color-text-muted)] text-[10px] font-bold rounded uppercase tracking-wide">
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
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                            title="Edit employee"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
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
                      <td colSpan="4" className="py-20 text-center text-[var(--color-text-muted)]">
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
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center">
              <Settings size={24} className="mr-2 text-[var(--color-text-muted)]" /> Company Settings
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-[var(--color-text)] mb-2">Update Information</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">Edit basic details and branding for {company.name}.</p>
                <button className="px-6 py-2 bg-[var(--color-bg)] text-[var(--color-text-muted)] rounded-lg font-bold hover:bg-gray-200 transition-colors" onClick={() => setShowEditModal(true)} >
                  Update Company Data
                </button>
              </div>

              <div className="pt-8 border-t border-red-50">
                <h3 className="font-bold text-red-600 mb-2 flex items-center">
                  <Trash2 size={18} className="mr-2" /> Danger Zone
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
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
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Assign Global Template</h2>
                <p className="text-xs text-[var(--color-text-muted)]">Clone a master event to {company.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {globalTemplates.map(template => (
                <div
                  key={template._id}
                  onClick={() => handleAssignTemplate(template._id)}
                  className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-text)] hover:bg-[var(--color-bg)] cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[var(--color-bg)] text-[var(--color-text)] rounded-lg flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-text)] leading-none mb-1">{template.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{template.products?.length || 0} Default Gift Products</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-[var(--color-border)] group-hover:text-[var(--color-text)] transition-colors" />
                </div>
              ))}
              {globalTemplates.length === 0 && (
                <div className="text-center py-10 text-[var(--color-text-muted)] italic">
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
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">New Employee</h2>
              <button onClick={() => setShowUserModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
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
                if (success) {
                  setShowUserModal(false);
                  showToast('Employee registered successfully!');
                } else {
                  showToast('Failed to register employee. Check email or connection.', 'error');
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Full Name</label>
                <input name="name" type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Work Email</label>
                <input name="email" type="email" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Initial Password</label>
                <input name="password" type="password" required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]" />
              </div>
              <button type="submit" className="w-full bg-[var(--color-text)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-text)] transition-all shadow-lg ">
                Register Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Edit Employee</h2>
              <button onClick={() => setShowEditUserModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Work Email <span className="text-[var(--color-text-muted)] font-normal">(not editable)</span></label>
                <input 
                  type="email" readOnly 
                  className="w-full border p-2.5 rounded-lg outline-none bg-[var(--color-bg)] text-[var(--color-text-muted)] cursor-not-allowed"
                  value={editUserForm.email}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Update Password <span className="text-[var(--color-text-muted)] font-normal">(leave blank to keep current)</span></label>
                <input 
                  type="password" 
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Enter new password..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSavingUser}
                className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-lg ${isSavingUser ? 'bg-blue-300 cursor-not-allowed' : 'bg-[var(--color-text)] hover:bg-[var(--color-text)] '}`}
              >
                {isSavingUser ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      {showPrivateEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">New Private Event</h2>
              <button onClick={() => setShowPrivateEventModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreatePrivateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Event Name</label>
                <input
                  type="text" required
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]"
                  placeholder="e.g. CEO Anniversary"
                  value={privateEventForm.name}
                  onChange={(e) => setPrivateEventForm({ ...privateEventForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Start Date</label>
                  <input
                    type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={privateEventForm.startDate}
                    onChange={(e) => setPrivateEventForm({ ...privateEventForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">End Date</label>
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
                className="w-full bg-[var(--color-text)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-text)] transition-all shadow-lg"
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
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Edit Company Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Company Name</label>
                <input name="name" type="text" defaultValue={company.name} required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]" />
              </div>
              <div>
                <input name="subdomain" type="text" defaultValue={company.subdomain} required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Company Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="relative group w-20 h-20 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center overflow-hidden transition-all hover:border-blue-400">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setLogoFile(null); setLogoPreview(company.logo || ''); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <Edit size={18} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="text-[var(--color-border)]" size={24} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text-muted)]">Pick a square logo for best results (PNG/JPG).</p>
                    <p className="text-[10px] text-[var(--color-text)] mt-1 uppercase font-black">Click to change</p>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-[var(--color-text)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-text)] transition-all shadow-lg ">
                Update Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && editingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[var(--color-bg)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Edit Event</h2>
              <button onClick={() => setShowEditEventModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-muted)]">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEditEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Event Name</label>
                <input type="text" required
                  className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-text)]"
                  value={editEventForm.name}
                  onChange={(e) => setEditEventForm({ ...editEventForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Start Date</label>
                  <input type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={editEventForm.startDate}
                    onChange={(e) => setEditEventForm({ ...editEventForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">End Date</label>
                  <input type="date" required
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={editEventForm.endDate}
                    onChange={(e) => setEditEventForm({ ...editEventForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" disabled={savingEvent}
                className="w-full bg-[var(--color-text)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-text)] transition-all shadow-lg disabled:opacity-50">
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

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}