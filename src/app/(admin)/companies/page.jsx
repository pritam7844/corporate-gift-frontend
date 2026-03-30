'use client';

import { useState } from 'react';
import { Building2, Plus, Globe, Users, Trash2, ExternalLink } from 'lucide-react';
import { useCompanies } from '../../../hooks/useCompanies';
import Link from 'next/link';

export default function CompaniesPage() {
  const { companies, loading, error, addCompany, fetchCompanies } = useCompanies();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', subdomain: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await addCompany(formData);
    setSubmitting(false);
    if (success) {
      setShowModal(false);
      setFormData({ name: '', subdomain: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
          <p className="text-gray-500">Register and manage corporate clients and their subdomains.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Register New Company</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">New Company Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Acme Corp"
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain</label>
                <div className="relative">
                  <input
                    type="text" required
                    placeholder="acme"
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-32"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">This will be the unique URL for the company portal.</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 shadow-md"
                >
                  {submitting ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && companies.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading companies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/companies/${company._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">{company.name}</h3>
                <a
                  href={typeof window !== 'undefined' ? `${window.location.protocol}//${company.subdomain}.${window.location.host.replace(/^admin\./, '')}` : `http://${company.subdomain}.${process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm font-medium mb-4 flex items-center italic hover:underline hover:text-blue-700 w-fit"
                >
                  <Globe size={14} className="mr-1" />
                  {company.subdomain}.{typeof window !== 'undefined' ? window.location.host.replace(/^admin\./, '') : (process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000')}
                </a>

                <div className="flex items-center space-x-4 text-gray-500 text-sm border-t pt-4">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{company.employeeCount || 0} Employees</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/companies/${company._id}`}
                className="block w-full text-center py-3 bg-gray-50 hover:bg-blue-600 hover:text-white transition-all text-sm font-bold text-gray-600 border-t border-gray-100"
              >
                Manage Company Profile
              </Link>
            </div>
          ))}

          {companies.length === 0 && !loading && (
            <div className="col-span-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No companies registered yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Create your first company profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}