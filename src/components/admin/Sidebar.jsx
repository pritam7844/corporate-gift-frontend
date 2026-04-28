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
    <aside
      className={`h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div
        className={`h-20 flex items-center px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h1
          className={`font-black tracking-tighter transition-all duration-300 ${isCollapsed ? 'text-2xl' : 'text-xl'}`}
          style={{ color: 'var(--color-text)' }}
        >
          {isCollapsed ? 'GP' : (
            <span className="flex items-center gap-2">
              GIFT PRO
              <span
                className="text-[10px] px-2 py-0.5 rounded font-black tracking-wide"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
              >
                ADMIN
              </span>
            </span>
          )}
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`flex items-center p-3 rounded-xl transition-all group relative font-bold text-sm ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              style={isActive
                ? { backgroundColor: 'var(--color-text)', color: '#ffffff' }
                : { color: 'var(--color-text-muted)' }
              }
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; } }}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${!isActive && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{item.name}</span>}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div
                  className="fixed left-20 ml-2 px-3 py-2 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl"
                  style={{ backgroundColor: 'var(--color-text)' }}
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`flex items-center p-3 w-full rounded-xl transition-all group relative text-sm font-bold ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span>Sign Out</span>}

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