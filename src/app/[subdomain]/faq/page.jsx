'use client';

import FaqSection from '../../../components/employee/FaqSection';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FaqPage() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] bg-[var(--color-surface)]  pb-20">
            {/* <div className="max-w-6xl mx-auto px-6 mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mr-3 group-hover:border-gray-400 group-hover:bg-[var(--color-bg)] transition-all">
                        <ChevronLeft size={16} className="stroke-[2.5]" />
                    </div>
                    Back
                </button>
            </div> */}
            <FaqSection />
        </div>
    );
}
