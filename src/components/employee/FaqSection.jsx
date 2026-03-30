'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, MessageSquare, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react';

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
        <section id="faq" className="bg-white py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/3 opacity-60"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-20 text-center">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100/50">
                        <HelpCircle size={16} />
                        <span>Support Center</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
                        FAQs – <span className="text-blue-600">Corporate Deals</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
                        Everything you need to know about our corporate gifting process and sample requests.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`border transition-all duration-300 rounded-[1.5rem] overflow-hidden ${
                                openIndex === i 
                                ? 'border-blue-200 bg-blue-50/30 shadow-md shadow-blue-500/5' 
                                : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                            }`}
                        >
                            <button
                                onClick={() => toggleFaq(i)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === i ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {faq.q.split(') ')[1]}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    openIndex === i ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                }`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out ${
                                openIndex === i ? 'max-h-[500px] opacity-100 border-t border-blue-100/50' : 'max-h-0 opacity-0 pointer-events-none'
                            }`}>
                                <div className="p-6 md:p-8 pt-0 mt-6 text-gray-600 leading-relaxed font-medium">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section - Redesigned for Premium Look */}
                <div className="mt-20 relative px-8 py-12 md:px-16 md:py-16 bg-[#0B0F19] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/40">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/2 opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/2 opacity-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left flex-1">
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Still have questions?</h3>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                                Can't find the answer you're looking for? Reach out to our friendly team for personalized support.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
                            <a 
                                href="tel:8356094864"
                                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Support 1</p>
                                    <p className="text-white font-bold text-sm tracking-wide">+91 83560 94864</p>
                                </div>
                            </a>

                            <a 
                                href="tel:9082109156"
                                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Support 2</p>
                                    <p className="text-white font-bold text-sm tracking-wide">+91 90821 09156</p>
                                </div>
                            </a>

                            <a 
                                href="mailto:service.brandbarrel@gmail.com"
                                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
                            >
                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Email Us</p>
                                    <p className="text-white font-bold text-[13px] tracking-wide break-all">service.brandbarrel@gmail.com</p>
                                </div>
                            </a>

                            <button 
                                onClick={() => router.push('/contact')}
                                className="group flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/40"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white shrink-0">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-black text-sm leading-none mb-1">Contact Portal</p>
                                        <p className="text-blue-100/70 text-[10px] font-semibold uppercase tracking-wider">Direct Access</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
