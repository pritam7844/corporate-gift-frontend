'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { Lock, Mail, ChevronRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleAdminLogin, error, loading } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isHydrated, isAuthenticated, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleAdminLogin(email, password);
  };

  if (isHydrated && isAuthenticated) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Subtle background decoration */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"
        style={{ backgroundColor: 'var(--color-accent)', opacity: 0.07, filter: 'blur(100px)' }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-sm"
            style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
          >
            GP
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--color-text)' }}>
            Admin Access
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to manage the platform
          </p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-2xl shadow-sm border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {error && (
            <div className="p-4 rounded-xl mb-6 flex items-center text-red-700 text-sm font-bold border border-red-100 bg-red-50">
              <span className="mr-3"></span> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-muted)' }}>
                Admin Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all font-medium text-sm border"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-text)'; e.currentTarget.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-bg)'; }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-muted)' }}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all font-medium text-sm border"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-text)'; e.currentTarget.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-bg)'; }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-widest mt-2 group"
              style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-8" style={{ color: 'var(--color-text-muted)' }}>
          Corporate Gift Platform &bull; Admin Console
        </p>
      </div>
    </div>
  );
}