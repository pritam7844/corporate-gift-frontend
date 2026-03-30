'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  MessageSquare,
  History,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Products Catalog', href: '/products', icon: Package },
  { name: 'Event Catalog', href: '/events', icon: CalendarDays },
  { name: 'New Arrivals', href: '/new-arrivals', icon: Sparkles },
  { name: 'Orders/Requests', href: '/requests', icon: Package },
  { name: 'Order History', href: '/history', icon: History },
  { name: 'Support', href: '/support', icon: MessageSquare },
  // { name: 'Manage Users', href: '/users', icon: Users },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <>
    <aside className={`bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-gray-800 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className={`p-6 border-b border-gray-800 h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <h1 className={`font-black text-blue-500 tracking-tighter transition-all duration-300 ${isCollapsed ? 'text-2xl' : 'text-xl'}`}>
          {isCollapsed ? 'GP' : (
            <span className="flex items-center">
              GIFT PRO <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded ml-1 font-bold">ADMIN</span>
            </span>
          )}
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`flex items-center p-3 rounded-xl transition-all group relative ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${!isActive && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300">{item.name}</span>}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-gray-700 shadow-xl">
                    {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center p-3 w-full text-gray-400 hover:text-red-400 transition-all rounded-xl hover:bg-red-900/10 group relative ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span className="font-bold text-sm">Sign Out</span>}
          
          {isCollapsed && (
            <div className="fixed left-20 ml-2 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
                Sign Out
            </div>
          )}
        </button>

      </div>
    </aside>

    <ConfirmModal
      isOpen={showLogoutConfirm}
      onClose={() => setShowLogoutConfirm(false)}
      onConfirm={handleLogout}
      title="Sign Out"
      message="Are you sure you want to sign out of the admin panel?"
      confirmText="Sign Out"
      type="danger"
    />
  </>
  );
}