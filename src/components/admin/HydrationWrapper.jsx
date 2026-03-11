'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function HydrationWrapper({ children }) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
        } else {
            const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
            return () => unsub();
        }
    }, []);

    if (!isHydrated) {
        return null; // Or a subtle loader if preferred. Returning null prevents page flash.
    }

    return <>{children}</>;
}
