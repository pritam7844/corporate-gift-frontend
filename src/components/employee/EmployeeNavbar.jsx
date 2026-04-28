'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { LogOut, User as UserIcon, Settings, ChevronDown, Calendar, ShoppingCart, Package, Menu, X, Plus, Sparkles } from 'lucide-react';

export default function EmployeeNavbar() {
    const { subdomain } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const cartCount = useCartStore((state) => state.getCartCount());

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [company, setCompany] = useState(null);
    const dropdownRef = useRef(null);

    const isHome = pathname === '/' || pathname === `/${subdomain}` || pathname === `/${subdomain}/`;

    useEffect(() => {
        setMounted(true);
        const fetchCompany = async () => {
            try {
                const res = await api.get(`/companies/portal/${subdomain}`);
                setCompany(res.data.data);
            } catch (err) {
                console.error("Failed to fetch company branding", err);
            }
        };
        if (subdomain) fetchCompany();
    }, [subdomain]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
                setShowLogoutConfirm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setShowLogoutConfirm(false);
        const isAdmin = window.location.pathname.startsWith('/admin') || window.location.pathname.includes('/dashboard');
        router.push(isAdmin ? '/admin-login' : '/login');
    };

    if (!user) return null;

    return (
        <>
            <nav className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">

                    {/* Logo Area */}
                    <div className="flex items-center">
                        <div
                            className="flex items-center space-x-4 cursor-pointer group"
                            onClick={() => router.push('/')}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-text)] text-[var(--color-surface)] flex items-center justify-center font-black shadow-lg overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                {company?.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">{subdomain?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-2xl font-black capitalize tracking-tighter text-[var(--color-text)] hidden sm:block">
                                {company?.name || subdomain}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-12">
                        <button
                            onClick={() => router.push('/')}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${isHome ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] opacity-60 hover:opacity-100'}`}
                        >
                            Home
                            {isHome && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-text)] rounded-full animate-in slide-in-from-left-2"></div>}
                        </button>
                        {[
                            { name: 'Events', path: '/events' },
                            { name: 'New Arrivals', path: '/new-arrivals' },
                            { name: 'FAQ', path: '/faq' },
                            { name: 'Contact', path: '/contact' }
                        ].map(item => {
                            const active = pathname.includes(item.path);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => router.push(item.path)}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] opacity-60 hover:opacity-100'}`}
                                >
                                    {item.name}
                                    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-text)] rounded-full animate-in slide-in-from-left-2"></div>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Area Actions */}
                    <div className="flex items-center space-x-4 md:space-x-8">
                        {/* Cart Button — Visible on both */}
                        <button
                            onClick={() => router.push('/cart')}
                            className="relative p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] transition-all hover:bg-[var(--color-surface)] shadow-sm active:scale-95 group"
                        >
                            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                            {(mounted && cartCount > 0) && (
                                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-xl bg-[var(--color-text)] text-[var(--color-surface)] text-[10px] font-black shadow-lg border-2 border-[var(--color-surface)] animate-in zoom-in-75 duration-300">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Desktop Profile Dropdown */}
                        <div className="relative hidden md:block" ref={dropdownRef}>
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setShowLogoutConfirm(false);
                                }}
                                className="flex items-center space-x-4 p-1.5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] transition-all hover:border-[var(--color-text)]/30 group shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-text)] text-[var(--color-surface)] flex items-center justify-center font-black text-sm shadow-md">
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="text-left hidden lg:block pr-2">
                                    <p className="text-sm font-black leading-none mb-1.5 text-[var(--color-text)] tracking-tight">{user.name}</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--color-text-muted)] opacity-60">Verified Member</p>
                                </div>
                                <ChevronDown size={14} className={`transition-all duration-500 mr-2 text-[var(--color-text-muted)] ${isProfileOpen ? 'rotate-180 text-[var(--color-text)]' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-4 w-72 rounded-3xl shadow-2xl p-3 animate-in slide-in-from-top-4 fade-in duration-300 z-50 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                                    <div className="p-6 flex items-center space-x-4 mb-3 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-text)] text-[var(--color-surface)] flex items-center justify-center font-black text-lg">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-[var(--color-text)] truncate tracking-tight">{user.name}</p>
                                            <p className="text-xs text-[var(--color-text-muted)] truncate opacity-60 font-bold">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                router.push('/orders');
                                            }}
                                            className={`w-full text-left p-4 rounded-xl flex items-center transition-all ${pathname.includes('/orders') ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'}`}
                                        >
                                            <Package size={20} className="mr-4 opacity-70" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Order History</span>
                                        </button>

                                        {!showLogoutConfirm ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowLogoutConfirm(true);
                                                }}
                                                className="w-full text-left p-4 rounded-xl flex items-center text-red-500 hover:bg-red-50 transition-all group"
                                            >
                                                <LogOut size={20} className="mr-4 group-hover:-translate-x-1 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
                                            </button>
                                        ) : (
                                            <div className="p-5 bg-red-50 rounded-2xl border border-red-100 mt-2 animate-in zoom-in-95 duration-300">
                                                <p className="text-[10px] font-black text-red-800 mb-4 text-center uppercase tracking-widest">Are you sure?</p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex-1 bg-red-600 text-white text-[10px] font-black py-3 rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowLogoutConfirm(false);
                                                        }}
                                                        className="flex-1 bg-white text-slate-900 text-[10px] font-black py-3 rounded-xl border border-slate-200 transition-all uppercase tracking-widest"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger — Far Right */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-4 bg-[var(--color-bg)] rounded-2xl text-[var(--color-text)] transition-all active:scale-95 border border-[var(--color-border)] shadow-sm"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-700 ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                <div
                    className={`absolute inset-0 bg-[var(--color-text)]/40 backdrop-blur-md transition-opacity duration-700 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <div className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-sm shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col bg-[var(--color-surface)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Compact Header */}
                    <div className="flex justify-between items-center p-8 pb-2 shrink-0">
                        {/* <div className="h-8 w-8 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                            <span className="text-[10px] font-black">{subdomain?.charAt(0).toUpperCase()}</span>
                        </div> */}
                        <div></div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-10 h-10 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] active:scale-90 transition-all shadow-sm"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Compact User Profile */}
                    <div className="px-6 mb-4 shrink-0">
                        <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] flex items-center space-x-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-text)] text-[var(--color-surface)] flex items-center justify-center font-black text-xl shadow-md">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-black text-[var(--color-text)] truncate tracking-tight leading-none mb-1">{user.name}</p>
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <Sparkles size={8} className="text-[var(--color-text)]" />
                                    <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items - Compressed */}
                    <div className="flex-grow px-4 pb-4 flex flex-col justify-between">
                        <div className="space-y-1">
                            {[
                                { name: 'Home', path: '/', icon: <ShoppingCart size={16} /> },
                                { name: 'Events', path: '/events', icon: <Calendar size={16} /> },
                                { name: 'New Arrivals', path: '/new-arrivals', icon: <Plus size={16} /> },
                                { name: 'FAQ', path: '/faq', icon: <Settings size={16} /> },
                                { name: 'Contact', path: '/contact', icon: <UserIcon size={16} /> },
                            ].map((item) => {
                                const active = item.path === '/' ? isHome : pathname.includes(item.path);
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }}
                                        className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between transition-all duration-300 ${active ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-lg' : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`p-1.5 rounded-lg ${active ? 'bg-[var(--color-surface)]/20' : 'bg-[var(--color-bg)]'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-xs font-black tracking-tight uppercase tracking-[0.05em]">{item.name}</span>
                                        </div>
                                        <ChevronDown className={active ? "-rotate-90" : "-rotate-90 opacity-20"} size={14} />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-1 mt-4 pt-4 border-t border-[var(--color-border)]/50">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    router.push('/orders');
                                }}
                                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between transition-all duration-300 ${pathname.includes('/orders') ? 'bg-[var(--color-text)] text-[var(--color-surface)] shadow-lg' : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`p-1.5 rounded-lg ${pathname.includes('/orders') ? 'bg-[var(--color-surface)]/20' : 'bg-[var(--color-bg)]'}`}>
                                        <Package size={16} />
                                    </span>
                                    <span className="text-xs font-black tracking-tight uppercase tracking-[0.05em]">Order History</span>
                                </div>
                                <ChevronDown className="-rotate-90 opacity-20" size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Footer Actions - Compact */}
                    <div className="p-6 pt-2 border-t border-[var(--color-border)] shrink-0">
                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="w-full p-4 rounded-xl font-black flex items-center justify-center gap-3 bg-[var(--color-bg)] text-red-600 border border-red-50 active:scale-95 transition-all text-[10px] uppercase tracking-[0.1em] shadow-sm"
                            >
                                <LogOut size={16} />
                                Exit Portal
                            </button>
                        ) : (
                            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
                                <p className="text-[9px] font-black text-red-900 mb-3 uppercase tracking-[0.1em]">Ready to leave?</p>
                                <div className="flex w-full gap-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-black active:scale-95 transition-all text-[9px] uppercase tracking-widest shadow-sm"
                                    >
                                        Yes, Exit
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 bg-white text-slate-900 py-3 rounded-lg font-black border border-slate-200 active:scale-95 transition-all text-[9px] uppercase tracking-widest"
                                    >
                                        Stay
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
