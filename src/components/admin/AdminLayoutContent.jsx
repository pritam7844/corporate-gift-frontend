'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import HydrationWrapper from './HydrationWrapper';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayoutContent({ children }) {
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Don't show Sidebar/Navbar on login page or the root redirector page
    if (pathname === '/admin-login' || pathname === '/') {
        return <>{children}</>;
    }

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <HydrationWrapper>
            <div className="flex min-h-screen" style={{backgroundColor: 'var(--color-bg)'}}>
                {/* Backdrop for mobile */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <Sidebar 
                    isCollapsed={isSidebarCollapsed} 
                    isMobileOpen={isMobileMenuOpen}
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                />

                <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                    <Navbar 
                        onToggleMobile={toggleMobileMenu} 
                        onToggleCollapse={toggleSidebar}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <main className="p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </HydrationWrapper>
    );
}
