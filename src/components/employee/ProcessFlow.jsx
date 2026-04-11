'use client';

import React from 'react';
import { Search, FileText, CheckCircle, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

const steps = [
    {
        title: "Browse & Select",
        description: "Head over to the 'Events' tabs in the navigation bar  , Choose any event then  Explore the Catalog  and add up to 3 products you'd like to sample.",
        icon: <Search className="w-6 h-6" />,
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-600",
    },
    {
        title: "Review & Personalize",
        description: "Open your Cart, confirm your selection, and click 'Review Personalization'. Specify your branding needs (logo, type, and size) for a tailored sample.",
        icon: <FileText className="w-6 h-6" />,
        color: "bg-indigo-500",
        lightColor: "bg-indigo-50",
        textColor: "text-indigo-600",
    },
    {
        title: "Submit & Confirm",
        description: "Click 'Continue to Shipping', fill in your delivery details, and place your request. You'll receive a confirmation email with your Order Reference Number.",
        icon: <CheckCircle className="w-6 h-6" />,
        color: "bg-violet-500",
        lightColor: "bg-violet-50",
        textColor: "text-violet-600",
    },
    {
        title: "Sample Delivery",
        description: "Our team will process your request, and your curated samples will be delivered to your doorstep within 4-5 working days for evaluation.",
        icon: <Truck className="w-6 h-6" />,
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
        textColor: "text-purple-600",
    }
];

export default function ProcessFlow() {
    return (
        <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        How It <span className="text-blue-600">Works</span>
                    </h2>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto">
                        A simple 5-step process to get premium corporate gifts delivered to your doorstep.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                {/* Icon Container */}
                                <div className={`w-24 h-24 rounded-3xl ${step.lightColor} flex items-center justify-center mb-6 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-xl`}>
                                    <div className={`${step.color} text-white p-4 rounded-2xl shadow-lg transform transition-transform duration-500 group-hover:scale-105`}>
                                        {step.icon}
                                    </div>

                                    {/* Step Number Badge */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-50 rounded-full flex items-center justify-center text-xs font-black text-gray-900 shadow-sm">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className={`text-xl font-black mb-3 ${step.textColor} tracking-tight`}>
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium px-4">
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
