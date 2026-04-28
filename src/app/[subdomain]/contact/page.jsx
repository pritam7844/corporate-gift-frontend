'use client';

import ContactSection from '../../../components/employee/ContactSection';
import { ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ContactPage() {
    const router = useRouter();
    const { subdomain } = useParams();
    const [companyId, setCompanyId] = useState(null);

    useEffect(() => {
        // Fetch company data to get the companyId for the support ticket
        const fetchCompany = async () => {
            try {
                const res = await api.get(`/companies/portal/${subdomain}`);
                setCompanyId(res.data.data._id);
            } catch (error) {
                console.error("Failed to load company for contact", error);
            }
        };
        fetchCompany();
    }, [subdomain]);

    return (
        <div className="min-h-[80vh] bg-[var(--color-bg)] pb-20">
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
            <ContactSection companyId={companyId} />
        </div>
    );
}
