'use client';

import { useAuthStore } from '../../store/authStore';
import { Bell, Search, UserCircle } from 'lucide-react';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search companies or products..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">System Admin</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}