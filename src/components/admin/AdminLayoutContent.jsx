'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function AdminLayoutContent({ children }) {
    const pathname = usePathname();

    // Don't show Sidebar/Navbar on login page or the root redirector page
    if (pathname === '/admin-login' || pathname === '/') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar is fixed, so we need a spacer or padding */}
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
