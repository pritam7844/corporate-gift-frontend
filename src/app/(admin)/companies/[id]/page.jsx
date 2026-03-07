'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2, Users, Calendar, Plus, Trash2, Edit, Mail, UserPlus,
  CheckCircle2, X, Tag, Globe, Settings, ArrowRight
} from 'lucide-react';
import api from '../../../../lib/api';
import { useEvents } from '../../../../hooks/useEvents';
import { useUsers } from '../../../../hooks/useUsers';
import { useProducts } from '../../../../hooks/useProducts';
import { assignEventToCompanyAPI } from '../../../../services/event.service';
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
  const { events: companyEvents, fetchEvents: refreshEvents, addEvent: createPrivateEvent } = useEvents(false, companyId);
  const { users, addUser, removeUser } = useUsers(companyId);

  const [privateEventForm, setPrivateEventForm] = useState({
    name: '', startDate: '', endDate: ''
  });

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
      alert(err.response?.data?.message || "Failed to assign template");
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
      alert(err.response?.data?.message || "Failed to create event");
    }
  };

  const handleDeleteCompany = async () => {
    if (window.confirm("FATAL: This will delete the company and ALL its data. Continue?")) {
      try {
        await deleteCompanyAPI(companyId);
        router.push('/companies');
      } catch (err) {
        alert("Failed to delete company");
      }
    }
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
      alert("Failed to update company");
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
              {company?.subdomain}.localhost:3000
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
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
        </div>
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {event.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{event.name}</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                    <Tag size={14} className="mr-2 text-blue-500" />
                    <span>{event.products?.length || 0} Ready Gifts</span>
                  </div>
                  <button
                    onClick={() => router.push(`/companies/${companyId}/events/${event._id}`)}
                    className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-sans"
                  >
                    Manage Event
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
                        <button
                          onClick={() => removeUser(user._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
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
                <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors">
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

      {/* Private Event Modal */}
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
    </div>
  );
}