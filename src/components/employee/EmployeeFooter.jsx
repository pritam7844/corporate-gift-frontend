'use client';

import { useParams } from 'next/navigation';

export default function EmployeeFooter() {
    const { subdomain } = useParams();

    return (
        <footer className="py-12 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-slate-500 text-[13px] font-medium">
                    &copy; {new Date().getFullYear()} <span className="capitalize">{subdomain}</span> Corporate Gift Portal.
                </p>
                <div className="flex items-center justify-center space-x-4 mt-6">
                    <div className="h-px w-8 bg-slate-200"></div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Professional Gifting Operations
                    </p>
                    <div className="h-px w-8 bg-slate-200"></div>
                </div>
            </div>
        </footer>
    );
}
