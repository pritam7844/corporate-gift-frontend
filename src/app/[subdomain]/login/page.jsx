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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/3 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-[120px] -z-10 translate-y-1/2 -translate-x-1/3 opacity-60"></div>

            <div className="w-full max-w-lg relative">
                <div className="bg-white border border-slate-200 p-10 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
                    {/* Brand Identity Section */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200/50">
                            <Building2 size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 capitalize tracking-tight">
                            {subdomain} <span className="text-indigo-600">Portal</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Enter your secure credentials to access your benefits.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-8 flex items-center text-red-600 text-xs font-bold uppercase tracking-wide animate-in slide-in-from-top-2">
                            <span className="mr-3 text-lg leading-none">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-slate-900 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-slate-900 text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4.5 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:bg-indigo-300 group mt-4 uppercase tracking-widest text-sm"
                        >
                            <span>{loading ? 'Authenticating...' : 'Access My Benefits'}</span>
                            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Powered by <span className="text-slate-900">Corporate Gift Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
