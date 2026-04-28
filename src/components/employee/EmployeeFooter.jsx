'use client';

import { useParams } from 'next/navigation';

export default function EmployeeFooter() {
    const { subdomain } = useParams();

    return (
        <footer className="py-20 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-10 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="h-[1px] w-12 bg-[var(--color-border)]"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-40">
                            Corporate Operations
                        </p>
                        <div className="h-[1px] w-12 bg-[var(--color-border)]"></div>
                    </div>
                    
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[var(--color-text)]">
                        &copy; {new Date().getFullYear()} <span className="text-[var(--color-text)] opacity-60">{subdomain}</span> &bull; Powered by BrandBarrel
                    </p>
                    
                    <div className="mt-12 flex gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] opacity-50">
                        <span className="hover:text-[var(--color-text)] cursor-pointer transition-colors">Privacy Protocol</span>
                        <span className="hover:text-[var(--color-text)] cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-[var(--color-text)] cursor-pointer transition-colors">Support Portal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
