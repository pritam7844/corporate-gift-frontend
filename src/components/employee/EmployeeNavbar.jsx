'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import CartDrawer from './CartDrawer';
import { LogOut, User as UserIcon, Settings, ChevronDown, Calendar, ShoppingCart } from 'lucide-react';

export default function EmployeeNavbar() {
    const { subdomain } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const cartCount = useCartStore((state) => state.getCartCount());

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef(null);

    // The middleware rewrites requests to /[subdomain]/...
    const isHome = pathname === `/${subdomain}` || pathname === `/${subdomain}/`;

    useEffect(() => {
        setMounted(true);
    }, []);

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
        router.push('/login');
    };

    if (!user) return null; // Fallback if not hydrated/logged in

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Logo Area */}
                    <div
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => router.push('/')}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:bg-blue-700 transition-colors shadow-sm">
                            {subdomain?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xl font-black text-gray-900 capitalize tracking-tight group-hover:text-blue-600 transition-colors">
                            {subdomain}
                        </span>
                    </div>

                    {/* Main Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-600 font-bold hover:text-blue-600 transition-colors"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/events')}
                            className="flex items-center space-x-2 text-gray-600 font-bold hover:text-blue-600 transition-colors"
                        >
                            <Calendar size={18} />
                            <span>Events</span>
                        </button>
                        {isHome && (
                            <>
                                <button
                                    onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-gray-600 font-bold hover:text-blue-600 transition-colors"
                                >
                                    FAQ
                                </button>
                                <button
                                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-gray-600 font-bold hover:text-blue-600 transition-colors"
                                >
                                    Contact
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right Area: Cart & Profile */}
                    <div className="flex items-center space-x-6">
                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
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
                                    setShowLogoutConfirm(false); // Reset confirm state when toggling
                                }}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-800 leading-none mb-1">{user.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold relative overflow-hidden">
                                    {user.name?.charAt(0)}
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
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
                                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center">
                                            <Settings size={16} className="mr-3" /> Account Settings
                                        </button>

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

            {/* Slide-out Cart */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
