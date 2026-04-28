'use client';

import { usePathname } from 'next/navigation';
import { Bell, UserCircle, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar({ onToggleMobile, onToggleCollapse, isCollapsed }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    const last = parts[parts.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
  };

  return (
    <header
      className="h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl transition-all active:scale-95"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <Menu size={24} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 rounded-xl transition-all active:scale-95"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
        </button>

        <div className="hidden sm:block h-8 w-px mx-2" style={{ backgroundColor: 'var(--color-border)' }}></div>

        <div>
          <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text)' }}>{getPageTitle()}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest hidden md:block" style={{ color: 'var(--color-text-muted)' }}>Admin Portal</p>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Bell */}
        <button
          className="relative p-2 rounded-xl group active:scale-95 transition-all"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2" style={{ borderColor: 'var(--color-surface)' }}></span>
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3 pl-4 md:pl-6" style={{ borderLeft: '1px solid var(--color-border)' }}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black leading-none" style={{ color: 'var(--color-text)' }}>{user?.name || 'Admin User'}</p>
            <p className="text-[10px] mt-1 uppercase tracking-wider font-black" style={{ color: 'var(--color-text-muted)' }}>System Admin</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm cursor-pointer transition-all text-sm"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
          >
            {user?.name?.charAt(0) || <UserCircle size={24} />}
          </div>
        </div>
      </div>
    </header>
  );
}