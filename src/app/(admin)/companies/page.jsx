'use client';

import { useState } from 'react';
import { useCompanies } from '../../../hooks/useCompanies';
import { uploadLogoAPI } from '../../../services/company.service';
import Link from 'next/link';
import { Image as ImageIcon, X as CloseIcon, Plus, Trash2, Building2, ExternalLink, Globe, Users } from 'lucide-react';

export default function CompaniesPage() {
  const { companies, loading, error, addCompany, fetchCompanies } = useCompanies();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', subdomain: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const uploadRes = await uploadLogoAPI(logoFile);
        if (uploadRes.success) logoUrl = uploadRes.url;
      }
      const success = await addCompany({ ...formData, logo: logoUrl });
      if (success) {
        setShowModal(false);
        setFormData({ name: '', subdomain: '' });
        setLogoFile(null);
        setLogoPreview('');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>Company Management</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Register and manage corporate clients and their subdomains.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl flex items-center space-x-2 font-bold text-sm transition-all active:scale-95 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
        >
          <Plus size={18} />
          <span>Register New Company</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="rounded-2xl w-full max-w-md shadow-2xl p-6 border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>New Company Profile</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                <CloseIcon size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Company Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Acme Corp"
                  className="w-full p-3 rounded-xl outline-none transition-all font-medium text-sm border"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Subdomain</label>
                <div className="relative">
                  <input
                    type="text" required
                    placeholder="acme"
                    className="w-full p-3 rounded-xl outline-none transition-all font-medium text-sm border pr-32"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  />
                  <span className="absolute right-3 top-3 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN}</span>
                </div>
                <p className="text-xs mt-1 italic font-medium" style={{ color: 'var(--color-text-muted)' }}>Unique URL for the company portal.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Company Logo</label>
                <div className="flex items-center space-x-4">
                  <div
                    className="relative group w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon size={24} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Upload company logo (PNG, JPG). Max 5MB.</p>
                    <p className="text-[10px] mt-1 uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Recommended: 400x400px</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm border transition-all"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                >
                  {submitting ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {loading && companies.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-text)' }}></div>
          <p className="mt-4 font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading companies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="rounded-2xl border overflow-hidden group transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border font-black text-lg"
                    style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : company.name.charAt(0)}
                  </div>
                  <Link
                    href={`/companies/${company._id}`}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    <ExternalLink size={18} />
                  </Link>
                </div>

                <h3 className="text-lg font-black mb-1" style={{ color: 'var(--color-text)' }}>{company.name}</h3>
                <a
                  href={typeof window !== 'undefined' ? `${window.location.protocol}//${company.subdomain}.${window.location.host.replace(/^admin\./, '')}` : `http://${company.subdomain}.${process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium mb-4 flex items-center italic hover:underline w-fit"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Globe size={14} className="mr-1" />
                  {company.subdomain}.{typeof window !== 'undefined' ? window.location.host.replace(/^admin\./, '') : (process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'localhost:3000')}
                </a>

                <div className="flex items-center space-x-4 text-sm border-t pt-4 font-medium" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{company.employeeCount || 0} Employees</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/companies/${company._id}`}
                className="block w-full text-center py-3 border-t text-sm font-black transition-all"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-text)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text)'; }}
              >
                Manage Company Profile
              </Link>
            </div>
          ))}

          {companies.length === 0 && !loading && (
            <div
              className="col-span-full rounded-2xl border-2 border-dashed py-20 text-center"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-bold text-sm" style={{ color: 'var(--color-text-muted)' }}>No companies registered yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 font-black text-sm hover:underline"
                style={{ color: 'var(--color-text)' }}
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