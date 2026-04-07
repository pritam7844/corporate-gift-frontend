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
            <nav className="bg-white backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                    {/* Logo Area */}
                    <div className="flex items-center space-x-2">
                        {/* Hamburger Menu Toggle (Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div
                            className="flex items-center space-x-3 cursor-pointer group"
                            onClick={() => router.push('/')}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black group-hover:scale-105 transition-all shadow-lg shadow-blue-500/20 overflow-hidden border border-blue-100/20">
                                {company?.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{subdomain?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-xl font-black text-gray-900 capitalize tracking-tighter group-hover:text-blue-600 transition-colors hidden sm:block">
                                {company?.name || subdomain}
                            </span>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        <button
                            onClick={() => router.push('/')}
                            className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 ${isHome ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/events')}
                            className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 ${pathname.includes('/events') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            Events
                        </button>
                        <button
                            onClick={() => router.push('/new-arrivals')}
                            className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 ${pathname.includes('/new-arrivals') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            New Arrivals
                        </button>
                        <button
                            onClick={() => router.push('/faq')}
                            className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 ${pathname.includes('/faq') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            FAQ
                        </button>
                        <button
                            onClick={() => router.push('/contact')}
                            className={`text-sm font-black uppercase tracking-widest transition-all hover:scale-105 ${pathname.includes('/contact') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            Contact
                        </button>
                    </div>

                    {/* Right Area: Cart & Profile */}
                    <div className="flex items-center space-x-6">
                        {/* Cart Button */}
                        <button
                            onClick={() => router.push('/cart')}
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover:bg-gray-50 rounded-xl"
                        >
                            <ShoppingCart size={24} />
                            {(mounted && cartCount > 0) && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-75 duration-300">
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
                                className="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-black relative shadow-inner group-hover:from-blue-100 group-hover:to-indigo-100">
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="text-right hidden lg:block px-1">
                                    <p className="text-xs font-black text-gray-900 leading-none mb-1">{user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Gold Member</p>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 fade-in duration-200 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <UserIcon size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate w-32">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                router.push('/orders');
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center ${pathname.includes('/orders') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                                        >
                                            <Package size={16} className="mr-3" /> My Orders
                                        </button>
                                        {/* <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center">
                                            <Settings size={16} className="mr-3" /> Account Settings
                                        </button> */}

                                        <div className="h-px bg-gray-50 my-1"></div>

                                        {!showLogoutConfirm ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowLogoutConfirm(true);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center group"
                                            >
                                                <LogOut size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        ) : (
                                            <div className="p-3 bg-red-50 rounded-xl border border-red-100 mt-2 animate-in zoom-in-95 duration-200">
                                                <p className="text-xs font-bold text-red-800 mb-2 text-center">Are you sure?</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Yes, Sign Out
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowLogoutConfirm(false);
                                                        }}
                                                        className="flex-1 bg-white text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
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
                {/* Backdrop with strong blur */}
                <div
                    className={`absolute inset-0 bg-white/60 backdrop-blur-2xl transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu Content - Side Drawer style but from top for better reach */}
                <div className={`absolute top-0 left-0 right-0 max-h-[95vh] overflow-y-auto bg-white border-b border-gray-100 shadow-2xl px-6 pt-24 pb-32 transition-all duration-500 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                    {/* <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 transition-colors"><X size={24} /></button> */}

                    {/* Navigation Items */}
                    <div className="flex flex-col space-y-2">
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
                                    className={`w-full text-left px-6 py-5 rounded-3xl flex items-center justify-between transition-all active:scale-95 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 px-8' : 'text-gray-900 bg-gray-50/50 hover:bg-gray-100'}`}
                                >
                                    <span className="text-xl font-black tracking-tight">{item.name}</span>
                                    {active ? <ChevronDown className="-rotate-90" size={20} /> : <Plus className="text-gray-300" size={20} />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Profile/Actions in Mobile Menu */}
                    <div className="mt-10 pt-10 border-t border-gray-100">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center text-2xl font-black shadow-inner">
                                {user.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 leading-none mb-1">{user.name}</p>
                                <p className="text-sm text-gray-400 font-bold">{user.email}</p>
                            </div>
                        </div>

                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="w-full bg-red-600 text-white px-6 py-5 rounded-3xl font-black flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-xl shadow-red-500/20"
                            >
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <div className="bg-red-50 rounded-[2.5rem] p-4 border border-red-100 flex flex-col items-center">
                                <p className="text-sm font-black text-red-900 mb-4 tracking-tight">Are you sure you want to exit?</p>
                                <div className="flex w-full space-x-3">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 bg-red-600 text-white text-sm font-black py-4 rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                    >
                                        Yes, Exit
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 bg-white text-gray-600 text-sm font-black py-4 rounded-2xl border border-gray-100 active:scale-95 transition-all"
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
