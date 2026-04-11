'use client';

import React from 'react';
import { Search, FileText, CheckCircle, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

const steps = [
    {
        title: "Explore",
        description: "Browse curated categories and select up to 3 premium products you'd like to evaluate per corporate event.",
        icon: <ShoppingBag className="w-5 h-5" />,
        color: "bg-slate-900",
        lightColor: "bg-slate-50",
        textColor: "text-slate-900",
    },
    {
        title: "Personalize",
        description: "Configure your branding requirements—including logo placement and sizing—directly in the cart for a tailored sample.",
        icon: <FileText className="w-5 h-5" />,
        color: "bg-indigo-600",
        lightColor: "bg-indigo-50",
        textColor: "text-indigo-600",
    },
    {
        title: "Confirm",
        description: "Review your selection and submit. You'll receive a detailed confirmation with your order reference ID instantly.",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "bg-slate-900",
        lightColor: "bg-slate-50",
        textColor: "text-slate-900",
    },
    {
        title: "Evaluation",
        description: "Your curated samples will be delivered within 4-5 working days, ready for you to assess quality and branding.",
        icon: <Truck className="w-5 h-5" />,
        color: "bg-indigo-600",
        lightColor: "bg-indigo-50",
        textColor: "text-indigo-600",
    }
];

export default function ProcessFlow() {
    return (
        <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Fulfillment <span className="text-indigo-600">Workflow</span>
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                        A streamlined process designed to fulfill your corporate gifting needs with precision and speed.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                             <div key={index} className="flex flex-col items-center text-center group relative">
                                {/* Icon Container */}
                                <div className={`w-20 h-20 rounded-2xl ${step.lightColor} flex items-center justify-center mb-8 relative transition-all duration-500 group-hover:scale-110 shadow-sm border border-slate-100`}>
                                    <div className={`${step.color} text-white p-3.5 rounded-xl shadow-lg transform transition-transform duration-500`}>
                                        {step.icon}
                                    </div>

                                    {/* Step Number Badge */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-sm">
                                        0{index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className={`text-lg font-bold mb-4 ${step.textColor} tracking-tight uppercase tracking-widest`}>
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium px-4">
                                    {step.description}
                                </p>

                                {/* Arrow (Desktop Connection) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute right-[-1.5rem] top-12 text-gray-200">
                                        <ArrowRight size={24} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
