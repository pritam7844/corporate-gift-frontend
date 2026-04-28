'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { Lock, Mail, ChevronRight, Building2 } from 'lucide-react';

export default function EmployeeLogin() {
    const { subdomain } = useParams();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleEmployeeLogin, error, loading } = useAuth();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
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
        if (isHydrated && isAuthenticated && user?.companyId?.subdomain === subdomain) {
            router.replace('/');
        }
    }, [isHydrated, isAuthenticated, user, subdomain, router]);

    const onSubmit = (e) => {
        e.preventDefault();
        handleEmployeeLogin(email, password, subdomain);
    };

    if (isHydrated && isAuthenticated && user?.companyId?.subdomain === subdomain) {
        return null;
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg)' }}
        >
            {/* Warm background accent */}
            <div
                className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"
                style={{ backgroundColor: 'var(--color-accent)', opacity: 0.08, filter: 'blur(100px)' }}
            />
            <div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"
                style={{ backgroundColor: 'var(--color-border)', opacity: 0.5, filter: 'blur(80px)' }}
            />

            <div className="w-full max-w-lg relative">
                <div
                    className="p-10 md:p-12 rounded-3xl border relative overflow-hidden shadow-sm"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                    {/* Brand Identity Section */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                            style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                        >
                            <Building2 size={32} />
                        </div>
                        <h1 className="text-3xl font-black mb-2 capitalize tracking-tight" style={{ color: 'var(--color-text)' }}>
                            {subdomain} <span style={{ color: 'var(--color-text-muted)' }}>Portal</span>
                        </h1>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Enter your secure credentials to access your benefits.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl mb-8 flex items-center text-red-700 text-xs font-bold uppercase tracking-wide border border-red-100 bg-red-50 animate-in slide-in-from-top-2">
                            <span className="mr-3 text-lg leading-none"></span> {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-muted)' }}>Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-muted)' }}>Access Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="*******"
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
                            className="w-full py-4 rounded-xl font-black flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 group mt-4 uppercase tracking-widest text-sm"
                            style={{ backgroundColor: 'var(--color-text)', color: '#ffffff' }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            <span>{loading ? 'Authenticating...' : 'Access My Benefits'}</span>
                            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 text-center text-[10px] font-bold uppercase tracking-widest" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        Powered by <span style={{ color: 'var(--color-text)' }}>Corporate Gift Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
