'use client';

import { useParams } from 'next/navigation';

export default function EmployeeFooter() {
    const { subdomain } = useParams();

    return (
        <footer className="py-12 bg-[#F8FAFC] border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-gray-400 text-sm font-medium">
                    &copy; {new Date().getFullYear()} <span className="capitalize">{subdomain}</span>. All rights reserved.
                </p>
                <p className="text-gray-300 text-xs font-medium uppercase tracking-widest mt-2">
                    Powered by Corporate Gift Platform
                </p>
            </div>
        </footer>
    );
}
