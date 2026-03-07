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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-gray-100">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-lg relative">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Company Branding placeholder */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-200 rotate-3 transform transition-transform hover:rotate-0">
                            <Building2 size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2 capitalize tracking-tight">
                            {subdomain} Portal
                        </h1>
                        <p className="text-gray-500 font-medium font-sans">Enter your credentials to access your rewards</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center text-red-600 text-sm font-semibold animate-in slide-in-from-top-2">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/30 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-800"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Security Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/30 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-800"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:bg-blue-300 group mt-4"
                        >
                            <span>{loading ? 'Verifying...' : 'Access My Benefits'}</span>
                            {!loading && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                        Powered by Corporate Gift Platform
                    </div>
                </div>
            </div>
        </div>
    );
}
