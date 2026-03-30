'use client';

import { usePathname } from 'next/navigation';
import { Bell, UserCircle, Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar({ onToggleMobile, onToggleCollapse, isCollapsed }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  // Helper to get current page title
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    const last = parts[parts.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
        </button>

        <div className="hidden sm:block h-8 w-px bg-gray-100 mx-2"></div>

        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{getPageTitle()}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden md:block">Admin Portal</p>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {/* <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 mr-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-40 font-medium"
            />
        </div> */}

        <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-all hover:bg-blue-50 rounded-xl group active:scale-95">
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 md:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-black">System Admin</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black shadow-sm ring-1 ring-blue-100 group cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
            {user?.name?.charAt(0) || <UserCircle size={24} />}
          </div>
        </div>
      </div>
    </header>
  );
}