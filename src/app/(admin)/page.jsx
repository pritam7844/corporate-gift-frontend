'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

export default function AdminRoot() {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        // Wait for Zustand hydration to avoid flash/missing state
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        if (isAuthenticated) {
            router.replace('/dashboard');
        } else {
            router.replace('/admin-login');
        }
    }, [isAuthenticated, isHydrated, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium font-sans">Authenticating...</p>
            </div>
        </div>
    );
}
