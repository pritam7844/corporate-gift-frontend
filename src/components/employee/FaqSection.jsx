'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, MessageSquare, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react';
import ProcessFlow from './ProcessFlow';

export default function FaqSection() {
    const router = useRouter();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: "1) How can I select products through Corporate Deals?",
            a: "You can select products for sampling based on your event requirements. Browse the event-based product categories and choose items that best suit your needs."
        },
        {
            q: "2) How many products can I select for samples?",
            a: "For each user ID and password, you can select a maximum of 3 different products per event."
        },
        {
            q: "3) How can I share my requirements with Corporate Deals?",
            a: "After selecting the products, you will be directed to a form. Please fill in all required details, including quantity, product specifications, lead time, customization requirements, delivery location, and your tentative budget."
        },
        {
            q: "4) How many days will it take to receive the samples?",
            a: "You will receive the samples within 4–5 working days."
        },
        {
            q: "5) How many units of a single product can I select for sampling?",
            a: "You can select a single product for sampling. However, you are allowed to choose a maximum of 3 different products for the sample request."
        },
        {
            q: "6) How can I include additional details or special requirements?",
            a: "At the end of the selection process, you will find a detailed form where most requirements are covered. If you have any additional queries or specific requests, you can mention them in the 'Additional Information' section."
        },
        {
            q: "7) How will I track or receive acknowledgment for my sample request or bulk enquiry?",
            a: "Once you submit all the required information, you will receive an order reference number on your registered email ID. This email will include all the details you have submitted. For any queries, you can email service.brandbarrel@gmail.com."
        },
        {
            q: "8) Is the Corporate Deals website meant for bulk enquiries?",
            a: "Yes, the platform is designed to help you first select samples for evaluation. Once finalized, you can proceed with your bulk enquiry."
        },
        {
            q: "9) Do I need to pay for samples on the website?",
            a: "No, you are not required to make any payment on the website. The sample cost will be billed to Housing.com against the respective order reference number."
        },
        {
            q: "10) What if the product I want is not listed on the website?",
            a: "You can email product images, specifications, brand name, target budget, lead time, and personalization details to service.brandbarrel@gmail.com. The team will respond within 5–6 working days."
        },
        {
            q: "11) When will I not be charged for the selected samples?",
            a: "You will not be charged if products are returned in original condition with tags, packaging, unused state, properly maintained apparel, and within 3 working days. Edible items are non-returnable."
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="bg-slate-50 py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -z-10 -translate-y-1/2 translate-x-1/3 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-[100px] -z-10 translate-y-1/2 -translate-x-1/3 opacity-40"></div>

            {/* How it Works Section */}
            <ProcessFlow />

            <div className="max-w-4xl mx-auto px-6 relative z-10 mt-20">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-100/50">
                        <HelpCircle size={14} />
                        <span>Support Center</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        Got <span className="text-indigo-600">Questions?</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
                        Everything you need to know about our corporate gifting process and reward fulfillment.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`border transition-all duration-300 rounded-xl overflow-hidden ${openIndex === i
                                    ? 'border-indigo-200 bg-white shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                                }`}
                        >
                            <button
                                onClick={() => toggleFaq(i)}
                                className="w-full flex items-center justify-between p-6 md:p-7 text-left focus:outline-none group"
                            >
                                <span className={`text-base font-bold transition-colors ${openIndex === i ? 'text-indigo-600' : 'text-slate-900'}`}>
                                    {faq.q.split(') ')[1]}
                                </span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openIndex === i ? 'bg-indigo-600 text-white rotate-180 shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                                    }`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-[500px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0 pointer-events-none'
                                }`}>
                                <div className="p-6 md:p-7 text-slate-600 leading-relaxed font-medium text-sm">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-24 relative px-8 py-16 md:px-16 md:py-20 bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-20"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                        <div className="text-center lg:text-left flex-1">
                            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Still have questions?</h3>
                            <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
                                Can't find the answer you're looking for? Reach out for personalized corporate support.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
                            <a
                                href="tel:8356094864"
                                className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">Direct Line</p>
                                    <p className="text-white font-bold text-sm tracking-wide">+91 83560 94864</p>
                                </div>
                            </a>

                            <a
                                href="mailto:service.brandbarrel@gmail.com"
                                className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5">Email Support</p>
                                    <p className="text-white font-bold text-sm tracking-wide">service.brandbarrel@gmail.com</p>
                                </div>
                            </a>

                            <button
                                onClick={() => router.push('/contact')}
                                className="col-span-1 md:col-span-2 group flex items-center justify-between p-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-900/20"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-bold text-sm leading-none mb-1">Inquiry Portal</p>
                                        <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-wider">Direct Message Access</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform ml-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
