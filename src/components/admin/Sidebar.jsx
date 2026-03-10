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
  History
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Products Catalog', href: '/products', icon: Package },
  { name: 'Event Catalog', href: '/events', icon: CalendarDays },
  { name: 'Orders/Requests', href: '/requests', icon: Package },
  { name: 'Order History', href: '/history', icon: History },
  { name: 'Support', href: '/support', icon: MessageSquare },
  // { name: 'Manage Users', href: '/users', icon: Users },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-500 tracking-tight">GIFT PRO <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded ml-1">ADMIN</span></h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 w-full text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/10"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}