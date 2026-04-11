'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import { LogOut, User as UserIcon, Settings, ChevronDown, Calendar, ShoppingCart, Package, Menu, X, Plus } from 'lucide-react';

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

    // The middleware rewrites requests to /[subdomain]/...
    // The browser url is essentially `/` for the home page.
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

    // Close dropdown when clicking outside
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

    if (!user) return null; // Fallback if not hydrated/logged in

    return (
        <>
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                    {/* Logo Area */}
                    <div className="flex items-center space-x-2">
                        {/* Hamburger Menu Toggle (Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all active:scale-95"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div
                            className="flex items-center space-x-3 cursor-pointer group"
                            onClick={() => router.push('/')}
                        >
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-all shadow-sm overflow-hidden border border-indigo-500/10">
                                {company?.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{subdomain?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-xl font-bold text-slate-900 capitalize tracking-tight group-hover:text-indigo-600 transition-colors hidden sm:block">
                                {company?.name || subdomain}
                            </span>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push('/')}
                            className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${isHome ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/events')}
                            className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${pathname.includes('/events') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            Events
                        </button>
                        <button
                            onClick={() => router.push('/new-arrivals')}
                            className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${pathname.includes('/new-arrivals') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            New Arrivals
                        </button>
                        <button
                            onClick={() => router.push('/faq')}
                            className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${pathname.includes('/faq') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => router.push('/contact')}
                            className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${pathname.includes('/contact') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            Contact
                        </button>
                    </div>

                    {/* Right Area: Cart & Profile */}
                    <div className="flex items-center space-x-6">
                        {/* Cart Button */}
                        <button
                            onClick={() => router.push('/cart')}
                            className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors hover:bg-slate-50 rounded-lg"
                        >
                            <ShoppingCart size={22} />
                            {(mounted && cartCount > 0) && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-75 duration-300">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown Area */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setShowLogoutConfirm(false);
                                }}
                                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold relative group-hover:bg-indigo-100 transition-colors">
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="text-right hidden lg:block px-1">
                                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Access Level: User</p>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-in slide-in-from-top-2 fade-in duration-200 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-50 flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <UserIcon size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate w-32">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                router.push('/orders');
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center ${pathname.includes('/orders') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            <Package size={16} className="mr-3" /> My Orders
                                        </button>

                                        <div className="h-px bg-slate-50 my-1"></div>

                                        {!showLogoutConfirm ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowLogoutConfirm(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center group"
                                            >
                                                <LogOut size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        ) : (
                                            <div className="p-3 bg-red-50 rounded-lg border border-red-100 mt-2 animate-in zoom-in-95 duration-200">
                                                <p className="text-xs font-bold text-red-800 mb-2 text-center">Are you sure?</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        Sign Out
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowLogoutConfirm(false);
                                                        }}
                                                        className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-md hover:bg-slate-50 transition-colors border border-slate-200"
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
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                {/* Backdrop - Clean overlay */}
                <div
                    className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu Content */}
                <div className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl px-6 pt-24 pb-32 transition-transform duration-500 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 transition-colors"><X size={24} /></button> */}

                    {/* Navigation Items */}
                    <div className="flex flex-col space-y-1">
                        {[
                            { name: 'Home', path: '/', icon: <ShoppingCart size={20} /> },
                            { name: 'Events', path: '/events', icon: <Calendar size={20} /> },
                            { name: 'New Arrivals', path: '/new-arrivals', icon: <Plus size={20} /> },
                            { name: 'My Orders', path: '/orders', icon: <Package size={20} /> },
                            { name: 'FAQ', path: '/faq', icon: <Settings size={20} /> },
                            { name: 'Contact', path: '/contact', icon: <UserIcon size={20} /> },
                        ].map((item) => {
                            const active = item.path === '/' ? isHome : pathname.includes(item.path);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }}
                                    className={`w-full text-left px-5 py-4 rounded-xl flex items-center justify-between transition-colors ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-900 hover:bg-slate-50'}`}
                                >
                                    <span className="text-lg font-bold tracking-tight">{item.name}</span>
                                    {active ? <ChevronDown className="-rotate-90" size={18} /> : <Plus className="text-slate-300" size={18} />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Profile/Actions in Mobile Menu */}
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                                {user.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                                <p className="text-sm text-slate-500 font-semibold truncate w-48">{user.email}</p>
                            </div>
                        </div>

                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-sm"
                            >
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex flex-col items-center">
                                <p className="text-sm font-bold text-red-900 mb-4 tracking-tight">Are you sure you want to sign out?</p>
                                <div className="flex w-full space-x-3">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 bg-red-600 text-white text-sm font-bold py-3.5 rounded-lg active:scale-95 transition-all"
                                    >
                                        Yes, Exit
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 bg-white text-slate-600 text-sm font-bold py-3.5 rounded-lg border border-slate-200 active:scale-95 transition-all"
                                    >
                                        Stay
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Close Button at bottom center for easy thumb access */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl shadow-black/30 transition-all duration-500 z-[101] active:scale-90 ${isMobileMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                >
                    <X size={28} fontStyle="bold" />
                </button>
            </div>
        </>
    );
}
